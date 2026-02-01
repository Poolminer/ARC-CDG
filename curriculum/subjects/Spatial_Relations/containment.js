class ContainmentLesson extends CurriculumLesson {
    constructor() {
        super('Containment', 'Objects are either contained or not contained within others');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = 0;
        let scene_height = 0;

        let bg_color = rnd_bg_color();

        let remove_subjects = rnd_bool();
        let remove_inner = rnd_bool();

        let target_num_videos = rnd_num_pairs();

        outer:
        while (true) {
            videos.length = 0;

            let obj_color = rnd_color([bg_color]);
            let subject_color = rnd_color([bg_color, obj_color]);
            let new_subject_color = rnd_color([bg_color, obj_color, subject_color]);

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

                let num_subjects = rnd_int(3, 6);

                let subjects = [];

                let is_obj_subject = (subject) => {
                    return subject.has_cell_within(obj);
                };
                let obj_subject_count = () => {
                    let count = 0;

                    for (let subject of subjects) {
                        if (is_obj_subject(subject)) {
                            count++;
                        }
                    }
                    return count;
                };
                for (let i = 0; i < num_subjects; i++) {
                    let subject = SceneObject.random(subject_color, subject_max_width, subject_max_height);

                    subjects.push(subject);

                    scene.add_object(subject);
                }
                let has_subjects = false;

                for (let i = 0; i < 100; i++) {
                    for (let subject of subjects) {
                        subject.set_random_position(scene.bounds);
                    }
                    if (scene.contains_overlapping_objects()) {
                        continue;
                    }
                    let subject_count = obj_subject_count();

                    if (subject_count > 0 && subject_count != num_subjects) {
                        has_subjects = true;

                        break;
                    }
                }
                if (!has_subjects) {
                    continue outer;
                }
                scene.start_recording();
                scene.render();

                for (let subject of subjects) {
                    if (is_obj_subject(subject)) {
                        if (remove_subjects) {
                            if (remove_inner) {
                                scene.remove_object(subject);
                            }
                        } else {
                            subject.set_color(new_subject_color);
                        }
                    } else {
                        if (remove_subjects && !remove_inner) {
                            scene.remove_object(subject);
                        }
                    }
                }
                scene.render();
                scene.stop_recording();

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