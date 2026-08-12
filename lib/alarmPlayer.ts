import { AlarmSound } from "./types";

const SOUND_DURATION: Record<AlarmSound, number> = {
  chime: 1.0,
  bell: 1.15,
  electronic: 0.85,
};

function sampleValue(sound: AlarmSound, time: number, duration: number) {
  switch (sound) {
    case "chime": {
      const envelope = Math.exp(-3.0 * time);
      return (
        (Math.sin(2 * Math.PI * 659.25 * time) * 0.55 +
          Math.sin(2 * Math.PI * 987.77 * time) * 0.25) *
        envelope
      );
    }

    case "bell": {
      const envelope = Math.exp(-2.7 * time);
      return (
        (Math.sin(2 * Math.PI * 523.25 * time) * 0.55 +
          Math.sin(2 * Math.PI * 1046.5 * time) * 0.2 +
          Math.sin(2 * Math.PI * 1567.98 * time) * 0.12) *
        envelope
      );
    }

    case "electronic": {
      const frequency = time < 0.42 ? 880.0 : 1174.66;
      const envelope = Math.max(0, 1.0 - time / duration);
      return Math.sin(2 * Math.PI * frequency * time) * envelope;
    }
  }
}

export class AlarmPlayer {
  private context: AudioContext | null = null;
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private activeSources: AudioBufferSourceNode[] = [];

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {
        // Resume failed, user gesture required on iOS
      });
    }

    return this.context;
  }

  initializeAudio() {
    // Initialize AudioContext on user interaction for iOS compatibility
    try {
      const context = this.getContext();
      if (context.state === "suspended") {
        context.resume();
      }
    } catch {
      // Silent fail
    }
  }

  private makeBuffer(sound: AlarmSound): AudioBuffer {
    const context = this.getContext();
    const sampleRate = context.sampleRate;
    const duration = SOUND_DURATION[sound];
    const frameCount = Math.floor(sampleRate * duration);

    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let frame = 0; frame < frameCount; frame++) {
      const time = frame / sampleRate;
      channel[frame] = sampleValue(sound, time, duration) * 0.85;
    }

    return buffer;
  }

  private playOnce(sound: AlarmSound, volume: number) {
    const context = this.getContext();
    const buffer = this.makeBuffer(sound);

    const source = context.createBufferSource();
    source.buffer = buffer;

    const gain = context.createGain();
    gain.gain.value = Math.min(Math.max(volume, 0), 1);

    source.connect(gain);
    gain.connect(context.destination);

    source.start();
    this.activeSources.push(source);

    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source);
    };
  }

  play(sound: AlarmSound, volume: number, repeatCount: number) {
    this.stop();

    const safeRepeat = Math.max(1, repeatCount);

    for (let index = 0; index < safeRepeat; index++) {
      const timeout = setTimeout(() => {
        this.playOnce(sound, volume);
      }, index * 1350);

      this.timeouts.push(timeout);
    }
  }

  preview(sound: AlarmSound, volume: number) {
    this.stop();
    this.playOnce(sound, volume);
  }

  stop() {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
    this.timeouts = [];

    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    }
    this.activeSources = [];
  }
}
