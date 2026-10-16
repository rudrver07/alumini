'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-md overflow-hidden flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="E-Cell NIET Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white uppercase">ILLUMINATE</span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">The Entrepreneurship Cell • IIT Bombay</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
              Empowering the next generation of Changemakers. A premier national entrepreneurship initiative transforming collegiate innovators into venture founders across 15+ Indian states.
            </p>

            <div className="pt-2">
              <span className="text-[11px] text-zinc-400 block font-medium">Workshop Calendar Window:</span>
              <strong className="text-red-400 text-xs font-semibold">14th July – 31st October 2026</strong>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-medium">
              <li>
                <a href="#about" className="hover:text-red-400 transition">About E-Cell IIT Bombay</a>
              </li>
              <li>
                <a href="#curriculum" className="hover:text-red-400 transition">9-Session Workshop Structure</a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-red-400 transition">Certificates & Startup Kit</a>
              </li>
              <li>
                <a href="#requirements" className="hover:text-red-400 transition">College Hosting Criteria</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-red-400 transition">Frequently Asked Questions</a>
              </li>
              <li>
                <a href="#register" className="hover:text-red-400 transition">Participant Enrollment</a>
              </li>
            </ul>
          </div>
        </div>


        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} The Entrepreneurship Cell, IIT Bombay. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition cursor-pointer"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
