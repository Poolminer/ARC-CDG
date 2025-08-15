class CompositeTransformationsLesson extends CurriculumLesson {
    constructor() {
        super('Composite Transformations', 'Combine multiple transformations (e.g., move + rotate)');

        this.output_is_next_input = true;
    }
    generate_task(demo = false) {
        let scene;

        let to_translate;
        let to_rotate;
        let to_scale;
        let to_fliplr;
        let to_flipud;
        let to_change_color;

        while (true) {
            let num_steps = 0;
            let grow = rnd_bool();

            to_translate = false;
            to_rotate = false;
            to_scale = false;
            to_fliplr = false;
            to_flipud = false;
            to_change_color = false;

            do {
                to_translate = false;
                to_rotate = rnd_bool();
                to_scale = (to_translate || to_rotate) ? false : rnd_bool();
                to_fliplr = to_rotate ? false : rnd_bool();
                to_flipud = to_rotate ? false : to_fliplr ? false : rnd_bool();
                to_change_color = rnd_bool();
            } while ([to_translate, to_rotate, to_scale, to_fliplr, to_flipud].filter(b => b === true).length < 2);

            outer:
            while (to_scale ? true : (num_steps < 4 || num_steps % 2 !== 0)) {
                num_steps = 0;

                let scene_width = demo ? 30 : rnd_int(8, 30);
                let scene_height = demo ? 30 : rnd_int(8, 30);

                let mul_max = to_scale ? 0.25 : 0.75;

                let object_max_width = rnd_obj_size(scene_width, 0.20, mul_max);
                let object_max_height = rnd_obj_size(scene_height, 0.20, mul_max);

                let bg_color = rnd_bg_color();
                let obj_color = rnd_color([bg_color]);
                let new_obj_color = rnd_color([bg_color, obj_color]);
                let current_obj_color = obj_color;

                scene = new Scene(scene_width, scene_height, bg_color);

                let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

                while (to_scale && (obj.width % 2 !== 0 || obj.height % 2 !== 0)) {
                    obj = SceneObject.random(obj_color, object_max_width, object_max_height);
                }
                let scale;

                if (to_rotate) {
                    if (obj.num_unique_rotations() !== 4) {
                        continue;
                    }
                    obj.speed_r = 1;
                }
                if (to_flipud) {
                    if (obj.is_horizontally_symmetrical()) {
                        continue;
                    }
                } else if (to_fliplr && obj.is_vertically_symmetrical()) {
                    continue;
                }
                if (to_scale) {
                    if (!grow) {
                        scale = 4;

                        obj.set_scale(scale);

                        if (obj.width > scene_width || obj.height > scene.height) {
                            continue;
                        }
                        while (obj.width <= scene_width && obj.height <= scene_height) {
                            obj.set_scale(++scale);
                        }
                        obj.set_scale(--scale);
                    } else {
                        scale = 1;
                    }
                }
                obj.set_random_position(scene.bounds);

                if (to_translate) {
                    while (obj.speed_x === 0 && obj.speed_y === 0) {
                        obj.speed_x = rnd_val([-1, 0, 1]);
                        obj.speed_y = rnd_val([-1, 0, 1]);
                    }
                }
                scene.add_object(obj);
                scene.start_recording();

                let step = () => {
                    if (to_flipud) {
                        obj.flipud = !obj.flipud;
                    } else if (to_fliplr) {
                        obj.fliplr = !obj.fliplr;
                    }
                    if (to_change_color) {
                        if (current_obj_color === obj_color) {
                            obj.set_color(new_obj_color);
                            current_obj_color = new_obj_color;
                        } else {
                            obj.set_color(obj_color);
                            current_obj_color = obj_color;
                        }
                    }
                    scene.step();
                };
                if (to_scale) {
                    if (grow) {
                        while (scene.within_bounds(obj)) {
                            scene.render();
                            obj.set_scale(++scale);
                            step();
                        }
                        if (--scale < 5) {
                            continue;
                        }
                        break;
                    } else {
                        scene.render();

                        for (let i = scale - 1; i > 0; i--) {
                            if (!scene.within_bounds(obj)) {
                                continue outer;
                            }
                            obj.set_scale(i);
                            step();
                            scene.render();
                        }
                        break;
                    }
                } else if (to_translate) {
                    while (scene.within_bounds(obj)) {
                        scene.render();
                        step();
                        num_steps++;
                    }
                } else {
                    while (num_steps !== 4 && scene.within_bounds(obj)) {
                        scene.render();
                        step();
                        num_steps++;
                    }
                }
            }
            scene.stop_recording();

            if (scene.video.num_unique_frames() !== scene.video.num_frames) {
                continue;
            }
            break;
        }
        scene.video.fps = 1;

        return scene.video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}