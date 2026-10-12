# Pacientes no jogo: revisão ética

Pergunta: dá pra pôr pacientes no jogo (nenhum real, óbvio)? Que interações faz sentido ter com eles, e o que
isso implica?

Resposta curta: **dá, e pode até deixar o jogo melhor**. A Professora Muriel mostra isso: o momento mais bonito
até agora é ela melhorando com a prescrição certa. Mas paciente muda o peso do jogo. Hoje o jogo ri de
professores, burocracia e apagão, que são alvos com poder. Paciente é a pessoa mais vulnerável do hospital.
Daqui pra frente, o paciente nunca é o alvo da piada nem do tiro.

> Isto é uma revisão de boas práticas, não parecer jurídico. As referências legais estão aqui pra orientar.
> Se o jogo for divulgado oficialmente (pela UFSM, pelo HUSM ou em congresso), vale mostrar antes pra gerência de
> ensino do hospital ou pra um professor de bioética.

## O que o jogo já tem e vale olhar agora
Já existe paciente no jogo, e há algumas piadas que encostam em paciente:

1. **A Professora Muriel é paciente E é professora.** Se ela for reconhecível como uma professora real (os
   nomes foram trocados, mas a turma reconhece), o jogo mostra uma pessoa real doente, com dor, chorando e
   comentando a própria "janta caprichada". Mesmo inventado, isso é retratar a saúde de alguém. É o ponto
   mais sensível hoje. Caminhos: (a) mostrar a cena pra ela e pedir autorização, ou (b) desligar a personagem
   da professora real (outra aparência, outra história, uma paciente sem relação com o corpo docente).
2. **Piadas de dano a paciente atribuídas a professores reconhecíveis.** Por exemplo: o Falastrão "entubou um
   rapaz que só tinha vindo trocar uma receita", e ele "já comentou" avaliações psicológicas confidenciais.
   Lido de fora, num site público com o nome do HUSM, isso descreve um médico identificável fazendo
   procedimento sem indicação e quebrando sigilo. O exagero deixa claro que é piada pra quem é da turma, mas
   pode não ficar claro pra quem não é. Sugestão: manter o exagero no ego e nas histórias dele (aorta em 15
   s, Nokia, sax) e tirar o que é dano concreto a paciente ou quebra de sigilo.
3. **Negligência no hospital real.** "Ninguém prescreveu nada: o sistema caiu" funciona como gancho de
   história, mas com o nome HUSM na fachada pode ser lido como denúncia. Um aviso na tela de título resolve
   boa parte (ver "Aviso" abaixo).
4. **"Tinha um javali em cada leito" / "javalis são pacientes difíceis".** Hoje é inofensivo porque os
   javalis são claramente bichos. A regra daqui pra frente é **nunca transformar paciente em inimigo**
   (paciente-zumbi, paciente-javali). É o clichê do terror hospitalar e o que mais pesa contra quem já
   esteve internado.

## Princípios
1. **Ficção de verdade.** Invente o caso do zero. Não é "anonimizar" um caso que você viu: troca de nome não
   basta, porque idade, bairro, profissão, data, leito, um detalhe raro do quadro ou uma frase marcante
   identificam a pessoa pra quem estava lá. Se o caso lembra alguém, mude.
2. **Dignidade.** O paciente tem nome, opinião, humor próprio e o direito de dizer não. Pode ser engraçado
   (a Muriel é), mas é engraçado **com** ele, não **dele**.
3. **A piada aponta pra cima.** Professor, sistema, burocracia, o próprio interno: pode. Corpo, doença, peso,
   cheiro, classe social, sotaque do interior, origem, religião, saúde mental, uso de substâncias do
   paciente: não.
4. **Nada de violência perto de paciente.** Paciente nunca é alvo. Arma não aparece apontada pra paciente.
5. **Precisão.** O jogo ensina (Atlanta, antibiótico na pancreatite, nó). Ensinar errado também é problema
   ético. Conteúdo clínico passa por alguém que domina o assunto.
6. **Falhar nunca mata paciente.** Errar tem consequência pro interno (o professor corrige, a aprovação cai,
   a enfermeira resolve), não pro paciente. A Muriel já segue isso: erra, ela explica, você tenta de novo.

## Referências que se aplicam
- **Código de Ética Médica** (Res. CFM 2.217/2018): art. 73 (sigilo) e art. 75 (proíbe fazer referência a
  casos clínicos identificáveis ou exibir pacientes reconhecíveis na divulgação de assuntos médicos, *mesmo
  com autorização do paciente*). O **Código de Ética do Estudante de Medicina** (CFM, 2018) vai na mesma
  linha. Ou seja: caso real reconhecível não entra nem com o paciente concordando.
- **LGPD** (Lei 13.709/2018): dado de saúde é dado pessoal sensível (art. 5º, II, e art. 11). Nada de prontuário,
  exame, foto ou laudo real, nem "só como referência" dentro do repositório (que hoje é público).
- **Código Civil**, arts. 17 e 20: nome e imagem de alguém não podem ser usados de forma que exponha a pessoa
  ao desprezo ou atinja sua honra. Vale pros professores caricaturados e, mais ainda, se um deles virar
  paciente.
- **Obstetrícia** (pro Centro Obstétrico): direito a acompanhante no trabalho de parto, parto e pós-parto no
  SUS (Lei 11.108/2005); Diretrizes Nacionais de Assistência ao Parto Normal (Ministério da Saúde, 2017), que
  desaconselham, por exemplo, a manobra de Kristeller e a episiotomia de rotina.
- O repositório já faz uma coisa certa: as fotos de referência com pessoas reais ficam fora do git
  (`.gitignore`). Vale o mesmo pra qualquer material de paciente.

## Interações possíveis com pacientes
| Interação | Vale a pena? | Risco | Como fazer |
|---|---|---|---|
| **Conversar / anamnese** | Muito. É onde o jogo ensina e diverte | Estereótipo, piada às custas do paciente | O paciente tem voz própria e responde com humor dele. Nada de sotaque ou origem como piada |
| **Pedir licença antes de examinar** | Muito, e vira mecânica | Nenhum | "Posso examinar?" antes de tocar. Pular custa um erro e uma bronca, não trava o jogo |
| **Exame físico** | Sim | Exposição do corpo | Descrito em texto, como já é. Cortina fechada (já tem). **Exame íntimo nunca em cena**: acontece fora da tela, com consentimento e acompanhante/chaperone |
| **Prescrever / decidir conduta** | Muito (é a Muriel) | Ensinar errado | Revisão clínica. Erro com explicação e nova tentativa |
| **Procedimentos** (sutura, CTG, punção) | Sim, como minijogo | Dor e sofrimento como espetáculo | Foco na técnica e na comunicação. Paciente informado e anestesiado. O "terror" vem do aparelho, do apagão, nunca do corpo do paciente |
| **Explicar o que está acontecendo** | Muito | Nenhum | Medidor de tranquilidade (como no plano do CTG): explicar acalma, som esquisito assusta |
| **Paciente recusa algo** | Sim, é ótimo pra ensinar autonomia | Virar "paciente difícil" como piada | Respeitar, explicar, registrar. A recusa não é castigo nem obstáculo cômico |
| **Notícia difícil** | Talvez, com muito cuidado | Banalizar luto | Só se o tom do capítulo comportar. Sem piada na cena. SPIKES como base |
| **Morte de paciente** | Evitar | Trivializar, punir o jogador com a morte de alguém | Se um dia entrar, é história e não falha de minijogo. Nunca game over por morte de paciente |
| **Combate perto de paciente** | Não | Alto | Arma guardada automaticamente em área de paciente (ver abaixo) |
| **Paciente como inimigo / monstro** | Não | Alto | Os javalis cumprem esse papel. Paciente nunca vira bicho, zumbi ou chefe |
| **Itens do paciente** (comer, pegar, usar) | Não | Médio | A marmita do Liberato pode. A do paciente, não |
| **Crianças, saúde mental, violência** | Só com muito cuidado | Alto | Melhor deixar de fora. Se entrar, com revisão de quem trabalha na área |

## Implicações práticas pro código
1. **Área de cuidado:** perto de paciente (leito da Muriel, o leito do CO), a arma abaixa sozinha e o clique
   não atira. É simples: uma zona no `main.js` (como `L.zoneLeito`) onde a arma da mão é guardada (e devolvida na
   saída) e o clique deixa de chamar `COMBAT.fire()`. Também evita o constrangimento de ter um revólver em
   primeira pessoa apontado pro leito durante a conversa.
2. **Consentimento como mecânica:** um passo "pedir licença" nos roteiros de exame (`story3.js` e futuros).
3. **Aviso na tela de título** (curto, uma linha): "Obra de ficção e humor. Personagens, casos e situações
   são inventados. Nenhum paciente real foi usado." Se quiser ir além: "Não é material oficial do HUSM/UFSM."
4. **Aviso antes do Centro Obstétrico:** uma linha antes de entrar ("Esta parte se passa num centro
   obstétrico. Ninguém se machuca."). Quem já passou por perda gestacional agradece, e não custa nada.
5. **Acessibilidade:** minijogo que depende de som (o CTG) precisa de legenda e de sinal visual. Muita gente
   joga no celular sem som.
6. **Revisão clínica:** um campo "revisado por" no topo dos roteiros com conteúdo clínico (`story3.js`, o
   futuro `story4.js`).

## Checklist antes de pôr um paciente novo
- [ ] O caso foi inventado do zero (não é um caso que eu vi com detalhes trocados)?
- [ ] Alguém que estava no hospital naquela época reconheceria a pessoa? Se sim, mudar.
- [ ] Se o paciente é inspirado num professor ou colega reconhecível: a pessoa viu e autorizou?
- [ ] Quem é o alvo da piada? (Se for o paciente, reescrever.)
- [ ] O paciente tem nome, voz e pode dizer não?
- [ ] Tem exame íntimo, nudez ou dor como espetáculo? (Tirar de cena.)
- [ ] Errar machuca o paciente? (Mudar a consequência pro interno.)
- [ ] Tem arma ou combate perto dele? (Área de cuidado.)
- [ ] O conteúdo clínico foi revisado?
- [ ] Precisa de aviso de conteúdo?

## Específico do Centro Obstétrico (minijogo do CTG)
- O som bizarro é **do aparelho** (rádio, baleia, modem), nunca do bebê. Nada de choro de bebê em sofrimento
  nem de "coração parando" como susto.
- Falhar no minijogo não põe o bebê em risco: a enfermeira obstetra resolve com o Pinard.
- A gestante e o(a) acompanhante são personagens com dignidade, não plateia nem alvo.
- Opções erradas que sejam violência obstétrica (Kristeller, episiotomia de rotina, examinar sem licença,
  mandar o acompanhante sair) podem existir **como erro com explicação**, igual ao meropenem da Muriel. Assim
  o jogo ensina em vez de normalizar.
