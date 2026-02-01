class SymmetryRepairingLesson extends CurriculumLesson {
    constructor(crop = false){
        super('Symmetry Repairing', 'Restore symmetric structures from incomplete ones.');
        this.crop = crop;
    }
    generate_task(demo = false) {
        let videos = [];

        let bg_color = rnd_bg_color();

        let target_num_videos = rnd_num_pairs();

        while (videos.length !== target_num_videos) {
            let scene_width = 30;
            let scene_height = 30;

            let object_max_size = rnd_obj_size(30, 0.20, 0.35);

            let symmetry = 1;

            let obj_color = rnd_color([bg_color]);

            let obj = SceneObject.random(obj_color, object_max_size, object_max_size, symmetry, 0.5);

            let scene = new Scene(scene_width, scene_height, bg_color);

            obj.set_random_position(scene.bounds);

            object_max_size = Math.round(Math.max(1, object_max_size / 2));

            let breaker_obj = SceneObject.random(bg_color, object_max_size, object_max_size, 0, 0.5);

            let point = p2add(rnd_val(obj.outlines[0].points), p2d(obj.grid_x, obj.grid_y));

            breaker_obj.x = point.x;
            breaker_obj.y = point.y;

            if(this.crop){
                scene_width = obj.width;
                scene_height = obj.height;

                scene = new Scene(scene_width, scene_height, bg_color);

                breaker_obj.grid_x -= obj.grid_x;
                breaker_obj.grid_y -= obj.grid_y;

                obj.grid_x = 0;
                obj.grid_y = 0;
            }
            scene.add_object(obj);

            scene.add_object(breaker_obj);

            scene.start_recording();
            scene.render();

            scene.remove_object(breaker_obj);

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