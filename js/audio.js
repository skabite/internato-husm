// Motor de áudio 8-bit: sequenciador com relógio em batidas (permite mudar o andamento ao vivo)
const AUDIO = (() => {
  let ctx = null, master, musicGain, sfxGain, noiseBuf;
  let song = null;            // música tocando
  let musicMuted = false;
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function freq(n) {
    const m = n.match(/^([A-G])(#|b)?(-?\d)$/);
    if (!m) return 0;
    const s = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (parseInt(m[3], 10) + 1) * 12 + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function transpose(n, oct) { return n.replace(/(-?\d)$/, d => String(parseInt(d, 10) + oct)); }

  // "A5:0.25 G5+B5:1 R:2" -> [{notes:[...], beats}]  (duração padrão = def)
  function parse(str, def = 0.5, oct = 0) {
    return str.trim().split(/\s+/).map(tok => {
      const [n, d] = tok.split(':');
      const beats = d ? parseFloat(d) : def;
      const notes = n === 'R' ? [] : n === 'x' ? ['x'] : n.split('+').map(x => transpose(x, oct));
      return { notes, beats };
    });
  }
  const rep = (s, k) => Array(k).fill(s).join(' ');

  // ---------------- REPERTÓRIO ----------------
  const SONGS = {};

  // J. S. Bach — Tocata e Fuga em Ré menor, BWV 565 (abertura)
  (() => {
    const lead =
      'A5:0.125 G5:0.125 A5:1.25 R:0.5 G5:0.125 F5:0.125 E5:0.125 D5:0.125 C#5:0.5 D5:1.5 R:1.5 ' +
      'A4:0.125 G4:0.125 A4:1.25 R:0.5 E4:0.25 F4:0.25 C#4:0.5 D4:1.5 R:1.5 ' +
      'A3:0.125 G3:0.125 A3:1.25 R:0.5 G3:0.125 F3:0.125 E3:0.125 D3:0.125 C#3:0.5 D3:2.5 R:0.5 ' +
      'C#3:0.25 E3:0.25 G3:0.25 Bb3:0.25 C#4:0.25 E4:0.25 G4:0.25 Bb4:0.25 ' +
      'C#4+E4+G4+Bb4:2 D4+F4+A4:3 R:1';
    SONGS.toccata = {
      bpm: 58,
      tracks: [
        { wave: 'square', vol: 0.12, ev: parse(lead) },
        { wave: 'square', vol: 0.07, ev: parse(lead, 0.5, -1) },
        { wave: 'triangle', vol: 0.30, ev: parse('R:18 D2:2 D2:2 D2:4') },
      ],
    };
  })();

  // L. v. Beethoven — Sonata ao Luar, 1º mov. (início)
  (() => {
    const t = s => rep(s.split(' ').map(n => n + ':0.3333').join(' '), 1);
    const m1 = rep(t('G#3 C#4 E4'), 4);
    const m3 = rep(t('A3 C#4 E4'), 2) + ' ' + rep(t('A3 D4 F#4'), 2);
    const m4 = t('G#3 C4 F#4') + ' ' + t('G#3 C#4 E4') + ' ' + t('G#3 C#4 D#4') + ' ' + t('F#3 C4 D#4');
    const arps = [m1, m1, m3, m4, m1, m1, m3, m4].join(' ');
    const bass = rep('C#2+C#3:4 B1+B2:4 A1+A2:2 F#1+F#2:2 G#1+G#2:4', 2);
    const mel = 'R:16 R:3 G#4:0.75 G#4:0.25 G#4:2 R:1 G#4:0.75 G#4:0.25 G#4:1 A4:1 A4:1 F#4:1 G#4:2 F#4:1 R:1';
    SONGS.moonlight = {
      bpm: 52,
      tracks: [
        { wave: 'triangle', vol: 0.20, ev: parse(arps) },
        { wave: 'triangle', vol: 0.26, ev: parse(bass) },
        { wave: 'square', vol: 0.06, ev: parse(mel) },
      ],
    };
  })();

  // E. Grieg — Na Gruta do Rei da Montanha (acelera junto com o professor)
  (() => {
    const lead = [
      'B3 C#4 D4 E4 F#4 D4 F#4:1',
      'F4 C#4 F4:1 E4 C4 E4:1',
      'B3 C#4 D4 E4 F#4 D4 F#4 B4',
      'A4 F#4 D4 F#4 A4:2',
      'F#4 G#4 A#4 B4 C#5 A#4 C#5:1',
      'D5 A#4 D5:1 C#5 A#4 C#5:1',
      'F#4 G#4 A#4 B4 C#5 A#4 C#5 F#5',
      'E5 C#5 A#4 C#5 E5:2',
    ].join(' ');
    const bass = rep('B2:0.25 R:0.25 F#2:0.25 R:0.25', 16) + ' ' + rep('F#2:0.25 R:0.25 C#3:0.25 R:0.25', 16);
    SONGS.mountain = {
      bpm: 100,
      tracks: [
        { wave: 'square', vol: 0.10, ev: parse(lead), stacc: 0.6 },
        { wave: 'triangle', vol: 0.32, ev: parse(bass) },
        { wave: 'noise', vol: 0.05, ev: parse(rep('x:1', 32)) },
      ],
    };
  })();

  for (const k in SONGS) {
    const s = SONGS[k];
    s.len = Math.max(...s.tracks.map(t => t.ev.reduce((a, e) => a + e.beats, 0)));
  }

  // ---------------- SÍNTESE ----------------
  function tone(f, t, dur, wave, vol, dest, stacc = 0.85) {
    const o = ctx.createOscillator(); o.type = wave; o.frequency.value = f;
    const g = ctx.createGain();
    const end = t + Math.max(0.03, dur * stacc);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.setValueAtTime(vol, Math.max(t + 0.007, end - 0.02));
    g.gain.linearRampToValueAtTime(0, end);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(end + 0.01);
  }
  function noise(t, dur, vol, dest, filt = 'highpass', fq = 6000, q = 0.7) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = filt; f.frequency.value = fq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
    return { f, g };
  }

  // ---------------- SEQUENCIADOR ----------------
  function beatAt(time) { return song.refBeat + (time - song.refTime) * song.bpm / 60; }
  function timeOfBeat(b) { return song.refTime + (b - song.refBeat) * 60 / song.bpm; }

  function tick() {
    if (!song || !ctx) return;
    const horizon = beatAt(ctx.currentTime + 0.15);
    for (const tr of song.def.tracks) {
      const st = song.st.get(tr);
      while (true) {
        const e = tr.ev[st.i];
        const b = st.loop * song.def.len + st.off;
        if (b >= horizon) break;
        const t = Math.max(ctx.currentTime, timeOfBeat(b));
        const dur = e.beats * 60 / song.bpm;
        for (const n of e.notes) {
          if (n === 'x') noise(t, 0.05, tr.vol, song.gain);
          else tone(freq(n), t, dur, tr.wave, tr.vol, song.gain, tr.stacc);
        }
        st.off += e.beats; st.i++;
        if (st.i >= tr.ev.length) {
          if (!song.loop) { st.i = tr.ev.length - 1; st.off = Infinity; break; }
          st.i = 0; st.off = 0; st.loop++;
        }
      }
    }
  }

  function play(name, opts = {}) {
    if (!ctx) return;
    stop(0.4);
    const def = SONGS[name];
    const gain = ctx.createGain(); gain.gain.value = 0; gain.connect(musicGain);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + (opts.fade || 0.5));
    song = { name, def, bpm: opts.bpm || def.bpm, refTime: ctx.currentTime + 0.05, refBeat: 0, gain,
      loop: opts.loop !== false, st: new Map(def.tracks.map(t => [t, { i: 0, off: 0, loop: 0 }])) };
  }
  function stop(fade = 0.6) {
    if (!song) return;
    const g = song.gain;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + fade);
    setTimeout(() => g.disconnect(), fade * 1000 + 300);
    song = null;
  }
  function setTempo(bpm) {
    if (!song) return;
    song.refBeat = beatAt(ctx.currentTime); song.refTime = ctx.currentTime; song.bpm = bpm;
  }

  // ---------------- EFEITOS ----------------
  const SFX = {
    blip() { // a "voz" do professor
      const t = ctx.currentTime;
      tone(170 + Math.random() * 140, t, 0.045, 'square', 0.05, sfxGain, 1);
    },
    step(run) {
      const t = ctx.currentTime;
      noise(t, run ? 0.07 : 0.09, 0.10, sfxGain, 'lowpass', 500 + Math.random() * 300, 1);
    },
    ui() { const t = ctx.currentTime; tone(660, t, 0.05, 'square', 0.07, sfxGain, 1); tone(990, t + 0.05, 0.07, 'square', 0.07, sfxGain, 1); },
    bad() { const t = ctx.currentTime; tone(220, t, 0.08, 'square', 0.08, sfxGain, 1); tone(150, t + 0.08, 0.14, 'square', 0.08, sfxGain, 1); },
    good() { const t = ctx.currentTime; [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.05, 0.06, 'square', 0.07, sfxGain, 1)); },
    breath() { const t = ctx.currentTime; const n = noise(t, 0.5, 0.0001, sfxGain, 'bandpass', 1400, 0.8);
      n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(0.09, t + 0.2); n.g.gain.linearRampToValueAtTime(0.0001, t + 0.5); },
    scratch() { const t = ctx.currentTime; const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.35);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0, t + 0.38);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.4); },
    squeak() { // rodinha de maca
      const t = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const o = ctx.createOscillator(); o.type = 'triangle';
        const s = t + i * 0.42;
        o.frequency.setValueAtTime(1300, s); o.frequency.linearRampToValueAtTime(950, s + 0.25);
        const g = ctx.createGain(); g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.035, s + 0.05); g.gain.linearRampToValueAtTime(0, s + 0.3);
        o.connect(g); g.connect(sfxGain); o.start(s); o.stop(s + 0.32);
      }
    },
    bang() { // porta batendo longe
      const t = ctx.currentTime;
      noise(t, 1.4, 0.35, sfxGain, 'lowpass', 300, 1);
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.8);
    },
    click() { const t = ctx.currentTime; noise(t, 0.03, 0.2, sfxGain, 'bandpass', 2500, 2); },
  };

  function startWind() {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    const g = ctx.createGain(); g.gain.value = 0.025;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lg = ctx.createGain(); lg.gain.value = 0.018;
    lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(sfxGain);
    s.start(); lfo.start();
  }

  return {
    init() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.55; musicGain.connect(master);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      setInterval(tick, 25);
      startWind();
    },
    play, stop, setTempo,
    get playing() { return song && song.name; },
    sfx(name, ...a) { if (ctx && SFX[name]) SFX[name](...a); },
    toggleMusic() {
      musicMuted = !musicMuted;
      if (ctx) musicGain.gain.value = musicMuted ? 0 : 0.55;
      return !musicMuted;
    },
  };
})();
