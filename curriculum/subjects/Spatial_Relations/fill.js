class FillLesson extends CurriculumLesson {
    constructor() {
        super('Fill', 'Flood fill an area');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = 0;
        let scene_height = 0;

        let bg_color = rnd_bg_color();

        let to_contain = rnd_bool();

        let target_num_videos = rnd_num_pairs();

        outer:
        while (true) {
            videos.length = 0;

            let obj_color = rnd_color([bg_color]);

            scene_width = demo ? 30 : rnd_int(8, 30);
            scene_height = demo ? 30 : rnd_int(8, 30);

            let object_max_width = rnd_obj_size(scene_width, 0.50, 0.75);
            let object_max_height = rnd_obj_size(scene_height, 0.50, 0.75);

            let subject_max_width = rnd_obj_size(scene_width, 0.10, 0.125);
            let subject_max_height = rnd_obj_size(scene_height, 0.10, 0.125);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height).eviscerate();

            let outlines = obj.grid.get_outlines();

            if (outlines.length === 1 || outlines[1].length < 16) {
                continue;
            }
            while (videos.length !== target_num_videos) {
                let scene = new Scene(scene_width, scene_height, bg_color);

                obj.set_random_position(scene.bounds);

                scene.add_object(obj);

                let subject_color = rnd_color([bg_color, obj_color]);

                let subject = SceneObject.random(subject_color, subject_max_width, subject_max_height);

                scene.add_object(subject);

                let contained = false;

                for (let i = 0; i < 100; i++) {
                    subject.set_random_position(scene.bounds);

                    if (scene.contains_overlapping_objects()) {
                        continue;
                    }
                    contained = subject.has_cell_within(obj);

                    if (to_contain) {
                        if (contained) {
                            break;
                        } else {
                            continue;
                        }
                    } else {
                        if (contained) {
                            continue;
                        } else {
                            break;
                        }
                    }
                }
                if (to_contain && !contained || !to_contain && contained) {
                    continue outer;
                }
                scene.start_recording();
                scene.render();

                scene.remove_object(subject);

                if (to_contain) {
                    xloop:
                    for (let x = 0; x < subject.grid.width; x++) {
                        for (let y = 0; y < subject.grid.height; y++) {
                            let lpos = obj.to_local(p2d(subject.grid_x + x, subject.grid_y + y));

                            if (obj.grid.array[lpos.y][lpos.x] === 10) {
                                obj.flood_fill(subject_color, lpos);

                                break xloop;
                            }
                        }
                    }
                } else {
                    obj.flood_fill(subject_color);
                }
                scene.render();
                scene.stop_recording();

                obj.flood_fill(10);

                scene.video.fps = 1;

                videos.push(scene.video);
            }
            break;
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}