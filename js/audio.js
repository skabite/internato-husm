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

  // J. S. Bach — Prelúdio em Dó maior, BWV 846 (o Dudu: metódico, repetitivo, em ordem)
  (() => {
    const bars = [
      'C4 E4 G4 C5 E5', 'C4 D4 A4 D5 F5', 'B3 D4 G4 D5 F5', 'C4 E4 G4 C5 E5',
      'C4 E4 A4 E5 A5', 'C4 D4 F#4 A4 D5', 'B3 D4 G4 D5 G5', 'B3 C4 E4 G4 C5',
      'A3 C4 E4 G4 C5', 'D3 A3 D4 F#4 C5', 'G3 B3 D4 G4 B4', 'G3 Bb3 E4 G4 C#5',
    ];
    const arp = bars.map(b => { const n = b.split(' '); const half = [n[0], n[1], n[2], n[3], n[4], n[2], n[3], n[4]].map(x => x + ':0.25').join(' '); return half + ' ' + half; }).join(' ');
    const bass = bars.map(b => { const n = b.split(' ')[0]; return n.replace(/\d$/, d => d - 1) + ':4'; }).join(' ');
    SONGS.prelude = {
      bpm: 66,
      tracks: [
        { wave: 'triangle', vol: 0.20, ev: parse(arp) },
        { wave: 'square', vol: 0.05, ev: parse(arp, 0.5, 1), stacc: 0.4 },
        { wave: 'triangle', vol: 0.24, ev: parse(bass) },
      ],
    };
  })();

  // A. Vivaldi — Verão, 3º mov. (Presto) — combate
  (() => {
    const s16 = s => s.split(' ').map(n => n.includes(':') ? n : n + ':0.25').join(' ');
    const A = s16(rep('G4', 8) + ' D5 C5 Bb4 A4 G4 F#4 G4 A4');
    const B = s16(rep('Bb4', 8) + ' Eb5 D5 C5 Bb4 A4 G4 A4 Bb4');
    const C = s16(rep('A4', 8) + ' D5 C5 Bb4 A4 G4 F#4 E4 F#4');
    const D = 'G4:1 D4:1 G3:2';
    const E = s16(rep('G4 Bb4 D5 G5', 2) + ' ' + rep('F#4 A4 D5 F#5', 2));
    const F = s16(rep('Eb4 G4 C5 Eb5', 2) + ' ' + rep('D4 F#4 A4 D5', 2));
    const lead = [A, B, C, D, E, F].join(' ');
    const e8 = s => s.split(' ').map(n => n.includes(':') ? n : n + ':0.5').join(' ');
    const bass = [
      e8('G2 G2 G2 G2 D2 D2 G2 G2'), e8('Eb2 Eb2 Eb2 Eb2 C2 C2 G2 G2'), e8('D2 D2 D2 D2 D2 D2 D2 D2'),
      'G2:1 D2:1 G1:2', e8('G2 G2 G2 G2 D2 D2 D2 D2'), e8('C2 C2 C2 C2 D2 D2 D2 D2'),
    ].join(' ');
    SONGS.summer = {
      bpm: 138,
      tracks: [
        { wave: 'square', vol: 0.09, ev: parse(lead), stacc: 0.7 },
        { wave: 'sawtooth', vol: 0.05, ev: parse(lead, 0.5, -1), stacc: 0.5 },
        { wave: 'triangle', vol: 0.32, ev: parse(bass), stacc: 0.6 },
        { wave: 'noise', vol: 0.05, ev: parse(rep('x:0.5', 48)) },
      ],
    };
  })();

  // W. A. Mozart — Eine kleine Nachtmusik (o Clóvis: elegante, rico, levemente superior)
  (() => {
    const lead = [
      'G5:1 R:0.5 D5:0.5 G5:1 R:0.5 D5:0.5', 'G5:0.5 D5:0.5 G5:0.5 B5:0.5 D6:2',
      'C6:1 R:0.5 A5:0.5 C6:1 R:0.5 A5:0.5', 'C6:0.5 A5:0.5 F#5:0.5 A5:0.5 D5:2',
      'G5:1 G5:0.5 B5:0.5 A5:0.5 G5:0.5 G5:0.5 F#5:0.5', 'F#5:1 A5:0.5 C6:0.5 F#5:0.5 A5:0.5 G5:1',
      'G5:1 G5:0.5 B5:0.5 A5:0.5 G5:0.5 G5:0.5 F#5:0.5', 'F#5:0.5 A5:0.5 C6:0.5 F#5:0.5 G5:2',
    ].join(' ');
    const bass = ['G2:0.5 G3:0.5 G2:0.5 G3:0.5 G2:0.5 G3:0.5 G2:0.5 G3:0.5', 'G2:0.5 G3:0.5 G2:0.5 G3:0.5 G2:0.5 G3:0.5 G2:0.5 G3:0.5',
      'D2:0.5 D3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5', 'D2:0.5 D3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5',
      'G2:0.5 B2:0.5 D3:0.5 B2:0.5 G2:0.5 B2:0.5 D3:0.5 B2:0.5', 'D2:0.5 F#2:0.5 A2:0.5 F#2:0.5 D2:0.5 F#2:0.5 G2:1',
      'G2:0.5 B2:0.5 D3:0.5 B2:0.5 G2:0.5 B2:0.5 D3:0.5 B2:0.5', 'D2:0.5 F#2:0.5 A2:0.5 D2:0.5 G2:2'].join(' ');
    SONGS.nacht = {
      bpm: 112,
      tracks: [
        { wave: 'square', vol: 0.08, ev: parse(lead), stacc: 0.7 },
        { wave: 'triangle', vol: 0.10, ev: parse(lead, 0.5, -1), stacc: 0.7 },
        { wave: 'triangle', vol: 0.26, ev: parse(bass), stacc: 0.5 },
      ],
    };
  })();

  // L. v. Beethoven — 5ª Sinfonia, 1º mov. (chefe: o Bélgica)
  (() => {
    const e = s => s.split(' ').map(n => n.includes(':') ? n : n + ':0.5').join(' ');
    const lead = [
      e('R G4 G4 G4'), 'Eb4:2', e('R F4 F4 F4'), 'D4:2',
      e('R G4 G4 G4'), e('Eb4 Ab4 Ab4 Ab4'), e('G4 Eb5 Eb5 Eb5'), 'C5:2',
      e('R G4 G4 G4'), e('D4 Ab4 Ab4 Ab4'), e('G4 F5 F5 F5'), 'D5:2',
      e('G5 G5 F5 Eb5'), e('D5 Eb5 F5 Ab5'), e('G5 F5 Eb5 D5'), 'C5:1 G4:1',
    ].join(' ');
    const bass = [
      e('R G2 G2 G2'), 'C2:2', e('R F2 F2 F2'), 'B1:2',
      e('C2 C3 C2 C3'), e('C2 C3 F2 F3'), e('C2 C3 C2 C3'), e('C2 C3 C2 C3'),
      e('B1 B2 B1 B2'), e('B1 B2 F2 F3'), e('G1 G2 G1 G2'), e('G1 G2 G1 G2'),
      e('C2 C3 C2 C3'), e('F2 F3 F2 F3'), e('G2 G3 G2 G3'), e('C2 C3 G1 G2'),
    ].join(' ');
    SONGS.fifth = {
      bpm: 132,
      tracks: [
        { wave: 'square', vol: 0.10, ev: parse(lead), stacc: 0.75 },
        { wave: 'sawtooth', vol: 0.05, ev: parse(lead, 0.5, -1), stacc: 0.6 },
        { wave: 'triangle', vol: 0.32, ev: parse(bass), stacc: 0.6 },
        { wave: 'noise', vol: 0.05, ev: parse(rep('x:0.5 R:0.5', 32)) },
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
    blip(base = 170, spread = 140) { // a "voz" de quem está falando
      const t = ctx.currentTime;
      tone(base + Math.random() * spread, t, 0.045, 'square', 0.05, sfxGain, 1);
    },
    shot() {
      const t = ctx.currentTime;
      noise(t, 0.35, 0.5, sfxGain, 'lowpass', 2200, 0.8);
      noise(t, 0.06, 0.4, sfxGain, 'highpass', 3000, 0.7);
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.3);
    },
    swish() {
      const t = ctx.currentTime; const n = noise(t, 0.18, 0.18, sfxGain, 'bandpass', 2000, 3);
      n.f.frequency.setValueAtTime(1200, t); n.f.frequency.exponentialRampToValueAtTime(5000, t + 0.15);
    },
    stab() { const t = ctx.currentTime; noise(t, 0.12, 0.25, sfxGain, 'lowpass', 900, 2); },
    dry() { const t = ctx.currentTime; noise(t, 0.03, 0.15, sfxGain, 'bandpass', 4000, 4); },
    reload() {
      const t = ctx.currentTime;
      [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5].forEach((d, i) => noise(t + d, 0.03, i === 6 ? 0.3 : 0.12, sfxGain, 'bandpass', i === 6 ? 1800 : 3500, 4));
    },
    grunt(vol = 1) { // grunhido de javali
      const t = ctx.currentTime, dur = 0.25 + Math.random() * 0.25;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(95 + Math.random() * 40, t);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 28 + Math.random() * 10;
      const lg = ctx.createGain(); lg.gain.value = 30; lfo.connect(lg); lg.connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25 * vol, t + 0.04); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(f); f.connect(g); g.connect(sfxGain); o.start(t); lfo.start(t); o.stop(t + dur + 0.02); lfo.stop(t + dur + 0.02);
    },
    squeal(vol = 1) { // guincho
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'square';
      o.frequency.setValueAtTime(500, t); o.frequency.linearRampToValueAtTime(1300, t + 0.12); o.frequency.linearRampToValueAtTime(700, t + 0.5);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.09 * vol, t); g.gain.linearRampToValueAtTime(0, t + 0.55);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.6);
    },
    hurt() {
      const t = ctx.currentTime;
      tone(130, t, 0.12, 'square', 0.12, sfxGain, 1); tone(95, t + 0.1, 0.18, 'square', 0.1, sfxGain, 1);
    },
    pickup() { const t = ctx.currentTime; [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.06, 0.08, 'square', 0.07, sfxGain, 1)); },
    door() {
      const t = ctx.currentTime; const n = noise(t, 0.9, 0.12, sfxGain, 'bandpass', 300, 2);
      n.f.frequency.setValueAtTime(250, t); n.f.frequency.linearRampToValueAtTime(600, t + 0.8);
    },
    phone() { // telefone tocando (trim-trim)
      const t = ctx.currentTime;
      for (let k = 0; k < 2; k++) for (let i = 0; i < 10; i++) {
        const s = t + k * 0.55 + i * 0.04;
        tone(i % 2 ? 1320 : 1760, s, 0.035, 'square', 0.05, sfxGain, 1);
      }
    },
    scribble() { const t = ctx.currentTime; for (let i = 0; i < 6; i++) noise(t + i * 0.07, 0.06, 0.12, sfxGain, 'bandpass', 3000 + Math.random() * 2000, 3); },
    throw() { const t = ctx.currentTime; const n = noise(t, 0.25, 0.14, sfxGain, 'bandpass', 900, 2); n.f.frequency.setValueAtTime(600, t); n.f.frequency.exponentialRampToValueAtTime(3000, t + 0.2); },
    shatter() { const t = ctx.currentTime; noise(t, 0.25, 0.2, sfxGain, 'highpass', 5000, 1); tone(2400, t, 0.05, 'triangle', 0.05, sfxGain, 1); tone(3100, t + 0.03, 0.05, 'triangle', 0.04, sfxGain, 1); },
    stare() { // zumbido psíquico subindo
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(320, t + 0.9);
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.setValueAtTime(83, t); o2.frequency.exponentialRampToValueAtTime(330, t + 0.9);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.8); g.gain.linearRampToValueAtTime(0.08, t + 3.2); g.gain.linearRampToValueAtTime(0, t + 3.5);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(sfxGain);
      o.start(t); o2.start(t); o.stop(t + 3.6); o2.stop(t + 3.6);
    },
    teleport() {
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1600, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.35);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.07, t); g.gain.linearRampToValueAtTime(0, t + 0.38);
      o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + 0.4);
    },
    achievement() { const t = ctx.currentTime; [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, t + i * 0.08, 0.12, 'square', 0.07, sfxGain, 1)); },
    notify() { const t = ctx.currentTime; tone(1318, t, 0.06, 'sine', 0.08, sfxGain, 1); tone(1760, t + 0.08, 0.1, 'sine', 0.08, sfxGain, 1); },
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
    note(f, dur = 0.14) { const t = ctx.currentTime; tone(f, t, dur, 'square', 0.08, sfxGain, 1); tone(f * 2, t, dur * 0.6, 'triangle', 0.03, sfxGain, 1); },
    oink(vol = 1) { // "óinc" nasal do Javali
      const t = ctx.currentTime;
      for (let k = 0; k < 2; k++) {
        const s = t + k * 0.17;
        const o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(260, s); o.frequency.linearRampToValueAtTime(380, s + 0.04); o.frequency.linearRampToValueAtTime(190, s + 0.13);
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.16 * vol, s + 0.02); g.gain.linearRampToValueAtTime(0, s + 0.14);
        o.connect(f); f.connect(g); g.connect(sfxGain); o.start(s); o.stop(s + 0.15);
      }
    },
    creak() { // dobradiça enferrujada (porta abrindo sozinha)
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(110, t + 1.2); o.frequency.linearRampToValueAtTime(55, t + 2.6);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 17; const lg = ctx.createGain(); lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency);
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.3); g.gain.linearRampToValueAtTime(0.12, t + 2.2); g.gain.linearRampToValueAtTime(0, t + 2.8);
      o.connect(f); f.connect(g); g.connect(sfxGain); o.start(t); lfo.start(t); o.stop(t + 2.9); lfo.stop(t + 2.9);
    },
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
