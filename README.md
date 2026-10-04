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
| 1–4 | opções de diálogo |
| Espaço | interromper o professor (só quando ele respira!) |

## Estrutura
```
index.html, style.css
lib/three.min.js     Three.js r128 (local)
js/util.js           utilidades
js/audio.js          sequenciador chiptune + efeitos (Bach, Beethoven, Grieg)
js/textures.js       texturas pixeladas geradas por código
js/sprites.js        sprite do professor (pixel art em código)
js/world.js          mapa — escala 1 unidade = 1 metro (LAYOUT PROVISÓRIO)
js/dialogue.js       sistema e textos da conversa com o professor
js/main.js           loop, controles, estados, gatilhos
```

## Modo dev
`index.html#dev=x,z,yaw` pula as telas iniciais e posiciona o jogador.
Acrescente `,talk` para abrir a conversa direto, ou `,met` para pular a conversa.
Ex.: `index.html#dev=0,-24,0,met` (início do corredor).

## Mecânica do diálogo
- **Foco do professor** (0–100%): chegar a 100% faz ele explicar a missão.
- Opções que alimentam a tangente baixam o foco; opções que puxam pro assunto sobem (mas ele pode sequestrar o assunto).
- **Interromper** com Espaço durante a respiração = +foco. Fora da respiração = ele acelera.
- Silêncio demais (barra vermelha) = ele preenche com outra história.
- A música (Na Gruta do Rei da Montanha) acelera junto com ele.
