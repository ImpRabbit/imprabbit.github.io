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
setInterval(updateThemeByTime, 60 * 60 * 1000); // 1時間ごとに再判定

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
 // クリックでふわっと消える演出
  emoji.onclick = () => {
    emoji.style.transition = "all 0.5s ease";
    emoji.style.transform = "translateY(-200px) scale(0.5)";
    emoji.style.opacity = "0";
    setTimeout(() => emoji.remove(), 500);
  };
  document.body.appendChild(emoji);

  // 4秒後に削除
  setTimeout(() => {
    emoji.remove();
  }, 4000);
}
setInterval(dropEmojis, 600);
// ==================== 📅 横向き○×履歴表生成 ====================

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

function generateRotatedRecordTable() {
  const tableContainer = document.getElementById("recordTableContainer");
  const dates = getPastDates(7);
  const dateStrs = dates.map(formatDate);
  const dayLabels = dates.map(d => `${d.getDate()}日`);

  // ★ 固定時間帯（朝・昼・晩）
  const timeLabels = ["朝", "昼", "晩"];
  const customLabelsSet = new Set();

  // ★ 任意ラベル集める（7日間分）
  dateStrs.forEach(dateStr => {
    const data = loadDay(dateStr);
    if (data.custom) {
      data.custom.forEach(entry => {
        customLabelsSet.add(entry.label);
      });
    }
  });

  const allTimeLabels = [...timeLabels, ...customLabelsSet];

  // 表作成
  const table = document.createElement("table");
  table.className = "record-table";

  // ヘッダー：1行目（1列目は空、2列目以降に「日」だけ表示）
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const blankTh = document.createElement("th");
  blankTh.textContent = "時間＼日付";
  headRow.appendChild(blankTh);

  dayLabels.forEach(label => {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  // 本文
  const tbody = document.createElement("tbody");

  allTimeLabels.forEach(label => {
    const tr = document.createElement("tr");
    const labelTd = document.createElement("td");
    labelTd.textContent = label;
    tr.appendChild(labelTd);

    dateStrs.forEach(dateStr => {
      const td = document.createElement("td");
      const data = loadDay(dateStr);

      if (["朝", "昼", "晩"].includes(label)) {
        const taken = data[label];
        if (taken === true) {
          td.textContent = "○";
          td.className = "circle";
        } else if (taken === false) {
          td.textContent = "×";
          td.className = "cross";
        } else {
          td.textContent = "";
        }
      } else {
        // 任意ラベル
        const matched = (data.custom || []).find(item => item.label === label);
        if (matched) {
          td.textContent = matched.taken ? "○" : "×";
          td.className = matched.taken ? "circle" : "cross";
        } else {
          td.textContent = "";
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

// 📦 ページ読み込み時に実行
generateRotatedRecordTable();
