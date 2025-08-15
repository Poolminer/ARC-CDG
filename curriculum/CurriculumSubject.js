class CurriculumSubject {
    constructor(title) {
        this.title = title;
        this.lessons = [];
    }
    add_lesson(lesson, exp = true) {
        lesson.exp = exp;

        this.lessons.push(lesson);
    }
}