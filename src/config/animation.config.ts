import { AnimationScene, CanvasFitMode, ScrollTriggerConfig } from '@/types/animation';

export const ANIMATION_THEME = {
  primaryBackground: '#050505',
  primaryRed: '#C8102E',
  accentRed: '#FF3030',
  textWhite: '#FFFFFF',
  textSecondary: '#AAAAAA',
  glassOverlay: 'rgba(5, 5, 5, 0.75)',
};

export const CANVAS_CONFIG: {
  fitMode: CanvasFitMode;
  maxDpr: number;
  backgroundColor: string;
} = {
  fitMode: 'cover',
  maxDpr: 2,
  backgroundColor: '#050505',
};

export const SCROLL_CONFIG: ScrollTriggerConfig = {
  start: 'top top',
  end: '+=700%', // Master end distance per specification
  scrub: 2.0,   // Scrub damping per specification
  pin: true,
  anticipatePin: 1,
};

export const LOADER_CONFIG = {
  manifestUrl: '/animation/manifest.json',
  legacyManifestUrl: '/frames-manifest.json',
  initialBatchSize: 8,
  minFramesBeforeInteractive: 20,
  maxConcurrentLoads: 6,
  cacheLimitMobile: 120, // Bounded cache size on mobile devices
};

export const CINEMATIC_SCENES: AnimationScene[] = [
  {
    id: 'scene-1',
    name: 'The Spark',
    startProgress: 0.0,
    endProgress: 0.2,
    headline: 'EVERY GREAT IDEA BEGINS WITH A SPARK.',
    subtext: 'An entrepreneurial mindset turns observation into innovation.',
    supportingLabel: 'The Genesis',
  },
  {
    id: 'scene-2',
    name: 'Possibilities',
    startProgress: 0.2,
    endProgress: 0.4,
    headline: 'IDEAS CREATE POSSIBILITIES.',
    subtext: 'POSSIBILITIES CREATE CHANGE.',
    supportingLabel: 'The Transformation',
  },
  {
    id: 'scene-3',
    name: 'The Builders',
    startProgress: 0.4,
    endProgress: 0.6,
    headline: 'THE FUTURE BELONGS TO THOSE WHO BUILD IT.',
    subtext: 'Transforming passive spectators into active venture founders.',
    accent: 'Architects of Innovation',
    supportingLabel: 'The Imperative',
  },
  {
    id: 'scene-4',
    name: 'The Ethos',
    startProgress: 0.6,
    endProgress: 0.8,
    headline: 'LEARN. INNOVATE. BUILD.',
    subtext: 'EXPERIENCE ENTREPRENEURSHIP LIKE NEVER BEFORE.',
    supportingLabel: 'Hands-on Bootcamp',
  },
  {
    id: 'scene-5',
    name: 'The Identity Reveal',
    startProgress: 0.8,
    endProgress: 0.95,
    headline: 'illuminate.',
    subtext: 'Empowering the Next Generation of Changemakers',
    supportingLabel: 'An Entrepreneurship Workshop Initiative by E-Cell, IIT Bombay',
    isIdentityReveal: true,
  },
  {
    id: 'scene-6',
    name: 'The Launchpad',
    startProgress: 0.95,
    endProgress: 1.0,
    headline: 'YOUR ENTREPRENEURIAL JOURNEY STARTS HERE.',
    subtext: 'Workshop Season: 14th July – 31st October 2026 • Certified by E-Cell IIT Bombay',
    isFinalCTA: true,
  },
];
