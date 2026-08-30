/**
 * ABDO HOUSE — Sound Architecture & Web Audio Ambient Engine
 * Zero autoplay sound, with ambient luxury harmonic drone & UI resonance when unmuted.
 */

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.droneOscs = [];
    this.btn = document.querySelector('.audio-toggle-btn');
    this.statusText = document.querySelector('.audio-status-text');

    this.bindEvents();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.setupAmbientDrone();
    }
  }

  setupAmbientDrone() {
    // Warm cinematic low drone (Root: D minor / 73.4Hz & 146.8Hz + Fifth 110Hz + Shimmer 440Hz)
    const freqs = [73.42, 110.00, 146.83, 220.00];
    
    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320 + i * 80, this.ctx.currentTime);

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Micro detune for lush cinematic warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04 / (i + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.droneOscs.push(osc);
    });
  }

  bindEvents() {
    if (this.btn) {
      this.btn.addEventListener('click', () => {
        this.toggle();
      });
    }

    // Attach subtle UI resonance to luxury buttons
    document.querySelectorAll('.btn, .project-card, .nav-link').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (!this.isMuted) this.playSubtleChime();
      });
    });
  }

  toggle() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.btn) {
      if (!this.isMuted) {
        this.btn.classList.add('audio-active');
        if (this.statusText) this.statusText.textContent = 'SOUND ON';
        this.fadeIn(0.18, 1.2);
      } else {
        this.btn.classList.remove('audio-active');
        if (this.statusText) this.statusText.textContent = 'SOUND OFF';
        this.fadeOut(0.6);
      }
    }
  }

  fadeIn(targetGain, duration) {
    if (!this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + duration);
  }

  fadeOut(duration) {
    if (!this.masterGain) return;
    this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
  }

  playSubtleChime() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}
