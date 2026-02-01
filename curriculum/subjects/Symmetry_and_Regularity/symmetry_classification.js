class SymmetryClassificationLesson extends CurriculumLesson {
    constructor(){
        super('Symmetry Classification', 'Assign colors based on symmetry type.');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = 30;
        let scene_height = 30;

        let bg_color = rnd_bg_color();

        let color_full_symmetry = rnd_color([bg_color]);
        let color_horizontal_symmetry = rnd_color([bg_color, color_full_symmetry]);
        let color_vertical_symmetry = rnd_color([bg_color, color_full_symmetry, color_horizontal_symmetry]);
        let color_diagonal_symmetry = rnd_color([bg_color, color_full_symmetry, color_horizontal_symmetry, color_vertical_symmetry]);

        let target_num_videos = rnd_num_pairs();

        while (videos.length !== target_num_videos) {
            let object_max_size = rnd_obj_size(scene_width, 0.15, 0.25);

            let obj_color = rnd_color([bg_color, color_full_symmetry, color_horizontal_symmetry, color_vertical_symmetry, color_diagonal_symmetry]);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let obj_full_symmetry = SceneObject.random(obj_color, object_max_size, object_max_size, 1, 0.5);
            let obj_horizontal_symmetry;
            let obj_vertical_symmetry;
            let obj_diagonal_symmetry;
            
            do {
                obj_horizontal_symmetry = SceneObject.random(obj_color, object_max_size, object_max_size, 2, 0.5);
            } while(obj_horizontal_symmetry.is_vertically_symmetrical() || obj_horizontal_symmetry.is_diagonally_symmetrical());

            do {
                obj_vertical_symmetry = SceneObject.random(obj_color, object_max_size, object_max_size, 3, 0.5);
            } while(obj_vertical_symmetry.is_horizontally_symmetrical() || obj_horizontal_symmetry.is_diagonally_symmetrical());

            do {
                obj_diagonal_symmetry = SceneObject.random(obj_color, object_max_size, object_max_size, 4, 0.5);
            } while(obj_diagonal_symmetry.is_horizontally_symmetrical() || obj_diagonal_symmetry.is_vertically_symmetrical());

            scene.add_object(obj_full_symmetry);
            scene.add_object(obj_horizontal_symmetry);
            scene.add_object(obj_vertical_symmetry);
            scene.add_object(obj_diagonal_symmetry);

            do {
                for(let obj of scene.objects){
                    obj.set_random_position(scene.bounds);
                }
            } while(scene.contains_connected_objects());

            scene.start_recording();
            scene.render();

            obj_full_symmetry.set_color(color_full_symmetry);
            obj_horizontal_symmetry.set_color(color_horizontal_symmetry);
            obj_vertical_symmetry.set_color(color_vertical_symmetry);
            obj_diagonal_symmetry.set_color(color_diagonal_symmetry);

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