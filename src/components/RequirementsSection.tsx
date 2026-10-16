'use client';

import React from 'react';
import { Building2, Car, Users2, FileCheck2, AlertCircle, CheckCircle } from 'lucide-react';
import { COLLEGE_REQUIREMENTS, WORKSHOP_METRICS } from '@/data/workshop';

export default function RequirementsSection() {
  const getReqIcon = (badge: string) => {
    switch (badge) {
      case 'Infrastructure':
        return Building2;
      case 'Logistics':
        return Car;
      case 'Coordination':
        return Users2;
      case 'Formalities':
        return FileCheck2;
      default:
        return Building2;
    }
  };

  return (
    <section id="requirements" className="relative py-24 bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <Building2 className="w-3.5 h-3.5" /> Host Institution Guidelines
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            College Hosting <span className="text-red-500">Requirements</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg font-light">
            Bringing ILLUMINATE to your institution is seamless. Ensure the following prerequisites to confirm your campus workshop.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLEGE_REQUIREMENTS.map((req, i) => {
            const Icon = getReqIcon(req.badge);
            return (
              <div
                key={i}
                className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-red-600/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/40">
                      {req.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{req.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">{req.description}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <CheckCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>Mandatory Provision</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Terms Box from Brochure */}
        <div className="mt-12 glass-panel p-8 rounded-3xl border border-red-900/40 bg-gradient-to-br from-red-950/20 via-black to-black">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-red-900/40 text-red-400 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Workshop Logistics & Financial Policies</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-300 leading-relaxed">
                <div>
                  <strong className="text-white block mb-1">Participant Quorum:</strong>
                  A minimum of <span className="text-red-400 font-bold">{WORKSHOP_METRICS.minParticipants} participants</span> is required for the workshop to be scheduled on campus.
                </div>
                <div>
                  <strong className="text-white block mb-1">Trainer Outstation Expenses:</strong>
                  E-Cell, IIT Bombay bears expenses for the Trainer&apos;s outstation (including travelling and food during transit).
                </div>
                <div>
                  <strong className="text-white block mb-1">Advance & Confirmation:</strong>
                  Official confirmation letter signed by Principal / Faculty and 50% advance at least 10 days before the selected date.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
