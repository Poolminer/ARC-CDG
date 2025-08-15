class LineOfSightLesson extends CurriculumLesson {
    constructor() {
        super('Line-of-Sight', 'Objects colored based on line-of-sight visibility');

        this.warnings.push('ambiguous tasks');
        this.warnings.push('rasterization');
    }
    generate_task(demo = false) {
        let scene;

        let mode = 1;

        let scene_width = 30;
        let scene_height = 30;

        let line_p1 = p2d(15, 0);
        let line_p2 = p2d(15, 30);

        let bg_color = rnd_bg_color();
        let obj_color = rnd_color([bg_color]);
        let line_color = rnd_color([bg_color, obj_color]);
        let color_fov_in = rnd_color([bg_color, obj_color, line_color]);
        let color_fov_semi = rnd_color([bg_color, obj_color, line_color, color_fov_in]);
        let color_fov_out = rnd_color([bg_color, obj_color, line_color, color_fov_in, color_fov_semi]);

        outer:
        while (true) {
            let object_max_width = rnd_int(1, 6);
            let object_max_height = rnd_int(1, 6);

            scene = new Scene(scene_width, scene_height, bg_color);

            let fov;
            let direction = 0;

            let obj = new SceneObject(new Grid(1, 1, obj_color));
            obj.grid_x = 15;

            if (mode === 0) {
                obj.grid_y = 0;
            } else {
                obj.grid_y = 15;
                fov = Math.PI / 4;
            }
            scene.add_object(obj);

            let num_objs = rnd_int(8, 12);
            let side_objs = [];

            for (let i = 0; i < num_objs; i++) {
                let color = rnd_color([bg_color, obj_color, line_color, color_fov_in, color_fov_out]);

                let side_obj = SceneObject.random(color, object_max_width, object_max_height);

                side_objs.push(side_obj);
                scene.add_object(side_obj);

                let attempts = 0;
                do {
                    side_obj.set_random_position(scene.bounds);

                    if (++attempts === 8) {
                        continue outer;
                    }
                } while (scene.contains_connected_objects() || side_obj.line_intersects(line_p1, line_p2));
            }
            scene.start_recording();

            if (mode === 0) {
                while (obj.grid_y !== 30) {
                    let p_src = p2d(obj.grid_x, obj.grid_y);

                    for (let _obj of scene.objects) {
                        if (_obj === obj) {
                            continue;
                        }
                        scene.set_obj_visible_cell_color(_obj, p_src, 0, Math.PI, color_fov_in, color_fov_out, [obj]);
                    }
                    scene.render();
                    obj.grid_y++;
                }
            } else {
                let num_steps = 8;
                let increment = Math.PI * 2 / num_steps;

                for (let i = 0; i < num_steps; i++) {
                    let p_src = p2d(obj.grid_x, obj.grid_y);
                    let visibilities = [];

                    for (let _obj of scene.objects) {
                        if (_obj === obj) {
                            continue;
                        }
                        let visibility = scene.obj_visibility(_obj, p_src, direction, fov, [obj]);
                        visibilities.push(visibility);

                        switch (visibility) {
                            case -1:
                                _obj.set_color(color_fov_out);
                                break;
                            case 0:
                                _obj.set_color(color_fov_semi);
                                break;
                            case 1:
                                _obj.set_color(color_fov_in);
                                break;
                        }
                    }
                    if (!(visibilities.includes(-1) && visibilities.includes(0) && visibilities.includes(1))) {
                        continue outer;
                    }
                    scene.render(true, () => {
                        let p_cone_top_left = p2rot(p2rot(p2d(p_src.x, p_src.y + sqrt30x30x2), -fov, p_src), direction, p_src);
                        let p_cone_top_right = p2rot(p2rot(p2d(p_src.x, p_src.y + sqrt30x30x2), fov, p_src), direction, p_src);

                        scene.grid.draw_line(p_src, p_cone_top_left, line_color, true);
                        scene.grid.draw_line(p_src, p_cone_top_right, line_color, true);
                    });
                    direction += increment;
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