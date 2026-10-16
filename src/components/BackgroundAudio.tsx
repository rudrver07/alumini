'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { EVENT_CONFIG } from '@/config/event.config';

export default function BackgroundAudio() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio playback and volume state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [showSlider, setShowSlider] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Refs for event callbacks to avoid stale closures
  const isMutedRef = useRef(isMuted);
  const wasPlayingBeforeHideRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // If currently on an admin route, do not render or play audio
  const isAdmin = pathname?.startsWith('/admin');

  // Attempt to play audio smoothly
  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isMutedRef.current) return;

    try {
      audio.volume = volume;
      await audio.play();
      setIsPlaying(true);
      setHasInteracted(true);
    } catch {
      // Browser autoplay restriction prevented playback
      setIsPlaying(false);
    }
  }, [volume]);

  // Autoplay compliance via first user interaction
  useEffect(() => {
    if (isAdmin) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    // Direct initial attempt (in case browser policy permits)
    attemptPlay();

    // Attach one-time listeners for first user gesture
    const userGestures = ['pointerdown', 'keydown', 'touchstart', 'click'];
    const handleFirstGesture = () => {
      setHasInteracted(true);
      attemptPlay();
      userGestures.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
    };

    userGestures.forEach((evt) => {
      window.addEventListener(evt, handleFirstGesture, { passive: true });
    });

    // Visibility change handling: pause on tab hide, resume if was playing on tab return
    const handleVisibilityChange = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      if (document.hidden) {
        if (!currentAudio.paused) {
          wasPlayingBeforeHideRef.current = true;
          currentAudio.pause();
          setIsPlaying(false);
        } else {
          wasPlayingBeforeHideRef.current = false;
        }
      } else {
        if (wasPlayingBeforeHideRef.current && !isMutedRef.current) {
          currentAudio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Audio native event synchronization
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Audio Ducking for Registration Confirmation Voice (Test 8 requirement)
    let preDuckVolume = volume;
    const handleVoiceStart = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio || isMutedRef.current) return;
      preDuckVolume = currentAudio.volume;
      // Smoothly duck background music to 20% so confirmation voice is crystal clear
      currentAudio.volume = Math.max(0.05, preDuckVolume * 0.2);
    };

    const handleVoiceEnd = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio || isMutedRef.current) return;
      // Restore background music volume
      currentAudio.volume = preDuckVolume;
    };

    window.addEventListener('illuminate:voice-playback-start', handleVoiceStart);
    window.addEventListener('illuminate:voice-playback-end', handleVoiceEnd);

    // Cleanup all listeners on unmount
    return () => {
      userGestures.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      window.removeEventListener('illuminate:voice-playback-start', handleVoiceStart);
      window.removeEventListener('illuminate:voice-playback-end', handleVoiceEnd);
      audio.pause();
    };
  }, [isAdmin, attemptPlay, volume]);

  // Handle Mute/Unmute Toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      // Unmuting
      audio.muted = false;
      setIsMuted(false);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      // Muting
      audio.muted = true;
      setIsMuted(true);
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVol;
      if (newVol === 0) {
        audio.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Do not render on admin pages
  if (isAdmin) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-40 select-none transition-all duration-300"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
      role="region"
      aria-label="Background Soundtrack Controls"
    >
      {/* Hidden audio element loading registration.wav */}
      <audio
        ref={audioRef}
        src={EVENT_CONFIG.audioPath}
        loop
        preload="auto"
      />

      {/* Sleek Floating Glass Pill */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-full glass-panel bg-zinc-950/85 border border-white/10 hover:border-red-600/40 shadow-2xl backdrop-blur-md transition-all duration-300 group">
        {/* Toggle Mute / Unmute Button */}
        <button
          type="button"
          onClick={toggleMute}
          id="btn-toggle-background-audio"
          className="w-8 h-8 rounded-full bg-zinc-900/90 border border-zinc-700/60 hover:border-red-500/60 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer group-hover:scale-105"
          title={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
          aria-label={isMuted ? 'Unmute Background Music' : 'Mute Background Music'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-zinc-500" />
          ) : volume < 0.4 ? (
            <Volume1 className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-red-500" />
          )}
        </button>

        {/* Ambient Animated Equalizer Bars when playing and unmuted */}
        <div className="flex items-center gap-0.5 px-1 py-1 h-5 cursor-pointer" onClick={toggleMute}>
          <span
            className={`w-0.5 rounded-full bg-red-500 transition-all ${
              isPlaying && !isMuted ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-0.5 rounded-full bg-red-400 transition-all ${
              isPlaying && !isMuted ? 'h-4 animate-bounce' : 'h-1 opacity-40'
            }`}
            style={{ animationDelay: '150ms' }}
          />
          <span
            className={`w-0.5 rounded-full bg-red-600 transition-all ${
              isPlaying && !isMuted ? 'h-2.5 animate-pulse' : 'h-1.5 opacity-40'
            }`}
            style={{ animationDelay: '300ms' }}
          />
        </div>

        {/* Expandable Volume Slider */}
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
            showSlider ? 'w-28 opacity-100 pl-1' : 'w-0 opacity-0'
          }`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            id="audio-volume-slider"
            aria-label="Volume Slider"
            className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
          />
          <span className="text-[10px] font-mono text-zinc-400 w-6">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>

        {/* Tiny Label Indicator */}
        {!showSlider && (
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider pr-1 hidden sm:inline">
            {isMuted ? 'Muted' : isPlaying ? 'Audio' : hasInteracted ? 'Paused' : 'Sound'}
          </span>
        )}
      </div>
    </div>
  );
}
