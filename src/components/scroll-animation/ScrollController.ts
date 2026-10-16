import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCROLL_CONFIG } from '@/config/animation.config';
import { ScrollProgressState } from '@/types/animation';

export type ScrollUpdateCallback = (state: ScrollProgressState) => void;

export class ScrollController {
  private triggerInstance: ScrollTrigger | null = null;
  private totalFrames: number;
  private onUpdate: ScrollUpdateCallback;
  private lastProgress = 0;

  constructor(totalFrames: number, onUpdate: ScrollUpdateCallback) {
    this.totalFrames = Math.max(1, totalFrames);
    this.onUpdate = onUpdate;
  }

  public init(containerElement: HTMLElement) {
    gsap.registerPlugin(ScrollTrigger);

    this.triggerInstance = ScrollTrigger.create({
      trigger: containerElement,
      start: SCROLL_CONFIG.start,
      end: SCROLL_CONFIG.end,
      scrub: SCROLL_CONFIG.scrub,
      pin: SCROLL_CONFIG.pin,
      anticipatePin: SCROLL_CONFIG.anticipatePin,
      onUpdate: (self) => {
        const progress = Math.max(0, Math.min(1, self.progress));
        const direction = self.direction === 1 ? 1 : self.direction === -1 ? -1 : 0;
        const velocity = self.getVelocity();

        // Map progress directly to frame index
        const currentFrameIndex = Math.min(
          this.totalFrames - 1,
          Math.floor(progress * (this.totalFrames - 1))
        );

        this.lastProgress = progress;

        this.onUpdate({
          progress,
          currentFrameIndex,
          direction,
          isPinned: self.isActive,
          velocity,
        });
      },
    });
  }

  public updateTotalFrames(count: number) {
    this.totalFrames = Math.max(1, count);
  }

  public refresh() {
    if (this.triggerInstance) {
      this.triggerInstance.refresh();
    }
  }

  public destroy() {
    if (this.triggerInstance) {
      this.triggerInstance.kill();
      this.triggerInstance = null;
    }
  }
}
