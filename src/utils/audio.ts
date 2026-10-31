/**
 * Web Audio Synthesizer for tactile calculator feedback
 */
let audioCtx: AudioContext | null = null;

export function playKeyClick(type: 'num' | 'op' | 'enter' | 'clear' = 'num') {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx?.resume();
    }

    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';

    if (type === 'enter') {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'clear') {
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } else if (type === 'op') {
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else {
      // standard numeric key click
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    }
  } catch {
    // Ignore audio permission or playback issues
  }
}
