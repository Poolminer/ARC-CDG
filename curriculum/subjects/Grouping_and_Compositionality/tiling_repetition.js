class TilingRepetitionLesson extends CurriculumLesson {
    constructor(){
        super('Tiling & Repetition', 'Replicate patterns across the grid.');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = demo ? 30 : rnd_int(6, 30);
        let scene_height = demo ? 30 : rnd_int(6, 30);

        let bg_color = rnd_bg_color();

        let palette = [];

        for(let c=0; c<10; c++){
            if(c !== bg_color){
                palette.push(c);
            }
        }
        let target_num_videos = rnd_num_pairs();

        let pattern_width, pattern_height;

        let flip_x = rnd_bool();
        let flip_y = rnd_bool();

        while (videos.length !== target_num_videos) {
            do {
                pattern_width = rnd_int(1, 3);
                pattern_height = rnd_int(1, 3);
            } while(pattern_width * pattern_height === 1);

            let pattern = new Grid(pattern_width, pattern_height);

            while(pattern.count_color(pattern.array[0][0]) === pattern.width * pattern.height){
                for(let x=0; x<pattern_width; x++){
                    for(let y=0; y<pattern_height; y++){
                        pattern.array[y][x] = rnd_val(palette);
                    }
                }
            }
            let scene = new Scene(scene_width, scene_height, bg_color);

            let obj = new SceneObject(pattern);

            obj.grid_x = 0;
            obj.grid_y = 0;

            scene.add_object(obj);

            scene.start_recording();
            scene.render();

            let r = 0;

            for(let x=0; x<scene_width; x+=pattern_width){
                for(let y=0; y<scene_height; y+=pattern_height){
                    obj = new SceneObject(pattern);

                    obj.grid_x = x;
                    obj.grid_y = y;

                    obj.r = r;

                    if(flip_y){
                        if(r === 0){
                            r = 2;
                        } else {
                            r = 0;
                        }
                    }
                    scene.add_object(obj);
                }
                if(flip_x){
                    if(r === 0){
                        r = 2;
                    } else {
                        r = 0;
                    }
                }
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