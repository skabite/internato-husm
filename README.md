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
| 1 / 2 | bisturi / revólver (fora de diálogo) |
| R | recarregar |
| 1–5 | opções de diálogo |
| Espaço | interromper o professor (só quando ele respira!) |

## Save
Salva sozinho (no navegador) depois do saguão, depois do Dudu, ao pegar o revólver, ao tomar café e a cada 20 s fora de combate.
Na tela de título: CONTINUAR ou NOVO JOGO. O save fica no navegador usado (Chrome e Edge têm saves separados).

## Estrutura
```
index.html, style.css
lib/three.min.js     Three.js r128 (local)
js/util.js           utilidades
js/audio.js          sequenciador chiptune + efeitos (Bach, Beethoven, Grieg)
js/textures.js       texturas pixeladas geradas por código
js/sprites.js        sprite do professor (pixel art em código)
js/world.js          fachada, saguão, corredor — escala 1 unidade = 1 metro
js/level1.js         Capítulo 1: ala de trás em MAPA ASCII (1 caractere = 1 m)
js/level2.js         Capítulo 2: Vascular (Clóvis) e CCIH (arena do chefe), também em ASCII
js/boss.js           o chefe: Alexandre "Bélgica" Schwartzboldt
js/story2.js         roteiros do Capítulo 2
js/combat.js         armas, javalis, café, HUD de combate
js/convo.js          motor de conversas roteirizadas (Dudu, Professor3, pensamentos)
js/story1.js         roteiros do Capítulo 1
personagens.html     galeria dos personagens (dev)
js/dialogue.js       sistema e textos da conversa com o professor
js/main.js           loop, controles, estados, gatilhos
```

## Modo dev
`index.html#dev=x,z,yaw` pula as telas iniciais e posiciona o jogador.
Opcional `,pPITCH` (olhar pra cima/baixo). Estágios: `,talk` abre a conversa do saguão · `,met` depois do saguão · `,dudu` depois do Dudu (com bisturi) · `,gun` com revólver · `,prof3` depois do Javali · `,clovis` depois do Clóvis (CCIH liberada).
No modo dev o jogo não pausa sem o mouse travado e expõe `window.__game` para testes automáticos.
Ex.: `index.html#dev=0,-24,0,met` (início do corredor).

## Mecânica do diálogo
- **Foco do professor** (0–100%): chegar a 100% faz ele explicar a missão.
- Opções que alimentam a tangente baixam o foco; opções que puxam pro assunto sobem (mas ele pode sequestrar o assunto).
- **Interromper** com Espaço durante a respiração = +foco. Fora da respiração = ele acelera.
- Silêncio demais (barra vermelha) = ele preenche com outra história.
- A música (Na Gruta do Rei da Montanha) acelera junto com ele.

## Capítulo 1 — Dudu da Gastro
- Dudu: você chegou atrasado. Medidor do Instagram (ele te segue ou deixa de seguir). Se terminar seguido: +25 de saúde máxima.
- Minijogo: ordenar os laudos de colonoscopia por prontuário crescente.
- Revólver do cirurgião torácico: escondido num de 5 móveis da sala (sorteado a cada partida).
- Ala C: javalis (olhos brilham no escuro, investem quando perto). Café da copa cura 30.
- Música: Prelúdio em Dó (Bach) no Dudu, Verão/Presto (Vivaldi) no combate.

## Capítulo 2 — A infecção no ar
- A sala do Professor3 ("O Javali") só abre com a Ala C sem javalis (contador no objetivo).
- Clóvis da Vascular: medidor "APROVAÇÃO DO CLÓVIS" (quase não sobe). Minijogo do nó cirúrgico: mão esquerda (W A S D) e direita (setas).
  Perfeito e rápido nas duas mãos = conquista rara "elogio do Clóvis".
- Chefe — Alexandre "Bélgica" Schwartzboldt (CCIH):
  - OLHAR PENETRANTE: raio psíquico; tira saúde enquanto ele te enxerga → esconda-se atrás dos pilares.
  - SERINGAS CONTAMINADAS: dano + infecção (café ou álcool gel curam). Dá pra destruir no ar com tiro.
  - Ponto fraco: o telefone toca (entrevista!). Ele para; chegue perto e aperte E → assinatura. 3 assinaturas vencem.
  - Balas não o afetam: é professor. Burocracia se vence com burocracia.
- Música: Eine kleine Nachtmusik (Mozart) no Clóvis, 5ª Sinfonia (Beethoven) no chefe.
