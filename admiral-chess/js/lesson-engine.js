/**
 * レッスン用の簡易エンジン
 */
class LessonEngine {
  constructor(boardUI, options = {}) {
    this.board = boardUI;
    this.onComplete = options.onComplete || null;
    this.currentStep = 0;
    this.steps = [];
  }
  loadLesson(lessonData) {
    this.steps = lessonData.steps || [];
    this.currentStep = 0;
    this.lessonId = lessonData.id;
    this.title = lessonData.title;
    this.teacher = lessonData.teacher;
    this.showStep(0);
  }
  showStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStep = index;
    const step = this.steps[index];
    if (step.fen) this.board.loadFen(step.fen);
    else if (step.reset) this.board.reset();
    this.board.clearHighlights();
    if (step.highlight && Array.isArray(step.highlight)) {
      step.highlight.forEach(sq => {
        const el = this.board.container.querySelector(`[data-square="${sq}"]`);
        if (el) el.classList.add("highlight");
      });
    }
    return step;
  }
  next() {
    if (this.currentStep < this.steps.length - 1) return this.showStep(this.currentStep + 1);
    return null;
  }
  prev() {
    if (this.currentStep > 0) return this.showStep(this.currentStep - 1);
    return null;
  }
  isLast() { return this.currentStep >= this.steps.length - 1; }
  isFirst() { return this.currentStep <= 0; }
}
window.LessonEngine = LessonEngine;
