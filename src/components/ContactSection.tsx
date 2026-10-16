'use client';

import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, MessageSquare, Shield } from 'lucide-react';
import { CONTACT_PERSONS } from '@/data/workshop';

export default function ContactSection() {
  return (
    <section id="contact" className="relative py-24 bg-gradient-to-b from-black via-zinc-950 to-black text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <MessageSquare className="w-3.5 h-3.5" /> Direct Communications
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Connect With the <span className="text-red-500">Organizing Committee</span>
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg font-light">
            Have queries regarding college hosting, workshop dates, speaker logistics, or bulk student delegations? Reach out to our leads directly.
          </p>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {CONTACT_PERSONS.map((person) => (
            <div
              key={person.name}
              className="glass-panel glass-panel-hover p-8 rounded-3xl border border-white/10 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 group-hover:bg-red-600/15 rounded-full blur-2xl transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">{person.role}</span>
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                  {person.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">The Entrepreneurship Cell, IIT Bombay</p>

                <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                  <a
                    href={`tel:${person.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition group/link"
                  >
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 group-hover/link:bg-red-600 group-hover/link:text-white transition">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-mono font-medium">{person.phone}</span>
                  </a>

                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition group/link"
                  >
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 group-hover/link:bg-red-600 group-hover/link:text-white transition">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{person.email}</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Direct Point of Contact</span>
                <span className="text-red-400 flex items-center gap-1">
                  Connect <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Location & Headquarters info */}
        <div className="mt-12 max-w-4xl mx-auto p-6 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/50 flex items-center justify-center text-red-400 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white text-sm block">Headquarters: Student Activity Centre (SAC)</strong>
              <span className="text-xs text-zinc-400">Indian Institute of Technology Bombay, Powai, Mumbai, Maharashtra 400076</span>
            </div>
          </div>
          <a
            href="https://ecell.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-red-400 hover:text-red-300 underline flex items-center gap-1"
          >
            Official E-Cell Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
