export type SoundId = "rain" | "ocean" | "wind" | "fire" | "white" | "pink" | "brown" | "cafe" | "birds";

export type Sound = {
  id: SoundId;
  name: string;
  // Extend this to wire up your own icons in the UI
};

export const SOUNDS: Sound[] = [
  { id: "rain",  name: "Rain"  },
  { id: "ocean", name: "Ocean" },
  { id: "wind",  name: "Wind"  },
  { id: "fire",  name: "Fire"  },
  { id: "cafe",  name: "Café"  },
  { id: "birds", name: "Birds" },
  { id: "white", name: "White" },
  { id: "pink",  name: "Pink"  },
  { id: "brown", name: "Brown" },
];

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

function isScheduledSource(node: AudioNode): node is AudioScheduledSourceNode {
  return "stop" in node;
}

export class AmbientPlayer {
  private ctx:     AudioContext | null = null;
  private master:  GainNode    | null = null;
  private node:    AudioNode   | null = null;
  private extras:  AudioNode[]        = [];
  private current: SoundId    | null  = null;

  // Incremented on every stop() — callbacks capture the value at scheduling
  // time and bail out if it has changed, killing orphaned setTimeout chains.
  private generation = 0;

  // ── Context ───────────────────────────────────────────────────────────────

  private ensure(): AudioContext {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctx) throw new Error("Web Audio API not supported.");
      this.ctx    = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  setVolume(v: number) {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    // Invalidate any in-flight setTimeout callbacks before tearing down nodes
    this.generation++;

    this.extras.forEach((n) => {
      if (isScheduledSource(n)) try { n.stop(); } catch { /* already stopped */ }
      try { n.disconnect(); } catch { /* */ }
    });
    this.extras = [];

    if (this.node) {
      if (isScheduledSource(this.node)) try { this.node.stop(); } catch { /* */ }
      try { this.node.disconnect(); } catch { /* */ }
      this.node = null;
    }

    this.current = null;
  }

  isPlaying()   { return !!this.node;   }
  currentSound(){ return this.current;  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private noise(ctx: AudioContext, type: "white" | "pink" | "brown", seconds = 4): AudioBuffer {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      if (type === "white") {
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      } else if (type === "pink") {
        let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
          b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
          b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616 *b5 - w*0.0168980;
          d[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) * 0.11;
          b6 = w * 0.115926;
        }
      } else {
        let last = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.02*w) / 1.02;
          d[i] = last * 3.5;
        }
      }
    }
    return buf;
  }

  private makeSrc(ctx: AudioContext, buf: AudioBuffer, loop = true): AudioBufferSourceNode {
    const n = ctx.createBufferSource();
    n.buffer = buf;
    n.loop   = loop;
    return n;
  }

  private makeFilter(ctx: AudioContext, type: BiquadFilterType, freq: number, Q = 1): BiquadFilterNode {
    const f = ctx.createBiquadFilter();
    f.type            = type;
    f.frequency.value = freq;
    f.Q.value         = Q;
    return f;
  }

  private makeGain(ctx: AudioContext, val: number): GainNode {
    const g = ctx.createGain();
    g.gain.value = val;
    return g;
  }

  // ── Sounds ────────────────────────────────────────────────────────────────
  // To add your own MP3/WAV:
  //
  //   const res  = await fetch("/sounds/my-sound.mp3");
  //   const raw  = await res.arrayBuffer();
  //   const buf  = await ctx.decodeAudioData(raw);
  //   const node = this.makeSrc(ctx, buf, true);
  //   node.connect(dest);
  //   node.start();
  //   src = node;
  //
  // Wire it into a new `else if (id === "my-sound")` branch below.

  play(id: SoundId) {
    this.stop();
    const gen  = this.generation;          // capture before any async work
    const ctx  = this.ensure();
    if (ctx.state === "suspended") ctx.resume();
    const dest = this.master!;
    const ex   = this.extras;
    let   src: AudioNode;

    // ── Pure noise ──────────────────────────────────────────────────────────
    if (id === "white" || id === "pink" || id === "brown") {
      const n = this.makeSrc(ctx, this.noise(ctx, id));
      n.connect(dest);
      n.start();
      src = n;

    // ── Rain ────────────────────────────────────────────────────────────────
    } else if (id === "rain") {
      const base     = this.makeSrc(ctx, this.noise(ctx, "brown", 8));
      const hp       = this.makeFilter(ctx, "highpass", 800);
      const lp       = this.makeFilter(ctx, "lowpass",  6000);
      const gainNode = this.makeGain(ctx, 1.3);
      base.connect(hp); hp.connect(lp); lp.connect(gainNode); gainNode.connect(dest);
      base.start();
      src = base;
      ex.push(hp, lp, gainNode);

      const drip = () => {
        if (this.generation !== gen) return;             // cancelled
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        const now = ctx.currentTime;
        osc.frequency.value = 1200 + Math.random() * 800;
        osc.connect(env); env.connect(dest);
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.04, now + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.start(now); osc.stop(now + 0.2);
        setTimeout(drip, 300 + Math.random() * 900);
      };
      setTimeout(drip, 500);

    // ── Ocean ───────────────────────────────────────────────────────────────
    } else if (id === "ocean") {
      const n   = this.makeSrc(ctx, this.noise(ctx, "pink", 12));
      const lp  = this.makeFilter(ctx, "lowpass",  800);
      const hp  = this.makeFilter(ctx, "highpass",  60);
      const g   = this.makeGain(ctx, 1.0);
      n.connect(lp); lp.connect(hp); hp.connect(g); g.connect(dest);
      n.start();
      src = n;
      ex.push(lp, hp, g);

      const lfo  = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoG = this.makeGain(ctx, 0.45);
      lfo.connect(lfoG); lfoG.connect(g.gain);
      lfo.start();
      ex.push(lfo, lfoG);

    // ── Wind ────────────────────────────────────────────────────────────────
    } else if (id === "wind") {
      const n   = this.makeSrc(ctx, this.noise(ctx, "pink", 6));
      const bp  = this.makeFilter(ctx, "bandpass", 400, 0.5);
      const g   = this.makeGain(ctx, 1.2);
      n.connect(bp); bp.connect(g); g.connect(dest);
      n.start();
      src = n;
      ex.push(bp, g);

      const lfo  = ctx.createOscillator();
      lfo.frequency.value = 0.08 + Math.random() * 0.05;
      const lfoG = this.makeGain(ctx, 0.5);
      lfo.connect(lfoG); lfoG.connect(g.gain);
      lfo.start();
      ex.push(lfo, lfoG);

    // ── Fire ────────────────────────────────────────────────────────────────
    } else if (id === "fire") {
      const n  = this.makeSrc(ctx, this.noise(ctx, "brown", 8));
      const lp = this.makeFilter(ctx, "lowpass",   1200);
      const hp = this.makeFilter(ctx, "highpass",    80);
      const g  = this.makeGain(ctx, 1.5);
      n.connect(lp); lp.connect(hp); hp.connect(g); g.connect(dest);
      n.start();
      src = n;
      ex.push(lp, hp, g);

      const crackle = () => {
        if (this.generation !== gen) return;             // cancelled
        const cg  = ctx.createGain();
        const now = ctx.currentTime;
        cg.gain.setValueAtTime(0.8 + Math.random() * 0.8, now);
        cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.08);
        const cn = this.makeSrc(ctx, this.noise(ctx, "white", 1), false);
        const cf = this.makeFilter(ctx, "bandpass", 2000 + Math.random() * 3000, 2);
        cn.connect(cf); cf.connect(cg); cg.connect(dest);
        cn.start(now); cn.stop(now + 0.12);
        setTimeout(crackle, 80 + Math.random() * 400);
      };
      setTimeout(crackle, 200);

    // ── Café ────────────────────────────────────────────────────────────────
    } else if (id === "cafe") {
      const n   = this.makeSrc(ctx, this.noise(ctx, "pink", 6));
      const lp  = this.makeFilter(ctx, "lowpass", 900);
      const g   = this.makeGain(ctx, 1.4);
      n.connect(lp); lp.connect(g); g.connect(dest);
      n.start();
      src = n;
      ex.push(lp, g);

      const lfo  = ctx.createOscillator();
      lfo.frequency.value = 2.3;
      const lfoG = this.makeGain(ctx, 0.18);
      lfo.connect(lfoG); lfoG.connect(g.gain);
      lfo.start();
      ex.push(lfo, lfoG);

    // ── Birds ───────────────────────────────────────────────────────────────
    } else {
      const n  = this.makeSrc(ctx, this.noise(ctx, "pink", 4));
      const lp = this.makeFilter(ctx, "lowpass", 1400);
      const ng = this.makeGain(ctx, 0.3);
      n.connect(lp); lp.connect(ng); ng.connect(dest);
      n.start();
      src = n;
      ex.push(lp, ng);

      const chirp = () => {
        if (this.generation !== gen) return;             // cancelled
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        const now = ctx.currentTime;
        const freq = 2000 + Math.random() * 2500;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 1.3, now + 0.1);
        osc.connect(env); env.connect(dest);
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.06, now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now); osc.stop(now + 0.3);
        if (Math.random() > 0.5) setTimeout(chirp, 150 + Math.random() * 200);
        setTimeout(chirp, 800 + Math.random() * 3000);
      };
      setTimeout(chirp, 400);
    }

    this.node    = src;
    this.current = id;
  }
}

export const ambient = new AmbientPlayer();
