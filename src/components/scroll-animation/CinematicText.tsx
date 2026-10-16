'use client';

import React from 'react';
import { SceneTimeline } from './SceneTimeline';
import { Sparkles } from 'lucide-react';

interface CinematicTextProps {
  progress: number;
  timeline: SceneTimeline;
}

export default function CinematicText({ progress, timeline }: CinematicTextProps) {
  const scenes = timeline.getScenes();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4 sm:px-6">
      {scenes.map((scene) => {
        // Skip final CTA as it is handled in FinalCTA component
        if (scene.isFinalCTA) return null;

        const state = timeline.computeSceneState(scene, progress);
        if (!state.isVisible) return null;

        return (
          <div
            key={scene.id}
            style={{
              opacity: state.opacity,
              transform: `translateY(${state.translateY}px) scale(${state.scale})`,
              transition: 'transform 0.1s linear, opacity 0.1s linear',
            }}
            className="absolute text-center max-w-4xl mx-auto px-4"
          >
            {/* Supporting Tag / Label */}
            {scene.supportingLabel && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/70 border border-red-700/40 text-red-300 text-xs font-semibold tracking-widest uppercase mb-4 shadow-lg shadow-red-950/40">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>{scene.supportingLabel}</span>
              </div>
            )}

            {/* Main Headline */}
            {scene.isIdentityReveal ? (
              <div className="space-y-4">
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
                  illuminate<span className="text-[#C8102E]">.</span>
                </h1>
                {scene.subtext && (
                  <p className="text-xl sm:text-2xl md:text-3xl font-light text-zinc-300 tracking-wide max-w-2xl mx-auto">
                    {scene.subtext}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-xl">
                  {scene.headline}
                </h2>

                {scene.subtext && (
                  <p className="text-base sm:text-xl md:text-2xl text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
                    {scene.subtext}
                  </p>
                )}

                {scene.accent && (
                  <div className="mt-3 inline-block px-3 py-1 rounded-md bg-zinc-900/80 border border-red-900/40 text-xs font-mono text-red-400">
                    {scene.accent}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
