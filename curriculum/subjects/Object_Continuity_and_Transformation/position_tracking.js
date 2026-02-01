class PositionTrackingLesson extends CurriculumLesson {
    constructor() {
        super('Position Tracking', 'Follow object translation across frames');
    }
    generate_task(demo = false) {
        let num_steps = 0;
        let scene;

        let min_steps = 6;

        while (num_steps < min_steps || num_steps % 2 !== 0) {
            num_steps = 0;

            let scene_width;
            let scene_height;

            do {
                scene_width = demo ? 30 : rnd_int(2, 30);
                scene_height = demo ? 30 : rnd_int(2, 30);
            } while (scene_width < 2 && scene_height < 2);

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
            scene.start_recording();

            while (scene.within_bounds(obj)) {
                scene.render();
                scene.step();

                num_steps++;
            }
        }
        scene.stop_recording();

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}