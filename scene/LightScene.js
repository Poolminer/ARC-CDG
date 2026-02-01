class LightScene extends Scene {
    constructor(width, height, bg_color, light_color = 1) {
        super(width, height, bg_color);
        this.light_color = light_color;
        this.light_source_color = light_color;
        this.light_particle = new Grid(1, 1, light_color);
        this.light_source = p2d();
        this.light_beam_angle = Math.PI;
        this.light_direction = 0;
    }
    render(recording_allowed = true) {
        super.render(recording_allowed, () => {
            this.shine();
        });
    }
    shine() {
        let dvec = p2rot(p2d(0, 1), this.light_direction);

        this.grid.array[this.light_source.y][this.light_source.x] = this.light_source_color;

        for (let x = 0; x < this.width; x++) {
            outer:
            for (let y = 0; y < this.height; y++) {
                if (x === this.light_source.x && y === this.light_source.y) {
                    continue;
                }
                let light_source = p2add(this.light_source, p2d(0.5, 0.5));

                let dx = x - light_source.x;
                let dy = y - light_source.y;

                let angle = p2angle(dvec, p2d(dx, dy));

                if (angle > this.light_beam_angle + 1e-12) {
                    continue;
                }
                let target = p2d(x + 0.5, y + 0.5);

                for (let obj of this.objects) {
                    if (obj.line_intersects(light_source, target)) {
                        continue outer;
                    }
                }
                this.grid.array[y][x] = this.light_color;
            }
        }
    }
    step() {
        return;
    }
}
