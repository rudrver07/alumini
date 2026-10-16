'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { CanvasFitMode } from '@/types/animation';
import { CANVAS_CONFIG } from '@/config/animation.config';

interface FrameCanvasProps {
  currentFrame: HTMLImageElement | null;
  fitMode?: CanvasFitMode;
  onResize?: (width: number, height: number) => void;
}

export default function FrameCanvas({
  currentFrame,
  fitMode = CANVAS_CONFIG.fitMode,
  onResize,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<HTMLImageElement | null>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, CANVAS_CONFIG.maxDpr);
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    // Adjust canvas buffer resolution for crisp HiDPI rendering
    const targetW = Math.round(cw * dpr);
    const targetH = Math.round(ch * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Fill base dark background
    ctx.fillStyle = CANVAS_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Draw Frame if present
    const img = currentFrame;
    if (img && img.complete && img.naturalWidth > 0) {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const imgRatio = imgW / imgH;
      const canvasRatio = cw / ch;

      let drawW = cw;
      let drawH = ch;
      let offsetX = 0;
      let offsetY = 0;

      if (fitMode === 'cover') {
        if (canvasRatio > imgRatio) {
          drawW = cw;
          drawH = cw / imgRatio;
          offsetY = (ch - drawH) / 2;
        } else {
          drawH = ch;
          drawW = ch * imgRatio;
          offsetX = (cw - drawW) / 2;
        }
      } else {
        // 'contain' mode
        if (canvasRatio > imgRatio) {
          drawH = ch;
          drawW = ch * imgRatio;
          offsetX = (cw - drawW) / 2;
        } else {
          drawW = cw;
          drawH = cw / imgRatio;
          offsetY = (ch - drawH) / 2;
        }
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      lastDrawnFrameRef.current = img;

      // 3. Subtle cinematic radial vignette
      const vignette = ctx.createRadialGradient(
        cw / 2,
        ch / 2,
        Math.min(cw, ch) * 0.35,
        cw / 2,
        ch / 2,
        Math.max(cw, ch) * 0.75
      );
      vignette.addColorStop(0, 'rgba(5, 5, 5, 0.05)');
      vignette.addColorStop(0.7, 'rgba(5, 5, 5, 0.45)');
      vignette.addColorStop(1, 'rgba(5, 5, 5, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, cw, ch);
    }

    ctx.restore();
  }, [currentFrame, fitMode]);

  // Coalesce rendering updates via requestAnimationFrame
  useEffect(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      renderCanvas();
    });
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [renderCanvas]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && onResize) {
        onResize(canvas.clientWidth, canvas.clientHeight);
      }
      renderCanvas();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas, onResize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
    />
  );
}
