document.addEventListener("DOMContentLoaded", () => {
  const monthDisplay = document.getElementById("monthDisplay");
  const monthlyRate = document.getElementById("monthlyRate");
  const praiseEmoji = document.getElementById("praiseEmoji");
  const ctx = document.getElementById("medChart").getContext("2d");

  const prevBtn = document.getElementById("prevMonth");
  const currentBtn = document.getElementById("currentMonth");
  const nextBtn = document.getElementById("nextMonth");

  const emojis = [
    "‧˚₊*̥(⁰͈꒨⁰͈∗︎*)‧˚", 
    "ﾌｫｫ――(⊙ω⊙)――ｯ!", 
    "(◦`꒳´◦)", 
    "(っ'-')╮ =͟͟͞͞💊", 
    "Σd(°∀°d)", 
    "(𐊭 ∀ 𐊭ˋ)"
  ];

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
    // 月情報表示
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-indexed
    monthDisplay.textContent = `${year}年${month + 1}月`;

    // 月初〜月末の日付取得
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // 月末
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

    // 月間トータル率と褒め表示
    praiseEmoji.innerHTML = "";
    if (totalPossible > 0) {
      const totalRate = (totalTaken / totalPossible) * 100;
      monthlyRate.textContent = `月間服薬率：${totalRate.toFixed(1)}%`;

      if (totalRate >= 90) {
        const face = emojis[Math.floor(Math.random() * emojis.length)];
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

  render();
});
