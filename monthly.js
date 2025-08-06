document.addEventListener("DOMContentLoaded", () => {
  const monthDisplay = document.getElementById("monthDisplay");
  const monthlyRate = document.getElementById("monthlyRate");
  const praiseEmoji = document.getElementById("praiseEmoji");
  const ctx = document.getElementById("medChart").getContext("2d");

  const prevBtn = document.getElementById("prevMonth");
  const currentBtn = document.getElementById("currentMonth");
  const nextBtn = document.getElementById("nextMonth");

  const praiseEmojis = [
    "‧˚₊*̥(⁰͈꒨⁰͈∗︎*)‧˚", 
    "ﾌｫｫ――(⊙ω⊙)――ｯ!", 
    "(◦`꒳´◦)", 
    "(っ'-')╮ =͟͟͞͞💊", 
    "Σd(°∀°d)", 
    "(𐊭 ∀ 𐊭ˋ)"
  ];

  // 季節ごとの絵文字（降らす用）
  const seasonalEmojis = {
    spring: ["🌸", "🌸", "🌷"],
    summer: ["🍧", "🌞", "🧊"],
    autumn: ["🍁", "🎃", "🍂"],
    winter: ["❄️", "⛄️", "🎄"]
  };

  let chart = null;
  let currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setMonth(currentMonth.getMonth() - 1); // ← デフォルトは前月

  prevBtn.onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    render();
  };
  currentBtn.onclick = () => {
    currentMonth = new Date();
    currentMonth.setDate(1);
    render();
  };
  nextBtn.onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    render();
  };

  function render() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-indexed
    monthDisplay.textContent = `${year}年${month + 1}月`;

    // 🌸 季節のクラスをbodyに追加
    const body = document.body;
    body.classList.remove("spring", "summer", "autumn", "winter");

    let season = "spring"; // デフォルト
    if ([11, 0].includes(month)) season = "winter";  // 12月, 1月
    else if ([1, 2, 3].includes(month)) season = "spring";
    else if ([6, 7].includes(month)) season = "summer"; // 7月, 8月
    else if ([9, 10].includes(month)) season = "autumn";
    else if ([4, 5].includes(month)) season = "summer"; // 初夏として夏に含む

    body.classList.add(season);
    startEmojiRain(seasonalEmojis[season]);

    // 日付とデータ処理
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const daysInMonth = end.getDate();

    const labels = [];
    const dailyRates = [];
    let totalTaken = 0;
    let totalPossible = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      labels.push(`${day}日`);

      const data = loadDay(dateStr);
      let takenCount = 0;
      let possibleCount = 0;

      ["朝", "昼", "晩"].forEach(time => {
        if (time in data) {
          possibleCount++;
          if (data[time] === true) takenCount++;
        }
      });

      (data.custom || []).forEach(entry => {
        possibleCount++;
        if (entry.taken) takenCount++;
      });

      const rate = possibleCount > 0 ? (takenCount / possibleCount) * 100 : null;
      dailyRates.push(rate);
      totalTaken += takenCount;
      totalPossible += possibleCount;
    }

    // グラフ描画
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "服薬率（%）",
          data: dailyRates.map(r => r !== null ? r.toFixed(1) : null),
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          tension: 0.3,
          spanGaps: true
        }]
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: value => `${value}%`
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });

    // トータル表示
    praiseEmoji.innerHTML = "";
    if (totalPossible > 0) {
      const totalRate = (totalTaken / totalPossible) * 100;
      monthlyRate.textContent = `月間服薬率：${totalRate.toFixed(1)}%`;

      if (totalRate >= 90) {
        const face = praiseEmojis[Math.floor(Math.random() * praiseEmojis.length)];
        praiseEmoji.textContent = `${face} よくがんばったね〜！`;
      }
    } else {
      monthlyRate.textContent = "この月には服薬データがありません。";
    }
  }

  function loadDay(dateStr) {
    const json = localStorage.getItem(`meds-${dateStr}`);
    return json ? JSON.parse(json) : {};
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function startEmojiRain(emojiList) {
    // 既存の絵文字削除
    document.querySelectorAll(".falling-emoji").forEach(e => e.remove());

    // 一定数の絵文字を降らせる（約20個）
    for (let i = 0; i < 20; i++) {
      const emoji = document.createElement("div");
      emoji.className = "falling-emoji";
      emoji.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
      emoji.style.left = Math.random() * 100 + "vw";
      emoji.style.animationDuration = 2 + Math.random() * 3 + "s";
      emoji.style.fontSize = (18 + Math.random() * 20) + "px";
      emoji.style.opacity = (0.3 + Math.random() * 0.3).toFixed(2);
      document.body.appendChild(emoji);

      // 一定時間で削除
      setTimeout(() => emoji.remove(), 5000);
    }

    // 継続して降らせたい場合はループする：
    setTimeout(() => startEmojiRain(emojiList), 3000); // 3秒ごとに再発生
  }

  render();
});
