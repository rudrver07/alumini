'use client';

import { Award, Target, CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="relative py-24 bg-black text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5" /> Established Excellence
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              About E-Cell, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">IIT Bombay</span>
            </h2>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-light">
              The Entrepreneurship Cell, IIT Bombay (E-Cell) firmly believes that emerging economies like India need the drive and innovation of young entrepreneurs. To realize this vision, E-Cell conceptualizes premier nationwide initiatives for college students, aspiring founders, and changemakers.
            </p>

            <div className="p-5 rounded-2xl glass-red border border-red-600/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex-shrink-0 flex items-center justify-center text-red-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">National Recognition & Accolades</h4>
                  <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                    E-Cell, IIT Bombay has been recognized as the <span className="text-white font-medium">Leading Entrepreneurship promoting student organization</span> in the country by the <em>&quot;National Entrepreneurship Network Achievement Awards&quot;</em> instituted by the Wadhwani Foundation, and felicitated at <strong>TiECon 2005</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                'Practical hands-on case study training rather than dry passive lecturing.',
                'Interactive sessions conducted by seasoned startup founders and real industry experts.',
                'Direct mentoring pipeline to Eureka! — Asia’s largest business model competition.',
                'Tangible outputs: Every participant drafts and completes a physical Business Model Canvas.',
              ].map((bullet, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300 leading-normal">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Key Pillars Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                The ILLUMINATE Mission
              </h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 flex-shrink-0 font-bold text-sm">
                    01
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Deconstruct Complexities</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Demystify market dynamics, financial planning, customer discovery, and pitching essentials in one power-packed day.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 flex-shrink-0 font-bold text-sm">
                    02
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Cultivate Founder Mindset</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Transform passive students into proactive problem solvers through team formation and lateral ideation drills.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 flex-shrink-0 font-bold text-sm">
                    03
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Road to IIT Bombay Campus</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      High-performing teams receive fast-track nominations to present their startup ventures in the national finals at IIT Bombay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span>Workshop Window</span>
                <span className="font-bold text-red-400">14th July – 31st October 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
