# Design do Quest

Registro do mundo visual construído. Serve de referência para quem for mexer na aparência.

## Mundo: feira livre

A vez de cada pessoa é a sua "barraca": um toldo listrado na cor dela anuncia quem joga. O resto vem da feira: lona azul no fundo, papel branco para ler, amarelo fluorescente de plaquinha de preço para a ação principal e avatares de frutas e legumes.

## Cores (`css/estilo.css`, `:root`)

| Papel | Token | Valor |
|---|---|---|
| Fundo (lona) | `--lona` | `#1d3b94` |
| Tabuleiro | `--lona-escura` | `#13296b` |
| Folhas de leitura | `--papel` | `#fffdf6` |
| Texto sobre papel | `--tinta` / `--tinta-2` | `#13204a` / `#46527d` |
| Ação principal | `--fluor` | `#ffe23d` (texto em `--tinta`) |
| Acerto / erro | `--acerto` / `--erro` | `#17824a` / `#c4271f` |

Cada categoria tem um fundo claro, uma cor forte e um símbolo próprio (`js/arte.js`, `CATEGORIAS`). A cor nunca é a única pista: casas, chips e legenda sempre mostram o símbolo.

As 12 cores de participante ficam em `CORES`. Dentro de uma partida não se repetem; escolher a cor de outra pessoa troca as duas.

## Tipografia

- **Lilita One**: letreiros (logo, nome na troca de turno, títulos). Nunca em texto corrido.
- **Atkinson Hyperlegible**: todo o texto. Feita para leitura fácil, boa para crianças e pessoas com baixa visão.
- Corpo a partir de 18 px; enunciado das perguntas a 24 px.

As duas fontes estão em `assets/fonts/` (licença SIL OFL), sem depender de serviços externos.

## Componentes

- **Toldo** (`.toldo`): listras na cor do jogador com bainha ondulada. Aparece no início, na troca de turno e na comemoração. É a assinatura do jogo; o detector do Impeccable o aponta como listra decorativa, e ele fica de propósito.
- **Cabeça de lona + folha de papel**: telas de configuração, pergunta e resultado. Uma superfície só, sem cartões dentro de cartões.
- **Peão** (`.ficha`): avatar sobre fundo branco com anel na cor da pessoa. Na casa, os peões ficam na metade de baixo, sem cobrir o número: no máximo três à vista, quem joga por cima, e o resto vira "+N". Tocar na casa lista quem está nela.
- **Corrida** (`.corrida`): na troca de turno, todos os peões numa trilha da largada à chegada, para a família ver quem está na frente.
- **Percurso** (`.percurso`): dentro do veredito, o trecho da casa de origem até o destino. No acerto o peão anda casa a casa; no erro as casas não alcançadas ficam vazias.
- **Placar** (`.btn-placar`): botão com texto no canto da partida. A folha ordena por quem está mais perto da chegada e traz o tabuleiro, as regras e o som.
- **Cronômetro** (`.cronometro`): bloco ao lado de "Confirmar resposta", com um anel que esvazia; fica vermelho e pulsa nos últimos 10 segundos.
- **Botões**: mínimo de 60 px de altura; o da troca de turno tem 76 px. Em telas com menos de 700 px de altura, a pergunta e os botões encolhem para as quatro alternativas caberem sem rolar.

## Movimento

Saídas exponenciais (`--saida`). Momentos com animação: o toldo descendo na troca de turno, o dado rolando, o peão andando casa a casa no percurso do veredito depois de um acerto e o confete do fim. Com "reduzir movimento" ativado no aparelho, tudo fica instantâneo.
