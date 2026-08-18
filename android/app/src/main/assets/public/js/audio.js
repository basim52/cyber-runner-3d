/**
 * Web Audio API Sound Synthesizer with Multi-World Music & Advanced SFX
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMusicPlaying = false;
    this.musicInterval = null;
    this.currentBiome = 'city';
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.4;
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.22;
        this.musicGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.sfxGain && this.musicGain) {
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.4;
      this.musicGain.gain.value = this.isMuted ? 0 : 0.22;
    }
    return this.isMuted;
  }

  setBiome(biome) {
    this.currentBiome = biome;
  }

  // Play Coin / Crystal Pickup chime
  playCollect(combo = 1) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    const baseFreq = 587.33; // D5
    const pitchMultiplier = Math.min(2.2, 1 + (combo - 1) * 0.12);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * pitchMultiplier * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Play Jump sound
  playJump(isDouble = false) {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = isDouble ? 'sawtooth' : 'triangle';
    const startF = isDouble ? 340 : 220;
    const endF = isDouble ? 880 : 660;

    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + 0.22);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Jump Pad Launch sound
  playJumpPad() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Warp Portal transition sound
  playWarp() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.8);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  // Upgrade Purchase Ding
  playPurchase() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.26);
    });
  }

  // Play Boost sound
  playBoost() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.35);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.4);
  }

  // Play Hit sound
  playHit() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Play Powerup pickup
  playPowerup() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  // Play Game Over
  playGameOver() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const chord = [330, 293.66, 261.63, 196];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = this.ctx.currentTime + idx * 0.15;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.65);
    });
  }

  // Dynamic Multi-World Synthwave Music Engine
  startMusic() {
    if (!this.ctx || this.isMusicPlaying) return;
    this.resume();
    this.isMusicPlaying = true;

    let noteIndex = 0;
    const tempo = 135;
    const stepTime = (60 / tempo) / 2;

    const playBassNote = () => {
      if (!this.isMusicPlaying || this.isMuted) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // World specific melody pattern
      let scale = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83]; // City
      if (this.currentBiome === 'lava') {
        scale = [82.41, 82.41, 98.0, 110.0, 82.41, 82.41, 123.47, 110.0]; // Heavy Aggressive E minor
      } else if (this.currentBiome === 'nebula') {
        scale = [146.83, 164.81, 196.0, 220.0, 196.0, 164.81, 246.94, 220.0]; // Ethereal High D
      } else if (this.currentBiome === 'abyss') {
        scale = [98.0, 110.0, 123.47, 130.81, 98.0, 123.47, 146.83, 130.81]; // Underwater deep G
      }

      const freq = scale[noteIndex % scale.length];
      noteIndex++;

      osc.type = (this.currentBiome === 'lava') ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      const cutoff = (this.currentBiome === 'nebula') ? 600 : 350;
      filter.frequency.setValueAtTime(cutoff, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + stepTime * 0.9);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + stepTime * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + stepTime);
    };

    this.musicInterval = setInterval(playBassNote, stepTime * 1000);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

window.sound = new SoundEngine();
