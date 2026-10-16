export type CanvasFitMode = 'cover' | 'contain';

export interface AnimationManifest {
  totalFrames: number;
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
  frames: string[];
  generatedAt?: string;
}

export interface AnimationScene {
  id: string;
  name: string;
  startProgress: number; // e.g. 0.00
  endProgress: number;   // e.g. 0.20
  headline: string;
  subtext?: string;
  supportingLabel?: string;
  accent?: string;
  isIdentityReveal?: boolean;
  isFinalCTA?: boolean;
}

export interface ScrollTriggerConfig {
  start: string;
  end: string;
  scrub: number;
  pin: boolean;
  anticipatePin: number;
}

export interface FrameLoadState {
  total: number;
  loaded: number;
  percent: number;
  isInitialReady: boolean;
  hasFailed: boolean;
  errorMessage?: string;
}

export interface ScrollProgressState {
  progress: number;
  currentFrameIndex: number;
  direction: 1 | -1 | 0; // 1 = scrolling down, -1 = scrolling up, 0 = idle
  isPinned: boolean;
  velocity: number;
}
