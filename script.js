if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
// ==================== 🕒 現在時刻の表示 ====================
const dateDisplay = document.getElementById('dateDisplay');
const timeDisplay = document.getElementById('timeDisplay');

function updateTimeDisplay() {
  const now = new Date();
  timeDisplay.textContent = `現在時刻：${now.toLocaleTimeString("ja-JP", { hour12: false })}`;
}
updateTimeDisplay();
setInterval(updateTimeDisplay, 1000);

// ==================== 🌇 時間帯に応じたテーマ変更 ====================
function updateThemeByTime() {
  const hour = new Date().getHours();
  const body = document.body;
  body.classList.remove('morning', 'noon', 'evening', 'night');

  if (hour >= 6 && hour < 12) {
    body.classList.add('morning');
  } else if (hour >= 12 && hour < 18) {
    body.classList.add('noon');
  } else if (hour >= 18 && hour < 22) {
    body.classList.add('evening');
  } else {
    body.classList.add('night');
  }
}
updateThemeByTime();
setInterval(updateThemeByTime, 60 * 60 * 1000);

// ==================== 📅 日付と曜日の取得 ====================
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getWeekday(date) {
  return "日月火水木金土"[date.getDay()];
}
function getPastDates(numDays = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates.reverse();
}

// ==================== 📦 保存・読み込み ====================
function saveDay(dateStr, data) {
  localStorage.setItem(`meds-${dateStr}`, JSON.stringify(data));
}
function loadDay(dateStr) {
  const json = localStorage.getItem(`meds-${dateStr}`);
  return json ? JSON.parse(json) : {};
}

// ==================== 🔘 任意時間フォーム制御 ====================
const addTimeBtn = document.getElementById('addTimeButton');
const addTimeForm = document.getElementById('addTimeForm');
const confirmAddTime = document.getElementById('confirmAddTime');
const newTimeLabelInput = document.getElementById('newTimeLabel');

addTimeBtn.addEventListener('click', () => {
  addTimeForm.style.display = 'block';
  newTimeLabelInput.focus();
});
confirmAddTime.addEventListener('click', () => {
  const label = newTimeLabelInput.value.trim();
  if (!label) return;
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  data.custom = data.custom || [];
  if (!data.custom.find(item => item.label === label)) {
    data.custom.push({ label, taken: false });
  }
  saveDay(dateStr, data);
  newTimeLabelInput.value = '';
  addTimeForm.style.display = 'none';
  render();
});

// ==================== 📋 服薬ボタン表示 ====================
const buttonsDiv = document.querySelector('.buttons');
const customTimesDiv = document.getElementById('customTimes');
const prevDayBtn = document.getElementById('prevDay');
const todayBtn = document.getElementById('today');
const nextDayBtn = document.getElementById('nextDay');
let currentDate = new Date();

prevDayBtn.onclick = () => { currentDate.setDate(currentDate.getDate() - 1); render(); };
todayBtn.onclick = () => { currentDate = new Date(); render(); };
nextDayBtn.onclick = () => { currentDate.setDate(currentDate.getDate() + 1); render(); };

function render() {
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  dateDisplay.textContent = `${formatDate(currentDate)}（${getWeekday(currentDate)}）`;

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

  customTimesDiv.innerHTML = "";
  (data.custom || []).forEach(entry => {
    const btn = document.createElement("button");
    btn.textContent = entry.label;
    btn.className = entry.taken ? "taken" : "not-taken";
    btn.onclick = () => {
      entry.taken = !entry.taken;
      saveDay(dateStr, data);
      render();
    };
    customTimesDiv.appendChild(btn);
  });

  generateRotatedRecordTable();
}

// ==================== 📊 横型記録表（曜日） ====================
function generateRotatedRecordTable() {
  const container = document.getElementById("recordTableContainer");
  container.innerHTML = "";
  const dates = getPastDates(7);
  const dateStrs = dates.map(formatDate);
  const weekdays = dates.map(getWeekday);

  const allTimeLabels = ["朝", "昼", "晩"];
  const customLabelsSet = new Set();
  dateStrs.forEach(dateStr => {
    const data = loadDay(dateStr);
    (data.custom || []).forEach(item => customLabelsSet.add(item.label));
  });
  allTimeLabels.push(...customLabelsSet);

  const table = document.createElement("table");
  table.className = "record-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = "<th>時間＼曜日</th>" + weekdays.map(day => `<th>${day}</th>`).join("");
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  allTimeLabels.forEach(label => {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = label;
    row.appendChild(th);
    dateStrs.forEach(dateStr => {
      const td = document.createElement("td");
      const data = loadDay(dateStr);
      if (["朝", "昼", "晩"].includes(label)) {
        const taken = data[label];
        td.textContent = taken === true ? "○" : taken === false ? "×" : "";
        td.className = taken === true ? "circle" : taken === false ? "cross" : "";
      } else {
        const match = (data.custom || []).find(item => item.label === label);
        td.textContent = match ? (match.taken ? "○" : "×") : "";
        td.className = match ? (match.taken ? "circle" : "cross") : "";
      }
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// ==================== 💖 顔文字ふらし ====================
const emojis = ["(𐊭 ∀ 𐊭ˋ)", "(◦`꒳´◦)", "( ˙꒳˙ )", "( 'ω' و(و\"", "Σd(°∀°d)", "(っ'-')╮ =͟͟͞͞💊"];
function dropEmojis() {
  const emoji = document.createElement("div");
  emoji.className = "kaomoji";
  emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  emoji.style.left = `${Math.random() * 100}vw`;
  emoji.style.fontSize = `${Math.random() * 20 + 24}px`;
  emoji.style.color = `hsl(${Math.random() * 360}, 80%, 70%)`;
  emoji.onclick = () => {
    emoji.style.transition = "all 0.5s ease";
    emoji.style.transform = "translateY(-200px) scale(0.5)";
    emoji.style.opacity = "0";
    setTimeout(() => emoji.remove(), 500);
  };
  document.body.appendChild(emoji);
  setTimeout(() => emoji.remove(), 4000);
}
setInterval(dropEmojis, 600);

render();
}
