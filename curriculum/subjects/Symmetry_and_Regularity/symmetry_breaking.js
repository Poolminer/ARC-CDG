class SymmetryBreakingLesson extends CurriculumLesson {
    constructor(crop = false){
        super('Symmetry Breaking', 'Detect anomalies in symmetric patterns.');
        this.crop = crop;
    }
    generate_task(demo = false) {
        let videos = [];

        let bg_color = rnd_bg_color();

        let obj_color = rnd_color([bg_color]);

        let mark_color = rnd_color([bg_color, obj_color]);

        let target_num_videos = rnd_num_pairs();

        while (videos.length !== target_num_videos) {
            let scene_width = 30;
            let scene_height = 30;

            let object_max_size = rnd_obj_size(30, 0.15, 0.25);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let symmetry = 1;

            let obj = SceneObject.random(obj_color, object_max_size, object_max_size, symmetry, 0.5);

            object_max_size = Math.round(Math.max(1, object_max_size / 2));

            let breaker_obj = SceneObject.random(obj_color, object_max_size, object_max_size, 0, 0.5);

            scene.add_object(breaker_obj);
            
            scene.add_object(obj);

            breaker_obj.set_random_position(scene.bounds);

            do {
                obj.set_random_position(scene.bounds);
            } while(!scene.contains_touching_objects());

            if(this.crop){
                scene.render();
                let new_grid = scene.grid.bound(bg_color);

                let dx = breaker_obj.grid_x < obj.grid_x ? breaker_obj.grid_x : obj.grid_x;
                let dy = breaker_obj.grid_y < obj.grid_y ? breaker_obj.grid_y : obj.grid_y;

                scene_width = new_grid.width;
                scene_height = new_grid.height;

                scene = new Scene(scene_width, scene_height, bg_color);
                obj.grid_x -= dx;
                obj.grid_y -= dy;
                
                breaker_obj.grid_x -= dx;
                breaker_obj.grid_y -= dy;

                scene.add_object(breaker_obj);
                scene.add_object(obj);
            }

            scene.start_recording();
            scene.render();

            breaker_obj.set_color(mark_color);

            scene.render();

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