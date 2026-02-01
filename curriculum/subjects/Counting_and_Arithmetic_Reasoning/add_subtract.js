class AddSubtractLesson extends CurriculumLesson {
    constructor(){
        super('Add/Subtract', 'Observe and reason about quantity changes.');
    }
    generate_task(demo = false) {
        let videos = [];

        let bg_color = rnd_color();
        
        let target_num_videos = rnd_num_pairs();

        let add = rnd_bool();

        let amount = rnd_int(1, 3);

        let horizontal = rnd_bool();

        let counts = new Array(11).fill(0);

        let size_before_test = add ? rnd_int(1, 10 - amount) : rnd_int(amount + 1, 10);

        outer:
        while (videos.length !== target_num_videos) {
            let video = new GridVideo();

            let sizes = new Array(3);
            
            for(let i=0; i<sizes.length; i++){
                let size;

                do {
                    size = add ? rnd_int(1, 10 - amount) : rnd_int(amount + 1, 10);
                } while(size === size_before_test);

                sizes[i] = size;
            }
            let lowest_count = Infinity;

            let size_before;

            if(videos.length === target_num_videos - 1){
                size_before = size_before_test;
            } else {
                for(let size of sizes){
                    let count = counts[size];

                    if(count < lowest_count){
                        lowest_count = count;
                        size_before = size;
                    }
                }
            }
            counts[size_before]++;
            
            let size_after = add ? size_before + amount : size_before - amount;

            if(horizontal){
                video.add_grid(new Grid(size_before, 1, bg_color));
                video.add_grid(new Grid(size_after, 1, bg_color));
            } else {
                video.add_grid(new Grid(1, size_before, bg_color));
                video.add_grid(new Grid(1, size_after, bg_color));
            }
            video.fps = 1;
            videos.push(video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}