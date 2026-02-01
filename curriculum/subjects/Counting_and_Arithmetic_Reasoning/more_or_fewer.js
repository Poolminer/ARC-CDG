class MoreOrFewerLesson extends CurriculumLesson {
    constructor(){
        super('More or Fewer', 'Determine which are greater or fewer in number.');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = demo ? 30 : rnd_int(15, 30);
        let scene_height = demo ? 30 : rnd_int(15, 30);

        let bg_color = rnd_bg_color();
        
        let obj_color_mark = rnd_color([bg_color]);

        let target_num_videos = rnd_num_pairs();

        let target_more = rnd_bool();

        let target_action = rnd_int(0, 1);

        outer:
        while (videos.length !== target_num_videos) {
            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.20);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.20);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let num_more = rnd_int(2, 5);

            let num_fewer;

            do {
                num_fewer = rnd_int(1, num_more - 1);
            } while(num_fewer === num_more);

            let objs_more = [];

            let objs_fewer = [];

            let obj_color_more = rnd_color([bg_color, obj_color_mark]);
            let obj_color_fewer = rnd_color([bg_color, obj_color_more, obj_color_mark]);

            for (let i = 0; i < num_more; i++) {
                let obj = SceneObject.random(obj_color_more, object_max_width, object_max_height);

                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while (scene.contains_connected_objects() && ++attempts < 12);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
                objs_more.push(obj);
            }
            for (let i = 0; i < num_fewer; i++) {
                let obj = SceneObject.random(obj_color_fewer, object_max_width, object_max_height);

                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while (scene.contains_connected_objects() && ++attempts < 12);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
                objs_fewer.push(obj);
            }
            scene.start_recording();
            scene.render();

            let targets = target_more ? objs_more : objs_fewer;

            switch(target_action){
                case 0:
                    for(let target of targets){
                        scene.remove_object(target)
                    }
                break;
                case 1:
                    for(let target of targets){
                        target.set_color(obj_color_mark);
                    }
                break;
            }
            scene.render();

            scene.video.fps = 1;

            videos.push(scene.video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}