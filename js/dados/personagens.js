// FICHA DE CADA PERSONAGEM: como fala (nome na caixa de conversa e "voz") e como aparece (visual).
// Personagem novo = uma entrada aqui + colocar no mapa num capítulo com GAME.npc('id', {...}). Ver CLAUDE.md.
// O id é o mesmo em todo lugar: c.say('liberato', ...), GAME.npc('liberato', ...), SPRITES.get('liberato').
//
//   fala:   { nome, cps (letras por segundo), blip: [tom, variação] da voz em bipes (null = muda),
//             italico (pensamento/narração), porco (grunhe nas pausas) }
//   visual: ficha do desenho (32x64 no mapa, 48x48 na conversa), lida por js/motor/sprites.js:
//     skin/skinD (pele/sombra) · hair: bald | short | sidepart | slicked | messy | pixie | spiky · hairC/hairD
//     glasses: thick | thin | rimless | onhead · glassC · beard: 'stubble' · beardC · brows (cor)
//     coat/coatD (jaleco) · shirt/shirtD · mouth: neutral | smile | frown | pain · faceRx/faceRy (rosto)
//     extras: short, tall, blazer, lantern, sax, lanyard, mask, stripes, cheek, earrings, tears, noSteth, browsUp, book, screenGlow
//     pose: (em pé) | patient (deitada na maca) | reading (sentado lendo) | desk (de perfil no computador)
const PERSONAGENS = {
  // ---------- sem desenho ----------
  eu: { fala: { nome: 'VOCÊ (pensando)', cps: 48, blip: null, italico: true } },
  narr: { fala: { nome: '', cps: 60, blip: null, italico: true } },
  zap: { fala: { nome: '📱 GRUPO "INTERNATO HUSM"', cps: 70, blip: null } },

  // ---------- prólogo ----------
  monteiro: {                     // professor do saguão: fala sem parar (mecânica de interromper: js/mecanicas/dialogue.js)
    fala: { nome: 'PROFESSOR MONTEIRO', cps: 30, blip: [170, 140] },
    visual: {
      skin: '#e2b48e', skinD: '#b98a66', hair: 'bald', hairC: '#9a958c', hairD: '#6e6a64',
      glasses: 'thick', glassC: '#141414', beard: 'stubble', beardC: '#8f8a84',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#f2f2f0', shirtD: '#c9cfd8',
      faceRx: 10, faceRy: 13, brows: '#6e6a64', browsUp: true, mouth: 'neutral', lantern: true,
    },
  },

  // ---------- capítulo 1 ----------
  liberato: {                     // gastroenterologia: pontual, metódico, Instagram
    fala: { nome: 'PROFESSOR LIBERATO', cps: 36, blip: [125, 25] },
    visual: {
      skin: '#dcaa84', skinD: '#b07e5a', short: true, hair: 'short', hairC: '#2e2620', hairD: '#1a1512',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#cfc8e6', shirtD: '#a59dc4',
      faceRx: 11.5, faceRy: 13.5, brows: '#2a221c', mouth: 'smile',
    },
  },
  maaa: {                         // interno veterano, sentado na maca do Consultório 4 lendo "As Portas da Percepção"
    fala: { nome: 'MAAA · INTERNO VETERANO', cps: 32, blip: [135, 35] },
    visual: {
      skin: '#c8946c', skinD: '#9c6c48', pose: 'reading', hair: 'messy', hairC: '#2a1c14', hairD: '#1a120c',
      glasses: 'thin', glassC: '#5a4a3a', beard: 'stubble', beardC: '#3a2a1e',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#5a7ab0', shirtD: '#41598a',
      faceRx: 11, faceRy: 13.5, brows: '#2a1c14', mouth: 'smile', book: true,
    },
  },
  adc: {                          // interno no computador do Consultório 4, de perfil, de cara pra tela
    fala: { nome: 'ADC · INTERNO', cps: 44, blip: [190, 60] },
    visual: {
      skin: '#e8bc98', skinD: '#bc9070', pose: 'desk', hair: 'short', hairC: '#4a3020', hairD: '#2e1e14',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#3e8a6e', shirtD: '#2c6a52',
      faceRx: 11, faceRy: 13.5, brows: '#3a2618', mouth: 'neutral', screenGlow: '#8ac8ff',
    },
  },

  // ---------- capítulo 2 ----------
  javali: {                       // "o Javali": fala grunhindo
    fala: { nome: 'JAVALI', cps: 30, blip: [70, 30], porco: true },
    visual: {
      skin: '#d6a47c', skinD: '#a97a56', hair: 'sidepart', hairC: '#3a3836', hairD: '#8d8a86',
      glasses: 'thin', glassC: '#3a3a3a',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#9fd8c8', shirtD: '#6fb0a0',
      faceRx: 10.5, faceRy: 13.5, brows: '#2a2826', mouth: 'smile',
    },
  },
  debarros: {                     // cirurgia vascular: ambidestro, rico, quase nunca aprova
    fala: { nome: 'PROFESSOR DE BARROS', cps: 33, blip: [150, 30] },
    visual: {
      skin: '#ecc3a6', skinD: '#c49a7e', hair: 'slicked', hairC: '#c9c2ae', hairD: '#9a927e',
      glasses: 'rimless', glassC: '#c8ccd0',
      coat: '#f4f4f0', coatD: '#c4c4bc', shirt: '#d9cfee', shirtD: '#b3a6d6',
      faceRx: 10.5, faceRy: 14, brows: '#a89a80', mouth: 'neutral', tall: true,
    },
  },
  schwarzenegger: {               // chefe da CCIH (luta: js/mecanicas/boss.js)
    fala: { nome: 'PROFESSOR SCHWARZENEGGER', cps: 52, blip: [140, 80] },
    visual: {
      skin: '#dcaa86', skinD: '#b07e5e', hair: 'messy', hairC: '#4a3426', hairD: '#8a8078',
      glasses: 'thick', glassC: '#141414',
      coat: '#b88a3e', coatD: '#8a6428', shirt: '#aac6e6', shirtD: '#7f9fc4', blazer: true, lanyard: '#c0202a',
      faceRx: 11, faceRy: 13.5, brows: '#2e2018', mouth: 'smile',
    },
  },

  // ---------- capítulo 3 ----------
  muriel: {                       // internada no Leito 12: sentada na maca, de camisola, óculos na cabeça
    fala: { nome: 'PROFESSORA MURIEL · LEITO 12', cps: 34, blip: [215, 50] },
    visual: {
      skin: '#ecc0a6', skinD: '#c49880', pose: 'patient', hair: 'pixie', hairC: '#dcd8d0', hairD: '#a8a49a',
      glasses: 'onhead', glassC: '#6a5e54',
      coat: '#9fbcd4', coatD: '#7a98b2', shirt: '#ecc0a6', shirtD: '#c49880', noSteth: true,
      faceRx: 11.5, faceRy: 13, brows: '#a8a49a', mouth: 'pain', cheek: '#e0907c', earrings: '#d8d8dc',
    },
  },
  mascara: {                      // só aparece em lembrança: camisa listrada, máscara no queixo
    fala: { nome: 'PROFESSOR MÁSCARA (lembrança)', cps: 38, blip: [92, 22] },
    visual: {
      skin: '#e6b89a', skinD: '#bc8e72', hair: 'spiky', hairC: '#3a2a1e', hairD: '#22170f',
      glasses: 'thin', glassC: '#a8acb2', beard: 'stubble', beardC: '#5a4a3e',
      coat: '#bccde6', coatD: '#8fa4c6', shirt: '#bccde6', shirtD: '#8fa4c6', noSteth: true, stripes: '#98aed2',
      faceRx: 11.5, faceRy: 14, brows: '#2a1e16', mouth: 'frown', mask: '#9cc8e0',
    },
  },
  falastrao: {                    // chefe do PS — visual PROVISÓRIO até chegar a foto: pijama verde, sax no pescoço
    fala: { nome: 'PROFESSOR FALASTRÃO', cps: 46, blip: [115, 70] },
    visual: {
      skin: '#e0b088', skinD: '#b48660', hair: 'messy', hairC: '#8a8478', hairD: '#5a564e',
      beard: 'stubble', beardC: '#6a645a',
      coat: '#4f9a86', coatD: '#3a7666', shirt: '#4f9a86', shirtD: '#3a7666',
      faceRx: 12, faceRy: 13.5, brows: '#4a463e', mouth: 'smile', sax: true,
    },
  },
};
// a Muriel depois do tratamento: chorando de emoção (mesmo personagem, outro rosto e voz um pouco mais aguda)
PERSONAGENS.muriel2 = {
  fala: Object.assign({}, PERSONAGENS.muriel.fala, { blip: [230, 50] }),
  visual: Object.assign({}, PERSONAGENS.muriel.visual, { mouth: 'smile', tears: true }),
};
