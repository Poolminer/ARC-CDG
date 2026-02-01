class ObjectAssemblyLesson extends CurriculumLesson {
    constructor() {
        super('Object Assembly', 'Combine parts to form complex shapes.');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = demo ? 30 : rnd_int(25, 30);
        let scene_height = demo ? 30 : rnd_int(25, 30);

        let bg_color = rnd_bg_color();
        let connect_color_1 = rnd_color([bg_color]);
        let connect_color_2 = rnd_color([bg_color, connect_color_1]);

        let target_num_videos = rnd_num_pairs();

        let vertically = rnd_bool();

        let subdivide_first = rnd_bool();

        let subdivide_second = rnd_bool();

        let keep_edges = rnd_bool();

        while (videos.length !== target_num_videos) {
            let object_max_width = rnd_obj_size(scene_width, 0.75, 0.75);
            let object_max_height = rnd_obj_size(scene_height, 0.75, 0.75);

            let obj_color = rnd_color([bg_color, connect_color_1, connect_color_2]);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let obj = SceneObject.random(obj_color, object_max_width, object_max_height, 0, 0.5, 0.5);

            let split1 = vertically ? obj.split_vertically(obj.height / 2, connect_color_1) : obj.split_horizontally(obj.width / 2, connect_color_1);

            let obj_p1 = split1[0];

            let obj_p2 = split1[1];

            let split2 = vertically ? obj_p1.split_horizontally(obj.width / 2, connect_color_2) : obj_p1.split_vertically(obj.height / 2, connect_color_2);

            let split3 = vertically ? obj_p2.split_horizontally(obj.width / 2, connect_color_2) : obj_p2.split_vertically(obj.height / 2, connect_color_2);

            if(subdivide_first){
                scene.add_object(split2[0]);
                scene.add_object(split2[1]);
            } else {
                scene.add_object(obj_p1);
            }
            if(subdivide_second){
                scene.add_object(split3[0]);
                scene.add_object(split3[1]);
            } else {
                scene.add_object(obj_p2);
            }

            do {
                for(let obj of scene.objects){
                    obj.set_random_position(scene.bounds);
                }
            } while(scene.contains_connected_objects());

            scene.start_recording();
            scene.render();

            if(subdivide_first){
                split2[0].grid_x = 0;
                split2[0].grid_y = 0;

                if(vertically){
                    split2[1].grid_x = 0;
                    split2[1].grid_y = split2[0].height;
                } else {
                    split2[1].grid_x = split2[0].width;
                    split2[1].grid_y = 0;
                }
            } else {
                obj_p1.grid_x = 0;
                obj_p1.grid_y = 0;
            }
            if(subdivide_second){
                if(vertically){
                    split3[0].grid_x = obj_p1.width;
                    split3[0].grid_y = 0;
                    split3[1].grid_x = obj_p1.width;
                    split3[1].grid_y = split3[0].height;
                } else {
                    split3[0].grid_x = 0;
                    split3[0].grid_y = obj_p1.height;
                    split3[1].grid_x = split3[0].width;
                    split3[1].grid_y = obj_p1.height;
                }
            } else {
                if(vertically){
                    obj_p2.grid_x = obj_p1.width;
                    obj_p2.grid_y = 0;
                } else {
                    obj_p2.grid_x = 0;
                    obj_p2.grid_y = obj_p1.height;
                }
            }
            if(!keep_edges){
                for(let obj of scene.objects){
                    obj.set_color(obj_color);
                }
            }
            scene.stop_recording()

            scene.render();
            
            scene.video.add_grid(scene.grid.bound(bg_color), false);

            scene.video.fps = 1;

            videos.push(scene.video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}