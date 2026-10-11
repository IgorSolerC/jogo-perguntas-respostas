/* Quest · regras da partida, sorteio de perguntas e salvamento. Sem DOM aqui. */
(function () {
  "use strict";

  const CHAVE_PARTIDA = "quest.partida.v1";
  const CHAVE_PREFS = "quest.prefs.v1";

  const TABULEIROS = [
    { id: "rapido", nome: "Rápido", casas: 18, colunas: 4, descricao: "Partida curta" },
    { id: "classico", nome: "Clássico", casas: 30, colunas: 4, descricao: "Partida média" },
    { id: "longo", nome: "Longo", casas: 42, colunas: 5, descricao: "Partida longa" },
  ];
  const DIFICULDADES = [
    { id: "facil", nome: "Fácil" },
    { id: "media", nome: "Média" },
    { id: "dificil", nome: "Difícil" },
  ];
  const TEMPOS = [
    { segundos: 0, nome: "Sem cronômetro" },
    { segundos: 30, nome: "30 segundos" },
    { segundos: 60, nome: "60 segundos" },
    { segundos: 90, nome: "90 segundos" },
  ];

  function embaralhar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

  function tabuleiro(id) {
    return TABULEIROS.find((t) => t.id === id) || TABULEIROS[1];
  }

  // Casa 0 é a largada; a última é a chegada. As do meio repetem as categorias
  // escolhidas em ciclos embaralhados, sem duas iguais lado a lado.
  function montarCasas(totalCasas, categorias) {
    const casas = [{ tipo: "largada" }];
    let anterior = null;
    let ciclo = [];
    for (let i = 1; i < totalCasas - 1; i++) {
      if (!ciclo.length) {
        ciclo = embaralhar(categorias);
        if (ciclo.length > 1 && ciclo[0] === anterior) ciclo.push(ciclo.shift());
      }
      anterior = ciclo.shift();
      casas.push({ tipo: "categoria", categoria: anterior });
    }
    casas.push({ tipo: "chegada" });
    return casas;
  }

  function novaPartida(config, jogadores, usadasAnteriores) {
    const tab = tabuleiro(config.tabuleiro);
    const lista = jogadores.map((j, i) => ({
      id: "j" + i,
      nome: j.nome,
      cor: j.cor,
      avatar: j.avatar,
      dificuldade: j.dificuldade,
      posicao: 0,
      acertos: 0,
      respondidas: 0,
    }));
    return {
      versao: 1,
      criadaEm: Date.now(),
      config: { tabuleiro: tab.id, tempo: config.tempo || 0, categorias: config.categorias.slice() },
      jogadores: lista,
      ordem: embaralhar(lista.map((j) => j.id)),
      vez: 0,
      rodada: 1,
      casas: montarCasas(tab.casas, config.categorias),
      usadas: usadasAnteriores || {},
      turno: { fase: "passe" },
      vencedor: null,
      fase: "ordem", // ordem → jogando → fim
    };
  }

  function jogadorDaVez(p) {
    return p.jogadores.find((j) => j.id === p.ordem[p.vez]);
  }
  function jogador(p, id) {
    return p.jogadores.find((j) => j.id === id);
  }
  function ultimaCasa(p) {
    return p.casas.length - 1;
  }

  // Sorteia sem repetir dentro da combinação categoria + dificuldade.
  // Só reaproveita depois de esgotar o conjunto.
  function sortearPergunta(p, categoria, dificuldade) {
    const banco = window.QUEST_PERGUNTAS || [];
    let grupo = banco.filter((q) => q.categoria === categoria && q.dificuldade === dificuldade);
    if (!grupo.length) grupo = banco.filter((q) => q.categoria === categoria);
    if (!grupo.length) grupo = banco.filter((q) => q.dificuldade === dificuldade);
    if (!grupo.length) grupo = banco;
    const chave = categoria + "|" + dificuldade;
    const usadas = p.usadas[chave] || [];
    let livres = grupo.filter((q) => !usadas.includes(q.id));
    if (!livres.length) {
      p.usadas[chave] = [];
      livres = grupo;
    }
    const q = sortear(livres);
    (p.usadas[chave] = p.usadas[chave] || []).push(q.id);
    // Embaralha as alternativas e guarda a ordem mostrada.
    const ordem = embaralhar([0, 1, 2, 3]);
    return {
      id: q.id,
      categoria: q.categoria,
      dificuldade: q.dificuldade,
      enunciado: q.enunciado,
      alternativas: ordem.map((i) => q.alternativas[i]),
      correta: ordem.indexOf(q.correta),
      explicacao: q.explicacao,
    };
  }

  function livresNaCategoria(p, categoria, dificuldade) {
    const banco = window.QUEST_PERGUNTAS || [];
    const usadas = p.usadas[categoria + "|" + dificuldade] || [];
    return banco.filter((q) => q.categoria === categoria && q.dificuldade === dificuldade && !usadas.includes(q.id)).length;
  }

  function comecarTurno(p) {
    p.turno = { fase: "pronto" };
  }

  // Lança o dado e já sorteia a pergunta, para que recarregar a página
  // não permita lançar de novo.
  function lancarDado(p, valorForcado) {
    if (p.turno.fase !== "pronto") return p.turno;
    const j = jogadorDaVez(p);
    const dado = valorForcado || 1 + Math.floor(Math.random() * 6);
    const fim = ultimaCasa(p);
    const destino = Math.min(j.posicao + dado, fim);
    let categoria;
    if (destino === fim) {
      // Na chegada vale qualquer assunto habilitado; prefere os que ainda têm perguntas novas.
      const comNovas = p.config.categorias.filter((c) => livresNaCategoria(p, c, j.dificuldade) > 0);
      categoria = sortear(comNovas.length ? comNovas : p.config.categorias);
    } else {
      categoria = p.casas[destino].categoria;
    }
    p.turno = {
      fase: "dado",
      dado,
      origem: j.posicao,
      destino,
      chegada: destino === fim,
      categoria,
      pergunta: sortearPergunta(p, categoria, j.dificuldade),
      escolha: null,
      resposta: null,
      restanteMs: p.config.tempo ? p.config.tempo * 1000 : null,
    };
    return p.turno;
  }

  function mostrarPergunta(p) {
    if (p.turno.fase === "dado") p.turno.fase = "pergunta";
  }

  function escolher(p, indice) {
    if (p.turno.fase !== "pergunta") return;
    p.turno.escolha = indice;
  }

  // Confirma a resposta uma única vez. indice = null quando o tempo acaba.
  function responder(p, indice, tempoEsgotado) {
    const t = p.turno;
    if (t.fase !== "pergunta" || t.resposta) return null;
    const j = jogadorDaVez(p);
    const correta = !tempoEsgotado && indice === t.pergunta.correta;
    t.resposta = { indice: tempoEsgotado ? null : indice, correta, tempoEsgotado: !!tempoEsgotado };
    t.fase = "resultado";
    j.respondidas += 1;
    if (correta) {
      j.acertos += 1;
      j.posicao = t.destino;
      if (t.chegada) {
        p.vencedor = j.id;
      }
    }
    return t.resposta;
  }

  function encerrarTurno(p) {
    if (p.turno.fase !== "resultado") return;
    if (p.vencedor) {
      p.fase = "fim";
      return;
    }
    p.vez = (p.vez + 1) % p.ordem.length;
    if (p.vez === 0) p.rodada += 1;
    p.turno = { fase: "passe" };
  }

  function classificacao(p) {
    const ordemTurno = (id) => p.ordem.indexOf(id);
    return p.jogadores.slice().sort((a, b) => {
      if (a.id === p.vencedor) return -1;
      if (b.id === p.vencedor) return 1;
      return b.posicao - a.posicao || b.acertos - a.acertos || a.respondidas - b.respondidas || ordemTurno(a.id) - ordemTurno(b.id);
    });
  }

  function revanche(p) {
    const jogadores = p.jogadores.map((j) => ({ nome: j.nome, cor: j.cor, avatar: j.avatar, dificuldade: j.dificuldade }));
    return novaPartida(p.config, jogadores, p.usadas);
  }

  // ── salvamento ──
  function salvar(p) {
    try {
      if (p) localStorage.setItem(CHAVE_PARTIDA, JSON.stringify(p));
      else localStorage.removeItem(CHAVE_PARTIDA);
      return true;
    } catch (e) {
      return false;
    }
  }
  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE_PARTIDA);
      if (!bruto) return null;
      const p = JSON.parse(bruto);
      if (!p || p.versao !== 1 || !Array.isArray(p.jogadores) || !p.turno) return null;
      return p;
    } catch (e) {
      return null;
    }
  }
  function lerPrefs() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_PREFS)) || {};
    } catch (e) {
      return {};
    }
  }
  function salvarPrefs(prefs) {
    try { localStorage.setItem(CHAVE_PREFS, JSON.stringify(prefs)); } catch (e) { /* sem armazenamento */ }
  }

  window.QuestJogo = {
    TABULEIROS, DIFICULDADES, TEMPOS, tabuleiro, embaralhar,
    novaPartida, jogadorDaVez, jogador, ultimaCasa,
    comecarTurno, lancarDado, mostrarPergunta, escolher, responder, encerrarTurno,
    classificacao, revanche, salvar, carregar, lerPrefs, salvarPrefs,
  };
})();
