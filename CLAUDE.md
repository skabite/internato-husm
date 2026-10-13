# CLAUDE.md — guia do código do INTERNATO HUSM

Jogo em primeira pessoa (Three.js r128, pixel art gerada por código) ambientado no HUSM. Textos e comentários em português.
Roda com **dois cliques no `index.html`** (file://) e no GitHub Pages. Por isso: **sem build, sem `import`/`export`,
sem bibliotecas novas**. Cada arquivo define um global em MAIÚSCULAS e **a ordem dos `<script>` no `index.html` importa**.
O dono do projeto é leigo em programação: explique as coisas em linguagem simples.

## Mapa do código
| Pasta / arquivo | O que é | Global |
|---|---|---|
| `js/motor/game.js` | hub: registro de capítulos e áreas, estado compartilhado `GAME.G`, personagens no mapa (`GAME.npc`), serviços | `GAME` |
| `js/motor/save.js` | save no `localStorage`, versão 2, `migrate()` converte saves antigos | `SAVE` |
| `js/motor/build.js` | caixa de ferramentas do mapa: `walls`/`scan` (mapa em texto), `door`/`pair`, `light`, `cafe`/`pickup` | `BUILD` |
| `js/motor/convo.js` | conversas roteirizadas (`c.say`, `c.choose`, `c.ig`, `c.meter`) + API de minijogos | `CONVO` |
| `js/motor/sprites.js` | desenha personagens a partir da ficha; também javali, armas, seringa | `SPRITES` |
| `js/motor/combat.js` | armas, javalis (IA), dano, esquiva, HUD de saúde | `COMBAT` |
| `js/motor/audio.js` | músicas 8-bit (`SONGS`) e efeitos (`SFX`) gerados na hora | `AUDIO` |
| `js/motor/` (resto) | `textures` (texturas), `aura` (brilhos), `touch` (celular), `util` (`U.clamp`, `U.pick`...) | |
| `js/dados/personagens.js` | **a ficha de cada personagem**: `fala` (nome, voz) e `visual` (desenho) | `PERSONAGENS` |
| `js/mapa/world.js` | entrada do Bloco D: praça, saguão, hall, corredor dos ambulatórios, banheiro, Consultório 4 | `WORLD` (área `W`) |
| `js/mapa/level1.js` | ala de trás (mapa em texto): Endoscopia, Torácica, copa, Ala C (javalis, Leito 12), sala do Javali | área `L1` |
| `js/mapa/level2.js` | Vascular (De Barros) e CCIH (arena do chefe) | área `L2` |
| `js/mapa/level3.js` | PS no subsolo (layout provisório) e a sala do **Centro Obstétrico** (colunas 44–52, cap. 4) | área `L3` |
| `js/mecanicas/` | `dialogue.js` (Monteiro: interromper quando ele respira), `laudos.js`, `no.js` (nó cirúrgico), `ctg.js` (cardiotocógrafo), `boss.js` (Schwarzenegger) | `DIALOGUE`, `BOSS` |
| `js/roteiros/storyN.js` | **só as falas** (funções async que recebem `c`) | `STORY1..4` |
| `js/capitulos/*.js` | **o que acontece e quando**: prologo, cap1..cap4, consultorio4 | — |
| `js/main.js` | motor: render, controles, câmera, telas, `runConvo`, itens de cura, laço | — |
| `tests/` | testes que jogam o jogo inteiro (`npm test`) | — |
| `docs/` | planos (minijogo do CTG) e revisão ética (pacientes) | — |

### Personagens (id único em todo lugar)
`monteiro` (saguão) · `liberato` · `javali` · `debarros` · `schwarzenegger` (chefe) · `muriel` / `muriel2` (Leito 12, chorando)
· `mascara` (lembrança) · `falastrao` (PS) · `maaa`, `adc` (Consultório 4) · Centro Obstétrico: `tcheco` (chefe), `jaque` / `jaque2`
(a gestante, aliviada depois da fita), `sandro` (acompanhante), `rosane` (enfermeira obstetra) · sem desenho: `eu`, `narr`, `zap`.

## Como as peças conversam
- `main.js` monta as áreas (`GAME.area`), chama `init()` de cada capítulo e, a cada quadro, `update(dt)` (só jogando)
  e `frame(dt, t)` (sempre). Objetivo, checkpoint, frases de morte e rótulo do save: **vale o último capítulo que responder**.
- Capítulos não se chamam direto. Compartilham o progresso em **`GAME.G`** (cada arquivo lista no topo os campos que são
  dele) e falam por **eventos**: o mapa faz `ctx.emit('gun', ...)`, outro capítulo faz `GAME.emit('bossDefeated')`, e quem
  escuta tem `on: { gun(...) {}, bossDefeated() {} }`.
- Uma cena típica: gatilho no `update` → `await GAME.runConvo(c => STORY2.deBarros(c, {...}), { target: npc })` → muda
  `GAME.G` → destranca porta (`BUILD.doors.x.locked = false`) → `GAME.refreshObjective()` → `GAME.save()`.
- Serviços do `GAME`: `toast`, `subtitle`, `notify`, `prompt`, `runConvo`, `titleCard(texto, segundos)` (promise), `travel` (escada com tela
  preta), `save`, `end(n, texto)`, `die`, `fx.flash/psychic`, `inZone(zona)`, `dist(npc)`, `N.id` (personagem pelo id), `P` (jogador).

## Receitas
### Capítulo novo
1. Crie `js/capitulos/capN.js` (modelo abaixo) e ponha o `<script>` no `index.html` **depois** do capítulo anterior.
2. Falas em `js/roteiros/storyN.js` (`<script>` junto dos outros roteiros).
3. Área nova? Veja "Área nova". Personagem novo? Veja "Personagem novo".
4. Um estágio no `dev:` e um teste em `tests/` (copie `tests/05-cap3.test.js`).
```js
// CAPÍTULO N — o que acontece. Mapa: js/mapa/... · Falas: js/roteiros/storyN.js
// Progresso (GAME.G): fooStarted/fooDone
GAME.chapter((() => {
  const G = GAME.G;
  let foo;                                          // personagens e estado só deste arquivo
  async function startFoo() {
    G.fooStarted = true;
    await GAME.runConvo(c => STORYN.foo(c), { target: foo });
    G.fooDone = true; GAME.refreshObjective(); GAME.save();
  }
  return {
    id: 'capN',
    init() { foo = GAME.npc('foo', { at: GAME.LN.fooPos, aura: { color: 0xffaa00 } }); },
    update(dt) { if (G.anteriorDone && !G.fooStarted && GAME.inZone(GAME.LN.zoneFoo)) startFoo(); },
    on: { algoNoMapa() { /* ctx.emit('algoNoMapa') */ } },
    save(s) { s.fooDone = !!G.fooDone; },
    load(s) { if (s.fooDone) { G.fooStarted = G.fooDone = true; /* deixar o mundo como estava */ } },
    objective: () => (G.fooDone ? 'OBJETIVO: ...' : G.anteriorDone ? 'OBJETIVO: Falar com o FOO' : null),
    checkpoint: () => (G.anteriorDone ? GAME.LN.checkpoint : null),
    saveLabel: s => (s.fooDone ? 'depois do Foo' : null),
    dev: { foo: { save: { fooDone: true } } },      // index.html#dev=x,z,yaw,foo
  };
})());
```
### Personagem novo
1. Entrada em `js/dados/personagens.js`: `fala` (nome na caixa, `cps`, `blip`) e `visual` (opções no topo do arquivo).
   Confira o desenho abrindo `personagens.html`.
2. No `init()` do capítulo: `GAME.npc('id', { at, w, h, aura: { color }, use: { verb, fn } })`. Tamanhos: em pé 0,9 × 1,8;
   baixinho 0,78 × 1,56; alto 0,92 × 1,9; sentado na maca: veja `muriel` (cap3) e `maaa` (consultorio4). Jaleco branco
   estoura na lanterna: `dim: 0.42`.
3. Falas: `c.say('id', 'texto')`. Pose nova (deitado, de perfil...) se desenha em `sprites.js` (veja `readingBody`, `deskBody`).
### Minijogo novo
`js/mecanicas/nome.js`: `CONVO.minigame('nome', { start(ui, ...args) { ...; return estado }, key(code, evento), pick(i), update(dt) })`;
termina com `ui.finish(resultado, atrasoMs)`. `<script>` depois do `convo.js`. No roteiro: `const r = await c.nome(...)`.
Modelos: `laudos.js` (escolher opções), `no.js` (teclas/arrasto com tempo), `ctg.js` (canvas próprio + medição contínua).
Quem desenha em canvas usa um `<canvas>` próprio e o CSS amplia (`#rhythm`, `#ctg` em `style.css`). Plano do CTG: `docs/minijogo-cardiotocografia.md`.
### Área nova (ou sala)
- Área com mapa em texto: `js/mapa/levelN.js` com `MAP` e `BUILD.walls/scan/door/light/cafe`; no fim
  `GAME.area('LN', LEVELN.build)`. Coloque longe das outras (o PS fica em z −320; chega-se por `GAME.travel`).
  O que o capítulo precisa (posições, zonas) vai no objeto devolvido pelo `build`. Ações do mapa: `ctx.emit('evento')`.
- Sala dentro de área que já existe: veja `buildConsultorio4` em `world.js` (abre a parede e monta por dentro).
- Objeto de examinar: `WORLD.box(..., { msg })`. De usar: `mesh.userData.verb/onUse` (+ `auraVisible` se o brilho some).
### Música nova
`audio.js`: `SONGS.nome = { bpm, tracks: [...] }`. **Todas as faixas com o mesmo total de batidas** (senão desencontram no loop).
### Item de cura
`BUILD.cafe('LN', x, z)` ou `BUILD.pickup('LN', { x, z, cup, heal, msgs, full })`. O id é `'LN:n'` pela ordem em cada área:
acrescente **no fim** da área pra não trocar o id dos que já existem (o save guarda os ids).
### Mudou o que vai pro save?
Campo novo: escreva em `save(s)` e leia em `load(s)` com valor padrão (saves antigos não têm). Renomeou ou mudou formato:
suba `SAVE.VERSION` e converta em `migrate()` (e acrescente um save antigo em `tests/07-save.test.js`).

## Convenções
- Texto do jogo e comentários em português; nomes no código em inglês curto (exceto ids de personagem e áreas).
- Comentário explica a regra ou o porquê, não o óbvio. Densidade parecida com o resto.
- 1 unidade = 1 metro. O hospital cresce pra −z. `yaw` 0 olha pra −z, −π/2 olha pra +x, π olha pra +z.
- Pessoas reais: fotos de referência ficam **fora do git** (`.gitignore`); professores são caricaturas com nome trocado.
  Antes de pôr paciente novo, leia `docs/etica-pacientes.md` (checklist no fim).

## Testes
`npm install` uma vez; `npm test` roda tudo (~5 min); `node tests/run.js cap2` roda só o que tiver "cap2" no nome.
Os testes abrem `index.html#dev=...` sem desenhar (`noRender`) e com texto acelerado (`textSpeed`), e controlam o jogo pelo
`window.__game` e pelos globais. Ajudantes em `tests/lib.js`: `g.open`, `g.goTo`, `g.talk` (avança até escolha),
`g.pick('texto')`, `g.talkThrough([preferências])`, `g.knot()`, `g.until(fn)`. Rode os testes antes de cada commit.
Pegadinhas: `onUse` que devolve promise trava o `g.eval` (chame sem `return`); jogador parado num gatilho dispara a cena
seguinte colada na anterior (afaste-o antes).

## Armadilhas conhecidas
- Modo dev não liga o som (o `AUDIO.init` é no clique da tela inicial).
- `GAME.G.muriel` com .5 = cena em andamento (não dispara de novo).
- `state 'dialogue'` é só a conversa do Monteiro (`DIALOGUE`); o resto usa `'convo'`.
- O capítulo 3 não encerra mais o jogo: ele emite `GAME.emit('psFechado')` e o `cap4.js` continua (destranca `BUILD.doors.co`).
- **O `MAP` de `level3.js` tem exatamente 26 linhas e cada uma é 1 metro.** Apagar ou acrescentar uma linha
  empurra TODAS as paredes dali pra baixo em 1 m — e os móveis, que são posicionados em coordenadas absolutas,
  ficam dentro da parede (foi o que aconteceu em out/2026: a vassoura e os troféus do Falastrão sumiram).
  Área nova se faz **alargando as linhas** (colunas), não mudando a contagem delas.
- Minijogo que desenha em canvas e põe botões na caixa de conversa precisa da classe **`.ctgbtn`** (ou `.knot`):
  é por ela que o `touch.js` esconde o **CONTINUAR ▶** no celular — e sem isso cada toque nele vira um `Space`,
  que o minijogo lê como "bater no aparelho". Veja `js/mecanicas/ctg.js` (`addOpts`) e `js/motor/touch.js` (`update`).
- O minijogo do CTG é o único que mede `dt` de verdade (o nó depende de `performance.now()`): mexer nele pensando no relógio de parede dá diferença nos testes.
- Na barriga do CTG (vista de cima, cabeça pra cima da tela) **a direita DELA fica à esquerda da tela**, como olhar alguém de frente.
  O lado vem de Leopold (`STORY4.tcheco1` devolve `lado`); as letras D e E desenhadas na barriga lembram o jogador.
