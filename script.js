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

// ==================== 📅 日付と記録表示 ====================
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
  dateDisplay.textContent = dateStrToJapanese(dateStr);
  const dayData = loadDay(dateStr);

  const defaultTimes = ['morning', 'noon', 'evening'];
  buttonsDiv.innerHTML = '';
  defaultTimes.forEach(t => {
    const btn = document.createElement('button');
    btn.dataset.time = t;
    btn.textContent = label(t);
    btn.className = dayData[t] ? 'taken' : 'not-taken';
    btn.onclick = () => toggleTime(t);
    buttonsDiv.appendChild(btn);
  });

  customTimesDiv.innerHTML = '';
  (dayData.custom || []).forEach(timeObj => {
    const btn = document.createElement('button');
    btn.dataset.time = timeObj.name;
    btn.textContent = timeObj.name;
    btn.className = timeObj.taken ? 'taken' : 'not-taken';
    btn.onclick = () => toggleCustom(timeObj.name);
    customTimesDiv.appendChild(btn);
  });

  updateNav();
}

function label(key) {
  const map = { morning: '朝', noon: '昼', evening: '晩' };
  return map[key] || key;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function dateStrToJapanese(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

function loadDay(dateStr) {
  const records = JSON.parse(localStorage.getItem('medRecords') || '{}');
  return records[dateStr] || { custom: [] };
}

function saveDay(dateStr, data) {
  const records = JSON.parse(localStorage.getItem('medRecords') || '{}');
  records[dateStr] = data;
  localStorage.setItem('medRecords', JSON.stringify(records));
}

function toggleTime(key) {
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  data[key] = !data[key];
  saveDay(dateStr, data);
  render();
}

function toggleCustom(name) {
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  const idx = data.custom.findIndex(x => x.name === name);
  if (idx >= 0) {
    data.custom[idx].taken = !data.custom[idx].taken;
    saveDay(dateStr, data);
    render();
  }
}

addTimeBtn.onclick = () => {
  const name = prompt('追加する時間帯の名前を入力');
  if (!name) return;
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  if (data.custom.some(x => x.name === name)) {
    alert('同じ名前が既にあります');
    return;
  }
  data.custom.push({ name, taken: true });
  saveDay(dateStr, data);
  render();
};

prevDayBtn.onclick = () => {
  currentDate.setDate(currentDate.getDate() - 1);
  render();
};
nextDayBtn.onclick = () => {
  currentDate.setDate(currentDate.getDate() + 1);
  render();
};
todayBtn.onclick = () => {
  currentDate = new Date();
  render();
};

function updateNav() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFuture = currentDate > today;
  nextDayBtn.disabled = isFuture;
}

// ==================== 🌈 顔文字アニメーション ====================
const emojis = ["(𐊭 ∀ 𐊭ˋ)", "(◦`꒳´◦)", "( ˙꒳˙ )", "( 'ω' و(و\"", "Σd(°∀°d)"];

function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

function dropEmojis() {
  const count = Math.floor(Math.random() * 10) + 2;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const emoji = document.createElement("div");
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.className = "kaomoji";

      const left = Math.floor(Math.random() * window.innerWidth);
      emoji.style.left = `${left}px`;
      emoji.style.top = `0px`;
      emoji.style.color = randomColor();
      emoji.style.fontSize = `${Math.floor(Math.random() * 24) + 24}px`;
      emoji.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;

      document.body.appendChild(emoji);

      setTimeout(() => {
        emoji.remove();
      }, 4000);
    }, i * 100);
  }
}

// 常時降るように修正（0.5秒ごと）
function scheduleDrop() {
  dropEmojis();
  setTimeout(scheduleDrop, 500);
}

scheduleDrop();

// ==================== 🌇 時間帯で背景・文字色を変える ====================
function updateBackgroundTheme() {
  const hour = new Date().getHours();
  const body = document.body;

  if (hour >= 5 && hour < 17) {
    // 朝〜昼（5:00〜16:59）
    body.style.backgroundColor = "#ffffff";
    body.style.color = "#000000";
  } else if (hour >= 17 && hour < 19) {
    // 夕方（17:00〜18:59）
    body.style.backgroundColor = "#ffe0b2";
    body.style.color = "#000000";
  } else {
    // 夜（19:00〜翌4:59）
    body.style.backgroundColor = "#1a237e";
    body.style.color = "#ffffff";
  }
}

updateBackgroundTheme();
setInterval(updateBackgroundTheme, 60000); // 毎分更新
