'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { EVENT_CONFIG } from '@/config/event.config';

interface FrameManifest {
  totalFrames: number;
  width: number;
  height: number;
  aspectRatio: number;
  frames: string[];
}

export default function ScrollCanvasAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [manifest, setManifest] = useState<FrameManifest | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [progress, setProgress] = useState(0);

  // Cached decoded images
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  function drawScaledImage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) {
    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    // Compute "cover" aspect ratio fit
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let renderW = cw;
    let renderH = ch;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      renderW = cw;
      renderH = cw / imgRatio;
      offsetY = (ch - renderH) / 2;
    } else {
      // Canvas is taller than image
      renderH = ch;
      renderW = ch * imgRatio;
      offsetX = (cw - renderW) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    // Subtle dark cinematic vignette overlay
    const gradient = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.35, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cw, ch);

    ctx.restore();
  }

  // Draw a specific frame to canvas with "cover" fit
  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback: search backwards for closest loaded frame
      for (let i = frameIdx - 1; i >= 0; i--) {
        const fallback = imagesRef.current[i];
        if (fallback && fallback.complete && fallback.naturalWidth > 0) {
          drawScaledImage(ctx, canvas, fallback);
          return;
        }
      }
      return;
    }

    drawScaledImage(ctx, canvas, img);
    currentFrameRef.current = frameIdx;
  }, []);

  // Handle canvas sizing with device pixel ratio
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory efficiency
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch frame manifest
  useEffect(() => {
    let isMounted = true;
    async function loadManifest() {
      try {
        const res = await fetch('/frames-manifest.json');
        if (!res.ok) throw new Error('Failed to load frames-manifest.json');
        const data: FrameManifest = await res.json();
        if (isMounted) {
          setManifest(data);
          imagesRef.current = new Array(data.totalFrames).fill(null);
        }
      } catch (err) {
        console.error('Manifest fetch error:', err);
      }
    }
    loadManifest();
    return () => {
      isMounted = false;
    };
  }, []);

  // Preload frames progressively
  useEffect(() => {
    if (!manifest || manifest.frames.length === 0) return;

    let isCancelled = false;
    const frames = manifest.frames;
    const total = manifest.totalFrames;
    let loaded = 0;

    // Phase 1: Load Frame 0 immediately
    const firstImg = new Image();
    firstImg.src = frames[0];
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = firstImg;
      loaded++;
      setLoadedCount(loaded);
      resizeCanvas();
      drawFrame(0);
    };

    // Phase 2: Concurrent batch loader for remaining frames
    const BATCH_SIZE = 6;
    let nextIndexToLoad = 1;

    async function loadBatch() {
      if (isCancelled || nextIndexToLoad >= total) {
        if (!isCancelled) setIsReady(true);
        return;
      }

      const currentBatch: Promise<void>[] = [];
      const batchEnd = Math.min(nextIndexToLoad + BATCH_SIZE, total);

      for (let i = nextIndexToLoad; i < batchEnd; i++) {
        const img = new Image();
        img.src = frames[i];

        const promise = new Promise<void>((resolve) => {
          img.onload = () => {
            if (!isCancelled) {
              imagesRef.current[i] = img;
              loaded++;
              setLoadedCount(loaded);
              if (loaded >= Math.min(30, total)) {
                setIsReady(true);
              }
            }
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        });
        currentBatch.push(promise);
      }

      nextIndexToLoad = batchEnd;
      await Promise.all(currentBatch);
      if (!isCancelled) {
        setTimeout(loadBatch, 10);
      }
    }

    loadBatch();

    return () => {
      isCancelled = true;
    };
  }, [manifest, drawFrame, resizeCanvas]);

  // Window resize listener
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Setup GSAP ScrollTrigger
  useEffect(() => {
    if (reducedMotion || !manifest || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const total = manifest.totalFrames;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=700%', // Explicit setting from clipboard specification
      pin: true,
      scrub: 2.0, // Explicit setting from clipboard specification
      onUpdate: (self) => {
        const p = self.progress;
        setProgress(p);

        const targetFrame = Math.min(total - 1, Math.floor(p * (total - 1)));
        if (targetFrame !== currentFrameRef.current) {
          drawFrame(targetFrame);
        }
      },
    });

    scrollTriggerRef.current = trigger;

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [manifest, reducedMotion, drawFrame]);

  // If user has reduced motion enabled, display static hero
  if (reducedMotion) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-black px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-700/50 text-red-300 text-sm font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-red-500" /> E-Cell IIT Bombay Presents
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white red-text-glow">
            ILLUMINATE
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-300 max-w-2xl mx-auto">
            Empowering the Next Generation of Changemakers. An intensive 6-hour hands-on venture development workshop.
          </p>
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#curriculum"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium border border-zinc-700 transition"
            >
              <BookOpen className="w-5 h-5 text-red-400" /> Learn More
            </a>
            <a
              href="#register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold red-glow transition transform hover:scale-105"
            >
              Register Now <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const loadPercent = manifest ? Math.round((loadedCount / manifest.totalFrames) * 100) : 0;

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Fullscreen Canvas with "fit cover" */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Loading Progress Meter (Subtle Bottom Indicator) */}
      {!isReady && (
        <div className="absolute inset-x-0 bottom-10 z-30 flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-red-900/50 text-xs text-zinc-400">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>Buffering Cinematic Experience... {loadPercent}%</span>
          </div>
          <div className="w-48 h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-200"
              style={{ width: `${loadPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* SYNCHRONIZED SCROLL STAGES OVERLAY */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
        {/* Stage 1: 0% - 24% */}
        <div
          className={`absolute text-center max-w-3xl transition-all duration-700 transform ${
            progress < 0.24
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 backdrop-blur-md border border-red-700/40 text-red-300 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4 shadow-lg shadow-red-950/40">
            <Sparkles className="w-4 h-4 text-red-500 animate-spin" style={{ animationDuration: '6s' }} />
            The Entrepreneurship Cell, IIT Bombay
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white red-text-glow uppercase">
            ILLUMINATE
          </h1>
          <p className="mt-4 text-lg sm:text-2xl text-zinc-300 font-light tracking-wide max-w-2xl mx-auto drop-shadow-md">
            Empowering the next generation of Changemakers
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400 animate-bounce tracking-widest uppercase">
            <span>Scroll Down to Discover</span>
            <ChevronDown className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* Stage 2: 25% - 49% */}
        <div
          className={`absolute text-center max-w-3xl transition-all duration-700 transform ${
            progress >= 0.25 && progress < 0.5
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <span className="text-xs uppercase tracking-widest text-red-400 font-bold">Comprehensive Curriculum</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mt-2 tracking-tight">
            From Idea to Viable Enterprise
          </h2>
          <p className="mt-4 text-base sm:text-xl text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
            Master the 9 building blocks of the Business Model Canvas, discover product-market fit, and learn startup finance from real entrepreneurs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-semibold text-zinc-300">
            <span className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-red-900/40">6 Immersive Hours</span>
            <span className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-red-900/40">Hands-on BMC Worksheet</span>
            <span className="px-3 py-1.5 rounded-md bg-zinc-900/80 border border-red-900/40">Live Pitching Sprint</span>
          </div>
        </div>

        {/* Stage 3: 50% - 74% */}
        <div
          className={`absolute text-center max-w-3xl transition-all duration-700 transform ${
            progress >= 0.5 && progress < 0.75
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <span className="text-xs uppercase tracking-widest text-red-400 font-bold">Fast-Track Pathway</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mt-2 tracking-tight">
            Direct Opportunity to Reach IIT Bombay
          </h2>
          <p className="mt-4 text-base sm:text-xl text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
            The workshop propels your ideas into <span className="text-red-400 font-semibold">Eureka!</span> — Asia&apos;s Largest Business Model Competition held on the prestigious IIT Bombay campus.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200 text-sm">
            <span className="font-bold text-white">18,000+ Students</span> trained across <span className="font-bold text-white">15+ States</span>
          </div>
        </div>

        {/* Stage 4: 75% - 100% (The Grand CTA Finale) */}
        <div
          className={`absolute text-center max-w-4xl transition-all duration-700 transform ${
            progress >= 0.75
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
          }`}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-semibold tracking-wider uppercase mb-3">
            Registrations Now Open for 2026
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight red-text-glow uppercase">
            Ignite Your Vision
          </h2>
          <p className="mt-4 text-base sm:text-xl text-zinc-200 max-w-2xl mx-auto font-light leading-relaxed">
            Reserve your seat or partner your college with E-Cell IIT Bombay. Workshop season runs 14th July – 31st October 2026.
          </p>

          {/* REVEAL BUTTONS: LEARN MORE & REGISTER NOW */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#curriculum"
              id="cta-learn-more"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-100 font-semibold border border-zinc-700/80 transition-all duration-300 hover:border-red-500/50 hover:text-white cursor-pointer shadow-lg"
            >
              <BookOpen className="w-5 h-5 text-red-500" />
              <span>Learn More</span>
            </a>
            <a
              href="#register"
              id="cta-register-now"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold transition-all duration-300 red-glow transform hover:-translate-y-0.5 cursor-pointer shadow-2xl"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            ₹{EVENT_CONFIG.participationFee} {EVENT_CONFIG.feeLabel} (Pending Organizer Confirmation) • Official E-Cell IIT Bombay Certificate Included
          </p>
        </div>
      </div>
    </div>
  );
}
