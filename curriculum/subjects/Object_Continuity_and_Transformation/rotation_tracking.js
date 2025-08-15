class RotationTrackingLesson extends CurriculumLesson {
    constructor() {
        super('Rotation Tracking', '90°, 180°, 270° rotations of the same object');

        this.output_is_next_input = true;
    }
    generate_task(demo = false) {
        let scene;

        outer:
        while (true) {
            let scene_width = demo ? 30 : rnd_int(8, 30);
            let scene_height = demo ? 30 : rnd_int(8, 30);

            let object_max_width = rnd_obj_size(scene_width, 0.20, 0.55);
            let object_max_height = rnd_obj_size(scene_height, 0.20, 0.55);

            let bg_color = rnd_bg_color();
            let obj_color = rnd_color([bg_color]);

            scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

            while (obj.width % 2 !== 0 || obj.height % 2 !== 0) {
                obj = SceneObject.random(obj_color, object_max_width, object_max_height);
            }
            if (obj.num_unique_rotations() !== 4) {
                continue;
            }
            obj.set_random_position(scene.bounds);

            obj.speed_r = 1;

            scene.add_object(obj);
            scene.start_recording();
            scene.render();

            for (let i = 0; i < 4; i++) {
                scene.step();

                if (!scene.within_bounds(obj)) {
                    continue outer;
                }
                scene.render();
            }
            break;
        }
        scene.stop_recording();

        scene.video.fps = 1;

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}