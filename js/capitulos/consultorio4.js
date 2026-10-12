// CONSULTÓRIO 4 (corredor dos ambulatórios, opcional): dois internos de plantão.
//   MAAA, veterano, lendo "As Portas da Percepção" na maca; ADC no computador, que pergunta o erro inato do metabolismo
//   favorito (uma chance só: Lesch-Nyhan dá 20% de chance de esquivar dos golpes). Na sala toca Das Lied von der Erde.
// Mapa: js/mapa/world.js (buildConsultorio4) · Falas: js/roteiros/story1.js (maaa, adc)
// Progresso (GAME.G): maaa (já conversou) · adc ('ok' acertou | 'erro' errou | null)
GAME.chapter((() => {
  const G = GAME.G;
  let maaa, adc, maaaK = 0, adcK = 0, inside = false, musicBefore = null;

  async function talkMAAA() {
    if (G.state !== 'play' || G.paused) return;
    if (G.maaa) { const l = STORY1.MAAA_DE_NOVO; await GAME.runConvo(c => c.say('maaa', l[maaaK++ % l.length]), { target: maaa }); return; }
    await GAME.runConvo(c => STORY1.maaa(c), { target: maaa });
    G.maaa = true; GAME.save(true);
  }
  async function talkADC() {
    if (G.state !== 'play' || G.paused) return;
    if (G.adc) { const l = STORY1.ADC_DE_NOVO[G.adc]; await GAME.runConvo(c => c.say('adc', l[adcK++ % l.length]), { target: adc }); return; }
    await GAME.runConvo(async c => {
      G.adc = await STORY1.adc(c, { ok: () => {
        COMBAT.P.dodge = 0.2; AUDIO.sfx('achievement');
        GAME.notify('20% de chance de esquivar dos golpes (javalis e seringas).', '⚡ REFLEXOS DE LESCH-NYHAN');
      } });
    }, { target: adc });
    GAME.save(true);
  }

  return {
    id: 'consultorio4',
    init() {
      const A = GAME.W.amb;
      maaa = GAME.npc('maaa', {                                    // sentado na beirada da maca, lendo
        at: A.maaaPos, w: 0.725, h: 1.45, y: 1.172, head: 1.58, dim: 0.42,
        aura: { color: 0xb08aff, w: 1.3, h: 1.7, opacity: 0.5, ring: 0 },
        use: { verb: 'conversar com o MAAA', fn: talkMAAA },
        // lê; às vezes levanta os olhos e balança a perna (quadro 2); falando alterna 1/2 (olhando pra você)
        anim(n, t, talking) { n.setFrame(talking ? (Math.floor(t * 7) % 2 ? 1 : 2) : (Math.floor(t * 0.9) % 5 === 0 ? 2 : 0)); },
      });
      adc = GAME.npc('adc', {                                       // na cadeira, de perfil, de cara pro monitor
        at: A.adcPos, w: 0.8, h: 1.6, dim: 0.42,
        aura: { color: 0x8ac8ff, w: 1.4, h: 1.9, opacity: 0.5, ring: 0 },
        use: { verb: 'conversar com o ADC', fn: talkADC },
        // clica sem tirar o olho da tela; espelha conforme o lado de onde você olha, pra continuar virado pro monitor
        anim(n, t, talking) {
          n.setFrame(talking ? Math.floor(t * 7) % 2 : (Math.sin(t * 5.3) > 0.55 ? 2 : 0));
          n.mesh.scale.x = GAME.camera.position.x < n.mesh.position.x ? 1 : -1;
        },
      });
    },
    // Das Lied von der Erde enquanto você estiver na sala (na saída, volta o que tocava)
    update() {
      const now = GAME.inZone(GAME.W.amb.zone);
      if (now === inside) return;
      inside = now;
      if (inside) { musicBefore = AUDIO.playing; AUDIO.play('erde', { fade: 2.5 }); }
      else if (AUDIO.playing === 'erde') AUDIO.play(musicBefore && musicBefore !== 'erde' ? musicBefore : 'moonlight', { fade: 2.5 });
    },
    save(s) { s.maaa = !!G.maaa; s.adc = G.adc || null; },
    load(s) {
      G.maaa = !!s.maaa; G.adc = s.adc || null;
      if (G.adc === 'ok') COMBAT.P.dodge = 0.2;
    },
  };
})());
