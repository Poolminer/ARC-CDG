class ProportionalReasoningLesson extends CurriculumLesson {
    constructor(){
        super('Proportional Reasoning', 'Double, half, or equal group sizes.');
    }
    generate_task(demo = false) {
        let videos = [];

        let horizontal = rnd_bool();

        let num_objs = rnd_int(2, 6);

        let obj_indices = [0, 1, 2, 3, 4];

        obj_indices.length = num_objs;

        let scene_width = horizontal ? num_objs : 28;
        let scene_height = horizontal ? 28 : num_objs;

        let bg_color = rnd_bg_color();

        let obj_colors = [];

        for(let i=0; i<num_objs; i++){
            obj_colors.push(rnd_color([bg_color, ...obj_colors]));
        }
        let target_num_videos = rnd_num_pairs();

        let target_obj_index = rnd_int(0, num_objs - 1);

        let obj_proportions = [];

        for(let i=0; i<num_objs; i++){
            obj_proportions[i] = i === target_obj_index ? 1 : rnd_val([0.5, 2]);
        }

        let to_float = rnd_bool();

        let target_obj_size_test = 2 * rnd_int(1, 7);
        
        while (videos.length !== target_num_videos) {
            let scene = new Scene(scene_width, scene_height, bg_color);

            let target_obj_size;

            if(videos.length === target_num_videos - 1){
                target_obj_size = target_obj_size_test;
            } else {
                do {
                    target_obj_size = 2 * rnd_int(1, 7);
                } while(target_obj_size === target_obj_size_test);
            }

            for(let i=0; i<num_objs; i++){
                let obj;
                let obj_size = i === target_obj_index ? target_obj_size : 28;

                if(horizontal){
                    let grid = new Grid(1, obj_size, obj_colors[i]);
                    obj = new SceneObject(grid);

                    obj.grid_x = i;
                    obj.grid_y = to_float ? 28 - obj_size : 0;
                } else {
                    let grid = new Grid(obj_size, 1, obj_colors[i]);
                    obj = new SceneObject(grid);

                    obj.grid_x = to_float ? 28 - obj_size : 0;
                    obj.grid_y = i;
                }
                scene.add_object(obj);
            }
            scene.start_recording();
            scene.render();

            scene.clear();

            for(let i=0; i<num_objs; i++){
                let obj;

                let obj_size = Math.round(target_obj_size * obj_proportions[i]);

                if(horizontal){
                    let grid = new Grid(1, obj_size, obj_colors[i]);
                    obj = new SceneObject(grid);

                    obj.grid_x = i;
                    obj.grid_y = to_float ? 28 - obj_size : 0;
                } else {
                    let grid = new Grid(obj_size, 1, obj_colors[i]);
                    obj = new SceneObject(grid);

                    obj.grid_x = to_float ? 28 - obj_size : 0;
                    obj.grid_y = i;
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