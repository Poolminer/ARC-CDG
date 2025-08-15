class LineDrawing extends CurriculumLesson {
    constructor() {
        super('Line Drawing', 'Draw lines to connect two points');
    }
    generate_task(demo = false) {
        let scene;
        let videos = [];

        let scene_width = demo ? 30 : rnd_int(8, 30);
        let scene_height = demo ? 30 : rnd_int(8, 30);

        let bg_color = rnd_bg_color();

        let target_num_videos = rnd_num_pairs();

        for (let i = 0; i < target_num_videos; i++) {
            scene = new Scene(scene_width, scene_height, bg_color);

            let pt_color = rnd_color([bg_color]);

            let p1 = new SceneObject(new Grid(1, 1, pt_color));
            let p2 = new SceneObject(new Grid(1, 1, pt_color));

            do {
                if (rnd_bool()) {
                    p1.set_random_position(scene.bounds);
                    p2.set_random_position(scene.bounds);

                    if (rnd_bool()) {
                        p2.x = p1.x;
                    } else {
                        p2.y = p1.y;
                    }
                } else {
                    let bounds = new Bounds(0, 0, 0, 0)

                    do {
                        bounds.width = rnd_int(3, Math.min(scene_width, scene_height));
                        bounds.height = bounds.width;
                        bounds.x = rnd_int(0, scene_width - bounds.width);
                        bounds.y = rnd_int(0, scene_height - bounds.height);
                    } while (!scene.bounds.contains_bounds(bounds, true));

                    if (rnd_bool()) {
                        p1.grid_x = bounds.x;
                        p1.grid_y = bounds.y;
                        p2.grid_x = bounds.x + bounds.width;
                        p2.grid_y = bounds.y + bounds.height;
                    } else {
                        p1.grid_x = bounds.x + bounds.width;
                        p1.grid_y = bounds.y;
                        p2.grid_x = bounds.x;
                        p2.grid_y = bounds.y + bounds.height;
                    }
                }
            } while (Math.abs(p1.x - p2.x) < 2 && Math.abs(p1.y - p2.y) < 2);

            scene.add_object(p1);
            scene.add_object(p2);

            scene.start_recording();
            scene.render();

            scene.render(true, () => {
                scene.grid.draw_line(p2d(p1.grid_x, p1.grid_y), p2d(p2.grid_x, p2.grid_y), pt_color);
            });
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