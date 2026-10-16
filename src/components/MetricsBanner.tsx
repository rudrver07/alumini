'use client';

import React from 'react';
import { Users, Presentation, MapPin, Clock, Tag, Trophy } from 'lucide-react';
import { WORKSHOP_METRICS } from '@/data/workshop';

export default function MetricsBanner() {
  const metrics = [
    {
      label: 'Students Empowered',
      value: WORKSHOP_METRICS.studentsTrained,
      icon: Users,
      desc: 'Across national engineering & business colleges',
    },
    {
      label: 'Workshops Conducted',
      value: WORKSHOP_METRICS.workshopsConducted,
      icon: Presentation,
      desc: 'Proven entrepreneurial track record',
    },
    {
      label: 'Indian States Reached',
      value: WORKSHOP_METRICS.statesReached,
      icon: MapPin,
      desc: 'Pan-India innovation ecosystem',
    },
    {
      label: 'Intensive Bootcamp',
      value: WORKSHOP_METRICS.hoursImmersive,
      icon: Clock,
      desc: '11:00 AM – 6:00 PM with networking break',
    },
    {
      label: 'Participation Fee per Student',
      value: `₹${WORKSHOP_METRICS.fee}`,
      icon: Tag,
      desc: 'Includes certificate, kit & BMC (pending organizer confirmation)',
    },
    {
      label: 'Eureka! Pathway',
      value: 'IIT Bombay',
      icon: Trophy,
      desc: 'Direct pitch track to Asia’s biggest B-model arena',
    },
  ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-black via-zinc-950 to-black border-y border-white/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl group-hover:bg-red-600/15 transition-colors pointer-events-none" />
                <div>
                  <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-red-400 transition-colors">
                    {item.value}
                  </div>
                  <div className="text-xs font-bold text-zinc-300 mt-1 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 mt-2 font-light leading-tight">
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
