class FluidDynamicsNoInbetweenLesson extends CurriculumLesson {
    constructor() {
        super('Fluid Dynamics No In-between', 'Fluid Dynamics lesson without in-between frames');

        this.fluid_dynamics_lesson = new FluidDynamicsLesson();
    }
    generate_task(demo = false) {
        let new_videos = [];

        let target_num_videos = rnd_num_pairs();

        if (demo) {
            Math.seedRandom(seed);
        }
        for (let i = 0; i < target_num_videos; i++) {
            let video = this.fluid_dynamics_lesson.generate_task(i === 0 ? demo : false);

            let new_video = new GridVideo();

            new_video.add_grid(video.grids[0]);
            new_video.add_grid(video.grids[video.grids.length - 1]);

            new_videos.push(new_video);
        }
        let final_video = GridVideo.concat(new_videos);
        final_video.fps = 1;

        return final_video;
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}