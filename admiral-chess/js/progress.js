/**
 * 進捗管理（LocalStorage）
 */
const Progress = {
  KEY: "three_admirals_chess_progress",
  defaultData() {
    return {
      lessons: {
        "01-basics": { completed: false, lastStep: 0 },
        "02-tactics": { completed: false, lastStep: 0 },
        "03-practice": { completed: false, lastStep: 0 },
        "04-opening": { completed: false, lastStep: 0 },
        "05-endgame": { completed: false, lastStep: 0 },
        "06-advanced": { completed: false, lastStep: 0 },
        "07-mistakes": { completed: false, lastStep: 0 },
        "08-tactics-adv": { completed: false, lastStep: 0 },
        "09-endgame-prac": { completed: false, lastStep: 0 },
        "10-mate-patterns": { completed: false, lastStep: 0 },
        "11-middlegame": { completed: false, lastStep: 0 },
        "12-pawn-structure": { completed: false, lastStep: 0 }
      },
      games: { played: 0, wins: 0, losses: 0, draws: 0 },
      settings: { sound: false },
      lastPlayed: null
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaultData();
      const data = JSON.parse(raw);
      const def = this.defaultData();
      data.lessons = { ...def.lessons, ...(data.lessons || {}) };
      data.games = { ...def.games, ...(data.games || {}) };
      data.settings = { ...def.settings, ...(data.settings || {}) };
      return data;
    } catch (e) {
      return this.defaultData();
    }
  },
  save(data) {
    try {
      data.lastPlayed = new Date().toISOString();
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("進捗の保存に失敗しました", e);
    }
  },
  completeLesson(lessonId) {
    const data = this.load();
    if (data.lessons[lessonId]) {
      data.lessons[lessonId].completed = true;
      data.lessons[lessonId].lastStep = 999;
    }
    this.save(data);
  },
  setLessonStep(lessonId, step) {
    const data = this.load();
    if (data.lessons[lessonId]) data.lessons[lessonId].lastStep = step;
    this.save(data);
  },
  recordGame(result) {
    const data = this.load();
    data.games.played += 1;
    if (result === "win") data.games.wins += 1;
    else if (result === "loss") data.games.losses += 1;
    else if (result === "draw") data.games.draws += 1;
    this.save(data);
  },
  isLessonCompleted(lessonId) {
    const data = this.load();
    return !!(data.lessons[lessonId] && data.lessons[lessonId].completed);
  },
  getLessonStep(lessonId) {
    const data = this.load();
    return (data.lessons[lessonId] && data.lessons[lessonId].lastStep) || 0;
  }
};
window.Progress = Progress;
