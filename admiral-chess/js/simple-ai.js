function chessIsCheckmate(g) {
  if (typeof g.isCheckmate === "function") return g.isCheckmate();
  if (typeof g.in_checkmate === "function") return g.in_checkmate();
  return false;
}
function chessIsDraw(g) {
  if (typeof g.isDraw === "function") return g.isDraw();
  if (typeof g.in_draw === "function") return g.in_draw();
  return false;
}
function chessIsGameOver(g) {
  if (typeof g.isGameOver === "function") return g.isGameOver();
  if (typeof g.game_over === "function") return g.game_over();
  return chessIsCheckmate(g) || chessIsDraw(g);
}
class SimpleChessAI {
  constructor(depth = 2) { this.depth = depth; }
  pieceValue = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  positionBonus = {
    p: [[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
    n: [[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
    b: [[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,10,10,10,10,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
    r: [[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
    q: [[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
    k: [[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
  };
  evaluate(game) {
    if (chessIsCheckmate(game)) return game.turn() === "w" ? -99999 : 99999;
    if (chessIsDraw(game)) return 0;
    let score = 0;
    const board = game.board();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (!piece) continue;
        const value = this.pieceValue[piece.type] || 0;
        let bonus = 0;
        if (this.positionBonus[piece.type]) {
          const r = piece.color === "w" ? rank : 7 - rank;
          bonus = this.positionBonus[piece.type][r][file] || 0;
        }
        const total = value + bonus;
        score += piece.color === "w" ? total : -total;
      }
    }
    return score;
  }
  minimax(game, depth, maximizingPlayer) {
    if (depth === 0 || chessIsGameOver(game)) return this.evaluate(game);
    const moves = game.moves({ verbose: true });
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = this.minimax(game, depth - 1, false);
        game.undo();
        if (evalScore > maxEval) maxEval = evalScore;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = this.minimax(game, depth - 1, true);
        game.undo();
        if (evalScore < minEval) minEval = evalScore;
      }
      return minEval;
    }
  }
  getBestMove(game) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    let bestMove = null;
    let bestValue = Infinity;
    const shuffled = moves.sort(() => Math.random() - 0.5);
    for (const move of shuffled) {
      game.move(move);
      const value = this.minimax(game, this.depth - 1, true);
      game.undo();
      if (value < bestValue) { bestValue = value; bestMove = move; }
    }
    return bestMove;
  }
  setDepth(depth) { this.depth = Math.max(1, Math.min(3, depth)); }
}
window.SimpleChessAI = SimpleChessAI;
