'use client';

import React from 'react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface StaticFallbackProps {
  reason?: 'reduced-motion' | 'load-error';
}

export default function StaticFallback({ reason = 'reduced-motion' }: StaticFallbackProps) {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center bg-[#050505] text-white px-4 py-24 text-center">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-700/50 text-red-300 text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-4 h-4 text-[#FF3030]" /> E-Cell, IIT Bombay Presents
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
          illuminate<span className="text-[#C8102E]">.</span>
        </h1>

        <p className="text-xl sm:text-2xl text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
          Empowering the Next Generation of Changemakers. An intensive 6-hour hands-on venture development bootcamp.
        </p>

        {reason === 'reduced-motion' && (
          <p className="text-xs text-zinc-400 font-mono">
            Optimized for Reduced-Motion Preference
          </p>
        )}

        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#about"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-sm border border-zinc-700 transition"
          >
            <BookOpen className="w-4 h-4 text-[#FF3030]" /> LEARN MORE
          </a>
          <a
            href="#register"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#FF3030] hover:from-red-600 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-red-950/70 transition transform hover:scale-105"
          >
            REGISTER NOW <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
