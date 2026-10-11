/* Quest · recebe as perguntas dos arquivos de cada assunto e confere se estão certas.
   Uma pergunta com problema é ignorada (o jogo continua) e o motivo aparece no console
   do navegador. Para conferir tudo de uma vez: node testes/validar-perguntas.js */
(function () {
  "use strict";
  const CATEGORIAS = ["geral", "natureza", "ciencia", "historia", "geografia", "cinema", "esportes", "curiosidades"];
  const DIFICULDADES = ["facil", "media", "dificil"];
  const lista = (window.QUEST_PERGUNTAS = window.QUEST_PERGUNTAS || []);
  const problemas = (window.QUEST_PROBLEMAS = window.QUEST_PROBLEMAS || []);
  const ids = new Set();
  const texto = (v) => typeof v === "string" && v.trim() !== "";

  function conferir(q) {
    if (!q || typeof q !== "object") return "não é um bloco { ... }";
    if (!texto(q.id)) return "falta o id";
    if (ids.has(q.id)) return "id repetido";
    if (!CATEGORIAS.includes(q.categoria)) return `categoria "${q.categoria}" não existe (use: ${CATEGORIAS.join(", ")})`;
    if (!DIFICULDADES.includes(q.dificuldade)) return `dificuldade "${q.dificuldade}" não existe (use: ${DIFICULDADES.join(", ")})`;
    if (!texto(q.enunciado)) return "falta o enunciado";
    if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4) return "precisa de exatamente 4 alternativas";
    if (!q.alternativas.every(texto)) return "tem alternativa vazia";
    if (new Set(q.alternativas.map((a) => a.trim())).size !== 4) return "tem alternativas repetidas";
    if (!texto(q.correta)) return "falta a resposta correta";
    if (!q.alternativas.some((a) => a.trim() === q.correta.trim())) return `a resposta correta "${q.correta}" não é igual a nenhuma alternativa`;
    if (!texto(q.explicacao)) return "falta a explicação";
    return null;
  }

  window.adicionarPerguntas = function (perguntas) {
    (perguntas || []).forEach((q, i) => {
      const erro = conferir(q);
      if (erro) {
        const nome = (q && q.id) || `pergunta nº ${i + 1} do arquivo`;
        problemas.push(`${nome}: ${erro}`);
        if (window.console) console.warn(`[Quest] Pergunta ignorada. ${nome}: ${erro}`);
        return;
      }
      ids.add(q.id);
      const alternativas = q.alternativas.map((a) => a.trim());
      lista.push({
        id: q.id,
        categoria: q.categoria,
        dificuldade: q.dificuldade,
        enunciado: q.enunciado.trim(),
        alternativas,
        correta: alternativas.indexOf(q.correta.trim()),
        explicacao: q.explicacao.trim(),
      });
    });
  };
})();
