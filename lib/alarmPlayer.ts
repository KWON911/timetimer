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
  private keepAliveOscillator: OscillatorNode | null = null;
  private keepAliveGain: GainNode | null = null;

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

  // iOS Safari는 AudioContext에 실제로 소리가 흐르지 않는 상태가 이어지면
  // 절전을 위해 몇십 초 뒤 컨텍스트를 다시 suspend 시킨다. 그 시점에 알람이
  // 울리려 하면 사용자 제스처 없이(setInterval 콜백에서) resume해야 하는데
  // 이게 iOS에서 잘 통하지 않는다. 카운트다운이 도는 동안 거의 무음에
  // 가까운 오실레이터를 계속 재생시켜 컨텍스트가 idle로 빠지지 않게 붙잡아둔다.
  startKeepAlive() {
    try {
      const context = this.getContext();
      if (this.keepAliveOscillator) return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      gain.gain.value = 0.00001;
      oscillator.frequency.value = 20;

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();

      this.keepAliveOscillator = oscillator;
      this.keepAliveGain = gain;
    } catch {
      // Silent fail
    }
  }

  stopKeepAlive() {
    if (this.keepAliveOscillator) {
      try {
        this.keepAliveOscillator.stop();
      } catch {
        // already stopped
      }
      this.keepAliveOscillator.disconnect();
      this.keepAliveOscillator = null;
    }

    if (this.keepAliveGain) {
      this.keepAliveGain.disconnect();
      this.keepAliveGain = null;
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
