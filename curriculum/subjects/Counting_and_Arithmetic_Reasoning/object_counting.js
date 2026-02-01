class ObjectCountingLesson extends CurriculumLesson {
    constructor(){
        super('Object Counting', 'Count objects on the grid.');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = demo ? 30 : rnd_int(15, 30);
        let scene_height = demo ? 30 : rnd_int(15, 30);

        let bg_color = rnd_bg_color();
        
        let horizontal = rnd_bool();

        let target_num_videos = rnd_num_pairs();

        outer:
        while (videos.length !== target_num_videos) {
            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.20);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.20);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let num_objs = rnd_int(1, 9);

            for (let i = 0; i < num_objs; i++) {
                let obj_color = rnd_color([bg_color]);

                let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while (scene.contains_connected_objects() && ++attempts < 12);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
            }
            scene.start_recording();
            scene.render();

            if(horizontal){
                scene.video.add_grid(new Grid(num_objs, 1, bg_color), false);
            } else {
                scene.video.add_grid(new Grid(1, num_objs, bg_color), false);
            }
            scene.stop_recording();

            scene.video.fps = 1;

            videos.push(scene.video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}