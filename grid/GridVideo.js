class GridVideo {
    grids = [];
    grids_fit_to = [];
    current_frame = 0;
    player_id = -1;
    grid_canvas = null;
    fps = 0;

    constructor() {

    }
    add_grid(grid, fit_to = true) {
        this.grids.push(grid);
        this.grids_fit_to.push(fit_to);
    }
    stop(reset = true) {
        window.clearInterval(this.player_id);

        if (reset) {
            this.current_frame = 0;
        }
    }
    play(cell_size = 8, border_size = 1, fps = this.num_frames, loop = true, prerender = false) {
        if (this.grids.length === 0) {
            return;
        }
        if (this.grid_canvas === null) {
            this.grid_canvas = new GridCanvas();
        }
        this.grid_canvas.cell_size = cell_size;
        this.grid_canvas.border_size = border_size;

        let greatest_width = 0;
        let greatest_height = 0;

        for(let grid of this.grids){
            if(grid.width > greatest_width){
                greatest_width = grid.width;
            }
            if(grid.height > greatest_height){
                greatest_height = grid.height;
            }
        }
        this.grid_canvas.fit_to_wh(greatest_width, greatest_height);
        
        let render = () => {
            if (this.element.parentNode === null) {
                this.stop();

                return;
            }
            if (!in_viewport(this.element.parentNode, this.grid_canvas.element, true)) {
                return;
            }
            this.grid_canvas.render(this.grids[this.current_frame], this.grids_fit_to[this.current_frame]);
            this.current_frame += 1;
            this.current_frame %= this.grids.length;

            if (!loop && this.current_frame === 0) {
                this.stop();
            }
        }
        if (prerender) {
            for (let i = 0; i < this.num_frames; i++) {
                render();
            }
        }
        this.player_id = window.setInterval(() => {
            render();
        }, fps === 0 ? 0 : Math.round(1000 / fps));

        render();
    }
    pop() {
        return this.grids.pop();
    }
    num_unique_frames() {
        let grids = this.grids.slice();

        for (let i = 0; i < grids.length; i++) {
            if (grids[i] === null) {
                continue;
            }
            for (let j = i + 1; j < grids.length; j++) {
                if (grids[j] !== null && grids[i].equals(grids[j])) {
                    grids[j] = null;
                }
            }
        }
        return grids.filter(x => x !== null).length;
    }
    get element() {
        if (this.grid_canvas === null) {
            this.grid_canvas = new GridCanvas();
        }
        return this.grid_canvas.element;
    }
    get num_frames() {
        return this.grids.length;
    }
    static concat(videos) {
        let result = new GridVideo();
        let fps = 0;

        for (let video of videos) {
            fps += video.fps;
        }
        fps /= videos.length;
        result.fps = fps;

        for (let video of videos) {
            for (let i = 0; i < video.grids.length; i++) {
                let grid = video.grids[i];
                let to_fit = video.grids_fit_to[i];

                result.add_grid(grid, to_fit);
            }
        }
        return result;
    }
}