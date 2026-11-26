/**
 * Procedural Web Audio score & SFX engine for Chapter 00.
 * - Composes a real multi-track psychological-thriller suspense soundtrack
 *   during the Prologue (dark minor piano motif with echo/reverb bus, bowed
 *   cello/string pad swells, subtle muffled heartbeat pulse, and eerie high
 *   harmonic tension that intensifies during Act 2 — A ruptura).
 * - Delivers crisp, smartphone-speaker-audible UI & hardware SFX with
 *   synchronous iOS Safari AudioContext unlocking.
 */

function triggerHaptic(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return;
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported vibration errors.
  }
}

// D minor / Phrygian haunting piano motif (Hz)
// 16-step dark cinema-noir sequence (null = atmospheric rest)
const PAST_PIANO_SEQ: ReadonlyArray<number | null> = [
  293.66, // D4
  null,
  349.23, // F4
  329.63, // E4
  220.0,  // A3
  null,
  233.08, // Bb3
  null,
  293.66, // D4
  null,
  311.13, // Eb4 (Phrygian suspense inflection)
  293.66, // D4
  220.0,  // A3
  null,
  261.63, // C4
  null,
];

const RUPTURE_PIANO_SEQ: ReadonlyArray<number | null> = [
  293.66, // D4
  311.13, // Eb4
  null,
  220.0,  // A3
  233.08, // Bb3
  null,
  185.0,  // F#3 / eerie tritone shadow
  220.0,  // A3
  349.23, // F4
  329.63, // E4
  null,
  293.66, // D4
  233.08, // Bb3
  220.0,  // A3
  null,
  146.83, // D3
];

// Slow dark string chord roots (4 bars: Dm -> Bb -> Gm -> A)
const STRING_CHORDS_PAST: ReadonlyArray<readonly number[]> = [
  [146.83, 220.0, 349.23], // Dm (D3, A3, F4)
  [116.54, 174.61, 293.66], // Bb (Bb2, F3, D4)
  [196.0, 233.08, 293.66], // Gm (G3, Bb3, D4)
  [110.0, 164.81, 277.18], // A  (A2, E3, C#4)
];

const STRING_CHORDS_RUPTURE: ReadonlyArray<readonly number[]> = [
  [146.83, 220.0, 311.13], // Dm(b9) / cold tension
  [116.54, 174.61, 329.63], // Bbmaj7#11
  [196.0, 233.08, 369.99], // Gm(maj7)
  [110.0, 233.08, 329.63], // A7b9 suspense dominant
];

interface MusicSession {
  mode: 'warm-dark' | 'cold-rupture';
  step: number;
  timerId: number | null;
  busGain: GainNode;
  delayNode: DelayNode;
  delayFeedback: GainNode;
  delayFilter: BiquadFilterNode;
}

class ChapterAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private musicSession: MusicSession | null = null;

  private ensureContext(): { ctx: AudioContext; out: AudioNode } | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.14;

      const master = this.ctx.createGain();
      master.gain.value = 0.92;

      master.connect(compressor);
      compressor.connect(this.ctx.destination);
      this.masterGain = master;
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }

    return {
      ctx: this.ctx,
      out: this.masterGain ?? this.ctx.destination,
    };
  }

  /**
   * Synchronously unlocks Web Audio inside a direct user gesture (tap/click)
   * so iOS Safari & Android Chrome play music and SFX immediately.
   */
  public unlock(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx } = audio;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      // Ignore if already unlocked.
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAmbientDrone();
    } else {
      this.unlock();
    }
  }

  /**
   * Starts (or shifts intensity of) the real psychological-thriller suspense
   * soundtrack during the Prologue: dark minor piano motif, cinematic string
   * swells, muffled suspense pulse, and distant hall echo.
   */
  public startAmbientDrone(mode: 'warm-dark' | 'cold-rupture' = 'warm-dark'): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    if (this.musicSession) {
      this.musicSession.mode = mode;
      return;
    }

    const now = ctx.currentTime;
    const busGain = ctx.createGain();
    busGain.gain.setValueAtTime(0.0001, now);
    busGain.gain.linearRampToValueAtTime(0.75, now + 1.2);
    busGain.connect(out);

    // Dark hall echo / delay send for cinematic depth
    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.value = 0.44;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.42;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1450;

    delayNode.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delayNode);
    delayFilter.connect(busGain);

    const session: MusicSession = {
      mode,
      step: 0,
      timerId: null,
      busGain,
      delayNode,
      delayFeedback,
      delayFilter,
    };

    const scheduleStep = () => {
      if (!this.musicSession || this.musicSession !== session || !this.ctx || this.muted) {
        return;
      }

      const c = this.ctx;
      const t = c.currentTime + 0.03;
      const isRupture = session.mode === 'cold-rupture';
      const stepIdx = session.step % 16;
      const chordIdx = Math.floor(stepIdx / 4) % 4;
      const stepMs = isRupture ? 580 : 680;

      // 1. Dark atmospheric piano note
      const seq = isRupture ? RUPTURE_PIANO_SEQ : PAST_PIANO_SEQ;
      const noteFreq = seq[stepIdx];
      if (noteFreq) {
        this.playSuspensePianoNote(c, session, noteFreq, t, isRupture ? 0.22 : 0.19);
      }

      // 2. Slow bowed cinematic string pad swell every 4 steps (1 chord per bar)
      if (stepIdx % 4 === 0) {
        const chords = isRupture ? STRING_CHORDS_RUPTURE : STRING_CHORDS_PAST;
        const chord = chords[chordIdx];
        this.playSuspenseStringSwell(
          c,
          session,
          chord,
          t,
          (stepMs * 4.2) / 1000,
          isRupture ? 0.095 : 0.075
        );
      }

      // 3. Muffled suspense heartbeat pulse (every 4 steps in past, every 2 steps in rupture)
      if (stepIdx % 4 === 0 || (isRupture && stepIdx % 4 === 2)) {
        this.playSuspensePulse(c, session, t, isRupture ? 0.24 : 0.17);
      }

      // 4. Eerie high bowed tension shimmer on bar 2 & 4
      if ((stepIdx === 6 || stepIdx === 14) && isRupture) {
        this.playEerieShimmer(c, session, t);
      }

      session.step += 1;
      session.timerId = window.setTimeout(scheduleStep, stepMs);
    };

    this.musicSession = session;
    scheduleStep();
  }

  private playSuspensePianoNote(
    ctx: AudioContext,
    session: MusicSession,
    freq: number,
    startTime: number,
    peakGain: number
  ): void {
    // Rich dark felt-piano synthesis: fundamental + subtle 2nd/3rd harmonics + damped hammer transient
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();
    const harmGain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    harmGain.gain.value = 0.28;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.frequency.exponentialRampToValueAtTime(420, startTime + 1.4);

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(peakGain, startTime + 0.018);
    env.gain.exponentialRampToValueAtTime(peakGain * 0.35, startTime + 0.45);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.1);

    osc1.connect(filter);
    osc2.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(env);
    env.connect(session.busGain);
    env.connect(session.delayNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 2.2);
    osc2.stop(startTime + 2.2);
  }

  private playSuspenseStringSwell(
    ctx: AudioContext,
    session: MusicSession,
    freqs: readonly number[],
    startTime: number,
    durationSec: number,
    peakGain: number
  ): void {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, startTime);
    filter.frequency.linearRampToValueAtTime(920, startTime + durationSec * 0.55);
    filter.frequency.linearRampToValueAtTime(440, startTime + durationSec);
    filter.Q.value = 0.8;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.linearRampToValueAtTime(peakGain, startTime + durationSec * 0.42);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    filter.connect(env);
    env.connect(session.busGain);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      // Slight cinema-string detune for warm ensemble width
      osc.frequency.setValueAtTime(f * (idx % 2 === 0 ? 0.997 : 1.003), startTime);
      osc.connect(filter);
      osc.start(startTime);
      osc.stop(startTime + durationSec + 0.08);
    });
  }

  private playSuspensePulse(
    ctx: AudioContext,
    session: MusicSession,
    startTime: number,
    peakGain: number
  ): void {
    // Double muffled thriller heartbeat (lub-dub) tuned so phone speakers feel the pulse
    [0, 0.22].forEach((offset, idx) => {
      const t = startTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const startFreq = idx === 0 ? 155 : 132;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(62, t + 0.16);

      const level = idx === 0 ? peakGain : peakGain * 0.65;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(level, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      osc.connect(gain);
      gain.connect(session.busGain);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  private playEerieShimmer(
    ctx: AudioContext,
    session: MusicSession,
    startTime: number
  ): void {
    // Dissonant minor-second bowed violin harmonic (A4 + Bb4)
    [880, 932.33].forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.032, startTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

      osc.connect(gain);
      gain.connect(session.delayNode);
      osc.start(startTime);
      osc.stop(startTime + 1.9);
    });
  }

  public stopAmbientDrone(): void {
    if (!this.musicSession || !this.ctx) return;
    const session = this.musicSession;
    this.musicSession = null;

    if (session.timerId !== null) {
      window.clearTimeout(session.timerId);
    }

    const now = this.ctx.currentTime;
    try {
      session.busGain.gain.cancelScheduledValues(now);
      session.busGain.gain.setTargetAtTime(0.0001, now, 0.25);
    } catch {
      // Ignore already disconnected bus.
    }
  }

  public playStartInvestigation(): void {
    this.unlock();
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    // Brief electrical terminal click + deep thriller resonance
    const bufLen = Math.floor(ctx.sampleRate * 0.06);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.25)) * 0.45;
    }
    const staticSrc = ctx.createBufferSource();
    staticSrc.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1700;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.18, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    staticSrc.connect(bp);
    bp.connect(sg);
    sg.connect(out);
    staticSrc.start(now);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.48);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.62);
    triggerHaptic(18);
  }

  public playFileAccessClick(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.025);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.036);
  }

  public playPrologueStep(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(165, now + 0.14);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playRuptureGlitch(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.28);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      const stutter = Math.sin(i * 0.08) > -0.2 ? 1 : 0.25;
      data[i] = (Math.random() * 2 - 1) * env * stutter * 0.85;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1950;
    bandpass.Q.value = 1.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(out);
    noise.start(now);

    const tone = ctx.createOscillator();
    const toneGain = ctx.createGain();
    tone.type = 'sawtooth';
    tone.frequency.setValueAtTime(420, now);
    tone.frequency.exponentialRampToValueAtTime(138, now + 0.55);

    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 1100;

    toneGain.gain.setValueAtTime(0.18, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    tone.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(out);
    tone.start(now);
    tone.stop(now + 0.62);
    triggerHaptic([35, 30, 50]);
  }

  public playDeadButtonClick(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1680, now);
    clickOsc.frequency.exponentialRampToValueAtTime(260, now + 0.032);
    clickGain.gain.setValueAtTime(0.24, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(out);
    clickOsc.start(now);
    clickOsc.stop(now + 0.045);

    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(230, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(115, now + 0.06);
    bodyGain.gain.setValueAtTime(0.18, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(out);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.07);

    triggerHaptic(16);
  }

  public playCablePlugSnap(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.045);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.25));
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 2600;
    hp.Q.value = 1.6;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    src.connect(hp);
    hp.connect(g);
    g.connect(out);
    src.start(now);
    triggerHaptic(22);
  }

  public playUsbConnectChime(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const notes = [587.33, 880];
    notes.forEach((freq, idx) => {
      const start = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();
      const overGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      overGain.gain.setValueAtTime(0.0001, start);
      overGain.gain.linearRampToValueAtTime(0.09, start + 0.012);
      overGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      osc.connect(gain);
      overtone.connect(overGain);
      overGain.connect(gain);
      gain.connect(out);

      osc.start(start);
      overtone.start(start);
      osc.stop(start + 0.48);
      overtone.stop(start + 0.25);
    });

    triggerHaptic([28, 45, 35]);
  }

  public playChargeTick(percent: number): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const ratio = Math.min(1, Math.max(0, percent / 100));
    const freq = 392 + ratio * 330;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playBootVibration(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const pulses = [
      { offset: 0, duration: 0.18 },
      { offset: 0.26, duration: 0.22 },
    ];

    pulses.forEach(({ offset, duration }) => {
      const start = now + offset;
      const carrier = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(178, start);
      harmonic.type = 'square';
      harmonic.frequency.setValueAtTime(356, start);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(30, start);
      lfoGain.gain.value = 0.08;

      filter.type = 'bandpass';
      filter.frequency.value = 340;
      filter.Q.value = 1.1;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.025);
      gain.gain.setValueAtTime(0.25, start + duration - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      const harmGain = ctx.createGain();
      harmGain.gain.value = 0.35;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      carrier.connect(filter);
      harmonic.connect(harmGain);
      harmGain.connect(filter);
      filter.connect(gain);
      gain.connect(out);

      carrier.start(start);
      harmonic.start(start);
      lfo.start(start);
      carrier.stop(start + duration + 0.03);
      harmonic.stop(start + duration + 0.03);
      lfo.stop(start + duration + 0.03);
    });

    triggerHaptic([140, 80, 160]);
  }

  public playKeypadTap(digit?: string): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const baseFreq = digit ? 720 + (Number(digit) % 5) * 32 : 590;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + 0.032);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.048);

    triggerHaptic(8);
  }

  public playPasscodeError(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    [0, 0.14].forEach((offset) => {
      const start = now + offset;
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, start);
      osc.frequency.exponentialRampToValueAtTime(165, start + 0.11);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(500, start);
      overtone.frequency.exponentialRampToValueAtTime(320, start + 0.11);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 780;

      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);

      osc.connect(filter);
      overtone.connect(filter);
      filter.connect(gain);
      gain.connect(out);

      osc.start(start);
      overtone.start(start);
      osc.stop(start + 0.13);
      overtone.stop(start + 0.13);
    });

    triggerHaptic([55, 45, 55]);
  }

  public playLockoutAlert(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const notes = [392, 233.08];
    notes.forEach((freq, idx) => {
      const start = now + idx * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.24, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);

      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.35);
    });

    triggerHaptic([90, 60, 140]);
  }

  public playUnlockSuccess(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const freqs = [440, 554.37, 659.25];
    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.24, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);

      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.52);
    });

    triggerHaptic([20, 40, 30]);
  }

  public playUiTap(): void {
    const audio = this.ensureContext();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(860, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.025);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.035);
  }
}

export const chapterAudio = new ChapterAudioEngine();
