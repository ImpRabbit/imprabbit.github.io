// 顔文字たち
const emojis = ["(𐊭 ∀ 𐊭ˋ)", "(◦`꒳´◦)", "( ˙꒳˙ )", "( 'ω' و(و\"", "Σd(°∀°d)"];

// ランダムな色生成関数
function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

// 顔文字をふわふわ降らせる関数（完全ランダム）
function dropEmojis() {
  const count = Math.floor(Math.random() * 10) + 2; // 2〜11個ランダム

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const emoji = document.createElement("div");
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.className = "kaomoji";

      const left = Math.floor(Math.random() * window.innerWidth);
      emoji.style.left = `${left}px`;
      emoji.style.top = `0px`;
      emoji.style.color = randomColor();
      emoji.style.fontSize = `${Math.floor(Math.random() * 24) + 24}px`; // サイズランダム（24〜48px）
      emoji.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`; // 回転ランダム

      document.body.appendChild(emoji);

      setTimeout(() => {
        emoji.remove();
      }, 4000);
    }, i * 150); // ちょっとずつタイミングずらして落とす
  }
}

// ランダムなタイミングで dropEmojis を呼び続ける関数
function scheduleDrop() {
  const delay = Math.random() * 3000 + 1000; // 1〜4秒の間でランダムに実行
  setTimeout(() => {
    dropEmojis();   // 顔文字出す
    scheduleDrop(); // 再帰的に次のスケジュール
  }, delay);
}

// 最初の1回だけ起動！
scheduleDrop();
