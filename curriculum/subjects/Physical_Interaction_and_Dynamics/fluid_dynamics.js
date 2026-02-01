class FluidDynamicsLesson extends CurriculumLesson {
    constructor() {
        super('Fluid Dynamics', 'Liquid-like material flows around obstacles or spreads downward / outward.');

        this.warnings.push('ambiguous tasks');
    }
    generate_task(demo = false) {
        let scene;
        let wine = demo && seed === init_seed;

        outer:
        while (true) {
            let scene_width = 30;
            let scene_height = 30;

            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.20);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.20);

            let bg_color = wine ? 0 : rnd_bg_color();
            let liquid_color = wine ? 9 : rnd_color([bg_color]);

            scene = new LiquidScene(scene_width, scene_height, bg_color, liquid_color);
            scene.collide_bottom = false;

            let liquid_source_x = wine ? 15 : rnd_int(0, 29);
            let liquid_source_y = 0;

            scene.add_source(liquid_source_x, liquid_source_y);

            let particle = new SceneObject(new Grid(1, 1, liquid_color));
            particle.x = liquid_source_x;

            scene.add_object(particle);

            let line_p1 = p2d(liquid_source_x, 0);
            let line_p2 = p2d(liquid_source_x, 30);

            let num_objs = wine ? 1 : rnd_int(4, 8);

            for (let i = 0; i < num_objs; i++) {
                let obj_color = rnd_color([bg_color, liquid_color]);

                let obj;

                do {
                    obj = wine ? SceneObject.wine_glass() : SceneObject.random(obj_color, object_max_width, object_max_height, 0, 0.14)
                } while (obj.grid.area === 1);

                if (wine) {
                    obj.grid_x = 0;
                    obj.grid_y = 11;

                    scene.add_object(obj);
                    break;
                }
                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while ((obj.bounds.contains_point(particle.x, particle.y) || scene.contains_connected_objects() || !obj.line_intersects(line_p1, line_p2)) && ++attempts < 24);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
            }
            scene.remove_object(particle);
            scene.apply_objects_to_liquid_field();
            scene.start_recording();

            let previous_grid = null;

            while (!scene.grid.equals(previous_grid)) {
                previous_grid = scene.grid.clone();

                scene.render();
                scene.step();
            }
            break;
        }
        scene.stop_recording();

        scene.video.pop();

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}