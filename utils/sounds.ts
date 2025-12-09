// Simple synthesizer for UI sounds using Web Audio API
// This avoids external dependencies/files and guarantees offline functionality.

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    // @ts-ignore - Handle Safari prefix
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

const playTone = (
  freq: number, 
  type: OscillatorType, 
  duration: number, 
  delay: number = 0, 
  vol: number = 0.1
) => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Envelope to avoid clicking
    const startTime = ctx.currentTime + delay;
    const endTime = startTime + duration;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(endTime + 0.1); // Give a little buffer for decay
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const playSuccessSound = () => {
  // A pleasing C Major arpeggio (C5 - E5 - G5 - C6)
  playTone(523.25, 'sine', 0.4, 0, 0.1);
  playTone(659.25, 'sine', 0.4, 0.1, 0.1);
  playTone(783.99, 'sine', 0.4, 0.2, 0.1);
  playTone(1046.50, 'sine', 0.6, 0.3, 0.08);
};

export const playClickSound = () => {
  // Short high-pitched tick for buttons
  playTone(800, 'sine', 0.05, 0, 0.05);
};

export const playSwapSound = () => {
  // A mechanical "tech" blip
  playTone(220, 'square', 0.05, 0, 0.03);
  playTone(440, 'square', 0.05, 0.05, 0.03);
};
