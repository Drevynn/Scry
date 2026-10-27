/**
 * High-precision Web Audio ambient soundscape engine
 * Implements harmonic drone beds + true stereo channel binaural beats
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private merger: ChannelMergerNode | null = null;
  
  // Current settings
  public carrierFreq = 216; // Carrier tone (Hz)
  public binauralBeat = 6;  // Difference in Hz (Theta default)
  public tuningBase = 432;  // 432Hz or 528Hz
  public volume = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(carrier = 216, beat = 6, tuning = 432) {
    this.initContext();
    if (!this.ctx) return;

    this.stop(); // Stop any running instances first

    this.carrierFreq = carrier;
    this.binauralBeat = beat;
    this.tuningBase = tuning;

    const now = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(this.volume, now + 2);
    this.masterGain.connect(this.ctx.destination);

    // Channel merger for true Left/Right stereo isolation (Binaural requirement)
    this.merger = this.ctx.createChannelMerger(2);

    // Left Ear Oscillator (Base Carrier)
    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.setValueAtTime(this.carrierFreq, now);

    const leftGain = this.ctx.createGain();
    leftGain.gain.value = 0.5;
    this.leftOsc.connect(leftGain);
    leftGain.connect(this.merger, 0, 0); // Connect to Left output channel

    // Right Ear Oscillator (Carrier + Binaural Beat Offset)
    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.setValueAtTime(this.carrierFreq + this.binauralBeat, now);

    const rightGain = this.ctx.createGain();
    rightGain.gain.value = 0.5;
    this.rightOsc.connect(rightGain);
    rightGain.connect(this.merger, 0, 1); // Connect to Right output channel

    this.merger.connect(this.masterGain);

    // Harmonic Warm Drone Bed (432Hz or 528Hz sub-harmonics)
    const droneFreq = this.tuningBase === 528 ? 132 : 108; // 2 octaves down
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'triangle';
    this.droneOsc1.frequency.setValueAtTime(droneFreq, now);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(droneFreq * 1.5, now); // Fifth harmonic

    // Warm Low-Pass Filter
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(320, now);
    this.droneFilter.Q.setValueAtTime(1.2, now);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.18, now);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    // Start all sound generators
    this.leftOsc.start(now);
    this.rightOsc.start(now);
    this.droneOsc1.start(now);
    this.droneOsc2.start(now);

    this.isPlaying = true;
  }

  public updateBeat(beatHz: number) {
    this.binauralBeat = beatHz;
    if (this.rightOsc && this.ctx) {
      this.rightOsc.frequency.setTargetAtTime(this.carrierFreq + beatHz, this.ctx.currentTime, 0.2);
    }
  }

  public updateTuning(baseHz: number) {
    this.tuningBase = baseHz;
    this.carrierFreq = baseHz / 2; // e.g. 216Hz for 432, 264Hz for 528
    if (this.leftOsc && this.rightOsc && this.ctx) {
      this.leftOsc.frequency.setTargetAtTime(this.carrierFreq, this.ctx.currentTime, 0.2);
      this.rightOsc.frequency.setTargetAtTime(this.carrierFreq + this.binauralBeat, this.ctx.currentTime, 0.2);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public playSingingBowlChime() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, now);
    osc.frequency.exponentialRampToValueAtTime(428, now + 4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 4.2);
  }

  public stop() {
    if (!this.isPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.4);
    }

    setTimeout(() => {
      try {
        this.leftOsc?.stop();
        this.rightOsc?.stop();
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.leftOsc?.disconnect();
        this.rightOsc?.disconnect();
        this.droneOsc1?.disconnect();
        this.droneOsc2?.disconnect();
      } catch (e) {
        // already stopped
      }
      this.isPlaying = false;
    }, 500);
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      carrierFreq: this.carrierFreq,
      binauralBeat: this.binauralBeat,
      tuningBase: this.tuningBase,
      volume: this.volume,
    };
  }
}

export const soundEngine = new AmbientAudioEngine();
