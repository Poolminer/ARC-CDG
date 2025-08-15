class ReflectionAndFlippingLesson extends CurriculumLesson {
    constructor() {
        super('Reflection and Flipping', 'Mirror transformations (horizontal, vertical)');
    }
    generate_task(demo = false) {
        let videos = [];
        let flipud = rnd_bool();

        let scene_width = demo ? 30 : rnd_int(8, 30);
        let scene_height = demo ? 30 : rnd_int(8, 30);

        let bg_color = rnd_bg_color();

        let target_num_videos = rnd_num_pairs();

        while (videos.length !== target_num_videos) {
            let object_max_width = rnd_obj_size(scene_width, 0.20, 0.55);
            let object_max_height = rnd_obj_size(scene_height, 0.20, 0.55);

            let obj_color = rnd_color([bg_color]);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

            if (flipud) {
                if (obj.is_horizontally_symmetrical()) {
                    continue;
                }
            } else if (obj.is_vertically_symmetrical()) {
                continue;
            }
            obj.set_random_position(scene.bounds);

            scene.add_object(obj);
            scene.start_recording();
            scene.render();

            if (flipud) {
                obj.flipud = true;
            } else {
                obj.fliplr = true;
            }
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