import { AnimationManifest, FrameLoadState } from '@/types/animation';
import { LOADER_CONFIG } from '@/config/animation.config';

export type LoadProgressCallback = (state: FrameLoadState) => void;

export class FrameLoader {
  private manifest: AnimationManifest | null = null;
  private cache: Map<number, HTMLImageElement> = new Map();
  private loadingSet: Set<number> = new Set();
  private onProgress: LoadProgressCallback | null = null;
  private isCancelled = false;

  constructor(onProgress?: LoadProgressCallback) {
    if (onProgress) this.onProgress = onProgress;
  }

  public async initManifest(): Promise<AnimationManifest> {
    try {
      const res = await fetch(LOADER_CONFIG.manifestUrl);
      if (res.ok) {
        this.manifest = await res.json();
        return this.manifest as AnimationManifest;
      }
    } catch {
      // Try legacy manifest fallback
    }

    try {
      const resFallback = await fetch(LOADER_CONFIG.legacyManifestUrl);
      if (!resFallback.ok) throw new Error('Could not load animation manifest');
      this.manifest = await resFallback.json();
      return this.manifest as AnimationManifest;
    } catch (err) {
      this.notifyProgress({
        total: 0,
        loaded: 0,
        percent: 0,
        isInitialReady: false,
        hasFailed: true,
        errorMessage: err instanceof Error ? err.message : 'Manifest load failed',
      });
      throw err;
    }
  }

  public getManifest(): AnimationManifest | null {
    return this.manifest;
  }

  public getFrame(index: number): HTMLImageElement | null {
    return this.cache.get(index) || null;
  }

  public getClosestLoadedFrame(index: number): HTMLImageElement | null {
    if (this.cache.has(index)) return this.cache.get(index)!;

    // Search backwards
    for (let i = index - 1; i >= 0; i--) {
      if (this.cache.has(i)) return this.cache.get(i)!;
    }
    // Search forwards
    if (this.manifest) {
      for (let i = index + 1; i < this.manifest.totalFrames; i++) {
        if (this.cache.has(i)) return this.cache.get(i)!;
      }
    }
    return null;
  }

  /**
   * Preload frame 0 immediately for instant first paint
   */
  public async loadInitialFrame(): Promise<HTMLImageElement> {
    if (!this.manifest || this.manifest.frames.length === 0) {
      throw new Error('Manifest not initialized');
    }

    const firstImg = await this.loadSingleFrame(0);
    this.notifyProgress({
      total: this.manifest.totalFrames,
      loaded: this.cache.size,
      percent: Math.round((this.cache.size / this.manifest.totalFrames) * 100),
      isInitialReady: true,
      hasFailed: false,
    });
    return firstImg;
  }

  /**
   * Directional priority preloading
   */
  public prioritizeSurroundingFrames(currentIndex: number, direction: 1 | -1 | 0 = 1, range = 25) {
    if (!this.manifest || this.isCancelled) return;
    const total = this.manifest.totalFrames;

    const indicesToLoad: number[] = [];

    if (direction >= 0) {
      // Scrolling down: prioritize forward frames
      for (let i = currentIndex; i <= Math.min(total - 1, currentIndex + range); i++) {
        if (!this.cache.has(i) && !this.loadingSet.has(i)) indicesToLoad.push(i);
      }
      for (let i = currentIndex - 1; i >= Math.max(0, currentIndex - 5); i--) {
        if (!this.cache.has(i) && !this.loadingSet.has(i)) indicesToLoad.push(i);
      }
    } else {
      // Scrolling up: prioritize backward frames
      for (let i = currentIndex; i >= Math.max(0, currentIndex - range); i--) {
        if (!this.cache.has(i) && !this.loadingSet.has(i)) indicesToLoad.push(i);
      }
      for (let i = currentIndex + 1; i <= Math.min(total - 1, currentIndex + 5); i++) {
        if (!this.cache.has(i) && !this.loadingSet.has(i)) indicesToLoad.push(i);
      }
    }

    // Load concurrent batch
    const batch = indicesToLoad.slice(0, LOADER_CONFIG.maxConcurrentLoads);
    batch.forEach((idx) => {
      this.loadSingleFrame(idx).catch(() => {});
    });
  }

  /**
   * Background loader for all remaining frames
   */
  public async startBackgroundLoader(): Promise<void> {
    if (!this.manifest) return;
    const total = this.manifest.totalFrames;

    let index = 1;
    const loadNextBatch = async () => {
      if (this.isCancelled || index >= total) return;

      const batch: Promise<HTMLImageElement>[] = [];
      const end = Math.min(total, index + LOADER_CONFIG.initialBatchSize);

      for (let i = index; i < end; i++) {
        if (!this.cache.has(i) && !this.loadingSet.has(i)) {
          batch.push(this.loadSingleFrame(i));
        }
      }

      index = end;
      await Promise.allSettled(batch);

      if (!this.isCancelled && index < total) {
        setTimeout(loadNextBatch, 15);
      }
    };

    loadNextBatch();
  }

  private loadSingleFrame(index: number): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.cache.has(index)) {
        return resolve(this.cache.get(index)!);
      }
      if (!this.manifest || !this.manifest.frames[index]) {
        return reject(new Error(`Index ${index} out of bounds`));
      }

      this.loadingSet.add(index);
      const img = new Image();
      img.src = this.manifest.frames[index];

      img.onload = async () => {
        if (this.isCancelled) return;
        this.loadingSet.delete(index);
        this.cache.set(index, img);

        if (this.manifest) {
          const loaded = this.cache.size;
          const total = this.manifest.totalFrames;
          this.notifyProgress({
            total,
            loaded,
            percent: Math.round((loaded / total) * 100),
            isInitialReady: loaded >= LOADER_CONFIG.minFramesBeforeInteractive,
            hasFailed: false,
          });
        }
        resolve(img);
      };

      img.onerror = () => {
        this.loadingSet.delete(index);
        reject(new Error(`Failed to load frame ${index}`));
      };
    });
  }

  private notifyProgress(state: FrameLoadState) {
    if (this.onProgress && !this.isCancelled) {
      this.onProgress(state);
    }
  }

  public destroy() {
    this.isCancelled = true;
    this.cache.clear();
    this.loadingSet.clear();
    this.onProgress = null;
  }
}
