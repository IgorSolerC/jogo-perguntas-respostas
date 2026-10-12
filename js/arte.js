/* Quest · arte: categorias, cores, avatares e ícones desenhados em SVG. */
(function () {
  "use strict";

  // Ícones de traço (24×24, traço 2, pontas arredondadas). Usam currentColor.
  const TRACO = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const ICONES = {
    geral: `<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/>`,
    natureza: `<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l8-8"/>`,
    ciencia: `<path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/>`,
    historia: `<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/><path d="M9.5 18.5h5"/>`,
    geografia: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>`,
    cinema: `<rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 9l1.8-5.2 16 3.4L21 9"/><path d="M8.5 5l1.6 4.6M14 6.2l1.4 3"/>`,
    esportes: `<circle cx="12" cy="12" r="9"/><path d="M12 7.5l4.2 3-1.6 5h-5.2l-1.6-5z"/><path d="M12 7.5V3.2M16.2 10.5l4.3-1.5M14.6 15.5l2.6 3.6M9.4 15.5l-2.6 3.6M7.8 10.5L3.5 9"/>`,
    curiosidades: `<circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.5-2.7 4.3"/><path d="M12 17.6v.1"/>`,
    largada: `<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>`,
    chegada: `<path d="M5 21V4"/><path d="M5 4h14v9H5"/><path d="M9.7 4v9M14.3 4v9M5 8.5h14" stroke-width="1.6"/>`,
    somLigado: `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>`,
    somDesligado: `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>`,
    menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
    voltar: `<path d="M15 5l-7 7 7 7"/>`,
    fechar: `<path d="M6 6l12 12M18 6L6 18"/>`,
    certo: `<path d="M4.5 12.5l5 5L19.5 7"/>`,
    errado: `<path d="M6 6l12 12M18 6L6 18"/>`,
    relogio: `<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>`,
    tabuleiro: `<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>`,
    placar: `<path d="M5 20V11M12 20V5M19 20v-6"/>`,
    livro: `<path d="M12 6.5C10.3 5.2 8 4.5 4 4.5v13c4 0 6.3.7 8 2 1.7-1.3 4-2 8-2v-13c-4 0-6.3.7-8 2z"/><path d="M12 6.5v13"/>`,
    pessoas: `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.4c2 .9 3.2 2.8 3.5 5.6"/>`,
    sortear: `<path d="M4 7h3.5c2 0 3.2 1 4.3 2.7l1.4 2.2C14.4 13.9 15.6 17 18 17h2"/><path d="M4 17h3.5c1.5 0 2.4-.6 3.2-1.5M14 8.5c1-1 2.2-1.5 4-1.5h2"/><path d="M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5"/>`,
    sair: `<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8l-4 4 4 4M6 12h10"/>`,
    trofeu: `<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5c0 3 1.6 4.6 3.8 4.9M16 6h3.5c0 3-1.6 4.6-3.8 4.9"/><path d="M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z"/>`,
    seta: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
    lapis: `<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/>`,
    dado: `<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.6" cy="8.6" r="1.1" fill="currentColor"/><circle cx="15.4" cy="15.4" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/>`,
  };

  function icone(nome, classe) {
    return `<svg class="ic ${classe || ""}" viewBox="0 0 24 24" ${TRACO} aria-hidden="true" focusable="false">${ICONES[nome] || ""}</svg>`;
  }

  // Categorias: cor de fundo da casa, cor forte e símbolo. Cada uma tem símbolo
  // próprio para não depender só da cor.
  const CATEGORIAS = [
    { id: "geral", nome: "Conhecimentos gerais", curto: "Gerais", forte: "#8a5d00", fundo: "#ffe7a3" },
    { id: "natureza", nome: "Animais e natureza", curto: "Natureza", forte: "#1d6b2e", fundo: "#c8efcf" },
    { id: "ciencia", nome: "Ciência e tecnologia", curto: "Ciência", forte: "#0a6361", fundo: "#c2efec" },
    { id: "historia", nome: "História", curto: "História", forte: "#6b4220", fundo: "#ecdcc8" },
    { id: "geografia", nome: "Geografia", curto: "Geografia", forte: "#1b4f9c", fundo: "#cfe1ff" },
    { id: "cinema", nome: "Cinema e desenhos", curto: "Cinema", forte: "#5523a8", fundo: "#e5d8ff" },
    { id: "esportes", nome: "Esportes", curto: "Esportes", forte: "#9a3f00", fundo: "#ffdcbd" },
    { id: "curiosidades", nome: "Curiosidades", curto: "Curiosidades", forte: "#9b1450", fundo: "#ffd3e5" },
  ];

  const CORES = [
    { id: "vermelho", nome: "Vermelho", hex: "#e03131" },
    { id: "laranja", nome: "Laranja", hex: "#f76707" },
    { id: "amarelo", nome: "Amarelo", hex: "#fab005" },
    { id: "lima", nome: "Lima", hex: "#82c91e" },
    { id: "verde", nome: "Verde", hex: "#2b8a3e" },
    { id: "turquesa", nome: "Turquesa", hex: "#0ca678" },
    { id: "ciano", nome: "Ciano", hex: "#1098ad" },
    { id: "azul", nome: "Azul", hex: "#3b5bdb" },
    { id: "roxo", nome: "Roxo", hex: "#7048e8" },
    { id: "rosa", nome: "Rosa", hex: "#e64980" },
    { id: "marrom", nome: "Marrom", hex: "#8d5524" },
    { id: "ardosia", nome: "Ardósia", hex: "#4a5073" },
  ];

  // Avatares: frutas e legumes da feira, desenhados em 64×64.
  const TINTA = "#13204a";
  function rosto(x, y, s) {
    s = s || 1;
    const e = 4.2 * s;
    return `<g fill="${TINTA}"><circle cx="${x - e}" cy="${y}" r="${1.9 * s}"/><circle cx="${x + e}" cy="${y}" r="${1.9 * s}"/></g>` +
      `<path d="M${x - 3.2 * s} ${y + 4 * s}q${3.2 * s} ${3 * s} ${6.4 * s} 0" fill="none" stroke="${TINTA}" stroke-width="${1.8 * s}" stroke-linecap="round"/>` +
      `<g fill="#ff8fa3" opacity=".55"><circle cx="${x - 8 * s}" cy="${y + 3.5 * s}" r="${2.2 * s}"/><circle cx="${x + 8 * s}" cy="${y + 3.5 * s}" r="${2.2 * s}"/></g>`;
  }
  const AVATARES = [
    { id: "abacaxi", nome: "Abacaxi", svg: `<path d="M32 18l-6-12 6 5 1-8 3 8 6-5-5 12z" fill="#2f9e44"/><ellipse cx="32" cy="38" rx="15" ry="20" fill="#f6b31b"/><path d="M20 30l24 16M20 44l22-14M24 24l18 12M22 52l20-12" stroke="#d48806" stroke-width="1.6" opacity=".7"/>` + rosto(32, 38) },
    { id: "banana", nome: "Banana", svg: `<path d="M14 18c-4 20 10 36 34 34 4 0 5-4 1-5-18-2-26-14-28-30-1-4-6-4-7 1z" fill="#ffd43b"/><path d="M14 18l-1-5 5 1z" fill="#6b4220"/><path d="M48 52l4 2-1-5" fill="#6b4220"/>` + rosto(30, 36, .9) },
    { id: "melancia", nome: "Melancia", svg: `<path d="M6 22h52a26 26 0 0 1-52 0z" fill="#2b8a3e"/><path d="M10 22h44a22 22 0 0 1-44 0z" fill="#f03e5a"/><g fill="${TINTA}" opacity=".8"><ellipse cx="18" cy="31" rx="1.4" ry="2.2"/><ellipse cx="46" cy="31" rx="1.4" ry="2.2"/><ellipse cx="24" cy="41" rx="1.4" ry="2.2"/><ellipse cx="40" cy="41" rx="1.4" ry="2.2"/></g>` + rosto(32, 29, .9) },
    { id: "tomate", nome: "Tomate", svg: `<circle cx="32" cy="36" r="21" fill="#e8413a"/><path d="M32 16l-4-5 4 2 4-2-4 5 9-1-7 5 3 4-5-3-5 3 3-4-7-5z" fill="#2f9e44"/>` + rosto(32, 38) },
    { id: "uva", nome: "Uva", svg: `<path d="M32 12c2-4 6-5 10-4-2 4-6 5-10 4z" fill="#2f9e44"/><path d="M32 12v6" stroke="#6b4220" stroke-width="2"/><g fill="#8e44ad"><circle cx="24" cy="24" r="7"/><circle cx="40" cy="24" r="7"/><circle cx="32" cy="27" r="7"/><circle cx="20" cy="36" r="7"/><circle cx="44" cy="36" r="7"/><circle cx="32" cy="38" r="8"/><circle cx="25" cy="48" r="7"/><circle cx="39" cy="48" r="7"/><circle cx="32" cy="56" r="6"/></g>` + rosto(32, 39, .85) },
    { id: "cenoura", nome: "Cenoura", svg: `<path d="M32 18c-3-8-9-11-12-10 3 3 6 7 9 11M32 18c0-8 2-12 5-13-1 5-2 9-3 13M33 19c4-6 10-8 13-7-3 2-7 5-11 9" fill="#2f9e44" stroke="#2f9e44" stroke-width="3" stroke-linejoin="round"/><path d="M20 20h24c0 14-6 30-12 40-6-10-12-26-12-40z" fill="#f76707"/><path d="M24 30h5M35 40h5M27 48h4" stroke="#c2410c" stroke-width="1.8" stroke-linecap="round"/>` + rosto(32, 28, .85) },
    { id: "laranja", nome: "Laranja", svg: `<circle cx="32" cy="36" r="21" fill="#fd8c1a"/><path d="M33 15c3-6 10-7 14-5-3 5-9 7-14 5z" fill="#2f9e44"/><g fill="#e8590c" opacity=".55"><circle cx="20" cy="30" r="1.2"/><circle cx="44" cy="46" r="1.2"/><circle cx="40" cy="24" r="1.2"/><circle cx="23" cy="48" r="1.2"/></g>` + rosto(32, 37) },
    { id: "morango", nome: "Morango", svg: `<path d="M12 22c6-6 34-6 40 0 2 14-8 34-20 38-12-4-22-24-20-38z" fill="#e8364f"/><path d="M14 20l8 4 4-7 6 6 6-6 4 7 8-4-6 8H20z" fill="#2f9e44"/><g fill="#ffe066"><ellipse cx="20" cy="34" rx="1" ry="1.6"/><ellipse cx="44" cy="34" rx="1" ry="1.6"/><ellipse cx="26" cy="48" rx="1" ry="1.6"/><ellipse cx="38" cy="48" rx="1" ry="1.6"/><ellipse cx="32" cy="54" rx="1" ry="1.6"/></g>` + rosto(32, 36, .9) },
    { id: "abacate", nome: "Abacate", svg: `<path d="M32 6c10 0 14 14 18 24 6 16-4 28-18 28S8 46 14 30c4-10 8-24 18-24z" fill="#4c7a1f"/><path d="M32 11c8 0 11 12 14 20 5 13-3 23-14 23s-19-10-14-23c3-8 6-20 14-20z" fill="#c6e48b"/><circle cx="32" cy="42" r="8" fill="#8d5524"/>` + rosto(32, 27, .8) },
    { id: "milho", nome: "Milho", svg: `<path d="M32 6c9 0 13 12 13 26s-5 24-13 24-13-10-13-24S23 6 32 6z" fill="#ffd43b"/><g stroke="#e0a800" stroke-width="1.3" opacity=".8"><path d="M22 20h20M20 28h24M20 36h24M21 44h22M24 52h16M27 9v44M32 6v50M37 9v44"/></g><path d="M18 60c-8-10-6-26 4-34 0 14 4 24 10 34zM46 60c8-10 6-26-4-34 0 14-4 24-10 34z" fill="#51a33b"/>` + rosto(32, 30, .85) },
    { id: "berinjela", nome: "Berinjela", svg: `<path d="M28 18c12-6 26 6 24 22-2 14-14 20-24 18S8 46 12 32c2-8 8-12 16-14z" fill="#6c3a9c"/><path d="M24 20c2-6 8-8 12-6 4-2 8 0 9 4-4 0-6 2-8 4-4-2-9-2-13-2z" fill="#2f9e44"/><path d="M36 14l3-8" stroke="#2f9e44" stroke-width="3" stroke-linecap="round"/>` + rosto(32, 36, .9) },
    { id: "limao", nome: "Limão", svg: `<path d="M10 34c0-12 10-20 22-20s22 8 22 20-10 18-22 18-22-6-22-18z" fill="#74b816"/><path d="M8 34l-4 0M56 34h4" stroke="#5c940d" stroke-width="4" stroke-linecap="round"/><path d="M33 14c2-5 8-6 11-4-2 4-7 5-11 4z" fill="#2f9e44"/>` + rosto(32, 34) },
  ];

  function avatarSvg(id, classe) {
    const a = AVATARES.find((x) => x.id === id) || AVATARES[0];
    return `<svg class="avatar ${classe || ""}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${a.svg}</svg>`;
  }

  // Faces do dado, desenhadas.
  const PONTOS = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[26, 26], [50, 50], [74, 74]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]],
    6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
  };
  function dadoSvg(n) {
    const p = (PONTOS[n] || PONTOS[1]).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5"/>`).join("");
    return `<svg class="dado-face" viewBox="0 0 100 100" role="img" aria-label="Dado mostrando ${n}"><rect x="4" y="4" width="92" height="92" rx="20" class="dado-corpo"/><g class="dado-pontos">${p}</g></svg>`;
  }

  window.QuestArte = { icone, CATEGORIAS, CORES, AVATARES, avatarSvg, dadoSvg };
})();
