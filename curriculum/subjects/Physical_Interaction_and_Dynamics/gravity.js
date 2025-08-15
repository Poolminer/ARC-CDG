class GravityLesson extends CurriculumLesson {
    constructor() {
        super('Gravity', 'Objects fall unless blocked');

        this.warnings.push('ambiguous tasks');
    }
    generate_task(demo = false) {
        let num_steps = 0;
        let scene;

        let min_steps = 6;

        outer:
        while (num_steps < min_steps || num_steps % 2 !== 0) {
            num_steps = 0;

            let scene_width = 30;
            let scene_height = 30;

            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.20);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.20);

            let bg_color = rnd_bg_color();

            scene = new Scene(scene_width, scene_height, bg_color);

            let num_objs = rnd_int(4, 8);

            for (let i = 0; i < num_objs; i++) {
                let obj_color = rnd_color([bg_color]);

                let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

                obj.collisions_enabled = true;
                obj.pushable_x = true;
                obj.pushable_y = true;

                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while (scene.contains_connected_objects() && ++attempts < 12);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
                obj.speed_y = 1;
            }
            scene.start_recording();

            let previous_grid = null;

            while (!scene.grid.equals(previous_grid)) {
                previous_grid = scene.grid.clone();

                scene.render();
                scene.step();

                num_steps++;
            }
        }
        scene.stop_recording();

        scene.video.pop();

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}