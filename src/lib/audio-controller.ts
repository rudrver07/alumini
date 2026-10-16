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
  private rawArrayBuffer: ArrayBuffer | null = null;
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;
  private isPreloaded = false;
  private isPreloading = false;
  private currentlyPlayingId: string | null = null;
  private playedIds = new Set<string>();

  constructor() {
    // Lazy initialized on client
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext || this.audioContext.state === 'closed') {
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
      const audioUrl = EVENT_CONFIG.registrationSuccessAudioPath || '/audio/registration-success.wav';
      const res = await fetch(audioUrl, {
        method: 'GET',
        cache: 'force-cache',
      });

      if (!res.ok) {
        throw new Error(`Failed to load audio asset: HTTP ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      this.rawArrayBuffer = arrayBuffer.slice(0); // preserve raw copy

      const ctx = this.getAudioContext();
      if (ctx) {
        try {
          this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[AudioDiagnostics] Audio preloaded successfully: duration=${this.audioBuffer.duration.toFixed(2)}s, sampleRate=${this.audioBuffer.sampleRate}Hz`
            );
          }
        } catch (decodeErr) {
          console.warn('[AudioDiagnostics] Web Audio decode warning (will retry on unlock):', decodeErr);
        }
      }

      // Also prepare fallback HTMLAudioElement
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(audioUrl);
        this.fallbackAudio.preload = 'auto';
        this.fallbackAudio.loop = false;
        this.fallbackAudio.load();
      }

      this.isPreloaded = true;
      return true;
    } catch (err) {
      console.warn('[AudioDiagnostics] Preload notice:', err);
      return false;
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Unlocks the AudioContext synchronously within a direct user gesture (e.g. clicking Submit).
   * Prevents browser autoplay policy rejection when awaiting async database persistence.
   */
  async unlockOnUserGesture(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Decode audio buffer if not yet decoded
        if (!this.audioBuffer && this.rawArrayBuffer) {
          try {
            this.audioBuffer = await ctx.decodeAudioData(this.rawArrayBuffer.slice(0));
          } catch (e) {
            console.warn('[AudioDiagnostics] Decode on gesture error:', e);
          }
        }

        // Prime audio pipeline with a silent 1-sample buffer to bind hardware
        try {
          const silentBuffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = silentBuffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch {
          // Ignore silent buffer failure
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AudioDiagnostics] AudioContext state on gesture: ${ctx.state}`);
        }
      }

      // Warm up fallback HTMLAudioElement
      const audioUrl = EVENT_CONFIG.registrationSuccessAudioPath || '/audio/registration-success.wav';
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(audioUrl);
        this.fallbackAudio.preload = 'auto';
        this.fallbackAudio.loop = false;
      }
      this.fallbackAudio.load();
    } catch (err) {
      console.warn('[AudioDiagnostics] Unlock gesture notice:', err);
    }
  }

  /**
   * Plays the confirmation voice recording exactly once for a confirmed registration ID.
   * Guarded by in-memory Set and sessionStorage.
   */
  async playRegistrationConfirmation(
    registrationId: string
  ): Promise<{ success: boolean; blocked: boolean; reason?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, blocked: false, reason: 'server_environment' };
    }

    // 1. Check if already played in the current browser session
    const storageKey = `illum_audio_played_${registrationId}`;
    if (this.playedIds.has(registrationId) || sessionStorage.getItem(storageKey)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AudioDiagnostics] Skipping duplicate playback for ID: ${registrationId}`);
      }
      return { success: false, blocked: false, reason: 'already_played' };
    }

    // Stop any existing playback
    this.stopAudio();

    // Mark as played in memory and sessionStorage immediately
    this.playedIds.add(registrationId);
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Storage access may be restricted in private browsing
    }

    this.currentlyPlayingId = registrationId;

    // Dispatch voice start event for background music ducking
    window.dispatchEvent(new CustomEvent('illuminate:voice-playback-start', { detail: { registrationId } }));

    const ctx = this.getAudioContext();

    // 2. Try Web Audio API playback (Running AudioContext is immune to async activation expiry)
    if (ctx) {
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // If audioBuffer is not yet decoded, decode from raw array buffer or fetch now
        if (!this.audioBuffer) {
          if (this.rawArrayBuffer) {
            this.audioBuffer = await ctx.decodeAudioData(this.rawArrayBuffer.slice(0));
          } else {
            const audioUrl = EVENT_CONFIG.registrationSuccessAudioPath || '/audio/registration-success.wav';
            const res = await fetch(audioUrl);
            const ab = await res.arrayBuffer();
            this.rawArrayBuffer = ab.slice(0);
            this.audioBuffer = await ctx.decodeAudioData(ab);
          }
        }

        if (this.audioBuffer && ctx.state === 'running') {
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

          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AudioDiagnostics] Confirmation voice playing via Web Audio API for ID: ${registrationId}`);
          }

          return { success: true, blocked: false };
        }
      } catch (err) {
        console.warn('[AudioDiagnostics] Web Audio playback failed, falling back to HTMLAudio:', err);
      }
    }

    // 3. Fallback to HTMLAudioElement
    try {
      const audioUrl = EVENT_CONFIG.registrationSuccessAudioPath || '/audio/registration-success.wav';
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(audioUrl);
        this.fallbackAudio.preload = 'auto';
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

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AudioDiagnostics] Confirmation voice playing via HTMLAudio for ID: ${registrationId}`);
      }

      return { success: true, blocked: false };
    } catch (err) {
      console.warn('[AudioDiagnostics] Autoplay restricted by browser policy:', err);
      window.dispatchEvent(new CustomEvent('illuminate:voice-playback-blocked', { detail: { registrationId } }));
      return { success: false, blocked: true, reason: 'browser_autoplay_blocked' };
    }
  }

  /**
   * Manual play triggered by participant tap on "Play confirmation audio" button.
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
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        if (!this.audioBuffer && this.rawArrayBuffer) {
          try {
            this.audioBuffer = await ctx.decodeAudioData(this.rawArrayBuffer.slice(0));
          } catch {}
        }

        if (this.audioBuffer) {
          const source = ctx.createBufferSource();
          source.buffer = this.audioBuffer;
          source.loop = false;
          source.connect(ctx.destination);
          source.onended = () => {
            this.activeSourceNode = null;
            this.currentlyPlayingId = null;
            window.dispatchEvent(new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId } }));
          };
          source.start(0);
          this.activeSourceNode = source;
          return { success: true, blocked: false };
        }
      }

      const audioUrl = EVENT_CONFIG.registrationSuccessAudioPath || '/audio/registration-success.wav';
      if (!this.fallbackAudio) {
        this.fallbackAudio = new Audio(audioUrl);
      }
      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio.loop = false;
      this.fallbackAudio.volume = 1.0;
      this.fallbackAudio.onended = () => {
        this.currentlyPlayingId = null;
        window.dispatchEvent(new CustomEvent('illuminate:voice-playback-end', { detail: { registrationId } }));
      };
      await this.fallbackAudio.play();
      return { success: true, blocked: false };
    } catch (err) {
      console.warn('[AudioDiagnostics] Manual play error:', err);
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
