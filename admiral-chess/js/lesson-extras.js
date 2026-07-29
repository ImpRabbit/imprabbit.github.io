(function () {
  function addFlipButton() {
    const board = document.getElementById("board");
    if (!board || document.getElementById("btn-flip-board")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-flip-board";
    btn.className = "btn";
    btn.textContent = "盤面を反転";
    btn.style.marginTop = "8px";
    btn.addEventListener("click", () => {
      if (window.__lessonBoard && typeof window.__lessonBoard.flip === "function") {
        window.__lessonBoard.flip();
      } else if (window.board && typeof window.board.flip === "function") {
        window.board.flip();
      }
    });
    const wrapper = board.closest(".board-wrapper") || board.parentElement;
    if (wrapper && wrapper.parentElement) wrapper.insertAdjacentElement("afterend", btn);
    else board.insertAdjacentElement("afterend", btn);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addFlipButton);
  else addFlipButton();
})();
