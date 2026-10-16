'use client';

import React from 'react';
import { Award, Package, Users, Rocket, ShieldCheck, Briefcase } from 'lucide-react';
import { WORKSHOP_BENEFITS } from '@/data/workshop';

export default function BenefitsSection() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award':
        return Award;
      case 'Package':
        return Package;
      case 'Users':
        return Users;
      case 'Rocket':
        return Rocket;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Briefcase':
        return Briefcase;
      default:
        return Award;
    }
  };

  return (
    <section id="benefits" className="relative py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5" /> High-Impact Value
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Benefits to Your <span className="text-red-500">College & Students</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg font-light">
            Every participant walks away with accredited credentials, tangible venture artifacts, and an enduring network of venture builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKSHOP_BENEFITS.map((benefit, i) => {
            const Icon = getIcon(benefit.icon);
            return (
              <div
                key={i}
                className="glass-panel glass-panel-hover p-8 rounded-3xl border border-white/10 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 group-hover:bg-red-600/15 rounded-full blur-2xl transition-all pointer-events-none" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-950/80 to-zinc-900 border border-red-800/40 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-red-950/40">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-300 leading-relaxed font-light">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold text-red-400/80">Certified by IIT Bombay</span>
                  <span>✓ Included</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificate preview highlight card */}
        <div className="mt-12 p-8 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-extrabold text-white">Three Distinct Accreditations Issued</h4>
            <p className="text-sm text-zinc-300 max-w-2xl font-light">
              1. <strong>Certificate of Participation</strong> to all student attendees • 2. <strong>Certificate of Coordination</strong> to student team leads • 3. <strong>Certificate of Appreciation</strong> to designated Faculty Coordinators.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-950/90 border border-red-700/50 text-red-300 text-xs font-bold tracking-wider uppercase">
              <Award className="w-4 h-4 text-red-400" /> Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
