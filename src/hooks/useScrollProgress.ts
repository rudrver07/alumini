'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollController } from '@/components/scroll-animation/ScrollController';
import { ScrollProgressState } from '@/types/animation';

export function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>, totalFrames: number) {
  const [scrollState, setScrollState] = useState<ScrollProgressState>({
    progress: 0,
    currentFrameIndex: 0,
    direction: 0,
    isPinned: false,
    velocity: 0,
  });

  const controllerRef = useRef<ScrollController | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalFrames <= 0) return;

    const controller = new ScrollController(totalFrames, (state) => {
      setScrollState(state);
    });

    controller.init(container);
    controllerRef.current = controller;

    return () => {
      controller.destroy();
    };
  }, [containerRef, totalFrames]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateTotalFrames(totalFrames);
    }
  }, [totalFrames]);

  return scrollState;
}
