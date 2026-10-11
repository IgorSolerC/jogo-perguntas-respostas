/* Quest · telas e interação. */
(function () {
  "use strict";

  const { icone, CATEGORIAS, CORES, AVATARES, avatarSvg, dadoSvg } = window.QuestArte;
  const J = window.QuestJogo;
  const Som = window.QuestSom;

  const app = document.getElementById("app");
  const aviso = document.getElementById("aviso");
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MIN_JOG = 2;
  const MAX_JOG = 12;
  const TOTAL_PASSOS = 6;

  let prefs = J.lerPrefs();
  if (prefs.som === false) Som.definir(false);
  let partida = J.carregar();

  const ui = {
    tela: "inicio",
    passo: 1,
    rascunho: null,
    erroPasso: "",
    retomando: false,
    rolando: false,
    folha: null, // { tipo: 'menu' | 'ficha' | 'casa' | 'tabuleiro', ... }
    anim: null, // { id, pos } enquanto um peão anda
    animarPasse: true,
  };

  // ───────── utilidades ─────────
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cat = (id) => CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[0];
  const cor = (id) => CORES.find((c) => c.id === id) || CORES[0];
  const dif = (id) => J.DIFICULDADES.find((d) => d.id === id) || J.DIFICULDADES[1];
  const varsCat = (c) => `--fundo:${c.fundo};--forte:${c.forte}`;

  function ficha(j, extra) {
    return `<span class="ficha ${extra || ""}" style="--cor:${cor(j.cor).hex}" title="${esc(j.nome)}">${avatarSvg(j.avatar)}</span>`;
  }

  function nomeCasa(p, pos) {
    if (pos <= 0) return "Largada";
    if (pos >= J.ultimaCasa(p)) return "Chegada";
    return "casa " + pos;
  }
  function ondeEsta(p, pos) {
    if (pos <= 0) return "Na largada";
    if (pos >= J.ultimaCasa(p)) return "Na chegada";
    return "Casa " + pos + " de " + J.ultimaCasa(p);
  }

  function anunciar(texto) {
    aviso.textContent = "";
    setTimeout(() => { aviso.textContent = texto; }, 30);
  }

  function guardar() {
    J.salvar(partida);
  }

  function botaoSom(classe) {
    const l = Som.ligado;
    return `<button class="btn-icone ${classe || ""}" data-acao="som" aria-pressed="${l}" aria-label="${l ? "Desligar sons" : "Ligar sons"}">${icone(l ? "somLigado" : "somDesligado")}</button>`;
  }

  // ───────── rascunho da configuração ─────────
  function rascunhoInicial() {
    const ultimo = prefs.ultimoGrupo;
    const avatares = J.embaralhar(AVATARES.map((a) => a.id));
    const jogadores = [];
    for (let i = 0; i < MAX_JOG; i++) {
      const salvo = ultimo && ultimo.jogadores && ultimo.jogadores[i];
      jogadores.push(salvo ? { ...salvo } : { nome: "Jogador " + (i + 1), cor: CORES[i].id, avatar: avatares[i], dificuldade: "media" });
    }
    return {
      quantidade: (ultimo && ultimo.quantidade) || 4,
      jogadores,
      categorias: (ultimo && ultimo.categorias && ultimo.categorias.length ? ultimo.categorias : CATEGORIAS.map((c) => c.id)).slice(),
      tabuleiro: (ultimo && ultimo.tabuleiro) || "classico",
      tempo: ultimo && typeof ultimo.tempo === "number" ? ultimo.tempo : 0,
    };
  }

  function ativos() {
    return ui.rascunho.jogadores.slice(0, ui.rascunho.quantidade);
  }

  // Garante cores e avatares diferentes entre quem vai jogar.
  function corrigirRepetidos() {
    const r = ui.rascunho;
    ["cor", "avatar"].forEach((campo) => {
      const todos = campo === "cor" ? CORES.map((c) => c.id) : AVATARES.map((a) => a.id);
      const vistos = new Set();
      r.jogadores.slice(0, r.quantidade).forEach((j) => {
        if (vistos.has(j[campo])) j[campo] = todos.find((x) => !vistos.has(x) && !r.jogadores.slice(0, r.quantidade).some((o) => o[campo] === x));
        vistos.add(j[campo]);
      });
    });
  }

  // ───────── telas ─────────
  function render() {
    pararCronometro();
    let html = "";
    if (ui.tela === "inicio") html = telaInicio();
    else if (ui.tela === "config") html = telaConfig();
    else if (ui.tela === "ordem") html = telaOrdem();
    else if (ui.tela === "jogo") html = telaJogo();
    else if (ui.tela === "fim") html = telaFim();
    app.innerHTML = html + folhaHtml();
    depoisDeRenderizar();
  }

  function telaInicio() {
    const temPartida = partida && partida.fase !== "fim";
    let info = "";
    if (temPartida) {
      const j = J.jogadorDaVez(partida);
      info = `<p class="retomar-info">${partida.jogadores.length} participantes · ${partida.fase === "ordem" ? "ordem já sorteada" : "vez de " + esc(j.nome)}</p>`;
    }
    const vitrine = AVATARES.slice(0, 6).map((a) => avatarSvg(a.id)).join("");
    return `<div class="tela tela-inicio toldo-animado">
      <div class="toldo-wrap"><div class="toldo" style="--cor:var(--fluor)"></div></div>
      <div class="inicio-topo">${botaoSom()}</div>
      <main class="inicio-centro">
        <h1 class="logo" tabindex="-1">Quest</h1>
        <p class="lema">Perguntas e respostas no tabuleiro, para jogar em família com um celular só.</p>
        <div class="banca" aria-hidden="true">${vitrine}</div>
      </main>
      <footer class="rodape">
        ${temPartida ? `${info}<button class="btn btn-prim btn-gigante" data-acao="continuar">Continuar partida</button>` : ""}
        <button class="btn ${temPartida ? "btn-sec" : "btn-prim btn-gigante"}" data-acao="comecar">Começar a jogar</button>
      </footer>
    </div>`;
  }

  function cabecaConfig() {
    const segs = Array.from({ length: TOTAL_PASSOS }, (_, i) => `<span class="${i < ui.passo ? "feito" : ""}"></span>`).join("");
    return `<header class="cabeca">
      <button class="btn-icone" data-acao="voltar-passo" aria-label="Voltar">${icone("voltar")}</button>
      <div class="cabeca-titulo">
        <div class="passo">Passo ${ui.passo} de ${TOTAL_PASSOS}</div>
        <div class="progresso" aria-hidden="true">${segs}</div>
      </div>
      ${botaoSom()}
    </header>`;
  }

  function telaConfig() {
    const r = ui.rascunho;
    let corpo = "";
    let botao = "Continuar";
    let desabilitar = false;

    if (ui.passo === 1) {
      corpo = `<h1 class="titulo-passo" tabindex="-1">Quantas pessoas vão jogar?</h1>
        <p class="dica">De 2 a 12 pessoas, passando o mesmo celular.</p>
        <div class="contador">
          <button data-acao="menos" aria-label="Uma pessoa a menos" ${r.quantidade <= MIN_JOG ? "disabled" : ""}>−</button>
          <output aria-live="polite" aria-label="${r.quantidade} pessoas">${r.quantidade}</output>
          <button data-acao="mais" aria-label="Uma pessoa a mais" ${r.quantidade >= MAX_JOG ? "disabled" : ""}>+</button>
        </div>
        <div class="fila-fichas" aria-hidden="true">${ativos().map((j) => ficha(j)).join("")}</div>`;
    } else if (ui.passo === 2) {
      corpo = `<h1 class="titulo-passo" tabindex="-1">Quem vai jogar?</h1>
        <p class="dica">Escreva os nomes. Toque no peão para trocar a cor e o avatar.</p>
        <div class="lista-jog">${ativos().map((j, i) => `
          <div class="linha-jog">
            <button class="ficha-btn" data-acao="editar-ficha" data-i="${i}" aria-label="Cor e avatar de ${esc(j.nome || "participante " + (i + 1))}: ${cor(j.cor).nome}, ${AVATARES.find((a) => a.id === j.avatar).nome}">
              ${ficha(j)}<span class="lapis" aria-hidden="true">${icone("lapis")}</span>
            </button>
            <label class="campo-nome"><span class="sr">Nome do participante ${i + 1}</span>
              <input type="text" value="${esc(j.nome)}" data-nome="${i}" maxlength="16" autocomplete="off" autocapitalize="words" enterkeyhint="next" placeholder="Participante ${i + 1}">
            </label>
          </div>`).join("")}
        </div>`;
    } else if (ui.passo === 3) {
      corpo = `<h1 class="titulo-passo" tabindex="-1">Qual a dificuldade de cada um?</h1>
        <p class="dica">Crianças podem jogar no fácil e adultos no difícil, na mesma partida.</p>
        <div>${ativos().map((j, i) => `
          <div class="linha-dif">
            ${ficha(j)}
            <span class="nome">${esc(nomeOuPadrao(j, i))}</span>
            <div class="segmentos" role="radiogroup" aria-label="Dificuldade de ${esc(nomeOuPadrao(j, i))}">
              ${J.DIFICULDADES.map((d) => `<button role="radio" aria-checked="${j.dificuldade === d.id}" data-acao="dificuldade" data-i="${i}" data-v="${d.id}">${d.nome}</button>`).join("")}
            </div>
          </div>`).join("")}
        </div>`;
    } else if (ui.passo === 4) {
      const todos = r.categorias.length === CATEGORIAS.length;
      desabilitar = r.categorias.length === 0;
      corpo = `<h1 class="titulo-passo" tabindex="-1">Quais assuntos entram?</h1>
        <div class="linha-acoes"><p class="dica">${r.categorias.length} de ${CATEGORIAS.length} escolhidos</p>
          <button class="btn-texto" data-acao="todos-assuntos">${todos ? "Desmarcar todos" : "Marcar todos"}</button></div>
        <div class="grade-assuntos" role="group" aria-label="Assuntos">
          ${CATEGORIAS.map((c) => {
            const on = r.categorias.includes(c.id);
            return `<button class="assunto" role="checkbox" aria-checked="${on}" data-acao="assunto" data-v="${c.id}" style="${varsCat(c)}">
              <span class="simbolo">${icone(c.id)}</span>${c.nome}
              <span class="marca" aria-hidden="true">${on ? icone("certo") : ""}</span>
            </button>`;
          }).join("")}
        </div>
        ${desabilitar ? `<p class="aviso-erro" role="alert">Escolha pelo menos um assunto.</p>` : ""}`;
    } else if (ui.passo === 5) {
      corpo = `<h1 class="titulo-passo" tabindex="-1">Qual tabuleiro?</h1>
        <p class="dica">Quanto mais casas, mais longa a partida.</p>
        <div class="opcoes" role="radiogroup" aria-label="Tabuleiro">
          ${J.TABULEIROS.map((t) => `<button class="opcao" role="radio" aria-checked="${r.tabuleiro === t.id}" data-acao="tabuleiro" data-v="${t.id}">
            <span class="bolinha" aria-hidden="true"></span>
            <span class="rotulo"><strong>${t.nome}</strong><span>${t.casas} casas · ${t.descricao}</span></span>
            <span class="mini-trilha" aria-hidden="true">${"<i></i>".repeat(t.casas)}</span>
          </button>`).join("")}
        </div>`;
    } else if (ui.passo === 6) {
      botao = "Sortear a ordem";
      corpo = `<h1 class="titulo-passo" tabindex="-1">Vai ter limite de tempo?</h1>
        <p class="dica">O tempo só conta enquanto a pergunta está na tela. Nunca durante a troca de celular.</p>
        <div class="opcoes" role="radiogroup" aria-label="Tempo para responder">
          ${J.TEMPOS.map((t) => `<button class="opcao" role="radio" aria-checked="${r.tempo === t.segundos}" data-acao="tempo" data-v="${t.segundos}">
            <span class="bolinha" aria-hidden="true"></span>
            <span class="rotulo"><strong>${t.nome}</strong>${t.segundos ? `<span>Se o tempo acabar, a resposta conta como errada.</span>` : `<span>Recomendado para começar</span>`}</span>
          </button>`).join("")}
        </div>`;
    }

    return `<div class="tela">
      ${cabecaConfig()}
      <main class="folha-papel">${corpo}</main>
      <footer class="rodape">
        <button class="btn btn-prim" data-acao="avancar-passo" ${desabilitar ? "disabled" : ""}>${botao}${icone("seta")}</button>
      </footer>
    </div>`;
  }

  function nomeOuPadrao(j, i) {
    return (j.nome || "").trim() || "Participante " + (i + 1);
  }

  function telaOrdem() {
    const p = partida;
    const lista = p.ordem.map((id, i) => {
      const j = J.jogador(p, id);
      return `<li style="animation-delay:${reduzMovimento ? 0 : i * 70}ms"><span class="pos">${i + 1}º</span>${ficha(j)}<span class="nome">${esc(j.nome)}</span><span class="etiqueta">${dif(j.dificuldade).nome}</span></li>`;
    }).join("");
    const tab = J.tabuleiro(p.config.tabuleiro);
    return `<div class="tela">
      <header class="cabeca">
        <div class="cabeca-titulo"><div class="passo">Tabuleiro ${tab.nome} · ${tab.casas} casas${p.config.tempo ? " · " + p.config.tempo + " s por pergunta" : ""}</div></div>
        ${botaoSom()}
      </header>
      <main class="folha-papel">
        <h1 class="titulo-passo" tabindex="-1">Ordem sorteada</h1>
        <ol class="ordem-lista" aria-label="Ordem dos turnos">${lista}</ol>
        <section class="regras" aria-labelledby="regras-t">
          <h3 id="regras-t">Como jogar</h3>
          <ol>
            <li>Na sua vez, lance o dado.</li>
            <li>O número mostra a casa que você vai tentar alcançar.</li>
            <li>Responda a pergunta do assunto dessa casa, no seu nível.</li>
            <li>Acertou? Avança até a casa. Errou? Fica onde está.</li>
            <li>Não precisa tirar o número exato: quem passaria do fim tenta a chegada. A pergunta da chegada pode ser de qualquer assunto, e quem acertar primeiro vence!</li>
          </ol>
        </section>
      </main>
      <footer class="rodape">
        <button class="btn btn-prim btn-gigante" data-acao="iniciar-partida">Começar partida</button>
      </footer>
    </div>`;
  }

  function telaJogo() {
    const fase = partida.turno.fase;
    if (ui.retomando || fase === "passe") return telaPasse();
    if (fase === "pronto" || fase === "dado") return telaTurno();
    if (fase === "pergunta") return telaPergunta();
    if (fase === "resultado") return telaResultado();
    return telaPasse();
  }

  function telaPasse() {
    const j = J.jogadorDaVez(partida);
    const c = cor(j.cor);
    const retomando = ui.retomando && partida.turno.fase !== "passe";
    return `<div class="tela tela-passe ${ui.animarPasse ? "toldo-animado" : ""}" style="--cor:${c.hex}">
      <div class="toldo-wrap"><div class="toldo"></div></div>
      <div class="passe-topo">${botaoSom()}<button class="btn-icone" data-acao="menu" aria-label="Placar e opções">${icone("menu")}</button></div>
      <main class="passe-centro">
        <p class="passe-pre">${retomando ? "Partida recuperada. " : ""}Passe o celular para</p>
        ${ficha(j, "ficha-gigante")}
        <h1 class="passe-nome" tabindex="-1">${esc(j.nome)}</h1>
        <p class="passe-cor"><i aria-hidden="true"></i>${c.nome} · ${dif(j.dificuldade).nome}</p>
      </main>
      <footer class="rodape">
        <button class="btn btn-prim btn-gigante" data-acao="iniciar-turno">${retomando ? "Estou com o celular — continuar meu turno" : "Estou com o celular — começar meu turno"}</button>
      </footer>
    </div>`;
  }

  function barraJogo(j) {
    const pos = ui.anim && ui.anim.id === j.id ? ui.anim.pos : j.posicao;
    return `<header class="barra-jogo">
      ${ficha(j)}
      <div class="quem"><strong>${esc(j.nome)}</strong><span>${ondeEsta(partida, pos)} · ${j.acertos} ${j.acertos === 1 ? "acerto" : "acertos"}</span></div>
      ${botaoSom()}
      <button class="btn-icone" data-acao="menu" aria-label="Placar e opções">${icone("menu")}</button>
    </header>`;
  }

  function tabuleiroHtml(p, opcoes) {
    opcoes = opcoes || {};
    const tab = J.tabuleiro(p.config.tabuleiro);
    const cols = tab.colunas;
    const fim = J.ultimaCasa(p);
    const meio = fim - 1; // casas 1..fim-1
    const linhas = Math.ceil(meio / cols);
    const posDe = (j) => (ui.anim && ui.anim.id === j.id ? ui.anim.pos : j.posicao);
    const naCasa = (i) => p.jogadores.filter((j) => posDe(j) === i);
    const classeN = (n) => (n <= 1 ? "n1" : n === 2 ? "n2" : n <= 4 ? "n4" : n <= 9 ? "n9" : "n12");
    const fichasHtml = (lista) => lista.map((j) => ficha(j, j.id === opcoes.destaque ? "ativa" : "")).join("");
    const rotuloQuem = (lista) => (lista.length ? ", com " + lista.map((j) => j.nome).join(", ") : "");
    const atualPos = opcoes.destaque ? posDe(J.jogador(p, opcoes.destaque)) : -1;

    const coord = (i) => {
      const k = i - 1;
      const r = Math.floor(k / cols);
      const cIdx = k % cols;
      const c = r % 2 === 0 ? cIdx : cols - 1 - cIdx;
      return { r, c };
    };

    const ponta = (i, tipo) => {
      const lista = naCasa(i);
      const cls = ["casa-ponta", tipo, i === atualPos ? "atual" : "", i === opcoes.destino ? "destino" : ""].join(" ");
      const nome = tipo === "largada" ? "Largada" : "Chegada";
      return `<button class="${cls}" data-acao="ver-casa" data-casa="${i}" data-casa-n="${i}" aria-label="${nome}${esc(rotuloQuem(lista))}">
        ${icone(tipo)}<span class="nome-ponta">${nome}</span>
        <span class="fichas">${fichasHtml(lista)}</span>
        ${i === opcoes.destino ? `<span class="tag-destino">Destino</span>` : ""}
      </button>`;
    };

    let casas = "";
    const pontos = [];
    for (let i = 1; i < fim; i++) {
      const { r, c } = coord(i);
      pontos.push(`${c + 0.5},${r + 0.5}`);
      const casa = p.casas[i];
      const ct = cat(casa.categoria);
      const lista = naCasa(i);
      const cls = ["casa", lista.length ? "ocupada" : "", i === atualPos ? "atual" : "", i === opcoes.destino ? "destino" : ""].join(" ");
      casas += `<button class="${cls}" style="grid-row:${r + 1};grid-column:${c + 1};${varsCat(ct)}" data-acao="ver-casa" data-casa="${i}" data-casa-n="${i}" aria-label="Casa ${i}, ${ct.nome}${esc(rotuloQuem(lista))}">
        <span class="casa-num" aria-hidden="true">${i}</span>
        <span class="casa-ic" aria-hidden="true">${icone(ct.id)}</span>
        ${lista.length ? `<span class="fichas ${classeN(lista.length)}">${fichasHtml(lista)}</span>` : ""}
        ${i === opcoes.destino ? `<span class="tag-destino">Destino</span>` : ""}
      </button>`;
    }
    const ultima = coord(fim - 1);
    const linha = [`0.5,0`].concat(pontos, [`${ultima.c + 0.5},${linhas}`]).join(" ");

    const usadas = p.config.categorias.map((id) => cat(id));
    const legenda = opcoes.legenda === false ? "" : `<div class="legenda" aria-label="Legenda dos assuntos">${usadas.map((c) => `<span style="${varsCat(c)}"><i>${icone(c.id)}</i>${c.curto}</span>`).join("")}</div>`;

    return `<div class="tabuleiro" role="group" aria-label="Tabuleiro com ${p.casas.length} casas">
      ${ponta(0, "largada")}
      <div class="trilha" style="--cols:${cols}">
        <svg class="trilha-linha" viewBox="0 0 ${cols} ${linhas}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${linha}"/></svg>
        ${casas}
      </div>
      ${ponta(fim, "chegada")}
    </div>${legenda}`;
  }

  function telaTurno() {
    const p = partida;
    const j = J.jogadorDaVez(p);
    const t = p.turno;
    let painel;
    if (t.fase === "pronto" && !ui.rolando) {
      painel = `<p class="painel-texto">Sua vez, <strong>${esc(j.nome)}</strong>! Lance o dado para ver qual casa você vai tentar alcançar.</p>
        <button class="btn btn-prim btn-gigante" data-acao="lancar">${icone("dado")}Lançar dado</button>`;
    } else if (ui.rolando) {
      painel = `<div class="dado-rolando" aria-label="Dado rolando">${dadoSvg(1 + Math.floor(Math.random() * 6))}</div>
        <button class="btn btn-prim btn-gigante" disabled>Rolando…</button>`;
    } else {
      const c = cat(t.categoria);
      const destinoTxt = t.chegada
        ? `<span>Destino: <strong>Chegada!</strong></span><span class="chip-cat" style="${varsCat(c)}">${icone(c.id)}${c.nome}</span>`
        : `<span>Destino: casa ${t.destino}</span><span class="chip-cat" style="${varsCat(c)}">${icone(c.id)}${c.nome}</span>`;
      painel = `<div class="resultado-dado">${dadoSvg(t.dado)}
          <div><p class="tirou">Você tirou ${t.dado}</p><p class="destino-linha">${destinoTxt}</p></div>
        </div>
        ${t.chegada ? `<p class="painel-texto">Acerte esta pergunta para vencer! Na chegada vale qualquer assunto.</p>` : ""}
        <button class="btn btn-prim btn-gigante" data-acao="ver-pergunta">Ver pergunta${icone("seta")}</button>`;
    }
    const destino = t.fase === "dado" && !ui.rolando ? t.destino : undefined;
    return `<div class="tela">
      ${barraJogo(j)}
      <main class="area-tabuleiro"><h1 class="sr" tabindex="-1">Vez de ${esc(j.nome)}</h1>${tabuleiroHtml(p, { destaque: j.id, destino })}</main>
      <footer class="painel">${painel}</footer>
    </div>`;
  }

  const LETRAS = ["A", "B", "C", "D"];

  function cabecaPergunta(t) {
    const c = cat(t.categoria);
    return `<div class="faixa-cat" style="${varsCat(c)}">
      <span class="cat">${icone(c.id)}${c.nome}</span>
      <span class="dif">${dif(t.pergunta.dificuldade).nome}</span>
    </div>`;
  }

  function telaPergunta() {
    const p = partida;
    const j = J.jogadorDaVez(p);
    const t = p.turno;
    const q = t.pergunta;
    const cron = p.config.tempo
      ? `<div class="cron-barra" aria-hidden="true"><i></i></div>`
      : "";
    const trajeto = t.chegada
      ? `Valendo a <strong>chegada</strong> e a vitória`
      : `Valendo: ${nomeCasa(p, t.origem)} ${icone("seta")} casa ${t.destino}`;
    return `<div class="tela tela-papel">
      ${barraJogo(j)}
      ${cabecaPergunta(t)}
      ${cron}
      <main class="corpo-pergunta">
        <div class="trajeto">
          ${trajeto}
          ${p.config.tempo ? `<span class="cronometro" role="timer" style="margin-left:auto">${icone("relogio")}<span data-cron>${Math.ceil(t.restanteMs / 1000)} s</span></span>` : ""}
        </div>
        <h1 class="enunciado" id="enunciado" tabindex="-1">${esc(q.enunciado)}</h1>
        <fieldset class="alternativas" aria-labelledby="enunciado">
          ${q.alternativas.map((a, i) => `<label class="alt">
            <input type="radio" name="alt" value="${i}" ${t.escolha === i ? "checked" : ""}>
            <span class="letra" aria-hidden="true">${LETRAS[i]}</span><span class="texto">${esc(a)}</span>
          </label>`).join("")}
        </fieldset>
      </main>
      <footer class="rodape">
        <button class="btn btn-prim btn-gigante" data-acao="confirmar" ${t.escolha === null ? "disabled" : ""}>Confirmar resposta</button>
        <p class="dica">Dá para trocar a escolha antes de confirmar.</p>
      </footer>
    </div>`;
  }

  function telaResultado() {
    const p = partida;
    const j = J.jogadorDaVez(p);
    const t = p.turno;
    const q = t.pergunta;
    const r = t.resposta;
    const venceu = p.vencedor === j.id;
    let titulo, sub, mov;
    if (r.correta) {
      titulo = venceu ? "Venceu!" : "Acertou!";
      sub = venceu ? "Resposta certa na chegada." : "Resposta certa.";
      mov = venceu
        ? `${esc(j.nome)} chegou ao fim do percurso e venceu a partida!`
        : `Você avançou de ${nomeCasa(p, t.origem)} para a casa ${t.destino}.`;
    } else {
      titulo = r.tempoEsgotado ? "Tempo esgotado" : "Errou";
      sub = r.tempoEsgotado ? "Acabou o tempo, então conta como erro." : "Não foi dessa vez.";
      mov = `Você continua ${t.origem === 0 ? "na largada" : "na casa " + t.origem}.`;
    }
    const rev = q.alternativas.map((a, i) => {
      const certa = i === q.correta;
      const marcada = r.indice === i && !certa;
      if (!certa && !marcada) return `<div class="rev-alt"><span>${LETRAS[i]}. ${esc(a)}</span></div>`;
      return `<div class="rev-alt ${certa ? "certa" : "marcada"}">${icone(certa ? "certo" : "errado")}<span>${LETRAS[i]}. ${esc(a)}</span><span class="rotulo">${certa ? (r.indice === i ? "Sua resposta, certa" : "Resposta certa") : "Sua resposta"}</span></div>`;
    }).join("");
    return `<div class="tela tela-papel">
      ${barraJogo(j)}
      <section class="veredito ${r.correta ? "ok" : "erro"}" role="status">
        <span class="selo">${icone(r.correta ? "certo" : "errado")}</span>
        <div><h1 tabindex="-1">${titulo}</h1><p>${sub}</p></div>
      </section>
      <main>
        <p class="movimento">${mov}</p>
        <div class="revisao"><p class="q">${esc(q.enunciado)}</p>${rev}</div>
        <div class="explicacao"><strong>Você sabia?</strong>${esc(q.explicacao)}</div>
        <section class="tab-resultado" aria-label="Tabuleiro depois da jogada">
          <h2>Tabuleiro</h2>
          <div class="area-tabuleiro">${tabuleiroHtml(p, { destaque: j.id, legenda: false })}</div>
        </section>
      </main>
      <footer class="rodape">
        <button class="btn btn-prim btn-gigante" data-acao="encerrar-turno">${venceu ? "Ver a comemoração" : "Encerrar meu turno"}</button>
      </footer>
    </div>`;
  }

  function telaFim() {
    const p = partida;
    const v = J.jogador(p, p.vencedor);
    const lista = J.classificacao(p);
    const linhas = lista.map((j, i) => `<tr class="${j.id === p.vencedor ? "campeao" : ""}">
        <td class="pos">${i + 1}º</td>
        <td><div class="quem">${ficha(j)}<div>${esc(j.nome)}<small>${j.id === p.vencedor ? "Chegada" : ondeEsta(p, j.posicao)}</small></div></div></td>
        <td class="num">${j.acertos}</td>
        <td class="num">${j.respondidas}</td>
      </tr>`).join("");
    return `<div class="tela tela-fim" style="--cor:${cor(v.cor).hex}">
      <canvas class="confete" aria-hidden="true"></canvas>
      <div class="toldo-wrap toldo-animado"><div class="toldo"></div></div>
      <main>
        <div class="fim-topo">
          <span class="trofeu">${icone("trofeu")}</span>
          ${ficha(v, "ficha-gigante")}
          <h1 tabindex="-1">${esc(v.nome)} venceu!</h1>
          <p>${v.acertos} ${v.acertos === 1 ? "acerto" : "acertos"} em ${v.respondidas} ${v.respondidas === 1 ? "pergunta" : "perguntas"}.</p>
        </div>
        <section class="folha-papel" aria-labelledby="classif-t">
          <h2 class="titulo-passo" id="classif-t">Classificação</h2>
          <table class="classif">
            <thead><tr><th scope="col"><span class="sr">Posição final</span></th><th scope="col">Participante</th><th scope="col" class="num">Acertos</th><th scope="col" class="num">Respondidas</th></tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </section>
      </main>
      <footer class="rodape" style="background:var(--papel)">
        <button class="btn btn-prim" data-acao="revanche">Jogar novamente com o mesmo grupo</button>
        <button class="btn btn-sec" style="background:var(--papel);color:var(--tinta);box-shadow:inset 0 0 0 2px var(--tinta-2)" data-acao="nova-partida">Criar uma nova partida</button>
      </footer>
    </div>`;
  }

  // ───────── folhas ─────────
  function folhaHtml() {
    const f = ui.folha;
    if (!f) return "";
    let titulo = "";
    let corpo = "";
    if (f.tipo === "ficha") {
      const r = ui.rascunho;
      const j = r.jogadores[f.i];
      const donoDe = (campo, v) => ativos().findIndex((o, k) => k !== f.i && o[campo] === v);
      titulo = `Peão de ${esc(nomeOuPadrao(j, f.i))}`;
      corpo = `<div style="display:flex;justify-content:center;margin:4px 0 6px">${ficha(j, "ficha-gigante")}</div>
        <h3 id="t-cor">Cor</h3>
        <div class="amostras" role="radiogroup" aria-labelledby="t-cor">${CORES.map((c) => {
          const d = donoDe("cor", c.id);
          return `<button class="amostra" role="radio" aria-checked="${j.cor === c.id}" style="--cor:${c.hex}" data-acao="escolher-cor" data-v="${c.id}" aria-label="${c.nome}${d >= 0 ? ", em uso por " + esc(nomeOuPadrao(ativos()[d], d)) : ""}">${d >= 0 ? `<span class="dono" aria-hidden="true">${ficha(ativos()[d])}</span>` : ""}</button>`;
        }).join("")}</div>
        <h3 id="t-av">Avatar</h3>
        <div class="avatares-op" role="radiogroup" aria-labelledby="t-av">${AVATARES.map((a) => {
          const d = donoDe("avatar", a.id);
          return `<button class="avatar-op" role="radio" aria-checked="${j.avatar === a.id}" data-acao="escolher-avatar" data-v="${a.id}" aria-label="${a.nome}${d >= 0 ? ", em uso por " + esc(nomeOuPadrao(ativos()[d], d)) : ""}">${avatarSvg(a.id)}${d >= 0 ? `<span class="dono" aria-hidden="true"><i style="--cor:${cor(ativos()[d].cor).hex}"></i></span>` : ""}</button>`;
        }).join("")}</div>
        <p class="nota-troca">Se escolher uma cor ou avatar que já é de outra pessoa, vocês trocam.</p>
        <div class="menu-acoes"><button class="btn btn-prim" data-acao="fechar-folha">Pronto</button></div>`;
    } else if (f.tipo === "menu") {
      const p = partida;
      const atual = J.jogadorDaVez(p).id;
      titulo = "Placar";
      corpo = `<ol class="placar-lista" aria-label="Ordem dos turnos">${p.ordem.map((id, i) => {
          const j = J.jogador(p, id);
          return `<li class="${id === atual ? "vez" : ""}">
            ${ficha(j)}
            <div class="info"><strong>${i + 1}º ${esc(j.nome)}</strong><span>${ondeEsta(p, j.posicao)}${id === atual ? " · vez agora" : ""}</span></div>
            <div class="ac">${j.acertos} ${j.acertos === 1 ? "acerto" : "acertos"}<small>${j.respondidas} ${j.respondidas === 1 ? "respondida" : "respondidas"}</small></div>
          </li>`;
        }).join("")}</ol>
        <div class="menu-acoes">
          <button class="btn btn-sec" data-acao="ver-tabuleiro">${icone("tabuleiro")}Ver tabuleiro</button>
          <button class="btn btn-sec" data-acao="som" aria-pressed="${Som.ligado}">${icone(Som.ligado ? "somLigado" : "somDesligado")}${Som.ligado ? "Desligar sons" : "Ligar sons"}</button>
          <button class="btn btn-sec" data-acao="sair">${icone("sair")}Sair para o início</button>
          <p class="dica" style="text-align:center">A partida fica salva neste celular.</p>
        </div>`;
    } else if (f.tipo === "tabuleiro") {
      titulo = "Tabuleiro";
      corpo = tabuleiroHtml(partida, { destaque: J.jogadorDaVez(partida).id });
    } else if (f.tipo === "casa") {
      const p = partida;
      const i = f.casa;
      const lista = p.jogadores.filter((j) => j.posicao === i);
      const casa = p.casas[i];
      titulo = casa.tipo === "categoria" ? `Casa ${i}` : nomeCasa(p, i);
      const desc = casa.tipo === "categoria"
        ? `<p style="margin-bottom:14px"><span class="chip-cat" style="${varsCat(cat(casa.categoria))}">${icone(casa.categoria)}${cat(casa.categoria).nome}</span></p>`
        : casa.tipo === "chegada" ? `<p class="dica" style="margin-bottom:14px">A pergunta da chegada pode ser de qualquer assunto da partida.</p>` : `<p class="dica" style="margin-bottom:14px">Todo mundo começa aqui.</p>`;
      corpo = desc + (lista.length
        ? `<div class="quem-na-casa">${lista.map((j) => `<div>${ficha(j)}${esc(j.nome)}</div>`).join("")}</div>`
        : `<p class="dica">Ninguém está nesta casa.</p>`);
    }
    return `<div class="fundo-folha" data-acao="fundo-folha">
      <div class="folha ${f.tipo === "ficha" ? "" : ""}" role="dialog" aria-modal="true" aria-labelledby="folha-t">
        <div class="folha-alca" aria-hidden="true"></div>
        <div class="folha-cabeca"><h2 id="folha-t" tabindex="-1">${titulo}</h2>
          <button class="btn-icone" data-acao="fechar-folha" aria-label="Fechar">${icone("fechar")}</button></div>
        ${corpo}
      </div>
    </div>`;
  }

  // ───────── depois de desenhar ─────────
  let focarDepois = true;
  function depoisDeRenderizar() {
    if (ui.folha) {
      const h = app.querySelector("#folha-t");
      if (h && focarDepois) h.focus({ preventScroll: true });
    } else if (focarDepois) {
      const h = app.querySelector("main [tabindex='-1'], .tela [tabindex='-1']");
      if (h) h.focus({ preventScroll: true });
    }
    focarDepois = true;
    ui.animarPasse = false;

    // Rola o tabuleiro até o destino ou até o peão da vez.
    const alvo = app.querySelector(".tela .casa.destino, .tela .casa-ponta.destino") || app.querySelector(".tela .casa.atual, .tela .casa-ponta.atual");
    if (alvo && !ui.folha && ui.tela === "jogo" && ["pronto", "dado"].includes(partida.turno.fase)) {
      alvo.scrollIntoView({ block: "center", behavior: reduzMovimento ? "auto" : "smooth" });
    }

    if (ui.tela === "jogo" && partida.turno.fase === "pergunta" && !ui.retomando && !ui.folha) iniciarCronometro();
    if (ui.tela === "fim" && !ui.folha) soltarConfete();
  }

  // Redesenha sem roubar o foco (para mudanças pequenas).
  function atualizar() {
    focarDepois = false;
    render();
  }

  // ───────── cronômetro ─────────
  let cron = null;
  let ultimoTique = 0;
  let ultimoSalvo = 0;

  function iniciarCronometro() {
    const p = partida;
    if (!p.config.tempo || cron) return;
    ultimoTique = performance.now();
    ultimoSalvo = ultimoTique;
    desenharCronometro();
    cron = setInterval(tique, 200);
  }
  function pararCronometro() {
    if (cron) clearInterval(cron);
    cron = null;
  }
  function tique() {
    const t = partida.turno;
    const agora = performance.now();
    if (document.hidden || t.fase !== "pergunta") {
      ultimoTique = agora;
      return;
    }
    const antes = t.restanteMs;
    t.restanteMs = Math.max(0, t.restanteMs - (agora - ultimoTique));
    ultimoTique = agora;
    if (Math.ceil(antes / 1000) !== Math.ceil(t.restanteMs / 1000)) {
      const s = Math.ceil(t.restanteMs / 1000);
      if (s === 10 || (s <= 5 && s > 0)) Som.tocar("alerta");
      if (s === 10) anunciar("Faltam 10 segundos");
    }
    desenharCronometro();
    if (agora - ultimoSalvo > 1000) {
      ultimoSalvo = agora;
      guardar();
    }
    if (t.restanteMs <= 0) {
      pararCronometro();
      confirmar(true);
    }
  }
  function desenharCronometro() {
    const t = partida.turno;
    const total = partida.config.tempo * 1000;
    const barra = app.querySelector(".cron-barra");
    const txt = app.querySelector("[data-cron]");
    const frac = Math.max(0, t.restanteMs / total);
    if (barra) {
      barra.style.setProperty("--p", frac.toFixed(3));
      barra.classList.toggle("urgente", t.restanteMs <= 10000);
    }
    if (txt) txt.textContent = Math.ceil(t.restanteMs / 1000) + " s";
  }
  document.addEventListener("visibilitychange", () => {
    if (partida) guardar();
    const el = app.querySelector(".cronometro");
    if (el) el.classList.toggle("pausado", document.hidden);
  });

  // ───────── ações ─────────
  function confirmar(tempoEsgotado) {
    const t = partida.turno;
    if (t.fase !== "pergunta" || t.resposta) return;
    if (!tempoEsgotado && t.escolha === null) return;
    const r = J.responder(partida, tempoEsgotado ? null : t.escolha, tempoEsgotado);
    guardar(); // salva antes de mostrar: recarregar não deixa responder de novo
    Som.tocar(r.correta ? "acerto" : "erro");
    if (navigator.vibrate) navigator.vibrate(r.correta ? 40 : [60, 50, 60]);
    anunciar(r.correta ? "Resposta certa!" : r.tempoEsgotado ? "Tempo esgotado." : "Resposta errada.");
    if (r.correta) {
      const j = J.jogadorDaVez(partida);
      ui.anim = { id: j.id, pos: t.origem };
    }
    render();
    if (ui.anim) andarPeao(t.origem, t.destino);
  }

  function andarPeao(de, para) {
    if (reduzMovimento) {
      ui.anim = null;
      atualizar();
      return;
    }
    let pos = de;
    const passo = () => {
      if (!ui.anim) return;
      pos += 1;
      ui.anim.pos = pos;
      Som.tocar("passo");
      atualizar();
      const el = app.querySelector(".tab-resultado .casa.atual, .tab-resultado .casa-ponta.atual");
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (pos < para) setTimeout(passo, 260);
      else setTimeout(() => { ui.anim = null; atualizar(); }, 300);
    };
    setTimeout(passo, 500);
  }

  const ACOES = {
    som() {
      Som.definir(!Som.ligado);
      prefs.som = Som.ligado;
      J.salvarPrefs(prefs);
      Som.tocar("toque");
      atualizar();
    },
    comecar() {
      ui.rascunho = rascunhoInicial();
      ui.passo = 1;
      ui.tela = "config";
      render();
    },
    continuar() {
      if (!partida) return;
      if (partida.fase === "ordem") ui.tela = "ordem";
      else if (partida.fase === "fim") ui.tela = "fim";
      else {
        ui.tela = "jogo";
        ui.retomando = partida.turno.fase !== "passe";
        ui.animarPasse = true;
      }
      render();
    },
    "voltar-passo"() {
      if (ui.passo === 1) ui.tela = "inicio";
      else ui.passo -= 1;
      render();
    },
    "avancar-passo"() {
      const r = ui.rascunho;
      if (ui.passo === 2) {
        ativos().forEach((j, i) => { j.nome = nomeOuPadrao(j, i); });
      }
      if (ui.passo === 4 && !r.categorias.length) return;
      if (ui.passo < TOTAL_PASSOS) {
        ui.passo += 1;
        render();
        window.scrollTo(0, 0);
        return;
      }
      // Fim da configuração: cria a partida e sorteia a ordem.
      corrigirRepetidos();
      const jogadores = ativos().map((j, i) => ({ ...j, nome: nomeOuPadrao(j, i) }));
      prefs.ultimoGrupo = { quantidade: r.quantidade, jogadores: r.jogadores.map((j) => ({ ...j })), categorias: r.categorias, tabuleiro: r.tabuleiro, tempo: r.tempo };
      J.salvarPrefs(prefs);
      partida = J.novaPartida({ tabuleiro: r.tabuleiro, tempo: r.tempo, categorias: r.categorias }, jogadores);
      guardar();
      Som.tocar("dado");
      ui.tela = "ordem";
      render();
      window.scrollTo(0, 0);
    },
    menos() {
      ui.rascunho.quantidade = Math.max(MIN_JOG, ui.rascunho.quantidade - 1);
      atualizar();
    },
    mais() {
      ui.rascunho.quantidade = Math.min(MAX_JOG, ui.rascunho.quantidade + 1);
      corrigirRepetidos();
      atualizar();
    },
    "editar-ficha"(el) {
      ui.folha = { tipo: "ficha", i: +el.dataset.i };
      render();
    },
    "escolher-cor"(el) { trocar("cor", el.dataset.v); },
    "escolher-avatar"(el) { trocar("avatar", el.dataset.v); },
    dificuldade(el) {
      ui.rascunho.jogadores[+el.dataset.i].dificuldade = el.dataset.v;
      atualizar();
    },
    assunto(el) {
      const lista = ui.rascunho.categorias;
      const i = lista.indexOf(el.dataset.v);
      if (i >= 0) lista.splice(i, 1);
      else lista.push(el.dataset.v);
      ui.rascunho.categorias = CATEGORIAS.map((c) => c.id).filter((id) => lista.includes(id));
      atualizar();
    },
    "todos-assuntos"() {
      const r = ui.rascunho;
      r.categorias = r.categorias.length === CATEGORIAS.length ? [] : CATEGORIAS.map((c) => c.id);
      atualizar();
    },
    tabuleiro(el) { ui.rascunho.tabuleiro = el.dataset.v; atualizar(); },
    tempo(el) { ui.rascunho.tempo = +el.dataset.v; atualizar(); },
    "iniciar-partida"() {
      partida.fase = "jogando";
      guardar();
      ui.tela = "jogo";
      ui.animarPasse = true;
      render();
    },
    "iniciar-turno"() {
      if (ui.retomando) {
        ui.retomando = false;
      } else {
        J.comecarTurno(partida);
        guardar();
      }
      render();
      window.scrollTo(0, 0);
    },
    lancar() {
      if (partida.turno.fase !== "pronto" || ui.rolando) return;
      const t = J.lancarDado(partida);
      guardar(); // o dado e a pergunta ficam gravados na hora
      ui.rolando = true;
      Som.tocar("dado");
      if (navigator.vibrate) navigator.vibrate(30);
      atualizar();
      const rolar = app.querySelector(".dado-rolando");
      let n = 0;
      const giro = setInterval(() => {
        n++;
        if (rolar) rolar.innerHTML = dadoSvg(1 + Math.floor(Math.random() * 6));
      }, 90);
      setTimeout(() => {
        clearInterval(giro);
        ui.rolando = false;
        render();
        anunciar(`Você tirou ${t.dado}. Destino: ${t.chegada ? "chegada" : "casa " + t.destino}, ${cat(t.categoria).nome}.`);
      }, reduzMovimento ? 50 : 900);
    },
    "ver-pergunta"() {
      J.mostrarPergunta(partida);
      guardar();
      render();
      window.scrollTo(0, 0);
    },
    confirmar() { confirmar(false); },
    "encerrar-turno"() {
      ui.anim = null;
      J.encerrarTurno(partida);
      guardar();
      if (partida.fase === "fim") {
        ui.tela = "fim";
        Som.tocar("vitoria");
      } else {
        ui.animarPasse = true;
      }
      render();
      window.scrollTo(0, 0);
    },
    menu() { ui.folha = { tipo: "menu" }; render(); },
    "ver-tabuleiro"() { ui.folha = { tipo: "tabuleiro" }; render(); },
    "ver-casa"(el) {
      if (ui.tela !== "jogo" && ui.tela !== "fim") return;
      ui.folha = { tipo: "casa", casa: +el.dataset.casa };
      render();
    },
    sair() {
      ui.folha = null;
      ui.retomando = false;
      ui.tela = "inicio";
      guardar();
      render();
    },
    "fechar-folha"() { fecharFolha(); },
    "fundo-folha"(el, ev) { if (ev.target === el) fecharFolha(); },
    revanche() {
      partida = J.revanche(partida);
      guardar();
      ui.tela = "ordem";
      render();
      window.scrollTo(0, 0);
    },
    "nova-partida"() {
      J.salvar(null);
      partida = null;
      ui.rascunho = rascunhoInicial();
      ui.passo = 1;
      ui.tela = "config";
      render();
      window.scrollTo(0, 0);
    },
  };

  function fecharFolha() {
    const voltarPara = ui.folha && ui.folha.tipo === "ficha" ? ui.folha.i : null;
    ui.folha = null;
    render();
    if (voltarPara !== null) {
      const b = app.querySelector(`[data-acao="editar-ficha"][data-i="${voltarPara}"]`);
      if (b) b.focus();
    }
  }

  // Troca cor ou avatar; se outra pessoa já usa, as duas trocam entre si.
  function trocar(campo, valor) {
    const f = ui.folha;
    const lista = ativos();
    const eu = lista[f.i];
    const outro = lista.findIndex((o, k) => k !== f.i && o[campo] === valor);
    if (outro >= 0) lista[outro][campo] = eu[campo];
    eu[campo] = valor;
    Som.tocar("toque");
    atualizar();
  }

  // ───────── eventos ─────────
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-acao]");
    if (!el || el.disabled) return;
    const acao = ACOES[el.dataset.acao];
    if (acao) acao(el, ev);
  });

  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.dataset && el.dataset.nome !== undefined && ui.rascunho) {
      ui.rascunho.jogadores[+el.dataset.nome].nome = el.value;
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && ui.folha) fecharFolha();
    if (ev.key === "Enter" && ev.target.dataset && ev.target.dataset.nome !== undefined) {
      ev.preventDefault();
      const prox = app.querySelector(`[data-nome="${+ev.target.dataset.nome + 1}"]`);
      if (prox) prox.focus();
      else ev.target.blur();
    }
  });

  document.addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.name === "alt" && partida && partida.turno.fase === "pergunta") {
      J.escolher(partida, +el.value);
      guardar();
      Som.tocar("toque");
      const b = app.querySelector('[data-acao="confirmar"]');
      if (b) b.disabled = false;
    }
  });

  // ───────── confete ─────────
  function soltarConfete() {
    const canvas = app.querySelector(".confete");
    if (!canvas || reduzMovimento) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (canvas.width = innerWidth * dpr);
    const H = (canvas.height = innerHeight * dpr);
    const cores = ["#ffe23d", "#ffffff", "#e03131", "#2b8a3e", "#f76707", "#7048e8", "#1098ad"];
    const pedacos = Array.from({ length: 140 }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.6,
      w: (6 + Math.random() * 8) * dpr,
      h: (8 + Math.random() * 10) * dpr,
      vy: (2 + Math.random() * 3) * dpr,
      vx: (Math.random() - 0.5) * 2 * dpr,
      g: Math.random() * Math.PI,
      vg: 0.05 + Math.random() * 0.1,
      c: cores[Math.floor(Math.random() * cores.length)],
    }));
    const inicio = performance.now();
    function quadro(agora) {
      if (!canvas.isConnected) return;
      const t = agora - inicio;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = t > 3200 ? Math.max(0, 1 - (t - 3200) / 800) : 1;
      pedacos.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.g += p.vg;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.g);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.g)));
        ctx.restore();
      });
      if (t < 4000) requestAnimationFrame(quadro);
      else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(quadro);
  }

  // Ganchos para testes automatizados.
  window.Quest = { get partida() { return partida; }, get ui() { return ui; } };

  render();
})();
