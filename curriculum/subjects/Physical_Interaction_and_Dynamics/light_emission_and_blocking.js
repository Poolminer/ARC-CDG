class LightEmissionAndBlockingLesson extends CurriculumLesson {
    constructor() {
        super('Light Emission and Blocking', 'Omnidirectional lights and light cones');

        this.warnings.push('rasterization');
    }
    generate_task(demo = false) {
        let scene;

        let mode = 0; //rnd_int(0, 1);

        let scene_width = 30;
        let scene_height = 30;

        let line_x = rnd_int(0, 29);

        let line_p1 = p2d(line_x, 0);
        let line_p2 = p2d(line_x, 30);

        let object_max_width = rnd_obj_size(scene_width, 0.10, 0.20);
        let object_max_height = rnd_obj_size(scene_height, 0.10, 0.20);

        let bg_color = rnd_bg_color();
        let light_color = rnd_color([bg_color]);
        let light_source_color = rnd_color([bg_color, light_color]);

        outer:
        while (true) {
            scene = new LightScene(scene_width, scene_height, bg_color, light_color);
            scene.light_source.x = line_x;

            if (mode === 0) {
                scene.light_source.y = 0;
            } else {
                scene.light_source.y = 15;
                scene.light_beam_angle = Math.PI / 4;
                scene.light_direction = Math.PI / 4;
            }
            scene.light_source_color = light_source_color;

            let particle = new SceneObject(new Grid(1, 1, light_source_color));
            particle.x = scene.light_source.x;
            particle.y = scene.light_source.y;

            scene.add_object(particle);

            let num_objs = rnd_int(4, 8);

            for (let i = 0; i < num_objs; i++) {
                let obj_color = rnd_color([bg_color, light_color, light_source_color]);

                let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

                scene.add_object(obj);

                let attempts = 0;
                do {
                    obj.set_random_position(scene.bounds);

                    if (++attempts === 8) {
                        continue outer;
                    }
                } while (scene.contains_connected_objects() || obj.line_intersects(line_p1, line_p2));
            }
            scene.remove_object(particle);
            scene.start_recording();

            if (mode === 0) {
                while (scene.light_source.y !== 30) {
                    scene.step();
                    scene.render();

                    scene.light_source.y++;
                }
            } else {
                let num_steps = 4;
                let increment = Math.PI / 2;

                for (let i = 0; i < num_steps; i++) {
                    scene.step();
                    scene.render();

                    scene.light_direction += increment;
                }
            }
            scene.stop_recording();

            if (mode === 1) {
                scene.video.fps = 1;
            }
            return scene.video;
        }
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}