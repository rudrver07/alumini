/**
 * ILLUMINATE — Enterprise Audio Controller & Web Audio Unlock Engine
 * 
 * Provides:
 * 1. Synchronous Web Audio Context pre-unlocking during user gestures (prevents transient activation loss during async fetch).
 * 2. Preloading and binary verification of registration-success.wav.
 * 3. Guaranteed one-time playback guarded by sessionStorage and active state refs.
 * 4. Graceful fallback to HTMLAudioElement if Web Audio API is unsupported.
 * 5. Automatic audio ducking coordination for background music systems.
 * 6. Explicit stop and reset functionality on popup dismissal.
 */

import { EVENT_CONFIG } from '@/config/event.config';

class RegistrationAudioController {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;
  private isPreloaded = false;
  private isPreloading = false;
  private currentlyPlayingId: string | null = null;

  constructor() {
    // Lazy initialized on client
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    return this.audioContext;
  }

  /**
   * Preloads and verifies the registration success WAV audio asset.
   * Caches the decoded AudioBuffer in memory for instantaneous, zero-latency playback.
   */
  async preloadAudio(): Promise<boolean> {
    if (typeof window === 'undefined' || this.isPreloaded || this.isPreloading) {
      return this.isPreloaded;
    }

    this.isPreloading = true;
    try {
      const res = await fetch(EVENT_CONFIG.registrationSuccessAudioPath, {
        method: 'GET',
        cache: 'force-cache',
      });

      if (!res.ok) {
        throw new Error(`Failed to load audio asset: HTTP ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const ctx = this.getAudioContext();

      if (ctx) {
        this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      }

      // Also prepare fallback HTMLAudioElement
      this.fallbackAudio = new Audio(EVENT_CONFIG.registrationSuccessAudioPath);
      this.fallbackAudio.preload = 'auto';
      this.fallbackAudio.loop = false;

      this.isPreloaded = true;
      return true;
    } catch (err) {
      console.warn('[AudioController] Audio preloading notice:', err);
      return false;
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Unlocks the AudioContext synchronously within a direct user gesture (e.g. clicking Submit).
   * Prevents browser autoplay policy rejection when awaiting async database persistence.
   */
  unlockOnUserGesture(): void {
    if (typeof window === 'undefined') return;

    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Pre-warm fallback audio element silently
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(EVENT_CONFIG.registrationSuccessAudioPath);
        this.fallbackAudio.loop = false;
      }
    } catch {
      // Ignore synchronous unlock errors
    }
  }

  /**
   * Plays the confirmation voice recording exactly once for a confirmed registration ID.
   * Guarded by sessionStorage and active state.
   */
  async playRegistrationConfirmation(
    registrationId: string
  ): Promise<{ success: boolean; blocked: boolean; reason?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, blocked: false, reason: 'server_environment' };
    }

    // 1. Check if already played in the current browser session
    const storageKey = `illum_audio_played_${registrationId}`;
    if (sessionStorage.getItem(storageKey)) {
      return { success: false, blocked: false, reason: 'already_played' };
    }

    // Stop any existing playback
    this.stopAudio();

    // Mark as played in sessionStorage immediately
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Storage access may be restricted in private browsing
    }

    this.currentlyPlayingId = registrationId;

    // Dispatch voice start event for background music ducking
    window.dispatchEvent(new CustomEvent('illuminate:voice-playback-start', { detail: { registrationId } }));

    const ctx = this.getAudioContext();

    // 2. Try Web Audio API playback
    if (ctx && this.audioBuffer) {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createBufferSource();
        source.buffer = this.audioBuffer;
        source.loop = false;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 1.0;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.onended = () => {
          this.activeSourceNode = null;
          this.currentlyPlayingId = null;
          window.dispatchEvent(new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId } }));
        };

        source.start(0);
        this.activeSourceNode = source;

        return { success: true, blocked: false };
      } catch (err) {
        console.warn('[AudioController] Web Audio playback failed, falling back to HTMLAudio:', err);
      }
    }

    // 3. Fallback to HTMLAudioElement
    try {
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(EVENT_CONFIG.registrationSuccessAudioPath);
        this.fallbackAudio.loop = false;
      }

      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio.loop = false;
      this.fallbackAudio.volume = 1.0;

      this.fallbackAudio.onended = () => {
        this.currentlyPlayingId = null;
        window.dispatchEvent(new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId } }));
      };

      const playPromise = this.fallbackAudio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      return { success: true, blocked: false };
    } catch (err) {
      console.warn('[AudioController] HTMLAudio playback blocked by browser:', err);
      window.dispatchEvent(new CustomEvent('illuminate:voice-playback-blocked', { detail: { registrationId } }));
      return { success: false, blocked: true, reason: 'browser_autoplay_blocked' };
    }
  }

  /**
   * Manual play triggered by participant tap on "Tap to hear confirmation" button.
   */
  async playManualFallback(
    registrationId: string
  ): Promise<{ success: boolean; blocked: boolean }> {
    if (typeof window === 'undefined') return { success: false, blocked: false };

    // Stop active audio
    this.stopAudio();

    // Dispatch start
    window.dispatchEvent(new CustomEvent('illuminate:voice-playback-start', { detail: { registrationId } }));

    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (ctx && this.audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = this.audioBuffer;
        source.loop = false;
        source.connect(ctx.destination);
        source.onended = () => {
          this.activeSourceNode = null;
          window.dispatchEvent(new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId } }));
        };
        source.start(0);
        this.activeSourceNode = source;
        return { success: true, blocked: false };
      }

      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(EVENT_CONFIG.registrationSuccessAudioPath);
      }
      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio.loop = false;
      this.fallbackAudio.volume = 1.0;
      this.fallbackAudio.onended = () => {
        window.dispatchEvent(new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId } }));
      };
      await this.fallbackAudio.play();
      return { success: true, blocked: false };
    } catch (err) {
      console.warn('[AudioController] Manual play error:', err);
      return { success: false, blocked: true };
    }
  }

  /**
   * Immediately stops and resets any ongoing confirmation voice playback.
   */
  stopAudio(): void {
    if (typeof window === 'undefined') return;

    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {
        // Source node may already be stopped
      }
      this.activeSourceNode = null;
    }

    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      } catch {
        // Ignore
      }
    }

    if (this.currentlyPlayingId) {
      window.dispatchEvent(
        new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId: this.currentlyPlayingId } })
      );
      this.currentlyPlayingId = null;
    }
  }
}

export const audioController = new RegistrationAudioController();
