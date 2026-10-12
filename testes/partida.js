// Teste de ponta a ponta: uma partida completa no Chromium, celular em pé.
const { chromium, devices } = require('playwright');
const URL = process.env.QUEST_URL || 'http://localhost:8000/';
const out = process.argv[2] || require('os').tmpdir();
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'], viewport: { width: 375, height: 740 } });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  const P = () => page.evaluate(() => JSON.parse(JSON.stringify(window.Quest.partida)));
  const clicar = async (sel, espera = 250) => { await page.click(sel); await page.waitForTimeout(espera); };
  let n = 0;
  const foto = async (nome, full) => page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${nome}.png`, fullPage: !!full });

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);

  console.log('Configuração');
  await clicar('[data-acao=comecar]');
  await clicar('[data-acao=menos]'); // 3 pessoas
  await clicar('[data-acao=avancar-passo]');
  const nomes = ['Vó Lúcia', 'Pedro', 'Ana'];
  for (let i = 0; i < 3; i++) await page.fill(`[data-nome="${i}"]`, nomes[i]);
  // troca de cor por cima da cor de outra pessoa → as duas trocam
  await clicar('[data-acao=editar-ficha][data-i="0"]', 500);
  await clicar('[data-acao=escolher-cor][data-v=laranja]');
  await clicar('[data-acao=escolher-avatar][data-v=milho]');
  await clicar('.folha [data-acao=fechar-folha]');
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=dificuldade][data-i="1"][data-v=facil]');
  await clicar('[data-acao=dificuldade][data-i="0"][data-v=dificil]');
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=todos-assuntos]');
  ok(await page.isDisabled('[data-acao=avancar-passo]'), 'sem assuntos não deixa continuar');
  await clicar('[data-acao=todos-assuntos]');
  await clicar('[data-acao=assunto][data-v=esportes]'); // tira esportes
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=tabuleiro][data-v=rapido]');
  await clicar('[data-acao=avancar-passo]');
  ok(await page.getAttribute('[data-acao=tempo][data-v="0"]', 'aria-checked') === 'true', 'sem cronômetro vem marcado');
  await clicar('[data-acao=avancar-passo]', 600);
  let p = await P();
  ok(p.jogadores.length === 3, '3 participantes');
  ok(p.casas.length === 18, 'tabuleiro rápido tem 18 casas');
  ok(!p.config.categorias.includes('esportes') && p.casas.every(c => c.categoria !== 'esportes'), 'esportes ficou fora');
  const lucia = p.jogadores.find(j => j.nome === 'Vó Lúcia');
  const pedro = p.jogadores.find(j => j.nome === 'Pedro');
  ok(lucia.cor === 'laranja' && pedro.cor === 'vermelho', 'cores trocaram entre Lúcia e Pedro');
  ok(lucia.dificuldade === 'dificil' && pedro.dificuldade === 'facil', 'dificuldade por pessoa');
  ok(new Set(p.jogadores.map(j => j.cor)).size === 3 && new Set(p.jogadores.map(j => j.avatar)).size === 3, 'cores e avatares distintos');
  ok(await page.isVisible('text=Como jogar'), 'resumo das regras aparece');
  await clicar('[data-acao=iniciar-partida]', 700);

  const vistas = {};
  async function jogarTurno(modo) {
    // modo: 'certo' | 'errado'
    const antes = await P();
    const quem = antes.jogadores.find(j => j.id === antes.ordem[antes.vez]);
    ok(await page.isVisible(`text=Passe o celular para`) && await page.isVisible(`.passe-nome:has-text("${quem.nome}")`), `passe o celular para ${quem.nome}`);
    ok(await page.locator('.enunciado, .veredito, .revisao').count() === 0, 'tela de troca esconde pergunta e resultado anteriores');
    await clicar('[data-acao=iniciar-turno]', 400);
    await clicar('[data-acao=lancar]', 1300);
    let p1 = await P();
    const t = p1.turno;
    ok(t.fase === 'dado' && t.dado >= 1 && t.dado <= 6, `dado ${t.dado}, destino ${t.destino}`);
    ok(t.destino === Math.min(quem.posicao + t.dado, 17), 'destino = posição + dado, limitado à chegada');
    ok(t.pergunta.dificuldade === quem.dificuldade, 'pergunta na dificuldade da pessoa');
    if (!t.chegada) ok(t.categoria === p1.casas[t.destino].categoria, 'pergunta da categoria da casa destino');
    const chave = t.categoria + '|' + t.pergunta.dificuldade;
    vistas[chave] = vistas[chave] || [];
    ok(!vistas[chave].includes(t.pergunta.id) || vistas[chave].length >= 8, `pergunta ${t.pergunta.id} não repetida`);
    vistas[chave].push(t.pergunta.id);
    await clicar('[data-acao=ver-pergunta]', 400);
    ok(await page.locator('.alt').count() === 4, 'quatro alternativas');
    ok(await page.isDisabled('[data-acao=confirmar]'), 'confirmar bloqueado sem escolha');
    const certa = t.pergunta.correta;
    const errada = (certa + 1) % 4;
    await clicar(`.alt >> nth=${errada}`);
    await clicar(`.alt >> nth=${modo === 'certo' ? certa : errada}`); // pode trocar antes de confirmar
    await clicar('[data-acao=confirmar]', 400);
    const p2 = await P();
    const eu = p2.jogadores.find(j => j.id === quem.id);
    ok(eu.respondidas === quem.respondidas + 1, 'conta a resposta');
    if (modo === 'certo') ok(eu.posicao === t.destino && eu.acertos === quem.acertos + 1, `acertou e foi para ${t.destino}`);
    else ok(eu.posicao === quem.posicao, 'errou e ficou no lugar');
    ok(await page.locator('.explicacao').isVisible(), 'mostra explicação');
    ok(await page.locator('.rev-alt.certa').count() === 1, 'mostra a alternativa correta');
    await page.waitForTimeout(t.dado * 280 + 900);
    return { quem, t, venceu: !!p2.vencedor };
  }

  console.log('Turno 1: erro');
  await jogarTurno('errado');
  await foto('resultado-erro');
  await clicar('[data-acao=encerrar-turno]', 700);
  console.log('Turno 2: acerto');
  await jogarTurno('certo');
  await foto('resultado-acerto');
  await clicar('[data-acao=encerrar-turno]', 700);

  console.log('Turno 3: atualizar a página no meio da pergunta');
  await clicar('[data-acao=iniciar-turno]', 400);
  await clicar('[data-acao=lancar]', 1300);
  await clicar('[data-acao=ver-pergunta]', 400);
  const antesReload = await P();
  await clicar('.alt >> nth=0');
  await page.reload(); await page.waitForTimeout(600);
  ok(await page.isVisible('[data-acao=continuar]'), 'oferece "Continuar partida"');
  await foto('inicio-continuar');
  await clicar('[data-acao=continuar]', 700);
  ok(await page.isVisible('text=Partida recuperada'), 'pede para passar o celular antes de mostrar a pergunta');
  ok(await page.locator('.enunciado').count() === 0, 'pergunta escondida até confirmar a pessoa');
  await clicar('[data-acao=iniciar-turno]', 400);
  const depoisReload = await P();
  ok(depoisReload.turno.pergunta.id === antesReload.turno.pergunta.id && depoisReload.turno.dado === antesReload.turno.dado, 'mesma pergunta e mesmo dado depois de atualizar');
  ok(await page.isVisible('.enunciado'), 'volta direto para a pergunta');
  await clicar(`.alt >> nth=${depoisReload.turno.pergunta.correta}`);
  await clicar('[data-acao=confirmar]', 400);
  const resp = (await P()).jogadores.map(j => j.respondidas);
  await page.reload(); await page.waitForTimeout(500);
  await clicar('[data-acao=continuar]', 600);
  await clicar('[data-acao=iniciar-turno]', 500);
  ok(await page.isVisible('.veredito') && await page.locator('.alt input').count() === 0, 'depois de responder, atualizar mostra o resultado e não a pergunta');
  ok(JSON.stringify((await P()).jogadores.map(j => j.respondidas)) === JSON.stringify(resp), 'não deixa responder duas vezes');
  await clicar('[data-acao=encerrar-turno]', 700);

  console.log('Placar no meio da partida');
  await clicar('[data-acao=menu]', 500);
  ok(await page.locator('.placar-lista li').count() === 3, 'placar com ordem, posição e acertos');
  await foto('placar');
  await clicar('[data-acao=ver-tabuleiro]', 500);
  await foto('tabuleiro-folha');
  await clicar('.folha [data-acao=fechar-folha]', 300);

  console.log('Jogando até alguém chegar');
  let fim = false, rodadas = 0;
  while (!fim && rodadas < 60) {
    const r = await jogarTurno('certo');
    rodadas++;
    if (r.t.chegada) ok(r.venceu, 'acertar a pergunta da chegada vence');
    if (r.venceu) await foto('vitoria-resultado');
    await clicar('[data-acao=encerrar-turno]', 1200);
    fim = r.venceu;
  }
  ok(fim, 'partida terminou');
  p = await P();
  ok(p.fase === 'fim', 'fase fim');
  ok(await page.isVisible('.fim-topo h1:has-text("venceu")'), 'comemoração com o nome de quem venceu');
  ok(await page.locator('.classif tbody tr').count() === 3, 'classificação com todo mundo');
  await page.waitForTimeout(400);
  await foto('fim');
  await foto('fim-full', true);

  console.log('Jogar de novo com o mesmo grupo');
  const usadasAntes = JSON.stringify(p.usadas);
  await clicar('[data-acao=revanche]', 600);
  p = await P();
  ok(p.jogadores.every(j => j.posicao === 0 && j.acertos === 0 && j.respondidas === 0), 'todos de volta à largada');
  ok(JSON.stringify(p.usadas) === usadasAntes, 'perguntas já feitas continuam guardadas');
  ok(p.jogadores.map(j => j.nome).sort().join() === nomes.slice().sort().join(), 'mesmo grupo');
  await clicar('[data-acao=iniciar-partida]', 700);
  ok(await page.isVisible('text=Passe o celular para'), 'nova partida começa');

  console.log('Nova partida a partir do menu de fim: forçando fim');
  // termina rápido: coloca alguém perto da chegada
  await page.evaluate(() => { const p = window.Quest.partida; p.jogadores.find(j => j.id === p.ordem[p.vez]).posicao = 16; });
  const r = await jogarTurno('certo');
  ok(r.t.chegada && r.venceu, 'chegada sem precisar de número exato');
  await clicar('[data-acao=encerrar-turno]', 1200);
  await clicar('[data-acao=nova-partida]', 500);
  ok(await page.isVisible('text=Quantas pessoas vão jogar?'), '"Criar uma nova partida" volta para a configuração');
  ok(await page.evaluate(() => localStorage.getItem('quest.partida.v1') === null), 'partida anterior apagada');

  console.log('Partida grande: 12 pessoas, tabuleiro longo, cronômetro');
  for (let i = 0; i < 9; i++) await clicar('[data-acao=mais]', 60);
  await clicar('[data-acao=avancar-passo]');
  await foto('doze-nomes', true);
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=tabuleiro][data-v=longo]');
  await clicar('[data-acao=avancar-passo]');
  await clicar('[data-acao=tempo][data-v="30"]');
  await clicar('[data-acao=avancar-passo]', 600);
  p = await P();
  ok(p.jogadores.length === 12 && p.casas.length === 42 && p.config.tempo === 30, '12 pessoas, 42 casas, 30 s');
  ok(new Set(p.jogadores.map(j => j.cor)).size === 12 && new Set(p.jogadores.map(j => j.avatar)).size === 12, '12 cores e 12 avatares diferentes');
  await clicar('[data-acao=iniciar-partida]', 700);
  await clicar('[data-acao=iniciar-turno]', 500);
  await foto('doze-largada');
  // empilha várias pessoas na mesma casa para ver se dá para identificar
  await page.evaluate(() => { const p = window.Quest.partida; p.jogadores.forEach((j, i) => { j.posicao = i < 7 ? 3 : i < 9 ? 5 : 0; }); });
  await clicar('[data-acao=menu]', 300); await clicar('.folha [data-acao=fechar-folha]', 300); // redesenha
  await foto('doze-empilhados');
  await clicar('.casa[data-casa="3"]', 500);
  ok(await page.locator('.quem-na-casa > div').count() === 7, 'tocar na casa lista quem está nela');
  await foto('casa-detalhe');
  await clicar('.folha [data-acao=fechar-folha]', 300);

  console.log('Cronômetro');
  await clicar('[data-acao=lancar]', 1300);
  ok((await P()).turno.restanteMs === 30000, 'tempo não corre antes de a pergunta aparecer');
  await page.waitForTimeout(1500);
  ok((await P()).turno.restanteMs === 30000, 'tempo parado na tela do dado');
  await clicar('[data-acao=ver-pergunta]', 1600);
  const r1 = (await P()).turno.restanteMs;
  ok(r1 < 29500, `tempo corre com a pergunta na tela (${Math.round(r1)} ms)`);
  // segundo plano
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  const h1 = (await P()).turno.restanteMs;
  await page.waitForTimeout(1500);
  const h2 = (await P()).turno.restanteMs;
  ok(Math.abs(h2 - h1) < 1, 'tempo pausa com o navegador em segundo plano');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await foto('pergunta-cronometro');
  await page.evaluate(() => { window.Quest.partida.turno.restanteMs = 1200; });
  await page.waitForTimeout(2200);
  const pt = await P();
  ok(pt.turno.fase === 'resultado' && pt.turno.resposta.tempoEsgotado && !pt.turno.resposta.correta, 'tempo esgotado conta como erro');
  ok(await page.isVisible('text=Tempo esgotado'), 'mostra "Tempo esgotado"');
  await foto('tempo-esgotado');

  console.log('Caminhos relativos e erros');
  ok(erros.length === 0, 'sem erros no console ' + JSON.stringify(erros));
  console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTUDO CERTO');
  await browser.close();
  process.exit(falhas ? 1 : 0);
})();
