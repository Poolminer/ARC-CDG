class SymmetryBreakingCroppedLesson extends CurriculumLesson {
    constructor(){
        super('Symmetry Breaking (cropped)', 'Detect anomalies in symmetric patterns.');
        this.org_lesson = new SymmetryBreakingLesson(true);
    }
    generate_task(demo = false) {
        return this.org_lesson.generate_task(demo);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}