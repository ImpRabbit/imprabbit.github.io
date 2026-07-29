/**
 * Interactive chess board UI
 * Depends on chess.js (global Chess)
 */
class ChessBoardUI {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.game = new Chess();
    this.selectedSquare = null;
    this.orientation = options.orientation || "white";
    this.onMove = options.onMove || null;
    this.playerColor = options.playerColor || "w";
    this.locked = false;
    this.pieceUnicode = {
      wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
      bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟"
    };
    this.render();
  }
  squareToIndices(square) {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1], 10) - 1;
    return { file, rank };
  }
  indicesToSquare(file, rank) {
    return String.fromCharCode(97 + file) + (rank + 1);
  }
  render() {
    this.container.innerHTML = "";
    this.container.classList.add("board");
    const board = this.game.board();
    const flipped = this.orientation === "black";
    for (let visualRow = 0; visualRow < 8; visualRow++) {
      for (let visualCol = 0; visualCol < 8; visualCol++) {
        let file, rank;
        if (flipped) { file = 7 - visualCol; rank = visualRow; }
        else { file = visualCol; rank = 7 - visualRow; }
        const squareName = this.indicesToSquare(file, rank);
        const piece = board[7 - rank][file];
        const sq = document.createElement("div");
        sq.classList.add("square");
        sq.dataset.square = squareName;
        const isLight = (file + rank) % 2 === 1;
        sq.classList.add(isLight ? "light" : "dark");
        if ((!flipped && file === 0) || (flipped && file === 7)) {
          const coord = document.createElement("span");
          coord.className = "coord coord-rank";
          coord.textContent = rank + 1;
          sq.appendChild(coord);
        }
        if ((!flipped && rank === 0) || (flipped && rank === 7)) {
          const coord = document.createElement("span");
          coord.className = "coord coord-file";
          coord.textContent = String.fromCharCode(97 + file);
          sq.appendChild(coord);
        }
        if (piece) {
          const code = piece.color + piece.type.toUpperCase();
          const span = document.createElement("span");
          span.className = piece.color === "w" ? "piece-w" : "piece-b";
          span.textContent = this.pieceUnicode[code];
          sq.appendChild(span);
        }
        sq.addEventListener("click", () => this.handleClick(squareName));
        this.container.appendChild(sq);
      }
    }
  }
  handleClick(square) {
    if (this.locked) return;
    if (this.game.turn() !== this.playerColor) return;
    if (this.selectedSquare) {
      const move = this.game.move({ from: this.selectedSquare, to: square, promotion: "q" });
      if (move) {
        this.selectedSquare = null;
        this.clearHighlights();
        this.render();
        if (this.onMove) this.onMove(move);
        return;
      }
      const piece = this.game.get(square);
      if (piece && piece.color === this.playerColor) { this.selectSquare(square); return; }
      this.selectedSquare = null;
      this.clearHighlights();
      return;
    }
    const piece = this.game.get(square);
    if (piece && piece.color === this.playerColor) this.selectSquare(square);
  }
  selectSquare(square) {
    this.selectedSquare = square;
    this.clearHighlights();
    const el = this.container.querySelector(`[data-square="${square}"]`);
    if (el) el.classList.add("selected");
    const moves = this.game.moves({ square, verbose: true });
    moves.forEach(m => {
      const target = this.container.querySelector(`[data-square="${m.to}"]`);
      if (target) {
        target.classList.add("possible");
        if (m.captured) target.classList.add("has-piece");
      }
    });
  }
  clearHighlights() {
    this.container.querySelectorAll(".selected, .possible, .has-piece").forEach(el => {
      el.classList.remove("selected", "possible", "has-piece");
    });
  }
  reset() { this.game.reset(); this.selectedSquare = null; this.render(); }
  loadFen(fen) { this.game.load(fen); this.selectedSquare = null; this.render(); }
  fen() { return this.game.fen(); }
  turn() { return this.game.turn(); }
  isGameOver() {
    if (typeof this.game.isGameOver === "function") return this.game.isGameOver();
    if (typeof this.game.game_over === "function") return this.game.game_over();
    return this.isCheckmate() || this.isDraw();
  }
  isCheck() {
    if (typeof this.game.isCheck === "function") return this.game.isCheck();
    if (typeof this.game.in_check === "function") return this.game.in_check();
    if (typeof this.game.inCheck === "function") return this.game.inCheck();
    return false;
  }
  isCheckmate() {
    if (typeof this.game.isCheckmate === "function") return this.game.isCheckmate();
    if (typeof this.game.in_checkmate === "function") return this.game.in_checkmate();
    return false;
  }
  isDraw() {
    if (typeof this.game.isDraw === "function") return this.game.isDraw();
    if (typeof this.game.in_draw === "function") return this.game.in_draw();
    return false;
  }
  setLocked(v) {
    this.locked = !!v;
    if (this.locked) { this.selectedSquare = null; this.clearHighlights(); }
  }
  history() { return this.game.history({ verbose: true }); }
  undo() { this.game.undo(); this.selectedSquare = null; this.render(); }
  setOrientation(color) { this.orientation = color; this.render(); }
  flip() { this.orientation = this.orientation === "white" ? "black" : "white"; this.render(); }
}
window.ChessBoardUI = ChessBoardUI;
