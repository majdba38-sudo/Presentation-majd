/* ============================================================
   CASE FILE 001 — Synthesized ambience & UI sounds (Web Audio)
   No external audio files required.
   ============================================================ */

window.SoundEngine = (function () {
  'use strict';

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.ambientGain = null;
      this.enabled = false;
      this.nodes = [];
    }

    _ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;

      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);

      // Warm, low room tone — two slightly detuned oscillators + filtered noise.
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0;
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 340;
      this.ambientGain.connect(lowpass);
      lowpass.connect(this.master);

      [55, 82.4].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = i === 0 ? 0.5 : 0.22;
        osc.connect(g);
        g.connect(this.ambientGain);
        osc.start();
        this.nodes.push(osc);
      });

      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const band = this.ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 220;
      band.Q.value = 0.7;
      const ng = this.ctx.createGain();
      ng.gain.value = 0.12;
      noise.connect(band);
      band.connect(ng);
      ng.connect(this.ambientGain);
      noise.start();
      this.nodes.push(noise);

      return true;
    }

    setEnabled(on) {
      if (on && !this._ensure()) return false;
      this.enabled = on;
      if (!this.ctx) return on;

      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(on ? 0.55 : 0, now, 0.25);
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setTargetAtTime(on ? 0.16 : 0, now, 0.4);
      return on;
    }

    toggle() {
      return this.setEnabled(!this.enabled);
    }

    _tone(freq, duration, volume, type) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.7), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    click() {
      this._tone(520, 0.09, 0.075, 'sine');
    }

    stamp() {
      this._tone(96, 0.24, 0.2, 'triangle');
      this._tone(150, 0.13, 0.07, 'sine');
    }

    chime() {
      this._tone(660, 0.5, 0.045, 'sine');
      this._tone(990, 0.7, 0.03, 'sine');
    }
  }

  return new SoundEngine();
})();
