/* Quest · sons curtos gerados no próprio navegador (sem arquivos de áudio). */
(function () {
  "use strict";
  let ctx = null;
  let ligado = true;

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function nota(freq, inicio, dur, tipo, volume) {
    const c = contexto();
    if (!c) return;
    const t = c.currentTime + inicio;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = tipo || "triangle";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume || 0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  const EFEITOS = {
    toque() { nota(660, 0, 0.06, "sine", 0.08); },
    dado() { for (let i = 0; i < 7; i++) nota(180 + Math.random() * 260, i * 0.075, 0.05, "square", 0.05); },
    acerto() { nota(660, 0, 0.14); nota(880, 0.11, 0.14); nota(1320, 0.22, 0.26); },
    erro() { nota(320, 0, 0.18, "sawtooth", 0.08); nota(220, 0.16, 0.3, "sawtooth", 0.08); },
    passo() { nota(520, 0, 0.05, "sine", 0.07); },
    vitoria() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => nota(f, i * 0.12, 0.22, "triangle", 0.16)); },
    alerta() { nota(990, 0, 0.08, "sine", 0.07); },
  };

  window.QuestSom = {
    tocar(nome) {
      if (!ligado || !EFEITOS[nome]) return;
      try { EFEITOS[nome](); } catch (e) { /* som é opcional */ }
    },
    definir(valor) { ligado = !!valor; },
    get ligado() { return ligado; },
  };
})();
