class IdentityDisambiguationLesson extends CurriculumLesson {
    constructor() {
        super('Identity Disambiguation', 'Track the correct object among lookalikes');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = 0;
        let scene_height = 0;

        let bg_color = rnd_bg_color();

        let mutation_rate = 0.25;
        let remove_decoys = rnd_bool();

        let object_max_width = 0;
        let object_max_height = 0;
        let source_obj;
        let obj;

        let obj_color = rnd_color([bg_color]);
        let new_obj_color = rnd_color([bg_color, obj_color]);

        let target_num_videos = rnd_num_pairs();

        outer:
        while (true) {
            videos.length = 0;

            do {
                scene_width = demo ? 30 : rnd_int(8, 30);
                scene_height = demo ? 30 : rnd_int(8, 30);

                object_max_width = rnd_obj_size(scene_width, 0.10, 0.25);
                object_max_height = rnd_obj_size(scene_height, 0.10, 0.25);
                source_obj = SceneObject.random(obj_color, object_max_width, object_max_height);
            } while (source_obj.size < 8);

            obj = source_obj.clone().mutate(mutation_rate, obj_color);

            while (videos.length !== target_num_videos) {
                obj.set_color(obj_color);
                obj.flipud = false;
                obj.fliplr = false;
                obj.r = 0;

                let scene = new Scene(scene_width, scene_height, bg_color);

                obj.set_random_position(scene.bounds);

                scene.add_object(obj);

                let num_decoys = rnd_int(1, 3);
                let decoys = [];

                for (let i = 0; i < num_decoys; i++) {
                    let decoy = source_obj.clone().mutate(mutation_rate, obj_color);
                    decoys.push(decoy);

                    decoy.set_random_position(scene.bounds);

                    scene.add_object(decoy);
                }
                if (scene.contains_connected_objects()) {
                    continue;
                }
                if (scene.contains_equivalent_grids()) {
                    continue outer;
                }
                scene.start_recording();
                scene.render();

                if (remove_decoys) {
                    for (let decoy of decoys) {
                        scene.remove_object(decoy);
                    }
                } else {
                    obj.set_color(new_obj_color);
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