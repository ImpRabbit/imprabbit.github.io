// Medication Tracker
const dateDisplay = document.getElementById('dateDisplay');
function updateTimeDisplay() {
  const timeElement = document.getElementById("timeDisplay");
  const now = new Date();
  const timeText = now.toLocaleTimeString("ja-JP", { hour12: false });
  timeElement.textContent = `現在時刻：${timeText}`;
}

// 最初に1回表示
updateTimeDisplay();
// 毎秒更新
setInterval(updateTimeDisplay, 1000);
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

  // default times
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

  // custom times
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

function label(key){
  const map = {morning:'朝',noon:'昼',evening:'晩'};
  return map[key] || key;
}

function formatDate(d){
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function dateStrToJapanese(dateStr){
  const [y,m,d] = dateStr.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

function loadDay(dateStr){
  const records = JSON.parse(localStorage.getItem('medRecords')||'{}');
  return records[dateStr] || {custom:[]};
}

function saveDay(dateStr, data){
  const records = JSON.parse(localStorage.getItem('medRecords')||'{}');
  records[dateStr]=data;
  localStorage.setItem('medRecords', JSON.stringify(records));
}

function toggleTime(key){
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  data[key] = !data[key];
  saveDay(dateStr, data);
  render();
}

function toggleCustom(name){
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  const idx = data.custom.findIndex(x=>x.name===name);
  if(idx>=0){
     data.custom[idx].taken = !data.custom[idx].taken;
     saveDay(dateStr,data);
     render();
  }
}

addTimeBtn.onclick = () => {
  const name = prompt('追加する時間帯の名前を入力');
  if(!name) return;
  const dateStr = formatDate(currentDate);
  const data = loadDay(dateStr);
  if(data.custom.some(x=>x.name===name)) { alert('同じ名前が既にあります'); return; }
  data.custom.push({name,taken:true});
  saveDay(dateStr,data);
  render();
};

prevDayBtn.onclick = ()=>{
  currentDate.setDate(currentDate.getDate()-1);
  render();
};
nextDayBtn.onclick = ()=>{
  currentDate.setDate(currentDate.getDate()+1);
  render();
};
todayBtn.onclick = ()=>{
  currentDate = new Date();
  render();
};

function updateNav(){
   const today = new Date();
   // zero out time for comparison
   today.setHours(0,0,0,0);
   const isFuture = currentDate > today;
   nextDayBtn.disabled = isFuture;
}
// 顔文字たち
const emojis = ["(𐊭 ∀ 𐊭ˋ)", "(◦`꒳´◦)", "( ˙꒳˙ )", "( 'ω' و(و\"", "Σd(°∀°d)"];

// ランダムな色生成関数
function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

// 顔文字を降らせる関数
function dropEmojis() {
  for (let i = 0; i < 15; i++) {
    const emoji = document.createElement("div");
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.position = "fixed";
    emoji.style.top = "-50px";
    emoji.style.left = Math.random() * 100 + "vw";
    emoji.style.fontSize = "32px";
    emoji.style.color = randomColor();
    emoji.style.zIndex = 9999;
    emoji.style.transition = "transform 4s linear, opacity 4s ease";
    emoji.style.transform = `translateY(100vh)`;
    emoji.style.opacity = "0";

    document.body.appendChild(emoji);

    setTimeout(() => {
      emoji.remove();
    }, 4000);
  }
}

// 3秒ごとに降らせる
setInterval(dropEmojis, 3000);
