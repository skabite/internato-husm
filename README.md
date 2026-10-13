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
| Mouse · Q/E · Espaço · Enter | no CTG: move o transdutor · gira o dial · bate no aparelho · fixa a cinta |

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
- Cardiotocógrafo (Centro Obstétrico): arraste o dedo na tela pra mover o transdutor pela barriga; **DIAL ◀**, **DIAL ▶**, **BATER** e **FIXAR** são os quatro botões da caixa de conversa.
- No computador dá pra testar os controles de toque com `index.html#touch`.

### Publicar no GitHub Pages
Settings → Pages → *Deploy from a branch* → `main` / `(root)` → Save. Em ~1 min o jogo fica em `https://skabite.github.io/internato-husm/`.
O site do Pages é público (quem tiver o link joga). Em conta gratuita, o Pages exige repositório público.

## Capítulo 3 — Plantão
- Depois de vencer o Schwarzenegger, a arena reabre. Na volta, o Professor Liberato te barra no corredor da Endoscopia,
  pergunta das colonoscopias e avisa: você está de plantão. Não tem luz, não tem ninguém internado... na verdade, tem.
- Antes, ele pede o **bisturi** de volta. Dá pra entregar o revólver ou a carabina primeiro ("Isso eu não pedi. Fica comigo
  também. E o bisturi?") ou tentar esconder o revólver no jaleco (ele vê). No fim ele leva todas as armas: o Capítulo 3 é sem
  combate ("Plantão não é lugar de arma. Nunca se sabe quem está atrás de uma cortina.").
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
- No fundo leste do corredor do PS: a porta do **CENTRO OBSTÉTRICO** (trancada por enquanto). Lá dentro, um cardiotocógrafo velho
  com mau contato: batimentos que viram rádio AM, internet discada, canto de baleia (dá pra ouvir chegando perto; a janelinha
  pisca no ritmo). Plano do minijogo em `docs/minijogo-cardiotocografia.md`.
- Professor Falastrão (chefe do PS; visual provisório até chegar a foto): abraça quebrando costela, esmaga a mão, toca sax,
  entuba todo mundo e só fecha o PS se isso der manchete pra ele. A conversa só começa perto da mesa dele — antes dá pra
  fuçar a sala: o slide 1 de 214, o Guyton corrigido, o kit de via aérea de caneta BIC, os coletes, a vassoura...
- Música: Prelúdio (Bach) no Liberato, Tocata e Fuga (Bach) no Falastrão.

## Capítulo 4 — Sintonia (Centro Obstétrico)
- O Falastrão fecha o PS e vai dar entrevista. No fundo leste do corredor, a porta do **CENTRO OBSTÉTRICO** destranca sozinha.
- Lá dentro: o **Professor Tcheco** (Obstetrícia), a **Jaqueline** em trabalho de parto de termo, o marido **Sandro** — acompanhante,
  como manda a Lei 11.108/2005 — e a **Enfermeira Rosane**, que resolve qualquer coisa com um Pinard de madeira em quatro segundos.
- O **cardiotocógrafo** é o vilão: patrimônio 000.001, consertado pelo técnico do rádio em 1998, com um dial de sintonia colado em cima.
  Por isso ele pega rádio AM, canto de baleia, internet discada e o Monteiro falando de tomates pelo encanamento — e não o coração do bebê.
- Você pede licença (consentimento é mecânica, não decoração), faz as manobras de Leopold, põe o toco e vai **sintonizar**:
  mova o transdutor pela barriga, gire o dial, e quando o cabo falhar **bata no aparelho** com a mão plana, quando a luzinha acender.
  Fora de hora, o sinal cai e você começa de novo. Com o traçado limpo, **fixe a cinta** e a fita imprime vinte minutos.
- Depois, a pergunta de prova: ler o traçado (categorias da FIGO 2015).
- **Armadilhas** que o jogo ensina: o batimento limpo e devagar (84) é o **da mãe** — sempre confira o pulso materno; e o visor que mostra
  280 ou 70 é contagem dobrada, não sofrimento fetal. *Perda de sinal não é frequência cardíaca.*
- Jogar certo do começo ao fim dá a conquista **SINTONIA FINA**. Errar não machuca ninguém: o bebê está bem o tempo todo.
- Música: por enquanto a mesma do plantão (a Canção de Ninar de Brahms em 8 bits ainda não entrou).

## Auras
Itens de cura brilham em verde, cada personagem tem um brilho da sua cor, objetos de usar (gavetas, geladeira, álcool gel) brilham em dourado,
e o objeto que você está olhando pulsa (dá pra examinar com [E] / USAR).

## Save
Salva sozinho (no navegador) depois do saguão, depois do Liberato, ao pegar o revólver, ao tomar café e a cada 20 s fora de combate.
Saves de versões antigas do jogo continuam funcionando (são convertidos ao carregar).
Na tela de título: CONTINUAR ou NOVO JOGO. O save fica no navegador usado (Chrome e Edge têm saves separados).

## Estrutura
O mapa completo do código (o que fica onde, como acrescentar capítulo, personagem, minijogo ou sala) está no **CLAUDE.md**.
```
index.html, style.css      a página (a ordem dos <script> importa)
lib/three.min.js           Three.js r128 (local)
js/motor/                  o motor: não sabe nada da história
  game.js                  o "hub": capítulos se registram aqui (GAME.chapter) e usam os serviços comuns
  save.js                  save no navegador, com versão (e conversão de saves antigos)
  build.js                 caixa de ferramentas do mapa: paredes do mapa em texto, portas, luzes, itens de cura
  convo.js                 conversas roteirizadas (e a API de minijogos)
  sprites.js · textures.js · audio.js · combat.js · aura.js · touch.js · util.js
js/dados/personagens.js    a ficha de cada personagem: como fala e como aparece
js/mapa/                   as áreas: world.js (entrada, saguão, corredor, Consultório 4), level1 (ala de trás),
                           level2 (Vascular e CCIH), level3 (PS no subsolo) — 1 unidade = 1 metro
js/mecanicas/              dialogue.js (Monteiro: interromper), laudos.js, no.js (nó cirúrgico), ctg.js (cardiotocógrafo), boss.js (Schwarzenegger)
js/roteiros/               as falas: story1 (prólogo, Cap. 1, Consultório 4), story2, story3, story4 (Centro Obstétrico)
js/capitulos/              o que acontece e quando: prologo, cap1, cap2, cap3, cap4, consultorio4
js/main.js                 laço, controles, câmera, telas
tests/                     testes automáticos que jogam o jogo inteiro (npm test)
personagens.html           galeria dos personagens (dev)
docs/                      planos e revisões (minijogo do CTG, ética de pacientes)
```

## Testes automáticos
`npm install` uma vez e depois `npm test` (ou `node tests/run.js cap2` pra rodar só uma parte). Eles abrem o jogo num
navegador escondido e jogam sozinhos: todos os estágios, o prólogo, os 3 capítulos até a tela de fim, o Consultório 4, o nó
no celular, a porta do CO, cafés, telas e saves (inclusive saves antigos). Leva uns 5 minutos.

## Modo dev
`index.html#dev=x,z,yaw` pula as telas iniciais e posiciona o jogador.
Opcional `,pPITCH` (olhar pra cima/baixo). Estágios (cada um inclui os anteriores): `,talk` abre a conversa do saguão · `,met` depois do saguão · `,liberato` depois do Liberato (com bisturi) · `,gun` com revólver · `,javali` depois do Javali (Ala C limpa) · `,debarros` depois do De Barros (CCIH liberada) · `,ch3` depois do Schwarzenegger (Capítulo 3) · `,leito` Liberato já mandou ver o Leito 12 · `,rx` falta só prescrever pra Professora Muriel · `,ps` liberado pro PS (escada caracol desce) · `,co` porta do Centro Obstétrico destrancada · `,fita` depois da fita (fim do capítulo). Cada capítulo declara os seus em `dev:` (js/capitulos/).
Ex. do Leito 12: `index.html#dev=21.2,-72,3.14,rx`. Acrescente `,touch` pra testar os controles de celular.
No modo dev o jogo não pausa sem o mouse travado, não liga o som e expõe `window.__game` para os testes automáticos.
Ex.: `index.html#dev=0,-24,0,met` (início do corredor).
Outros pontos úteis: `#dev=0,14,0,p0.2` (marquise) · `#dev=2,-1.5,0.15,met` (catracas) · `#dev=-2,-12,-1.08,met` (escada helicoidal) · `#dev=-2.2,-30.3,1.57,met` (banheiro masculino) · `#dev=4.6,-34.6,-1.57,met` (Consultório 4, de frente pro MAAA) · `#dev=4.9,-32.6,3.14,met` (de frente pro ADC).

## Mecânica do diálogo
- **Cutscene antes**: ele está gravando um áudio de WhatsApp de 14 minutos; o interno lembra o aviso dos veteranos no grupo
  (fala demais, só dá pra interromper quando ele respira) e o jogo mostra o aviso amarelo que vai aparecer na conversa.
  No primeiro 0,8 s da conversa o [ESPAÇO] não conta (o dedo ainda está no "continuar" da cutscene).
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

## Consultório 4 (corredor dos ambulatórios, lado direito) — opcional
A única porta aberta do corredor. Dois internos de plantão (visual provisório até chegar foto). Fale com eles com [E] / USAR.
- **MAAA**, interno veterano, sentado na maca lendo *As Portas da Percepção* (Huxley). Conta que nem gosta de medicina, mas
  gosta de ajudar as pessoas. Dá uma dica sobre o aniversário do Liberato e manda você olhar a mesa do ADC antes de falar com ele.
- **ADC**, no computador, passando tomografia e ressonância sem tirar o olho da tela. Pergunta qual é o seu **erro inato do
  metabolismo favorito**. **Uma chance só.** A resposta é **Lesch-Nyhan** (as pistas estão na mesa: post-it "HGPRT", caneca, pôster
  da via das purinas). Acertou: "Você se sente mais ágil" e ganha **20% de chance de esquivar** dos golpes dos javalis e das
  seringas do Schwarzenegger (o olhar dele não dá pra esquivar). Fica no save.
- Música: entrou na sala, toca **Das Lied von der Erde** (Mahler), o final de "Der Abschied" ("ewig... ewig...") em 8 bits;
  saiu, volta o que estava tocando.

## Capítulo 2 — A infecção no ar
- A sala do Javali só abre com a Ala C sem javalis (contador no objetivo).
- Depois do Javali e do letreiro do capítulo, **cutscene**: o interno pensa no De Barros (ele vai mandar suturar ou dar um nó, com as
  duas mãos), o jogo explica o minijogo do nó e dá pra **treinar** no pé da mesa do Javali quantas vezes quiser (ou pular).
  Se treinou, o De Barros repara (sente o cheiro do fio).
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

