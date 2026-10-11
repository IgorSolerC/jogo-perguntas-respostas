// Confere todos os arquivos de perguntas e mostra quantas há em cada assunto e nível.
// Uso: node testes/validar-perguntas.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const pasta = path.join(__dirname, "..", "data", "perguntas");
const contexto = { window: {}, console: { warn() {} } };
contexto.window.console = contexto.console;
vm.createContext(contexto);
vm.runInContext(fs.readFileSync(path.join(pasta, "carregar.js"), "utf8"), contexto);
contexto.adicionarPerguntas = contexto.window.adicionarPerguntas;

let erroDeArquivo = false;
for (const arquivo of fs.readdirSync(pasta).filter((f) => f.endsWith(".js") && f !== "carregar.js").sort()) {
  try {
    vm.runInContext(fs.readFileSync(path.join(pasta, arquivo), "utf8"), contexto, { filename: arquivo });
  } catch (e) {
    erroDeArquivo = true;
    const linha = (e.stack || "").match(new RegExp(arquivo.replace(".", "\\.") + ":(\\d+)"));
    console.log(`✗ ${arquivo}${linha ? " (linha " + linha[1] + ")" : ""}: o arquivo inteiro não carregou. ${e.message}`);
    console.log("  Dica: confira vírgulas no fim de cada linha, aspas fechadas e as chaves { }.");
  }
}

const perguntas = contexto.window.QUEST_PERGUNTAS || [];
const problemas = contexto.window.QUEST_PROBLEMAS || [];
problemas.forEach((p) => console.log("✗ " + p));

const cats = ["geral", "natureza", "ciencia", "historia", "geografia", "cinema", "esportes", "curiosidades"];
const difs = ["facil", "media", "dificil"];
console.log("\nassunto        fácil  média  difícil");
for (const c of cats) {
  const n = difs.map((d) => perguntas.filter((q) => q.categoria === c && q.dificuldade === d).length);
  console.log(c.padEnd(14) + n.map((x) => String(x).padStart(6)).join(" "));
}
console.log(`\nTotal: ${perguntas.length} perguntas válidas.`);
if (problemas.length || erroDeArquivo) {
  console.log(`${problemas.length} pergunta(s) com problema${erroDeArquivo ? " e arquivo(s) que não carregaram" : ""}. Corrija e rode de novo.`);
  process.exit(1);
}
console.log("Tudo certo.");
