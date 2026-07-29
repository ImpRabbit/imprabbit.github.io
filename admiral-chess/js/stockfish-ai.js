/**
 * Stockfish AI wrapper for browser
 */
class StockfishAI {
  constructor(options = {}) {
    this.skill = options.skill || 10;
    this.movetime = options.movetime || 900;
    this.worker = null;
    this.ready = false;
    this.pendingResolve = null;
    this.fallback = null;
    this.useFallback = false;
    this._init();
  }
  _init() {
    try {
      const workerUrl = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/0.10.2/stockfish.js";
      this.worker = new Worker(workerUrl);
      this.worker.onmessage = (e) => {
        const line = e.data;
        if (typeof line !== "string") return;
        if (line === "readyok") this.ready = true;
        if (line.startsWith("bestmove")) {
          const parts = line.split(" ");
          const best = parts[1];
          if (this.pendingResolve && best && best !== "(none)") {
            this.pendingResolve(best);
            this.pendingResolve = null;
          }
        }
      };
      this.worker.onerror = () => { this._enableFallback(); };
      this.worker.postMessage("uci");
      this.worker.postMessage("isready");
      setTimeout(() => { if (!this.ready) this._enableFallback(); }, 5000);
    } catch (err) {
      this._enableFallback();
    }
  }
  _enableFallback() {
    this.useFallback = true;
    if (window.SimpleChessAI) this.fallback = new SimpleChessAI(2);
  }
  setSkill(level) { this.skill = Math.max(0, Math.min(20, level)); }
  getBestMoveUCI(fen) {
    return new Promise((resolve) => {
      if (this.useFallback || !this.worker || !this.ready) {
        if (this.fallback && window.Chess) {
          const g = new Chess(fen);
          const move = this.fallback.getBestMove(g);
          if (move) { resolve(move.from + move.to + (move.promotion || "")); return; }
        }
        resolve(null);
        return;
      }
      this.pendingResolve = resolve;
      this.worker.postMessage("ucinewgame");
      this.worker.postMessage("position fen " + fen);
      this.worker.postMessage("setoption name Skill Level value " + this.skill);
      this.worker.postMessage("go movetime " + this.movetime);
    });
  }
  async playMove(boardUI) {
    const fen = boardUI.fen();
    const uci = await this.getBestMoveUCI(fen);
    if (!uci || uci.length < 4) return null;
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : "q";
    const move = boardUI.game.move({ from, to, promotion });
    if (move) boardUI.render();
    return move;
  }
  destroy() {
    if (this.worker) { this.worker.terminate(); this.worker = null; }
  }
}
window.StockfishAI = StockfishAI;
