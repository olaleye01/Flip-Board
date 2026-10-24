// Procedural Audio Engine for Flip Board using Web Audio API
// Implements category-specific soundscapes, dynamic streak pitch-shifting, and urgency ticking clock

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.streakPitch = 1.0;
    this.tickingInterval = null;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  setStreak(streak) {
    // Dynamic pitch-shifting: +0.1 pitch per consecutive match on a streak, resetting to 1.0 on miss
    if (streak <= 1) {
      this.streakPitch = 1.0;
    } else {
      this.streakPitch = Math.min(2.0, 1.0 + (streak - 1) * 0.1);
    }
  }

  resetStreak() {
    this.streakPitch = 1.0;
  }

  // --- Sound Dispatcher ---
  playFlip(categoryId = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (categoryId) {
      case 0: this._animalsFlip(); break;
      case 1: this._foodFlip(); break;
      case 2: this._sportFlip(); break;
      case 3: this._techFlip(); break;
      case 4: this._colorsFlip(); break;
      default: this._animalsFlip(); break;
    }
  }

  playMatch(categoryId = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const p = this.streakPitch;
    switch (categoryId) {
      case 0: this._animalsMatch(p); break;
      case 1: this._foodMatch(p); break;
      case 2: this._sportMatch(p); break;
      case 3: this._techMatch(p); break;
      case 4: this._colorsMatch(p); break;
      default: this._animalsMatch(p); break;
    }
  }

  playMiss(categoryId = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.resetStreak();
    switch (categoryId) {
      case 0: this._animalsMiss(); break;
      case 1: this._foodMiss(); break;
      case 2: this._sportMiss(); break;
      case 3: this._techMiss(); break;
      case 4: this._colorsMiss(); break;
      default: this._animalsMiss(); break;
    }
  }

  playWin(categoryId = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    switch (categoryId) {
      case 0: this._animalsWin(); break;
      case 1: this._foodWin(); break;
      case 2: this._sportWin(); break;
      case 3: this._techWin(); break;
      case 4: this._colorsWin(); break;
      default: this._animalsWin(); break;
    }
  }

  // --- Category 0: Animals (Jungle) ---
  // Flip: Hollow bamboo clack
  _animalsFlip() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Match: Upbeat Marimba chord
  _animalsMatch(pitch = 1.0) {
    const t = this.ctx.currentTime;
    const freqs = [392 * pitch, 493.88 * pitch, 587.33 * pitch, 783.99 * pitch];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.4, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.48);
    });
  }

  // Miss: Low wooden frog croak
  _animalsMiss() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Win: Tropical bird call & drum flourish
  _animalsWin() {
    const t = this.ctx.currentTime;
    // Bird whistle glide
    const bird = this.ctx.createOscillator();
    const birdGain = this.ctx.createGain();
    bird.type = 'sine';
    bird.frequency.setValueAtTime(1200, t);
    bird.frequency.exponentialRampToValueAtTime(2400, t + 0.18);
    bird.frequency.exponentialRampToValueAtTime(1600, t + 0.35);

    birdGain.gain.setValueAtTime(0.4, t);
    birdGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    bird.connect(birdGain);
    birdGain.connect(this.masterGain);
    bird.start(t);
    bird.stop(t + 0.42);

    // Drum flourish
    [0.1, 0.22, 0.35, 0.48].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + idx * 30, t + delay);
      osc.frequency.exponentialRampToValueAtTime(60, t + delay + 0.15);
      g.gain.setValueAtTime(0.5, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.2);
    });
  }

  // --- Category 1: Food (Bento / Diner) ---
  // Flip: Crisp ceramic clink
  _foodFlip() {
    const t = this.ctx.currentTime;
    [2100, 3150].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.11);
    });
  }

  // Match: Diner Bell (Ding!) + sizzle
  _foodMatch(pitch = 1.0) {
    const t = this.ctx.currentTime;
    // Bell Ding
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093 * pitch, t);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.62);

    // Harmonic bell chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(4186 * pitch, t);
    gain2.gain.setValueAtTime(0.2, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t);
    osc2.stop(t + 0.38);
  }

  // Miss: Hollow pot lid rattle
  _foodMiss() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.15);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Win: Kitchen timer ring & soda pop fizz
  _foodWin() {
    const t = this.ctx.currentTime;
    // Timer bell rapid dings
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760 + (i % 2) * 440, t + i * 0.1);
      g.gain.setValueAtTime(0.4, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.22);
    }
  }

  // --- Category 2: Sport (Stadium) ---
  // Flip: Basketball dribble thump
  _sportFlip() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Match: Clean net swish + crowd swell
  _sportMatch(pitch = 1.0) {
    const t = this.ctx.currentTime;
    // Chord flourish
    [523.25 * pitch, 659.25 * pitch, 783.99 * pitch, 1046.5 * pitch].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.03);
      gain.gain.setValueAtTime(0.4, t + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.03);
      osc.stop(t + idx * 0.03 + 0.42);
    });
  }

  // Miss: Short referee whistle chirp
  _sportMiss() {
    const t = this.ctx.currentTime;
    [2800, 2980].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Win: Buzzer-beater horn & applause
  _sportWin() {
    const t = this.ctx.currentTime;
    // Horn blast
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(261.63, t + 0.15);
    osc.frequency.setValueAtTime(329.63, t + 0.3);
    osc.frequency.setValueAtTime(440, t + 0.45);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  // --- Category 3: Technology (Cyber PCB) ---
  // Flip: Mechanical key switch click
  _techFlip() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Match: 8-bit synth power-up arpeggio
  _techMatch(pitch = 1.0) {
    const t = this.ctx.currentTime;
    const notes = [523.25 * pitch, 659.25 * pitch, 783.99 * pitch, 1046.5 * pitch, 1318.5 * pitch];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.25, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.16);
    });
  }

  // Miss: Low synth buzz
  _techMiss() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Win: Sci-fi power-core charge & chime
  _techWin() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.5);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.85);
  }

  // --- Category 4: Colors (Art Gallery) ---
  // Flip: Soft water-drop / glass tap
  _colorsFlip() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Match: Crystal glass harp shimmer
  _colorsMatch(pitch = 1.0) {
    const t = this.ctx.currentTime;
    const freqs = [880 * pitch, 1108.73 * pitch, 1318.51 * pitch, 1760 * pitch];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.3, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.55);
    });
  }

  // Miss: Muted brush sweep
  _colorsMiss() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.18);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Win: Lush blooming ambient chord
  _colorsWin() {
    const t = this.ctx.currentTime;
    // Major 9th shimmering pad (C - E - G - B - D)
    [261.63, 329.63, 392.00, 493.88, 587.33].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  // --- Urgency State (Final 10s Ticking Clock) ---
  // Accelerates from 1.0x to 1.5x tempo as time runs down
  startUrgencyClock(onTickCallback) {
    this.stopUrgencyClock();
    let tickCount = 0;

    const playTick = () => {
      if (this.isMuted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.05);

      if (onTickCallback) onTickCallback(tickCount);
      tickCount++;
    };

    // Initial tick
    playTick();
    // Accelerate interval from 1000ms down to 650ms
    const scheduleNext = (remainingRatio) => {
      // ratio 1.0 (at 10s) -> interval 1000ms; ratio 0.0 (at 0s) -> interval 660ms
      const interval = 660 + 340 * Math.max(0, Math.min(1, remainingRatio));
      this.tickingTimeout = setTimeout(() => {
        playTick();
        scheduleNext(Math.max(0, remainingRatio - 0.1));
      }, interval);
    };

    scheduleNext(1.0);
  }

  stopUrgencyClock() {
    if (this.tickingTimeout) {
      clearTimeout(this.tickingTimeout);
      this.tickingTimeout = null;
    }
  }
}

export const soundEngine = new SoundEngine();
