class OutlineLesson extends CurriculumLesson {
    constructor() {
        super('Outline', 'Draw object outlines');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = demo ? 30 : rnd_int(8, 30);
        let scene_height = demo ? 30 : rnd_int(8, 30);

        let bg_color = rnd_bg_color();
        let outline_color = rnd_color([bg_color]);

        let target_num_videos = rnd_num_pairs();

        while (videos.length !== target_num_videos) {
            let object_max_width = rnd_obj_size(scene_width, 0.15, 0.75);
            let object_max_height = rnd_obj_size(scene_height, 0.15, 0.75);

            let obj_color = rnd_color([bg_color, outline_color]);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

            obj.set_random_position(scene.bounds, 1);

            scene.add_object(obj);
            scene.start_recording();
            scene.render();

            obj.outline_size = 1;
            obj.outline_color = outline_color;

            obj.grid_x -= 1;
            obj.grid_y -= 1;

            scene.render();
            scene.stop_recording();

            scene.video.fps = 1;

            videos.push(scene.video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}