'use client';

import React from 'react';

interface LoadingScreenProps {
  percent: number;
}

export default function LoadingScreen({ percent }: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505] text-white select-none">
      <div className="text-center space-y-5 px-4">
        {/* Minimal illuminate. typography */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-xl">
          illuminate<span className="text-[#C8102E]">.</span>
        </h1>

        <p className="text-xs text-zinc-400 font-light tracking-widest uppercase">
          E-Cell • IIT Bombay
        </p>

        {/* Restrained red progress indicator */}
        <div className="w-48 sm:w-64 h-1 bg-zinc-900 rounded-full mx-auto overflow-hidden mt-6 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#C8102E] to-[#FF3030] transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
          />
        </div>

        <div className="text-[10px] font-mono text-zinc-400 pt-1">
          Initializing Cinematic Experience... {percent}%
        </div>
      </div>
    </div>
  );
}
