// The opening's sound, made in the browser with the Web Audio API (no audio files):
//   0.0 s  the projector's switch clicks
//   0.2 s  the motor spins up, with the flutter of film running through the gate
//   1.7 s  a low boom and a warm, swelling chord as "SM Enterprises" comes up on the screen
//   ~7 s   everything fades out
// Browsers only allow sound after a tap, so this is called from the "Enter the theatre" button.
// Returns stop(): fades everything out (used by "Skip intro").

export const LOGO_AT = 1.7; // seconds after the tap when the logo appears (the visuals use the same timing)

export function playIntroSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return () => {};

  const ctx = new AudioCtx();
  ctx.resume?.();
  const t0 = ctx.currentTime + 0.05;

  // master -> gentle compressor -> speakers, plus a generated room reverb
  const master = ctx.createGain();
  master.gain.value = 0.85;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  const reverb = ctx.createConvolver();
  reverb.buffer = roomImpulse(ctx, 3.4, 2.6);
  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  reverb.connect(wet).connect(master);

  const noise = noiseBuffer(ctx, 3);

  // 1) the switch: two short, filtered clicks
  click(ctx, noise, master, t0, 2600, 0.5);
  click(ctx, noise, master, t0 + 0.09, 1700, 0.28);

  // 2) projector motor: rumbling noise, fluttering like film in the gate, spinning up
  {
    const src = loopNoise(ctx, noise);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.setValueAtTime(90, t0 + 0.15);
    band.frequency.exponentialRampToValueAtTime(210, t0 + 1.4);
    band.Q.value = 0.9;
    const flutter = ctx.createGain();
    flutter.gain.value = 0.55;
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(6, t0 + 0.15);
    lfo.frequency.exponentialRampToValueAtTime(18, t0 + 1.4); // the shutter speeding up
    const depth = ctx.createGain();
    depth.gain.value = 0.45;
    lfo.connect(depth).connect(flutter.gain);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0 + 0.15);
    env.gain.linearRampToValueAtTime(0.5, t0 + 0.9);
    env.gain.setValueAtTime(0.5, t0 + 3.4);
    env.gain.linearRampToValueAtTime(0.16, t0 + 4.6);
    env.gain.linearRampToValueAtTime(0, t0 + 6.8);
    src.connect(band).connect(flutter).connect(env).connect(master);
    env.connect(reverb);
    src.start(t0 + 0.15);
    lfo.start(t0 + 0.15);
    src.stop(t0 + 7);
    lfo.stop(t0 + 7);

    // motor hum rising in pitch
    const hum = ctx.createOscillator();
    hum.type = "triangle";
    hum.frequency.setValueAtTime(48, t0 + 0.15);
    hum.frequency.exponentialRampToValueAtTime(100, t0 + 1.5);
    const humEnv = ctx.createGain();
    humEnv.gain.setValueAtTime(0, t0 + 0.15);
    humEnv.gain.linearRampToValueAtTime(0.05, t0 + 0.9);
    humEnv.gain.setValueAtTime(0.05, t0 + 3.4);
    humEnv.gain.linearRampToValueAtTime(0, t0 + 6);
    hum.connect(humEnv).connect(master);
    hum.start(t0 + 0.15);
    hum.stop(t0 + 6.2);
  }

  const hit = t0 + LOGO_AT;

  // 3) low boom as the logo lands
  {
    const boom = ctx.createOscillator();
    boom.type = "sine";
    boom.frequency.setValueAtTime(72, hit);
    boom.frequency.exponentialRampToValueAtTime(34, hit + 1.6);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, hit);
    env.gain.linearRampToValueAtTime(0.75, hit + 0.03);
    env.gain.exponentialRampToValueAtTime(0.001, hit + 2.4);
    boom.connect(env).connect(master);
    env.connect(reverb);
    boom.start(hit);
    boom.stop(hit + 2.5);
  }

  // 4) the swell: a warm D major chord, detuned saws opening up through a low-pass filter
  {
    const notes = [73.42, 110, 146.83, 185, 220, 293.66, 369.99];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(220, hit - 0.3);
    filter.frequency.exponentialRampToValueAtTime(2600, hit + 2.2);
    filter.frequency.exponentialRampToValueAtTime(900, hit + 5.5);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, hit - 0.3);
    env.gain.linearRampToValueAtTime(0.22, hit + 1.4);
    env.gain.setValueAtTime(0.22, hit + 2.6);
    env.gain.linearRampToValueAtTime(0, hit + 5.6);
    filter.connect(env);
    env.connect(master);
    env.connect(reverb);
    notes.forEach((f) => {
      [-7, 7].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = cents;
        const g = ctx.createGain();
        g.gain.value = 0.06;
        o.connect(g).connect(filter);
        o.start(hit - 0.3);
        o.stop(hit + 5.8);
      });
    });
    // a soft high shimmer on top
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 880;
    const sEnv = ctx.createGain();
    sEnv.gain.setValueAtTime(0, hit + 0.4);
    sEnv.gain.linearRampToValueAtTime(0.025, hit + 2);
    sEnv.gain.linearRampToValueAtTime(0, hit + 5.4);
    shimmer.connect(sEnv).connect(reverb);
    shimmer.start(hit + 0.4);
    shimmer.stop(hit + 5.6);
  }

  setTimeout(() => ctx.close().catch(() => {}), 9000);

  return function stop() {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.4);
    setTimeout(() => ctx.close().catch(() => {}), 600);
  };
}

function noiseBuffer(ctx, seconds) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) { // brown-ish noise: deeper, like a motor
    const white = Math.random() * 2 - 1;
    last = (last + 0.04 * white) / 1.04;
    data[i] = last * 3.2;
  }
  return buf;
}

function loopNoise(ctx, buffer) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
}

function click(ctx, buffer, out, at, freq, level) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = freq;
  band.Q.value = 1.4;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(level * 6, at + 0.002);
  env.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  src.connect(band).connect(env).connect(out);
  src.start(at, Math.random());
  src.stop(at + 0.06);
}

function roomImpulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}
