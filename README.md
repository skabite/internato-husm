# INTERNATO — HUSM: Apagão

Jogo em primeira pessoa (estética Doom: 3D de baixa resolução + sprites) ambientado no
Hospital Universitário de Santa Maria durante um apagão. Suspense/terror, sem pacientes.

## Como jogar
Dê dois cliques em `index.html` (Chrome/Edge/Firefox). Não precisa instalar nada.
A fonte pixelada vem do Google Fonts (sem internet, cai numa fonte monoespaçada).

| Tecla | Ação |
|---|---|
| WASD / setas | andar |
| Mouse | olhar |
| Shift | correr |
| E | examinar |
| F | lanterna |
| P | alterna resolução interna (180 / 270 / 400 linhas) |
| M | liga/desliga música |
| Clique | atacar (bisturi / revólver) |
| 1 / 2 / 3 | bisturi / revólver / carabina de ipê (fora de diálogo) |
| R | recarregar |
| 1–5 | opções de diálogo |
| Espaço | interromper o professor (só quando ele respira!) |

## No celular (Android)
Abra o link do jogo (GitHub Pages) no Chrome do celular e deite o aparelho. Os controles de toque aparecem sozinhos:
- **Joystick**: encoste o dedo na metade esquerda e arraste (empurrar até a borda = correr).
- **Olhar**: arraste o dedo na metade direita.
- **ATACAR**: segure pra atacar sem parar; arrastando o dedo no próprio botão você mira ao mesmo tempo.
- **MIRA LEVE / FORTE / OFF** (toque pra alternar): LEVE (padrão) puxa a câmera de leve pro inimigo e quem atira é você;
  FORTE puxa mais e atira sozinha quando ele entra na mira. Enquanto você arrasta a câmera, ela não puxa (dá pra trocar de alvo).
- **USAR** (fica amarelo quando tem algo pra examinar), **ARMA** (alterna entre as armas que você tem), **R** (recarregar), 🔦, **PX** (resolução — use se travar) e **II** (pausa).
- Nas conversas: toque nas opções; **INTERROMPER!** acende quando o professor respira; **CONTINUAR ▶** avança.
- Nó cirúrgico do De Barros: arraste o dedo na direção da seta — mão esquerda na metade esquerda da tela, direita na direita (o lado da vez fica aceso).
- No computador dá pra testar os controles de toque com `index.html#touch`.

### Publicar no GitHub Pages
Settings → Pages → *Deploy from a branch* → `main` / `(root)` → Save. Em ~1 min o jogo fica em `https://skabite.github.io/internato-husm/`.
O site do Pages é público (quem tiver o link joga). Em conta gratuita, o Pages exige repositório público.

## Capítulo 3 — Plantão
- Depois de vencer o Schwarzenegger, a arena reabre. Na volta, o Professor Liberato te barra no corredor da Endoscopia,
  pergunta das colonoscopias e avisa: você está de plantão. Não tem luz, não tem ninguém internado... na verdade, tem.
- **Leito 12 (Ala C, atrás da cortina): Professora Muriel, internada por pancreatite.** Você conversa (dor em faixa,
  pedrinhas na vesícula), examina, lê o prontuário (lipase 1.840) e responde a "pergunta de prova" do diagnóstico.
  A TC está no negatoscópio da parede direita da Ala C: pancreatite edematosa intersticial, sem necrose, sem gás,
  sem infecção local.
- Na prescrição, a voz do **Professor Máscara** (lembrança em sépia, máscara no queixo): "E se fosse a sua mãe, você não
  daria antibiótico?". Você prescreve certo — Ringer guiado por meta, analgesia de verdade, dieta oral precoce, SEM
  antibiótico, colecistectomia na mesma internação — e ela melhora (e chora de emoção). Errar tem explicação e você tenta de
  novo; sem nenhum erro = conquista "PRESCRIÇÃO PERFEITA".
- Só depois o Liberato manda você ao PS: "O PS ainda está aberto."
- A escada caracol do hall agora desce pro PS (subsolo, layout provisório): Acolhimento/Classificação de risco, Sala Verde,
  Sala Vermelha, Sala Amarela e a Chefia do PS.
- Professor Falastrão (chefe do PS; visual provisório até chegar a foto): abraça quebrando costela, esmaga a mão, toca sax,
  entuba todo mundo e só fecha o PS se isso der manchete pra ele. A conversa só começa perto da mesa dele — antes dá pra
  fuçar a sala: o slide 1 de 214, o Guyton corrigido, o kit de via aérea de caneta BIC, os coletes, a vassoura...
- Música: Prelúdio (Bach) no Liberato, Tocata e Fuga (Bach) no Falastrão.

## Auras
Itens de cura brilham em verde, cada personagem tem um brilho da sua cor, objetos de usar (gavetas, geladeira, álcool gel) brilham em dourado,
e o objeto que você está olhando pulsa (dá pra examinar com [E] / USAR).

## Save
Salva sozinho (no navegador) depois do saguão, depois do Liberato, ao pegar o revólver, ao tomar café e a cada 20 s fora de combate.
Na tela de título: CONTINUAR ou NOVO JOGO. O save fica no navegador usado (Chrome e Edge têm saves separados).

## Estrutura
```
index.html, style.css
lib/three.min.js     Three.js r128 (local)
js/util.js           utilidades
js/audio.js          sequenciador chiptune + efeitos (Bach, Beethoven, Grieg)
js/textures.js       texturas pixeladas geradas por código
js/sprites.js        sprite do professor (pixel art em código)
js/world.js          entrada do Bloco D (fachada, praça, recepção, escada, corredor, banheiro) — 1 unidade = 1 metro
js/level1.js         Capítulo 1: ala de trás em MAPA ASCII (1 caractere = 1 m)
js/level2.js         Capítulo 2: Vascular (De Barros) e CCIH (arena do chefe), também em ASCII
js/boss.js           o chefe: Professor Schwarzenegger
js/story2.js         roteiros do Capítulo 2
js/level3.js         Capítulo 3: o PS no subsolo (layout provisório em ASCII)
js/story3.js         roteiros do Capítulo 3 (Liberato, Professora Muriel/Professor Máscara e Professor Falastrão)
js/combat.js         armas, javalis, café, HUD de combate
js/convo.js          motor de conversas roteirizadas (Liberato, Javali, pensamentos)
js/touch.js          controles de toque (celular): joystick, arrastar pra olhar, botões
js/aura.js           brilho dos itens de cura, personagens e objetos de usar
js/story1.js         roteiros do Capítulo 1
personagens.html     galeria dos personagens (dev)
js/dialogue.js       sistema e textos da conversa com o professor
js/main.js           loop, controles, estados, gatilhos
```

## Modo dev
`index.html#dev=x,z,yaw` pula as telas iniciais e posiciona o jogador.
Opcional `,pPITCH` (olhar pra cima/baixo). Estágios: `,talk` abre a conversa do saguão · `,met` depois do saguão · `,dudu` depois do Liberato (com bisturi) · `,gun` com revólver · `,prof3` depois do Javali · `,clovis` depois do De Barros (CCIH liberada) · `,ch3` depois do Schwarzenegger (Capítulo 3) · `,leito` Liberato já mandou ver o Leito 12 · `,rx` falta só prescrever pra Professora Muriel · `,ps` liberado pro PS (escada caracol desce).
Ex. do Leito 12: `index.html#dev=21.2,-72,3.14,rx`.
No modo dev o jogo não pausa sem o mouse travado e expõe `window.__game` para testes automáticos.
Ex.: `index.html#dev=0,-24,0,met` (início do corredor).
Outros pontos úteis: `#dev=0,14,0,p0.2` (marquise) · `#dev=2,-1.5,0.15,met` (catracas) · `#dev=-2,-12,-1.08,met` (escada helicoidal) · `#dev=-2.2,-30.3,1.57,met` (banheiro masculino).

## Mecânica do diálogo
- **Foco do professor** (0–100%): chegar a 100% faz ele explicar a missão.
- Opções que alimentam a tangente baixam o foco; opções que puxam pro assunto sobem (mas ele pode sequestrar o assunto).
- **Interromper** com Espaço durante a respiração = +foco. Fora da respiração ele não lida: perde o fio e recomeça do começo (−foco).
- Ele divaga sobre saúde coletiva, TI em saúde e gestão, e oferece café e biscoito: aceitar = +10 de saúde máxima no fim da conversa.
- Silêncio demais (barra vermelha) = ele preenche com outra história.
- A música (Na Gruta do Rei da Montanha) acompanha a empolgação dele, sem exagero.

## Capítulo 1 — Professor Liberato
- Liberato: você chegou atrasado. Medidor do Instagram (ele te segue ou deixa de seguir; curte, comenta, visualiza e não reage). Se terminar seguido: +25 de saúde máxima.
- Minijogo: ordenar os laudos de colonoscopia por prontuário crescente.
- Revólver do cirurgião torácico: escondido num de 5 móveis da sala (sorteado a cada partida).
- Ala C: javalis (olhos brilham no escuro, investem quando perto).
- Cura: café da copa (+30, cura infecção), bolacha Maria (+15), dipirona (+20), soro fisiológico (+25, cura infecção),
  chimarrão no galpãozinho (+40) e a marmita do Liberato na geladeira da copa (+50 — mas se ele te seguia, deixa de seguir e leva os +25).
- Música: Prelúdio em Dó (Bach) no Liberato, Verão/Presto (Vivaldi) no combate.

## Capítulo 2 — A infecção no ar
- A sala do Javali só abre com a Ala C sem javalis (contador no objetivo).
- Professor De Barros: medidor "APROVAÇÃO DO DE BARROS" (quase não sobe). Minijogo do nó cirúrgico:
  - **Computador** (nó clássico): digite a sequência — WASD na mão esquerda, setas na direita. 7 teclas e 6 s por mão;
    perfeito = sem erro e até 3,5 s por mão.
  - **Celular** (arrasto): aparece uma seta e você arrasta o dedo naquela direção. 8 laçadas por mão, ~1,4 s por seta
    (demorou, o fio afrouxa e conta erro); a mão direita tem diagonais. Cada mão usa a sua metade da tela
    (a metade da vez fica acesa); arrastar no lado errado conta erro.
  Cada acerto toca uma nota de Eine kleine Nachtmusik. Sem errar nas duas mãos = conquista rara "elogio do De Barros".
- **Aprovação máxima** (elogiar a sala, perguntar dos cavalos, nó perfeito e responder "Perfeitamente, professor"): ele te dá a
  **CARABINA DE IPÊ** — 8 tiros, dano 3, recarga mais lenta. Tecla [3].
- Javali: fala grunhindo.
- Chefe — Professor Schwarzenegger (CCIH):
  - OLHAR PENETRANTE: raio psíquico; tira saúde enquanto ele te enxerga → esconda-se atrás dos pilares.
  - SERINGAS CONTAMINADAS: dano + infecção (café ou álcool gel curam). Dá pra destruir no ar com tiro.
  - Ponto fraco: o telefone toca (entrevista!). Ele para; chegue perto e aperte E → assinatura. 3 assinaturas vencem.
  - Ou na força: 60 de vida (revólver 2, bisturi 1). Zerou, ele se rende e assina tudo.
- Música: Eine kleine Nachtmusik (Mozart) no De Barros, 5ª Sinfonia (Beethoven) no chefe.

## Entrada do HUSM (Bloco D) — refeita a partir das fotos de referência
As fotos ficam só no computador (têm pessoas reais), mas o que foi tirado delas está no código:
- **Fachada**: térreo com o mural de formas pretas sobre o reboco creme, basculantes com ar-condicionado e a faixa verde de concreto com limo;
  torre de **6 pavimentos** (térreo + 5 fileiras de janelas, contadas nas fotos), pilares verde-claros, persianas projetadas, platibanda.
- **Marquise branca** com o letreiro HOSPITAL / HUSM / SUS / EBSERH, totem "Bloco D", placa de "Proibido fumar", bancos e guarda-corpos.
- **Praça**: bloquete sextavado, meio-fio amarelo, barreiras laranja no retorno, jacarandás, bancos de concreto, ambulância, poste.
- **Recepção**: balcão curvo dos guichês 21–24, painel de senha (PC0696), coluna verde-petróleo com INFORMAÇÕES, cadeiras azuis, relógio parado em 18h47, catracas.
- **Hall**: escada helicoidal verde com o miolo verde/vermelho/amarelo, cadeiras de rodas embaixo, elevadores, o galpãozinho de madeira com o quadro da ponte.
- **Corredor**: parede cinza com barra de granilite, forro de PVC, eletrocalha, quadradinhos azuis no piso, extintor no quadrado vermelho e amarelo, hidrante,
  placas fotoluminescentes e o sanitário masculino (a porta do fundo abre sozinha).
- Ainda provisório: a **planta** (onde fica cada sala). Uma foto do "MAPA DO HOSPITAL" da entrada resolveria.

