import { AnimationScene } from '@/types/animation';
import { CINEMATIC_SCENES } from '@/config/animation.config';

export interface SceneVisualState {
  scene: AnimationScene;
  opacity: number;
  translateY: number;
  scale: number;
  isVisible: boolean;
}

export class SceneTimeline {
  private scenes: AnimationScene[];

  constructor(scenes: AnimationScene[] = CINEMATIC_SCENES) {
    this.scenes = scenes;
  }

  public getScenes(): AnimationScene[] {
    return this.scenes;
  }

  public getActiveScene(progress: number): AnimationScene | null {
    for (const scene of this.scenes) {
      if (progress >= scene.startProgress && progress <= scene.endProgress) {
        return scene;
      }
    }
    // If progress is >= 1, clamp to final scene
    if (progress >= 1 && this.scenes.length > 0) {
      return this.scenes[this.scenes.length - 1];
    }
    return null;
  }

  /**
   * Calculates smooth entrance, sustain, and exit transitions for a scene
   */
  public computeSceneState(scene: AnimationScene, progress: number): SceneVisualState {
    const { startProgress, endProgress, isFinalCTA } = scene;
    const duration = endProgress - startProgress;

    if (progress < startProgress || (!isFinalCTA && progress > endProgress)) {
      return {
        scene,
        opacity: 0,
        translateY: progress < startProgress ? 24 : -24,
        scale: 0.95,
        isVisible: false,
      };
    }

    // Normalized progress within this specific scene [0, 1]
    const localProgress = Math.max(0, Math.min(1, (progress - startProgress) / duration));

    let opacity = 1;
    let translateY = 0;
    let scale = 1;

    // Final CTA stays visible through the end
    if (isFinalCTA) {
      if (localProgress < 0.3) {
        const t = localProgress / 0.3;
        opacity = t;
        translateY = (1 - t) * 20;
        scale = 0.95 + 0.05 * t;
      } else {
        opacity = 1;
        translateY = 0;
        scale = 1;
      }
    } else {
      // Standard Scene: 25% Fade In, 50% Sustain, 25% Fade Out
      if (localProgress < 0.25) {
        const t = localProgress / 0.25;
        opacity = t;
        translateY = (1 - t) * 20;
        scale = 0.95 + 0.05 * t;
      } else if (localProgress > 0.75) {
        const t = (localProgress - 0.75) / 0.25;
        opacity = 1 - t;
        translateY = -t * 20;
        scale = 1 - 0.05 * t;
      } else {
        opacity = 1;
        translateY = 0;
        scale = 1;
      }
    }

    return {
      scene,
      opacity: Math.max(0, Math.min(1, opacity)),
      translateY,
      scale,
      isVisible: opacity > 0.01,
    };
  }
}
