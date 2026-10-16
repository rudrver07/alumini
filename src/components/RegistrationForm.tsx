'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  AlertCircle,
  Tag,
  User,
  Mail,
  Phone,
  GraduationCap,
  Hash,
  ShieldCheck,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Registration } from '@/types';
import { EVENT_CONFIG } from '@/config/event.config';
import { audioController } from '@/lib/audio-controller';
import RegistrationSuccessModal from './RegistrationSuccessModal';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    aktu_roll_no: '',
    department: '',
    year_of_study: '3rd Year',
    city: '',
    state: '',
    expectations: '',
    referral_code: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateField, setDuplicateField] = useState<'email' | 'phone' | null>(null);
  const [registeredData, setRegisteredData] = useState<Registration | null>(null);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  // Synchronous submission lock to prevent rapid double-clicks
  const isSubmittingRef = useRef(false);

  // Preload audio asset when form mounts
  useEffect(() => {
    audioController.preloadAudio().catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg(null);
    if (duplicateField) setDuplicateField(null);
  };

  const fireCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#ef4444', '#ffffff', '#fbbf24', '#10b981'],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission on rapid repeated clicks
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Synchronously unlock AudioContext during the user's submit gesture
    await audioController.unlockOnUserGesture();

    setLoading(true);
    setErrorMsg(null);
    setDuplicateField(null);

    // Basic client validation
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.aktu_roll_no ||
      !formData.department ||
      !formData.city ||
      !formData.state
    ) {
      setErrorMsg('Please complete all required fields marked with *');
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit registration');
        if (data.duplicateField) {
          setDuplicateField(data.duplicateField);
        }
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // Backend confirmed database persistence!
      // Trigger confirmation voice recording immediately on successful backend response
      const audioResult = await audioController.playRegistrationConfirmation(data.registration.registration_id);
      setIsAudioBlocked(audioResult.blocked);

      // Display the registration success popup
      setRegisteredData(data.registration);
      fireCelebration();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const resetForm = () => {
    // Stop and reset audio when closing confirmation
    audioController.stopAudio();

    setIsAudioBlocked(false);
    setRegisteredData(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      aktu_roll_no: '',
      department: '',
      year_of_study: '3rd Year',
      city: '',
      state: '',
      expectations: '',
      referral_code: '',
    });
  };

  return (
    <>
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 bg-zinc-950/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Pricing Pill Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div>
          <span className="text-xs font-bold text-red-400 tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Participant Registration
          </span>
          <h3 className="text-2xl font-black text-white mt-1">Enroll in ILLUMINATE 2026</h3>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-900/90 border border-red-800/40">
          <Tag className="w-5 h-5 text-red-500" />
          <div>
            <div className="text-xs text-zinc-400">{EVENT_CONFIG.feeLabel}</div>
            <div className="text-lg font-black text-white">
              {EVENT_CONFIG.currencySymbol}{EVENT_CONFIG.participationFee}{' '}
              <span className="text-[10px] text-zinc-400 font-normal">/ Student</span>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate / General Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Registration Notice</strong>
            <span>{errorMsg}</span>
            {duplicateField && (
              <p className="mt-1 text-xs text-red-300">
                Tip: Each participant must register with a unique {duplicateField}. If you already registered, please contact the coordinator team.
              </p>
            )}
          </div>
        </div>
      )}

      {/* The Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-red-400" /> Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Rudransh Verma"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-red-400" /> Email Address *
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. rudransh@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-400" /> Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            />
          </div>

          {/* AKTU Roll No. */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-red-400" /> AKTU Roll No. *
            </label>
            <input
              type="text"
              name="aktu_roll_no"
              value={formData.aktu_roll_no}
              onChange={handleChange}
              placeholder="e.g. 2100970100045"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition font-mono"
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-red-400" /> Department / Branch *
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science / Management"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            />
          </div>

          {/* Year of Study */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-red-400" /> Current Academic Year *
            </label>
            <select
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            >
              <option value="1st Year">1st Year (Freshman)</option>
              <option value="2nd Year">2nd Year (Sophomore)</option>
              <option value="3rd Year">3rd Year (Junior)</option>
              <option value="4th Year">4th Year (Senior)</option>
              <option value="Post-Graduate / MBA">Post-Graduate / MBA</option>
              <option value="Faculty / Working Professional">Faculty / Working Professional</option>
            </select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Mumbai"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> State *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Maharashtra"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
            />
          </div>
        </div>

        {/* Expectations / Ideas */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">
            What do you hope to achieve at ILLUMINATE? (Optional)
          </label>
          <textarea
            name="expectations"
            value={formData.expectations}
            onChange={handleChange}
            rows={2}
            placeholder="Tell us about your startup idea, domain of interest, or what you hope to build..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
          />
        </div>

        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">
            Referral / Campus Ambassador Code (Optional)
          </label>
          <input
            type="text"
            name="referral_code"
            value={formData.referral_code}
            onChange={handleChange}
            placeholder="e.g. ECELL2026 / CAMPUS50"
            className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition font-mono uppercase"
          />
        </div>

        {/* Modular Payment Policy Notice */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-400 space-y-1">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>Inclusive Workshop Package Guarantee</span>
          </div>
          <p>
            Your {EVENT_CONFIG.currencySymbol}{EVENT_CONFIG.participationFee} {EVENT_CONFIG.feeLabel.toLowerCase()} (pending organizer confirmation; baseline brochure fee ₹{EVENT_CONFIG.brochureOriginalFee} preserved for historical reference) includes 6 hours of master training, an official Certificate of Participation certified by E-Cell IIT Bombay, the physical Startup Founder Kit with Business Model Canvas, and direct fast-track eligibility for Eureka!.
          </p>
          <p className="text-[11px] text-zinc-400">
            * Direct participant registration is secured upon submission. Organizer confirmation pending; baseline brochure fee ₹{EVENT_CONFIG.brochureOriginalFee} preserved for reference.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-base red-glow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer shadow-xl shadow-red-950/60"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Registering Participant...</span>
            </div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Confirm Workshop Registration</span>
            </>
          )}
        </button>
      </form>
    </div>

    {/* Dedicated Portal Overlay - Mounts directly into document.body over entire website */}
    {registeredData && (
      <RegistrationSuccessModal
        registration={registeredData}
        onClose={resetForm}
        audioBlocked={isAudioBlocked}
      />
    )}
  </>
);
}
