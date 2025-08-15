class CurriculumLesson {
    constructor(title, description, exp = true) {
        this.title = title;
        this.description = description;
        this.num_videos = 1;
        this.video_fps = 0;
        this.exp = exp;
        this.output_is_next_input = false;
        this.warnings = [];
    }
    generate_task() {
        return null;
    }
    /** Generate a demo task for in the sidebar */
    generate_demo_task() {
        return null;
    }
}