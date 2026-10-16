'use client';

import React from 'react';
import RegistrationForm from './RegistrationForm';
import { Sparkles, Check, HelpCircle } from 'lucide-react';

export default function RegistrationSection() {
  return (
    <section id="register" className="relative py-24 bg-black text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Guarantees */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-xs font-semibold tracking-wider uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Reserve Your Spot
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Step Into the <span className="text-red-500">Arena</span>
              </h2>
              <p className="mt-4 text-zinc-300 text-base font-light leading-relaxed">
                Whether you are registering as an individual visionary or representing a student cohort from your university, ILLUMINATE provides the foundational launchpad you need.
              </p>
            </div>

            {/* Inclusions Checklist */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                What Every Participant Receives:
              </h4>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Official Certificate of Participation certified by E-Cell, IIT Bombay.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Tangible Startup Founder Kit including physical Business Model Canvas (BMC).</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Interactive case-study training and pitch evaluation with live startup founders.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-950 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Direct fast-track pipeline to Eureka! at the IIT Bombay campus.</span>
                </li>
              </ul>
            </div>

            {/* Quick Assistance */}
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-400 flex items-center gap-4">
              <HelpCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <span className="text-zinc-200 font-semibold block">Need assistance with college bulk registrations?</span>
                <span>Contact our coordination leads at rachit@ecell.in or abhishek@ecell.in.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Registration Form */}
          <div className="lg:col-span-7">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
