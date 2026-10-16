'use client';

import React from 'react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { SceneTimeline } from './SceneTimeline';
import { CINEMATIC_SCENES } from '@/config/animation.config';
import { EVENT_CONFIG } from '@/config/event.config';

interface FinalCTAProps {
  progress: number;
  timeline: SceneTimeline;
}

export default function FinalCTA({ progress, timeline }: FinalCTAProps) {
  const finalScene = CINEMATIC_SCENES.find((s) => s.isFinalCTA);
  if (!finalScene) return null;

  const state = timeline.computeSceneState(finalScene, progress);
  if (!state.isVisible) return null;

  return (
    <div
      style={{
        opacity: state.opacity,
        transform: `translateY(${state.translateY}px) scale(${state.scale})`,
        transition: 'transform 0.1s linear, opacity 0.1s linear',
      }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto pointer-events-auto"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-700/50 text-red-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-xl shadow-red-950/50">
        <Sparkles className="w-4 h-4 text-[#FF3030]" /> E-Cell, IIT Bombay Presents
      </div>

      <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-2xl">
        {finalScene.headline}
      </h2>

      {finalScene.subtext && (
        <p className="mt-4 text-sm sm:text-lg text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
          {finalScene.subtext}
        </p>
      )}

      {/* Prominent Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <a
          href="#about"
          id="cta-learn-more"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 text-white font-bold text-sm border border-zinc-700/80 transition-all duration-300 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-950/30 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#FF3030]" />
          <span>LEARN MORE</span>
        </a>

        <a
          href="#register"
          id="cta-register-now"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-r from-[#C8102E] to-[#FF3030] hover:from-red-600 hover:to-red-500 text-white font-extrabold text-sm transition-all duration-300 shadow-xl shadow-red-950/70 hover:shadow-red-700/50 transform hover:-translate-y-0.5 cursor-pointer"
        >
          <span>REGISTER NOW</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <p className="mt-5 text-[11px] text-zinc-400 font-medium">
        ₹{EVENT_CONFIG.participationFee} {EVENT_CONFIG.feeLabel} (Pending Organizer Confirmation) • Official Certification by E-Cell IIT Bombay • Physical Startup Kit Included
      </p>
    </div>
  );
}
