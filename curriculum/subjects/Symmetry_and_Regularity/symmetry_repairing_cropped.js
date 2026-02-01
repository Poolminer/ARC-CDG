class SymmetryRepairingCroppedLesson extends CurriculumLesson {
    constructor(){
        super('Symmetry Repairing (cropped)', 'Restore symmetric structures from incomplete ones.');
        this.org_lesson = new SymmetryRepairingLesson(true);
    }
    generate_task(demo = false) {
        return this.org_lesson.generate_task(demo);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}