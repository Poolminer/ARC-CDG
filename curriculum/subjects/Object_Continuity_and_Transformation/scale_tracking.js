class ScaleTrackingLesson extends CurriculumLesson {
    constructor() {
        super('Scale Tracking', 'Objects grow or shrink while maintaining shape');

        this.output_is_next_input = true;
    }
    generate_task(demo = false) {
        let scene;
        let grow = rnd_bool();

        while (true) {
            let scene_width = demo ? 30 : rnd_int(2, 30);
            let scene_height = demo ? 30 : rnd_int(2, 30);

            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.25);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.25);

            let bg_color = rnd_bg_color();
            let obj_color = rnd_color([bg_color]);

            scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

            obj.outline_color = rnd_color([bg_color, obj_color]);
            obj.outline_size = rnd_int(0, 1);

            let scale;

            if (!grow) {
                scale = 4;

                obj.set_scale(scale);

                if (obj.grid_transformed.width + obj.outline_size * 2 > scene_width || obj.grid_transformed.height + obj.outline_size * 2 > scene.height) {
                    continue;
                }
                while (obj.grid_transformed.width + obj.outline_size * 2 <= scene_width && obj.grid_transformed.height + obj.outline_size * 2 <= scene_height) {
                    obj.set_scale(++scale);
                }
                obj.set_scale(--scale);
            } else {
                scale = 1;
            }
            obj.set_random_position(scene.bounds, obj.outline_size);

            scene.add_object(obj);
            scene.start_recording();

            if (grow) {
                while (scene.within_bounds(obj)) {
                    scene.render();

                    obj.set_scale(++scale);
                }
                if (--scale < 5) {
                    continue;
                }
                break;
            } else {
                scene.render();

                for (let i = scale - 1; i > 0; i--) {
                    obj.set_scale(i);
                    scene.render();
                }
                break;
            }
        }
        scene.stop_recording();

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}