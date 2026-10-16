'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import FrameCanvas from './FrameCanvas';
import CinematicText from './CinematicText';
import FinalCTA from './FinalCTA';
import LoadingScreen from './LoadingScreen';
import StaticFallback from './StaticFallback';
import { SceneTimeline } from './SceneTimeline';
import { useFrameSequence } from '@/hooks/useFrameSequence';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reduced motion preference detection
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Frame sequence hook
  const { manifest, loadState, renderedFrame, setTargetFrameIndex } = useFrameSequence();

  // Scroll progress hook
  const totalFrames = manifest?.totalFrames || 0;
  const { progress, currentFrameIndex, direction } = useScrollProgress(containerRef, totalFrames);

  // Sync scroll progress with target frame loader
  useEffect(() => {
    if (totalFrames > 0) {
      setTargetFrameIndex(currentFrameIndex, direction);
    }
  }, [currentFrameIndex, direction, totalFrames, setTargetFrameIndex]);

  // Timeline instance
  const timeline = useMemo(() => new SceneTimeline(), []);

  // If user requests reduced motion, show static hero
  if (reducedMotion) {
    return <StaticFallback reason="reduced-motion" />;
  }

  // If asset load fails, show graceful fallback
  if (loadState.hasFailed) {
    return <StaticFallback reason="load-error" />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] overflow-hidden select-none"
    >
      {/* HTML5 Canvas Frame Renderer with cover fit and HiDPI */}
      <FrameCanvas currentFrame={renderedFrame} fitMode="cover" />

      {/* Loading Screen until first essential frames are available */}
      {!loadState.isInitialReady && <LoadingScreen percent={loadState.percent} />}

      {/* Scenes 1 through 5 HTML Overlays */}
      <CinematicText progress={progress} timeline={timeline} />

      {/* Scene 6 Finale CTA Reveal */}
      <FinalCTA progress={progress} timeline={timeline} />

      {/* Subtle Scroll Progress Indicator at bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-950/80 z-20 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#C8102E] to-[#FF3030] transition-all duration-75"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
