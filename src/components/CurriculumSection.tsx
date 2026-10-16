'use client';

import React, { useState } from 'react';
import { Clock, Layers, Flame, CheckCircle, Lightbulb, Compass, BarChart, Code2, Mic } from 'lucide-react';
import { WORKSHOP_SESSIONS } from '@/data/workshop';

export default function CurriculumSection() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Foundation', 'Ideation', 'Strategy', 'Financials', 'Execution', 'Pitch'];

  const filteredSessions =
    activeCategory === 'All'
      ? WORKSHOP_SESSIONS
      : WORKSHOP_SESSIONS.filter((s) => s.category === activeCategory);

  const getSessionIcon = (sessionNum: number) => {
    switch (sessionNum) {
      case 1:
        return Compass;
      case 2:
        return Lightbulb;
      case 3:
        return Layers;
      case 4:
        return Flame;
      case 5:
      case 6:
        return CheckCircle;
      case 7:
        return BarChart;
      case 8:
        return Code2;
      case 9:
        return Mic;
      default:
        return Layers;
    }
  };

  return (
    <section id="curriculum" className="relative py-24 bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <Clock className="w-3.5 h-3.5" /> Official Brochure Structure
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            illuminate <span className="text-red-500">Workshop Structure</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg font-light">
            An extensive 6-hour intensive bootcamp (11:00 AM – 6:00 PM including 1 hour break) consisting of expert speaker sessions, case study simulations, and hands-on Business Model Canvas construction.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white red-glow shadow-md shadow-red-950'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {cat === 'All' ? 'All 9 Sessions' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 9-Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const Icon = getSessionIcon(session.number);
            return (
              <div
                key={session.number}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/5 group-hover:bg-red-600/20 rounded-full blur-2xl transition-all pointer-events-none" />

                <div>
                  {/* Top Bar: Session Number & Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 font-extrabold text-xs">
                        {String(session.number).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Session {session.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-red-400">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      <span>{session.duration}</span>
                    </div>
                  </div>

                  {/* Topic Title */}
                  <div className="flex items-start gap-3 mt-2">
                    <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/5 text-red-400 flex-shrink-0 mt-0.5 group-hover:text-red-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                      {session.topic}
                    </h3>
                  </div>

                  {/* Activity Details */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-zinc-300 leading-relaxed font-light">
                      {session.activity}
                    </p>
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="mt-6 pt-3 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {session.category}
                  </span>
                  <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Interactive Segment →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule & Timing Summary Card */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl glass-panel border border-red-900/30 bg-gradient-to-r from-red-950/20 via-zinc-950 to-zinc-950">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left items-center">
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Recommended Timing</span>
              <h4 className="text-xl font-bold text-white mt-1">11:00 AM – 6:00 PM</h4>
              <p className="text-xs text-zinc-400 mt-1">Includes 1-hour lunch and inter-team networking break</p>
            </div>
            <div>
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Eligible Calendar Dates</span>
              <h4 className="text-xl font-bold text-white mt-1">14th July – 31st October 2026</h4>
              <p className="text-xs text-zinc-400 mt-1">Select any mutually convenient date for your college</p>
            </div>
            <div className="md:text-right">
              <a
                href="#register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm red-glow transition"
              >
                Enroll In Workshop →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
