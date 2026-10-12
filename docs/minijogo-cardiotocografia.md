# Minijogo: sintonizar o cardiotocógrafo (Centro Obstétrico)

Status: **planejado**. Por enquanto só a porta existe: fica no fundo leste do corredor do PS (subsolo),
trancada, com o aparelho tocando batimentos com mau contato que descambam pra rádio AM, internet discada e
canto de baleia (`js/level3.js`, efeito `ctg` em `js/audio.js`).

## A ideia em uma frase
Um cardiotocógrafo (CTG) velhíssimo, com mau contato e "consertado com peça de rádio", capta tudo
(rádio, baleia, modem, o Monteiro falando com o bebedouro) menos o coração do bebê. O interno tem que achar o
foco fetal, sintonizar o aparelho e segurar o sinal tempo suficiente pra imprimir um traçado que dê pra ler.

## Onde entra na história
- **Recomendado:** abertura do Capítulo 4. O Falastrão fecha o PS e diz "Plantão nunca acaba, interno. Ele só
  espera." Na saída da Chefia, a porta do Centro Obstétrico destranca sozinha (o som do CTG fica mais alto).
- Alternativa: missão opcional durante o Capítulo 3, antes do Falastrão (dá uma conquista e +saúde máxima).

## Personagens (a definir com você)
- **Quem manda no CO:** um(a) professor(a) da Obstetrícia, no mesmo estilo dos outros (caricatura com nome
  trocado). Ver `docs/etica-pacientes.md`: se for reconhecível, pedir autorização antes.
- **A gestante:** personagem fictícia, adulta, gestação de termo, baixo risco, em trabalho de parto inicial.
  Ela tem nome, opinião e senso de humor (como a Professora Muriel), e não é alvo da piada. O alvo é o aparelho.
- **O(a) acompanhante:** sempre presente (direito garantido pela Lei 11.108/2005). Faz as perguntas que o
  jogador também faria ("isso é normal?" quando o aparelho toca canto de baleia).
- **A enfermeira obstetra:** a rede de segurança. Se o interno não conseguir, ela resolve com um Pinard de
  madeira em 4 segundos. Ninguém corre risco por causa do minijogo.

## O aparelho
- "CARDIOTOCÓGRAFO — PATRIMÔNIO 000.001". Etiqueta: "consertado pelo técnico do rádio, 1998". Por isso tem um
  dial de **SINTONIA** colado em cima, e por isso pega estação AM.
- Cabo enrolado em esparadrapo. Bilhete: "NÃO BATER NO APARELHO." Embaixo, outra letra: "(bater funciona)".
- Dois transdutores, como os de verdade:
  - **Ultrassom (Doppler)**, que capta a frequência cardíaca fetal (FCF). Vai **com gel**.
  - **Toco**, que registra as contrações. Vai no fundo do útero, **sem gel**.

## Como se joga (laço principal)
Uma tela própria (canvas em pixel, no estilo do nó do De Barros, só que maior) com três partes:
a barriga vista de cima, o monitor (número da FCF e a fita de papel saindo) e o dial de sintonia.

0. **Antes de encostar:** se apresentar e pedir licença ("Posso colocar o aparelho na sua barriga?").
   Pular essa etapa não trava o jogo: o(a) acompanhante corta ("Opa, pergunta antes!") e conta como erro.
1. **Manobras de Leopold** (2 ou 3 escolhas rápidas): onde está o dorso do bebê e qual é a apresentação.
   Isso diz onde procurar. Na apresentação cefálica, o foco fica abaixo do umbigo, do lado do dorso.
2. **Toco no fundo do útero.** Escolha rápida. Passar gel no toco é uma das armadilhas (a enfermeira ri).
3. **Sintonizar.** O jogador move o transdutor de ultrassom pela barriga e gira o dial:
   - longe do foco ou fora da estação certa = sons bizarros + legenda do que está tocando;
   - chegando perto = o "tchuf-tchuf" galopado do Doppler vai aparecendo por baixo do ruído;
   - no ponto certo = batimento limpo, FCF estável no visor (ex.: 140 bpm).
4. **Mau contato.** De tempos em tempos o sinal cai. O jogador **bate no aparelho** no momento certo (quando a
   luzinha do cabo pisca), ou segura o cabo. Bater fora de hora derruba o sinal de vez por 2 s.
5. **Fixar a cinta e imprimir.** Com o sinal bom, o jogador fixa. A fita imprime por uns 10 s de jogo
   (o equivalente a 20 min de traçado). Se o sinal cair muito nesse tempo, volta pro passo 3.
6. **Ler o traçado** (pergunta de prova, igual à da Muriel). Por exemplo: linha de base 140, variabilidade
   moderada, acelerações presentes, sem desacelerações. Resposta: CTG normal (categorias da FIGO 2015).

### As armadilhas (é aqui que o minijogo ensina)
| Armadilha | O que aparece | O que o jogo ensina |
|---|---|---|
| **FC materna** | Num ponto da barriga, batimento limpinho a ~84 bpm, sincronizado com o oxímetro da mãe | Sempre conferir com o pulso materno. Se fixar ali, a enfermeira mostra o oxímetro: "Isso é a mãe." |
| **Dobra / meia** | Em certas posições do dial o visor mostra 280 ou 70 | Artefato do aparelho (contagem dobrada ou pela metade), não taquicardia nem bradicardia |
| **Gel no toco** | Opção de passar gel nos dois transdutores | Gel só no ultrassom |
| **Sem licença** | Encostar sem pedir | Consentimento antes de examinar |
| **Ler o ruído** | O visor pisca "180" por meio segundo quando o cabo falha | Perda de sinal não é FCF. Não se interpreta trecho sem sinal |

### Os sons bizarros (estações do dial)
Cada faixa do dial tem uma "estação". Todas têm **legenda na tela**, pra quem joga sem som:
- **Rádio AM:** a entrevista do Falastrão, começando em alemão ("...und dann habe ich die Aorta in fünfzehn
  Sekunden geklemmt...").
- **Canto de baleia:** "Isso é normal?", pergunta o(a) acompanhante.
- **Internet discada:** a gestante: "Meu filho tá baixando alguma coisa?"
- **O Monteiro:** pelo encanamento, ainda falando com o bebedouro sobre tomates.
- **Grunhidos:** os javalis da Ala C, captados de algum jeito que ninguém quer entender.
- **Gre-Nal narrado** (o Falastrão narrando você): "O INTERNO GIRA O DIAL... VAI ACHAR O CORAÇÃO..."

### Medidores
- **SINAL** (0–100%): é o que o jogador está tentando subir.
- **TRANQUILIDADE DA GESTANTE:** cai a cada som esquisito e sobe quando o interno explica ("É o aparelho, não
  é o bebê. O coração dele está ótimo."). Ensina comunicação. A gestante nunca entra em pânico de verdade: o
  piso do medidor é "desconfiada".

### Resultado
- `{ erros, tempo, armadilhas: { materna, dobra, gel, licenca }, perfeito }`
- **Perfeito:** pediu licença, sem cair em armadilha, leitura certa de primeira e abaixo do tempo-alvo.
  Conquista **"SINTONIA FINA"**.
- **Falhar não machuca ninguém.** Se o tempo acabar, a enfermeira obstetra chega com o Pinard, ouve 140 em
  4 s e diz "tá ótimo, os dois". O interno sai humilhado, nada mais. O bebê está sempre bem.

## Controles
- **Computador:** mouse move o transdutor (mesmo esquema de `movementX/Y` do nó por arrasto); **Q/E** ou a roda
  do mouse giram o dial; **ESPAÇO** bate no aparelho; **ENTER** fixa a cinta; 1–5 nas escolhas.
- **Celular:** arrastar o dedo na barriga (metade esquerda da tela); dial como um controle deslizante vertical
  (metade direita); botões grandes **BATER** e **FIXAR**.

## Implementação (quando for a hora)
| Arquivo | O que muda |
|---|---|
| `js/level3.js` | Abrir a parede leste (coluna 43, linhas 10–11), alargar o `MAP` com a sala do CO (leito PPP, o CTG no carrinho, Pinard na parede, bola de parto) e trocar a porta falsa por uma porta de verdade (`out.doors.co`, trancada até o capítulo começar) |
| `js/story4.js` (novo) | Roteiros: professor(a) da Obstetrícia, gestante, acompanhante, enfermeira |
| `js/convo.js` | Nova API `c.ctg(opts)`, no molde de `knotStart`: canvas próprio, entrada por mouse/teclado/toque, devolve o resultado |
| `js/audio.js` | Motor contínuo (não um efeito solto): `AUDIO.ctgStart()`, `AUDIO.ctgSet({ sinal, estacao, bpm, materna })`, `AUDIO.ctgStop()`. O batimento é agendado no `tick` que já existe; as estações reaproveitam os pedaços do efeito `ctg` |
| `js/touch.js` | Botões BATER/FIXAR e o dial deslizante |
| `js/main.js` | Flags (`G.co`), campos de save, gatilho perto do leito, estágio dev `,co`, texto de objetivo, música (sugestão: Canção de Ninar de Brahms em 8 bits, desafinando com o sinal) |
| `README.md` | Seção do capítulo e controles |

### Modelo do sinal (pra calibrar)
- Barriga em coordenadas `(u, v)` de 0 a 1. Foco fetal `F` sorteado do lado do dorso (resultado de Leopold).
  Ponto materno `M` em outro lugar.
- Dial `d` de 0 a 1, estação certa `d*` sorteada.
- `sinal = contato × exp(-|p − F|² / σ²) × exp(-(d − d*)² / τ²)`; `contato` cai pra 0 de 3 em 3 s ± ruído e
  volta com a batida certa.
- Mixagem: batimento com ganho `sinal`, estação bizarra com ganho `1 − sinal`, estalos quando o contato cai.
- Dificuldade: `σ` e `τ` diminuem e o mau contato fica mais frequente. Três níveis no máximo.

### Fases sugeridas
1. Sala do CO + porta abrindo + roteiro sem minijogo (dá pra testar a história).
2. Protótipo do minijogo **sem som** (só visual: SINAL, visor, fita). Se for divertido sem som, o som só melhora.
3. Motor de áudio e as estações.
4. Celular (toque) e acessibilidade (legendas, nada que dependa só do som).
5. Teste com 3 ou 4 pessoas de fora e ajuste de `σ`, `τ` e do tempo-alvo.

## Perguntas pra você decidir
1. Quem é o(a) professor(a) do CO, e essa pessoa topa aparecer?
2. Capítulo 4 (recomendado) ou missão opcional no Capítulo 3?
3. Comédia com tensão leve (recomendado) ou um susto de verdade (o sinal some por alguns segundos)?
   Mesmo no susto, o bebê nunca corre risco por erro do jogador.
4. Precisão clínica: quem revisa o conteúdo (Leopold, FIGO, armadilhas)? Sugiro um(a) professor(a) ou residente
   da Obstetrícia.
