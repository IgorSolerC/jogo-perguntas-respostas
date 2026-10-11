# Product

<!-- impeccable:product-schema 1 -->

> Registro inferido do briefing escrito por Rafael (thread do projeto Quest). Nenhuma entrevista adicional foi feita; fatos marcados como *inferido* devem ser confirmados.

## Platform

web

## Stack

delegated: HTML, CSS e JavaScript puros, sem etapa de build, publicados no GitHub Pages com caminhos relativos. Escolhido porque o briefing pede site estático, sem servidor nem banco, e permite HTML/CSS/JS ou TypeScript.

## Users

Famílias jogando juntas no mesmo lugar (sala, mesa de jantar, viagem), com idades misturadas: crianças pequenas, adolescentes, adultos e pessoas pouco acostumadas com tecnologia. Um único celular passa de mão em mão a cada turno.

## Product Purpose

Quest é um jogo de perguntas e respostas com tabuleiro. Cada participante lança um dado, tenta alcançar uma casa e só avança se acertar a pergunta da categoria daquela casa, na dificuldade escolhida para si. Sucesso: a família abre um link no celular, configura em poucos toques e joga uma partida inteira sem confusão sobre de quem é a vez.

## Positioning

Dificuldade individual por jogador (criança no fácil, adulto no difícil, na mesma partida) e um ritual explícito de "passe o celular" entre turnos, que esconde tudo da jogada anterior.

## Operating Context

Celular na vertical, segurado por uma pessoa e mostrado às outras. Ambiente doméstico, luz variada (inferido: muitas vezes à noite, luz de casa). Interrupções frequentes; a página pode ser fechada ou recarregada no meio da partida.

## Capabilities and Constraints

- 2 a 12 participantes; nome, cor, avatar e dificuldade por participante.
- 8 categorias; ≥180 perguntas locais com 4 alternativas e explicação.
- Tabuleiros de 18, 30 e 42 casas.
- Cronômetro opcional, pausado em segundo plano e nunca durante a troca.
- Salvamento automático no navegador; retomada sem permitir responder duas vezes.
- Sem cadastro, servidor ou banco externo.

## Brand Commitments

Nome: Quest. Textos em português do Brasil. Personalidade alegre de jogo de tabuleiro familiar (pedido explícito).

## Evidence on Hand

Nenhum asset de marca existente. O repositório estava vazio.

## Product Principles

1. A troca de turno é o momento mais importante: nunca pode haver dúvida de quem joga.
2. Uma criança de 7 anos e uma avó de 75 precisam conseguir jogar sem ajuda.
3. Começar rápido: tudo tem valor inicial preenchido.
4. Justo: sem repetir perguntas, sem responder duas vezes, sem contar tempo fora da vez.

## Accessibility & Inclusion

Letras grandes e legíveis, bom contraste, botões grandes, sem precisar dar zoom. Categorias diferenciadas por cor **e** símbolo (daltonismo). Respeitar `prefers-reduced-motion`.
