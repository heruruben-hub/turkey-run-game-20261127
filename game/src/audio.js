// Gobble Dash — every sound is synthesised live with WebAudio: no audio
// files, no network, just oscillators and a little noise. The music is a
// plucky banjo-ish loop that quickens as the turkey runs faster.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicTempo = 132;
  }

  // Browsers only let audio start after a gesture; call from input handlers.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noiseBurst(dur, vol, lowFreq) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowFreq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  }

  // The turkey's signature: a quick gobble-gobble.
  gobble() {
    const notes = [520, 660, 520, 660, 440];
    notes.forEach((f, i) => this.tone(f, 0.09, 'square', 0.12, i * 0.07, f * 0.82));
  }

  jump() {
    this.tone(280, 0.16, 'sine', 0.18, 0, 620);
  }

  doubleJump() {
    this.tone(420, 0.14, 'sine', 0.16, 0, 880);
  }

  pickup() {
    this.tone(880, 0.09, 'triangle', 0.16);
    this.tone(1320, 0.12, 'triangle', 0.14, 0.07);
  }

  drumstick() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.16, i * 0.06));
  }

  thud() {
    this.noiseBurst(0.18, 0.35, 320);
    this.tone(110, 0.22, 'sine', 0.3, 0, 55);
  }

  caughtSting() {
    [392, 370, 349, 311].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.12, i * 0.16));
    this.noiseBurst(0.4, 0.2, 240);
  }

  fanfare() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.18, i * 0.1));
    this.tone(1568, 0.5, 'triangle', 0.16, 0.52);
  }

  click() {
    this.tone(700, 0.06, 'square', 0.08);
  }

  // A simple plucked loop: C pentatonic walk over a soft bass thump.
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const melody = [523, 0, 587, 659, 0, 784, 659, 587, 523, 0, 440, 523, 0, 659, 587, 0];
    const bass = [131, 0, 0, 0, 98, 0, 0, 0, 110, 0, 0, 0, 98, 0, 131, 0];
    const stepDur = 60 / this.musicTempo / 2;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const i = this.musicStep % 16;
      if (melody[i]) this.tone(melody[i], 0.22, 'triangle', 0.07);
      if (bass[i]) this.tone(bass[i], 0.3, 'sine', 0.12);
      this.musicStep++;
    }, stepDur * 1000);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
