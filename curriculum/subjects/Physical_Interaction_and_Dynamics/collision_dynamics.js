class CollisionDynamicsLesson extends CurriculumLesson {
    constructor() {
        super('Collision Dynamics', 'Movement stopped or redirected on impact');

        this.warnings.push('ambiguous tasks');
    }
    generate_task(demo = false) {
        let videos = [];
        let num_steps = 0;
        let scene;

        let bg_color = rnd_bg_color();

        let mode = 2;//rnd_int(0, 2);

        let scene_width = demo ? 30 : rnd_int(8, 30);
        let scene_height = demo ? 30 : rnd_int(8, 30);
        let obj;

        let target_num_videos = 1;

        outer:
        while (videos.length !== target_num_videos) {
            num_steps = 0;

            inner:
            while (num_steps < 4) {
                num_steps = 0;

                let obj_max_width = rnd_obj_size(scene_width, 0.15, 0.20);
                let obj_max_height = rnd_obj_size(scene_height, 0.15, 0.20);

                scene = new Scene(scene_width, scene_height, bg_color);
                scene.noclip = mode === 2;

                let obj_color = rnd_color([bg_color]);

                let objs = [];
                let num_objs = rnd_int(6, 8);

                for (let i = 0; i < num_objs; i++) {
                    obj = SceneObject.random(obj_color, obj_max_width, obj_max_height);

                    obj.collisions_enabled = true;
                    obj.transfer_momentum_on_collide = true;

                    if (mode === 1) {
                        obj.set_pushable(true);
                    }
                    objs.push(obj);
                    scene.add_object(obj);

                    let attempts = 0;

                    do {
                        obj.set_random_position(scene.bounds);
                    } while (scene.contains_connected_objects() && ++attempts !== 16);

                    if (scene.contains_connected_objects()) {
                        continue;
                    }
                }
                let sx, sy;
                do {
                    obj.speed_x = sx = rnd_val([-1, 0, 1]);
                    obj.speed_y = sy = rnd_val([-1, 0, 1]);
                } while (obj.speed_x === 0 && obj.speed_y === 0);

                scene.start_recording();

                if (mode === 0) {

                } else if (mode === 1) {
                    let colliders = [];
                    let required_steps = 0;

                    for (let _obj of objs) {
                        _obj.on_collide = (other_obj) => {
                            if (typeof other_obj === 'symbol') {
                                return;
                            }
                            if (!colliders.includes(_obj)) {
                                colliders.push(_obj);
                                required_steps = 2;
                            }
                        };
                    }
                    let previous_grid = null;

                    while (!scene.grid.equals(previous_grid)) {
                        previous_grid = scene.grid.clone();

                        scene.step();

                        if (scene.contains_overlapping_objects()) {
                            num_steps = 0;
                            continue inner;
                        }
                        scene.render();

                        num_steps++;
                        required_steps--;
                    }
                    if (colliders.length < 2 || required_steps > 0) {
                        num_steps = 0;
                        continue;
                    }
                } else if (mode === 2) {
                    let colliders = [];
                    let hits = [];
                    let required_steps = 0;
                    let collided = false;

                    for (let _obj of objs) {
                        _obj.on_collide = (other_obj) => {
                            if (typeof other_obj === 'symbol') {
                                return;
                            }
                            if (!colliders.includes(_obj)) {
                                colliders.push(_obj);
                                required_steps = 2;
                            }
                            if (!hits.includes(other_obj)) {
                                hits.push(other_obj);
                            }
                            collided = true;
                        };
                    }
                    let previous_grid = null;

                    scene.render();

                    while (!scene.grid.equals(previous_grid)) {
                        hits.length = 0;
                        previous_grid = scene.grid.clone();

                        collided = false;

                        scene.step();

                        if (collided) {
                            scene.step(hits);
                        }
                        scene.render();

                        num_steps++;
                        required_steps--;
                    }
                    if (colliders.length < 2 || required_steps > 0) {
                        num_steps = 0;
                        continue;
                    }
                }
            }
            scene.stop_recording();

            scene.video.pop();

            scene.video.fps = 8;

            videos.push(scene.video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}