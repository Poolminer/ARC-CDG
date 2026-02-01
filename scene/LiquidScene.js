class LiquidScene extends Scene {
    constructor(width, height, bg_color, liquid_color = 1) {
        super(width, height, bg_color);
        this.liquid_color = 1;
        this.liquid_particle = new Grid(1, 1, liquid_color);
        this.liquid_field = arr2du8(width, height, 0);
        this.liquid_sources = [];
        this.liquid_viscous = true;
    }
    apply_objects_to_liquid_field() {
        this.cls();
        this.render_objects();

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.grid.array[y][x] !== this.bg_color) {
                    this.liquid_field[y][x] = 2;
                }
            }
        }
    }
    add_source(x, y) {
        this.liquid_field[y][x] = 1;
        this.liquid_sources.push(p2d(x, y));
    }
    liquid_neighbor(x, y, dx, dy) {
        let _x = x + dx;
        let _y = y + dy;

        if (_x < 0 || _x >= this.width || _y < 0 || _y >= this.height) {
            return null;
        }
        return this.liquid_field[_y][_x];
    }
    render(recording_allowed = true) {
        super.render(recording_allowed, () => {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let val = this.liquid_field[y][x];

                    if (val === 1 || val === 3) {
                        this.grid.draw(x, y, this.liquid_particle);
                    }
                }
            }
        });
    }
    cell_has_capacity(cx, cy, visited = arr2d(this.width, this.height, false)) {
        if (visited[cy][cx]) {
            return false;
        }
        visited[cy][cx] = true;

        for (let x = cx; x < this.width; x++) {
            let val = this.liquid_field[cy][x];

            if (val === 2) {
                break;
            }
            if (val === 0) {
                return true;
            }
        }
        for (let x = cx - 1; x > -1; x--) {
            let val = this.liquid_field[cy][x];

            if (val === 2) {
                break;
            }
            if (val === 0) {
                return true;
            }
        }
        if (cy === this.height - 1) {
            return false;
        }
        for (let x = cx; x < this.width; x++) {
            let val = this.liquid_field[cy][x];
            let val_down = this.liquid_field[cy + 1][x];

            if (val === 2) {
                break;
            }
            if (val_down === 2 || val_down === 3) {
                continue;
            }
            if (this.cell_has_capacity(x, cy + 1, visited)) {
                return true;
            }
        }
        for (let x = cx - 1; x > -1; x--) {
            let val = this.liquid_field[cy][x];
            let val_down = this.liquid_field[cy + 1][x];

            if (val === 2) {
                break;
            }
            if (val_down === 2 || val_down === 3) {
                continue;
            }
            if (this.cell_has_capacity(x, cy + 1, visited)) {
                return true;
            }
        }
        return false;
    }
    step() {
        let next = this.liquid_field.map(row => row.slice());

        let c = this.collide_bottom ? 0 : 1;

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - c; y++) {
                let val = this.liquid_field[y][x];

                if (val !== 1) {
                    continue;
                }
                let neighbor_bottom = this.liquid_neighbor(x, y, 0, 1);

                if (neighbor_bottom === 0) {
                    next[y + 1][x] = 1;
                    continue;
                }
                if (neighbor_bottom === 1) {
                    if (this.cell_has_capacity(x, y + 1)) {
                        continue;
                    } else {
                        next[y + 1][x] = 3;
                    }
                }
                let neighbor_left = this.liquid_neighbor(x, y, -1, 0);
                let neighbor_right = this.liquid_neighbor(x, y, 1, 0);

                if (neighbor_left === 0) {
                    next[y][x - 1] = 1;
                }
                if (neighbor_right === 0) {
                    next[y][x + 1] = 1;
                }
            }
        }
        this.liquid_field = next;
    }
}
