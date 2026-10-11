# Quest

Jogo de perguntas e respostas com tabuleiro para jogar em família, no mesmo lugar, passando **um único celular** de mão em mão.

Funciona direto no navegador: sem cadastro, sem servidor e sem banco de dados. A partida fica salva no próprio celular.

## Como jogar

1. Toque em **Começar a jogar** e siga os 6 passos: quantas pessoas (2 a 12), nomes com cor e avatar, dificuldade de cada pessoa, assuntos, tabuleiro e cronômetro. Tudo já vem preenchido; dá para só ir tocando em **Continuar**.
2. O jogo sorteia a ordem e mostra um resumo das regras.
3. Antes de cada turno aparece **"Passe o celular para [nome]"**. Só quem recebeu o celular toca em **Estou com o celular — começar meu turno**.
4. A pessoa lança o dado. O número mostra a casa que ela vai tentar alcançar.
5. Aparece uma pergunta do assunto daquela casa, no nível daquela pessoa. Ela escolhe uma alternativa e toca em **Confirmar resposta**.
6. Acertou? Avança até a casa. Errou? Fica onde está. Depois aparecem a resposta certa e uma explicação curta.
7. Não precisa tirar o número exato: quem passaria do fim tenta a chegada. A pergunta da chegada pode ser de qualquer assunto, e quem acertar primeiro vence.

O menu (☰) mostra o placar, a ordem dos turnos, o tabuleiro e o botão de som.

Se a página fechar ou for atualizada, a tela inicial oferece **Continuar partida**, com participantes, posições, turno e pergunta atual. Uma pergunta já respondida não pode ser respondida de novo.

## Rodar no computador

O jogo é feito só de arquivos estáticos (HTML, CSS e JavaScript), sem instalação.

- **Jeito mais simples:** abra o arquivo `index.html` no navegador.
- **Com um servidor local** (recomendado para testar no celular pela rede de casa):

  ```bash
  cd jogo-perguntas-respostas
  python3 -m http.server 8000
  ```

  Depois abra `http://localhost:8000` no computador, ou `http://IP-DO-COMPUTADOR:8000` no celular conectado ao mesmo Wi-Fi.

## Publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Build and deployment**, escolha **Source: Deploy from a branch**.
3. Selecione o branch `main` e a pasta `/ (root)`. Clique em **Save**.
4. Depois de um ou dois minutos, o site fica em:

   `https://<usuario>.github.io/jogo-perguntas-respostas/`

   Para este repositório: `https://igorsolerc.github.io/jogo-perguntas-respostas/`

Todos os caminhos são relativos, então o jogo funciona dentro do endereço do repositório. O arquivo `.nojekyll` faz o GitHub Pages servir os arquivos como estão.

Para jogar, basta mandar o link para a família e abrir no celular. Se quiser, use "Adicionar à tela inicial" no navegador para abrir como um aplicativo.

## Perguntas

As perguntas ficam na pasta [`data/perguntas/`](data/perguntas/), **um arquivo por assunto**, para várias pessoas editarem ao mesmo tempo. O guia de edição está em [`data/perguntas/LEIA-ME.md`](data/perguntas/LEIA-ME.md).

São **1.431 perguntas**: as do arquivo `perguntas-unificadas.js` (1.320) mais 111 das iniciais que não repetiam nenhuma delas. Cada combinação de assunto e dificuldade tem de 56 a 62.

Cada pergunta é um bloco assim:

```js
  {
    id: "GEO-M-07",
    categoria: "geografia",
    dificuldade: "media",
    enunciado: "Que linha imaginária divide a Terra em hemisfério Norte e hemisfério Sul?",
    alternativas: ["Linha do Equador", "Meridiano de Greenwich", "Trópico de Capricórnio", "Círculo Polar Ártico"],
    correta: "Linha do Equador",
    explicacao: "A Linha do Equador passa pelo meio do planeta.",
  },
```

A resposta certa é escrita por extenso, sem contar posição, e o jogo embaralha as alternativas. Para conferir tudo depois de editar, rode `node testes/validar-perguntas.js`.

Durante a partida, uma pergunta não se repete até que todas da mesma combinação de assunto e dificuldade tenham saído. "Jogar novamente com o mesmo grupo" continua de onde parou, então as perguntas também não se repetem entre partidas seguidas.

## Organização dos arquivos

```
index.html          página única do jogo
css/estilo.css      aparência
js/arte.js          categorias, cores, avatares e ícones (SVG desenhado)
js/jogo.js          regras, sorteio de perguntas e salvamento
js/app.js           telas e interação
testes/             teste da partida e conferência das perguntas
js/som.js           sons curtos gerados no navegador
data/perguntas/     perguntas, um arquivo por assunto
assets/             fontes e ícone
DESIGN.md           referência visual
PRODUCT.md          resumo do produto
```

## Acessibilidade

- Letras grandes (Atkinson Hyperlegible, feita para leitura fácil) e botões de pelo menos 60 px de altura.
- Cada assunto tem cor **e** símbolo, para não depender só da cor.
- Funciona com leitor de tela e teclado.
- Respeita a opção "reduzir movimento" do aparelho.
- Sons podem ser desligados a qualquer momento.

## Créditos

Fontes [Lilita One](https://fonts.google.com/specimen/Lilita+One) e [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible), licença SIL Open Font License 1.1.

## Teste automático

`testes/partida.js` joga uma partida inteira num Chromium com tela de celular: troca de participantes, acerto, erro, chegada, atualizar a página no meio da pergunta, cronômetro (inclusive pausa em segundo plano), revanche e nova partida.

```bash
npm install playwright        # uma vez
npx playwright install chromium
python3 -m http.server 8000 & # na pasta do jogo
node testes/partida.js
```
