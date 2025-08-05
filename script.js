// ==================== 🕒 現在時刻の表示 ====================
const dateDisplay = document.getElementById('dateDisplay');
const timeDisplay = document.getElementById('timeDisplay');

function updateTimeDisplay() {
  const now = new Date();
  const timeText = now.toLocaleTimeString("ja-JP", { hour12: false });
  timeDisplay.textContent = `現在時刻：${timeText}`;
}
updateTimeDisplay();
setInterval(updateTimeDisplay, 1000);

// ==================== 📅 日付フォーマット ====================
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function dateStrToJapanese(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${m}月${d}日`;
}

// ==================== 📦 保存・読み込み ====================
function saveDay(dateStr, data) {
  localStorage.setItem(`meds-${dateStr}`, JSON.stringify(data));
}
function loadDay(dateStr) {
  const json = localStorage.getItem(`meds-${dateStr}`);
  return json ? JSON.parse(json) : {};
}

// ==================== 📋 表示レンダリング ====================
const buttonsDiv = document.querySelector('.buttons');
const customTimesDiv = document.getElementById('customTimes');
const addTimeBtn = document.getElementById('addTimeButton');
const prevDayBtn = document.getElementById('prevDay');
const todayBtn = document.getElementById('today');
const nextDayBtn = document.getElementById('nextDay');

let currentDate = new Date();
render();

function render() {
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  dateDisplay.textContent = dateStrToJapanese(dateStr);

  // 3固定時間（朝・昼・晩）
  buttonsDiv.innerHTML = "";
  ["朝", "昼", "晩"].forEach(time => {
    const btn = document.createElement("button");
    btn.textContent = time;
    btn.className = data[time] ? "taken" : "not-taken";
    btn.onclick = () => {
      data[time] = !data[time];
      saveDay(dateStr, data);
      render();
    };
    buttonsDiv.appendChild(btn);
  });

  // 任意時間
  customTimesDiv.innerHTML = "";
  (data.custom || []).forEach((item, i) => {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.className = item.taken ? "taken" : "not-taken";
    btn.onclick = () => {
      item.taken = !item.taken;
      saveDay(dateStr, data);
      render();
    };
    customTimesDiv.appendChild(btn);
  });
}

// ==================== ➕ 任意の時間追加 ====================
addTimeBtn.onclick = () => {
  const label = prompt("時間帯のラベルを入力してね（例：夜中、寝る前など）");
  if (!label) return;
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  if (!data.custom) data.custom = [];
  data.custom.push({ label, taken: true });
  saveDay(dateStr, data);
  render();
};

// ==================== 📆 日移動 ====================
prevDayBtn.onclick = () => {
  currentDate.setDate(currentDate.getDate() - 1);
  render();
};
todayBtn.onclick = () => {
  currentDate = new Date();
  render();
};
nextDayBtn.onclick = () => {
  currentDate.setDate(currentDate.getDate() + 1);
  render();
};

// ==================== ✨ 顔文字ふらし ====================
const emojis = ["(𐊭 ∀ 𐊭ˋ)", "(◦`꒳´◦)", "( ˙꒳˙ )", "( 'ω' و(و\"", "Σd(°∀°d)"];
function dropEmojis() {
  const emoji = document.createElement("div");
  emoji.className = "kaomoji";
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  // ランダムな位置・サイズ・色
  emoji.style.left = `${Math.random() * 100}vw`;
  emoji.style.fontSize = `${Math.random() * 20 + 24}px`;
  emoji.style.color = `hsl(${Math.random() * 360}, 80%, 70%)`;

  document.body.appendChild(emoji);

  // 4秒後に削除
  setTimeout(() => {
    emoji.remove();
  }, 4000);
}
setInterval(dropEmojis, 600);
