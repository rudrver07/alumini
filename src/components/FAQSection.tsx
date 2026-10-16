'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { EVENT_CONFIG } from '@/config/event.config';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Who is eligible to participate in the ILLUMINATE workshop?',
    answer:
      'ILLUMINATE is open to all enrolled college students across undergraduate, post-graduate, diploma programs, as well as faculty members and early-stage startup enthusiasts from any academic background (engineering, management, arts, sciences).',
  },
  {
    question: 'Is the certificate accredited and issued by IIT Bombay?',
    answer:
      'Yes. All participants who complete the 6-hour bootcamp receive an official Certificate of Participation certified by The Entrepreneurship Cell, IIT Bombay. Student organizers receive Certificates of Coordination, and faculty leads receive Certificates of Appreciation.',
  },
  {
    question: `What does the ${EVENT_CONFIG.currencySymbol}${EVENT_CONFIG.participationFee} ${EVENT_CONFIG.feeLabel.toLowerCase()} cover?`,
    answer:
      `The updated ${EVENT_CONFIG.feeLabel.toLowerCase()} of ${EVENT_CONFIG.currencySymbol}${EVENT_CONFIG.participationFee} per student (pending organizer confirmation; baseline brochure fee ₹${EVENT_CONFIG.brochureOriginalFee} preserved for historical reference) covers the full 6-hour interactive bootcamp, hands-on BMC sprint, the physical Startup Founder Kit with Business Model Canvas, certified accreditation from E-Cell IIT Bombay, and fast-track consideration for Eureka! 2026.`,
  },
  {
    question: 'Do I need to already have an idea or existing startup to join?',
    answer:
      'Not at all! ILLUMINATE is specifically designed to take you from square one. Sessions 1 to 4 focus explicitly on the entrepreneurial mindset, multidisciplinary team formation, and creative problem identification to help you discover viable startup ideas during the workshop.',
  },
  {
    question: 'What are the hosting prerequisites for our college?',
    answer:
      'Your college needs a dedicated 1-day seminar hall with 100+ seating and a quality sound system, speaker pick-and-drop from the nearest transit hub, 5 student coordinators + 1 faculty coordinator, and a minimum of 70 participants.',
  },
  {
    question: 'How does the Eureka! fast-track nomination work?',
    answer:
      "During Session 9 (Pitching Workshop), teams present their Business Model Canvas. The most promising concepts receive direct guidance, mentorship feedback, and fast-track evaluation into Eureka! — Asia's largest business model competition held at IIT Bombay.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/40 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <HelpCircle className="w-3.5 h-3.5" /> Clarifications
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Frequently Asked <span className="text-red-500">Questions</span>
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base font-light">
            Everything you need to know about the curriculum, certification, and institutional hosting.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-red-600/30"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-base font-bold text-white hover:text-red-400 transition-colors">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-red-950/80' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-zinc-300 font-light leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
