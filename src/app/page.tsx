import React from 'react';
import Navbar from '@/components/Navbar';
import ScrollExperience from '@/components/scroll-animation/ScrollExperience';
import MetricsBanner from '@/components/MetricsBanner';
import AboutSection from '@/components/AboutSection';
import CurriculumSection from '@/components/CurriculumSection';
import BenefitsSection from '@/components/BenefitsSection';
import RequirementsSection from '@/components/RequirementsSection';
import RegistrationSection from '@/components/RegistrationSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import BackgroundAudio from '@/components/BackgroundAudio';

export const metadata = {
  title: 'ILLUMINATE 2026 | Entrepreneurship Workshop by E-Cell, IIT Bombay',
  description:
    'Empowering the next generation of Changemakers. An intensive 6-hour hands-on venture incubation bootcamp covering the Business Model Canvas, startup finance, and fast-track pathway to Eureka! at IIT Bombay.',
  keywords: [
    'ILLUMINATE',
    'E-Cell IIT Bombay',
    'Entrepreneurship Workshop',
    'Business Model Canvas',
    'Eureka IIT Bombay',
    'Startup Bootcamp India',
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-red-600 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Hero: Canvas-based Scroll-controlled Animation */}
      <ScrollExperience />

      {/* Metrics & Impact Bar */}
      <MetricsBanner />

      {/* About E-Cell IIT Bombay */}
      <AboutSection />

      {/* 9-Session Official Curriculum Structure */}
      <CurriculumSection />

      {/* Benefits to College & Students */}
      <BenefitsSection />

      {/* College Hosting Requirements */}
      <RequirementsSection />

      {/* Real Participant Registration */}
      <RegistrationSection />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Floating Ambient Soundtrack Controls */}
      <BackgroundAudio />
    </div>
  );
}
