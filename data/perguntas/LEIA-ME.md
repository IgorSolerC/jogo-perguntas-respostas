# Como editar as perguntas

Cada assunto tem seu próprio arquivo nesta pasta. Assim, várias pessoas podem editar ao mesmo tempo sem uma atrapalhar a outra.

| Arquivo | Assunto |
|---|---|
| `geral.js` | Conhecimentos gerais |
| `natureza.js` | Animais e natureza |
| `ciencia.js` | Ciência e tecnologia |
| `historia.js` | História |
| `geografia.js` | Geografia |
| `cinema.js` | Cinema e desenhos |
| `esportes.js` | Esportes |
| `curiosidades.js` | Curiosidades |

## Adicionar uma pergunta

Copie um bloco inteiro, do `{` até o `},`, cole antes do `]);` no fim do arquivo e edite:

```js
  {
    id: "GEO-M-09",
    categoria: "geografia",
    dificuldade: "media",
    enunciado: "Qual é o maior lago da América do Sul?",
    alternativas: ["Lago Titicaca", "Lagoa dos Patos", "Lago de Maracaibo", "Lago Nahuel Huapi"],
    correta: "Lago de Maracaibo",
    explicacao: "O Lago de Maracaibo, na Venezuela, é o maior da América do Sul.",
  },
```

- **id**: qualquer código que ainda não exista. O padrão é `ASSUNTO-NÍVEL-NÚMERO` (F = fácil, M = média, D = difícil).
- **categoria**: igual ao nome do arquivo, sem o `.js`.
- **dificuldade**: `facil`, `media` ou `dificil`, sem acento.
- **alternativas**: exatamente 4, todas diferentes. A ordem não importa, porque o jogo embaralha.
- **correta**: copie o texto da alternativa certa, exatamente igual.
- **explicacao**: uma frase curta, mostrada depois da resposta.

Não esqueça a vírgula depois de cada linha e depois do `}`. Aspas dentro do texto precisam de barra antes: `"O filme \"Up\" é de 2009"`.

## Conferir antes de publicar

```bash
node testes/validar-perguntas.js
```

O comando mostra quantas perguntas há em cada assunto e nível e aponta o que estiver errado, com o id da pergunta ou a linha do arquivo.

Se algo passar sem conferir, o jogo não quebra:
- uma pergunta com problema é ignorada, e o motivo aparece no console do navegador;
- um erro de digitação que impeça o arquivo de carregar (uma vírgula ou aspa faltando) deixa só aquele assunto sem perguntas novas, e o jogo usa perguntas de outro assunto no lugar.

## Boas perguntas

- Uma única resposta certa, sem margem para discussão.
- Evite fatos que mudam com frequência, como recordes, populações, campeões recentes ou preços.
- Erradas plausíveis: o ideal é que quem não sabe fique na dúvida.
- Tente manter um número parecido de perguntas em cada nível de cada assunto, para não repetir cedo.
