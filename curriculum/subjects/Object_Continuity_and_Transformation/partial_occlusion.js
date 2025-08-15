class PartialOcclusionLesson extends CurriculumLesson {
    constructor() {
        super('Partial Occlusion', 'Identity preserved despite being partially covered');

        this.warnings.push('ambiguous tasks');
    }
    generate_task(demo = false) {
        let num_steps = 0;
        let scene;

        let min_steps = 6;

        outer:
        while (num_steps < min_steps || num_steps % 2 !== 0) {
            num_steps = 0;

            let scene_width = demo ? 30 : rnd_int(16, 30);
            let scene_height = demo ? 30 : rnd_int(16, 30);

            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.75);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.75);

            let bg_color = rnd_bg_color();
            let obj_color = rnd_color([bg_color]);

            scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

            obj.set_random_position(scene.bounds);

            do {
                obj.speed_x = rnd_val([-1, 0, 1]);
                obj.speed_y = rnd_val([-1, 0, 1]);
            } while (obj.speed_x === 0 && obj.speed_y === 0);

            scene.add_object(obj);

            let num_occluders = rnd_int(1, 3);
            let occluders = [];

            for (let i = 0; i < num_occluders; i++) {
                let occluder_color = rnd_color([bg_color, obj_color]);
                let occluder = SceneObject.random(occluder_color, object_max_width, object_max_height);

                occluder.z = 1;
                occluders.push(occluder);

                let attempts = 0;

                do {
                    occluder.set_random_position(scene.bounds);

                    if (++attempts === 16) {
                        continue outer;
                    }
                } while (occluder.overlaps_with(obj));

                scene.add_object(occluder);
            }
            let is_occluded = () => {
                for (let occluder of occluders) {
                    if (occluder.overlaps_with(obj)) {
                        return true;
                    }
                }
                return false;
            };
            scene.start_recording();

            let num_frames_occluded = 0;
            let num_frames_unoccluded = 0;

            while (scene.within_bounds(obj)) {
                if (is_occluded()) {
                    num_frames_occluded++;
                } else if (num_frames_occluded === 0) {
                    num_frames_unoccluded++;
                }
                if (scene.obj_unoccluded_cell_count(obj) === 0) {
                    num_steps = 0;

                    continue outer;
                }
                scene.render();
                scene.step();

                num_steps++;
            }
            if (num_frames_occluded < 3 || num_frames_unoccluded < 3) {
                num_steps = 0;

                continue;
            }
        }
        scene.stop_recording();

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}