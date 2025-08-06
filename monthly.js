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

  const seasonalEmojis = {
    spring: ["🌸", "🌸", "🌷"],
    summer: ["🍧", "🌞", "🧊"],
    autumn: ["🍁", "🎃", "🍂"],
    winter: ["❄️", "⛄️", "🎄"]
  };

  let chart = null;
  let currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setMonth(currentMonth.getMonth() - 1);

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
    const month = currentMonth.getMonth();
    monthDisplay.textContent = `${year}年${month + 1}月`;

    const body = document.body;
    body.classList.remove("spring", "summer", "autumn", "winter");

    let season = "spring";
    if ([11, 0].includes(month)) season = "winter";
    else if ([1, 2, 3].includes(month)) season = "spring";
    else if ([6, 7].includes(month)) season = "summer";
    else if ([9, 10].includes(month)) season = "autumn";
    else if ([4, 5].includes(month)) season = "summer";

    body.classList.add(season);
    startEmojiRain(seasonalEmojis[season]);

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
    if (window.__emojiRainInterval) clearInterval(window.__emojiRainInterval);

    function dropEmoji() {
      const emoji = document.createElement("div");
      emoji.className = "falling-emoji";
      emoji.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];

      emoji.style.left = Math.random() * 100 + "vw";
      emoji.style.top = "-5%";
      emoji.style.fontSize = `${18 + Math.random() * 20}px`;
      emoji.style.opacity = (0.3 + Math.random() * 0.3).toFixed(2);
      emoji.style.animationDuration = `${3 + Math.random() * 4}s`;

      document.body.appendChild(emoji);
      setTimeout(() => emoji.remove(), 8000);
    }

    window.__emojiRainInterval = setInterval(() => {
      dropEmoji();
    }, 300 + Math.random() * 300);
  }

  render();
});
