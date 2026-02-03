class ObjectCopyingLesson extends CurriculumLesson {
    constructor(){
        super('Object Copying', 'Copy an object a number of times.');
    }
    generate_task(demo = false) {
        let videos = [];

        let horizontal = rnd_bool();

        let scene_width = horizontal ? 29 : 5;
        let scene_height = horizontal ? 5 : 29;

        let bg_color = rnd_bg_color();
        let new_obj_color = rnd_color([bg_color]);

        let target_num_videos = rnd_num_pairs();

        let num_objs = rnd_int(2, 6);

        while (videos.length !== target_num_videos) {
            let object_max_width = 3;
            let object_max_height = 3;

            let obj_color = rnd_color([bg_color, new_obj_color]);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

            obj.grid_x = 1;
            obj.grid_y = 1;

            scene.add_object(obj);
            scene.start_recording();
            scene.render();

            for(let i=0; i<num_objs; i++){
                obj = obj.clone();

                if(horizontal){
                    obj.grid_x = 1 + (i + 1) * 4;
                    obj.grid_y = 1;
                } else {
                    obj.grid_x = 1;
                    obj.grid_y = 1 + (i + 1) * 4;
                }
                scene.add_object(obj);
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