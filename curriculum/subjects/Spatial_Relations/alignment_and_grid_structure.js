class AlignmentAndGridStructureLesson extends CurriculumLesson {
    constructor() {
        super('Alignment and Grid Structure', 'Infer and construct underlying spatial grids or regular arrangements from partial or noisy patterns');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = 30;
        let scene_height = 30;

        let bg_color = rnd_bg_color();

        let small_grid = true;

        let target_num_videos = rnd_num_pairs();

        for (let i = 0; i < target_num_videos; i++) {
            let scene = new Scene(scene_width, scene_height, bg_color);

            let divisors = [2, 3, 5, 6, 10];

            let num_rows = rnd_val(divisors);
            let num_cols = num_rows;

            let cell_width = 30 / num_cols;
            let cell_height = 30 / num_rows;

            let obj_color = rnd_color([bg_color]);

            let object_max_width = rnd_obj_size(cell_width, 0.65, 0.75);
            let object_max_height = rnd_obj_size(cell_height, 0.65, 0.75);

            let template = arr2du8(num_cols, num_rows);

            let num_objects_rows = arr1d(num_rows);
            let num_objects_cols = arr1d(num_cols);
            let min_num_objects_per_row = num_cols * 0.5;
            let min_num_objects_per_col = num_rows * 0.5;

            let grid = new Grid(num_cols, num_rows, bg_color);

            if (small_grid) {
                grid.bounds.width = num_cols;
                grid.bounds.height = num_rows;
                grid.bounds.x = 15 - Math.floor(num_cols / 2 + 0.5);
                grid.bounds.y = 15 - Math.floor(num_rows / 2 + 0.5);
            }
            function add(x, y) {
                template[y][x] = rnd_bool() ? 1 : 0;

                if (template[y][x] === 1) {
                    let obj = SceneObject.random(obj_color, object_max_width, object_max_height, 0, 0.75);

                    let bounds = new Bounds(x * cell_width, y * cell_height, cell_width - 1, cell_height - 1);

                    obj.set_random_position(bounds);

                    scene.add_object(obj);

                    if (small_grid) {
                        grid.array[y][x] = obj_color;
                    } else {
                        for (let _x = 0; _x < cell_width; _x++) {
                            for (let _y = 0; _y < cell_height; _y++) {
                                grid.array[y * cell_height + _y][x * cell_width + _x] = obj_color;
                            }
                        }
                    }
                    num_objects_cols[x]++;
                    num_objects_rows[y]++;
                }
            }
            for (let x = 0; x < num_cols; x++) {
                while (num_objects_cols[x] < min_num_objects_per_col) {
                    for (let y = 0; y < num_rows; y++) {
                        if (template[y][x] === 1) {
                            continue;
                        }
                        add(x, y);
                    }
                }
            }
            for (let y = 0; y < num_rows; y++) {
                while (num_objects_rows[y] < min_num_objects_per_row) {
                    for (let x = 0; x < num_cols; x++) {
                        if (template[y][x] === 1) {
                            continue;
                        }
                        add(x, y);
                    }
                }
            }
            scene.start_recording();
            scene.render();
            scene.stop_recording();

            scene.video.add_grid(grid, false);

            scene.video.fps = 1;

            videos.push(scene.video);
        }

        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}