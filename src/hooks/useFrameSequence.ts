'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FrameLoader } from '@/components/scroll-animation/FrameLoader';
import { AnimationManifest, FrameLoadState } from '@/types/animation';

export function useFrameSequence() {
  const [manifest, setManifest] = useState<AnimationManifest | null>(null);
  const [loadState, setLoadState] = useState<FrameLoadState>({
    total: 0,
    loaded: 0,
    percent: 0,
    isInitialReady: false,
    hasFailed: false,
  });

  const loaderRef = useRef<FrameLoader | null>(null);
  const [renderedFrame, setRenderedFrame] = useState<HTMLImageElement | null>(null);
  const currentRenderIndexRef = useRef<number>(-1);

  // Initialize FrameLoader
  useEffect(() => {
    let isMounted = true;
    const loader = new FrameLoader((state) => {
      if (isMounted) setLoadState({ ...state });
    });
    loaderRef.current = loader;

    async function init() {
      try {
        const m = await loader.initManifest();
        if (!isMounted) return;
        setManifest(m);

        // Preload Frame 0 immediately
        const firstImg = await loader.loadInitialFrame();
        if (isMounted) {
          setRenderedFrame(firstImg);
          currentRenderIndexRef.current = 0;
        }

        // Start background progressive loader
        loader.startBackgroundLoader();
      } catch (err) {
        console.error('[useFrameSequence] Initialization error:', err);
      }
    }

    init();

    return () => {
      isMounted = false;
      loader.destroy();
    };
  }, []);

  // Update requested frame and request directional preloading
  const setTargetFrameIndex = useCallback((targetIndex: number, direction: 1 | -1 | 0 = 1) => {
    const loader = loaderRef.current;
    if (!loader) return;

    if (currentRenderIndexRef.current !== targetIndex) {
      currentRenderIndexRef.current = targetIndex;
      const img = loader.getClosestLoadedFrame(targetIndex);
      if (img) {
        setRenderedFrame(img);
      }
      loader.prioritizeSurroundingFrames(targetIndex, direction);
    }
  }, []);

  return {
    manifest,
    loadState,
    renderedFrame,
    setTargetFrameIndex,
  };
}
