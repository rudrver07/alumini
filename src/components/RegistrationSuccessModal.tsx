'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Volume2 } from 'lucide-react';
import { Registration } from '@/types';
import { audioController } from '@/lib/audio-controller';

export interface RegistrationSuccessModalProps {
  registration: Registration;
  onClose: () => void;
  audioBlocked?: boolean;
}

export default function RegistrationSuccessModal({
  registration,
  onClose,
  audioBlocked = false,
}: RegistrationSuccessModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showTapToHear, setShowTapToHear] = useState(audioBlocked);
  const [isPlayingManual, setIsPlayingManual] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (audioBlocked) {
      setShowTapToHear(true);
    }
  }, [audioBlocked]);

  // Ensure client-side portal mounting and lock background body scroll
  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Listen for audio blocked events (e.g. if browser blocked auto-play)
    const handleBlocked = () => {
      setShowTapToHear(true);
    };
    window.addEventListener('illuminate:voice-playback-blocked', handleBlocked);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('illuminate:voice-playback-blocked', handleBlocked);
      // Immediately stop audio when popup unmounts or leaves screen
      audioController.stopAudio();
    };
  }, []);

  // Stop and reset audio when popup closes
  const handleClose = () => {
    audioController.stopAudio();
    onClose();
  };

  const handleManualPlay = async () => {
    setIsPlayingManual(true);
    try {
      const result = await audioController.playManualFallback(registration.registration_id);
      if (result.success) {
        setShowTapToHear(false);
      }
    } catch (err) {
      console.warn('[Popup Audio] Manual playback error:', err);
    } finally {
      setIsPlayingManual(false);
    }
  };

  // Render modal content via React Portal directly into document.body to ensure it floats over the entire site
  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-success-heading"
      style={{ isolation: 'isolate' }}
    >
      <div className="relative w-full max-w-lg p-8 sm:p-12 rounded-3xl border border-red-600/60 bg-[#0a0a0d] text-white shadow-[0_0_80px_rgba(220,38,38,0.35)] overflow-hidden text-center animate-modal-scale-fade my-auto z-10">
        {/* Ambient Crimson Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-950/30 rounded-full blur-3xl pointer-events-none" />

        {/* Top Close Icon Button */}
        <button
          type="button"
          onClick={handleClose}
          id="btn-close-modal-icon"
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close Confirmation Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Green Checkmark with smooth scale-and-fade animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex items-center justify-center text-emerald-400 mx-auto animate-checkmark-scale-fade">
            <Check className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
          </div>
        </div>

        {/* Heading: Registration Successful! */}
        <h3
          id="modal-success-heading"
          className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3"
        >
          Registration Successful!
        </h3>

        {/* Message: Your initial registration has been done */}
        <p className="text-base sm:text-lg font-bold text-red-100 mb-2">
          Your initial registration has been done
        </p>

        {/* Supporting Message */}
        <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
          The ILLUMINATE team will share further details.
        </p>

        {/* Optional fallback control when browser blocks autoplay */}
        {showTapToHear && (
          <div className="mb-6">
            <button
              type="button"
              id="btn-tap-to-hear-confirmation"
              onClick={handleManualPlay}
              disabled={isPlayingManual}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/90 border border-red-500/50 text-red-300 hover:text-white hover:border-red-500 text-xs font-semibold transition shadow-md cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              {isPlayingManual ? 'Playing confirmation audio...' : 'Play confirmation audio'}
            </button>
          </div>
        )}

        {/* Clean Registration Summary Badge */}
        <div className="p-4 mb-8 rounded-2xl bg-zinc-900/80 border border-white/10 text-left text-xs text-zinc-300 space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-zinc-400">Participant</span>
            <span className="font-bold text-white">{registration.full_name}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-zinc-400">AKTU Roll No.</span>
            <span className="font-medium text-zinc-200 font-mono">{registration.aktu_roll_no || registration.college}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Registration ID</span>
            <span className="font-mono text-red-400 font-bold">{registration.registration_id}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="flex justify-center">
          <button
            type="button"
            id="close-confirmation-modal"
            onClick={handleClose}
            className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold transition-all shadow-lg shadow-red-950/50 red-glow cursor-pointer text-sm tracking-wide"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Use createPortal to mount on document.body, escaping all parent container constraints
  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}
