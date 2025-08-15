class Outline {
    constructor(x, y) {
        this.list = [];
        this.points = [p2d(x, y)];
        this.corner_cells = [];
        this.cells = [];
        this.inner_cells = [];
        this.outer_cells = [];
        this.normals = [];
        this._x = x;
        this._y = y;
        this.width = 0;
        this.height = 0;
        this.length = 0;
        this._curr_x = x;
        this._curr_y = y;
    }
    add_segment(direction, seg_length) {
        this.list.push([direction, seg_length]);
        this.length += seg_length;

        switch (direction) {
            case 0: // up
                this._curr_y -= seg_length;
                break;
            case 1: // down
                this._curr_y += seg_length;
                break;
            case 2: // left
                this._curr_x -= seg_length;
                break;
            case 3: // right
                this._curr_x += seg_length;
                break;
            default:
                break;
        }
        this.points.push(p2d(this._curr_x, this._curr_y));
    }
    add_cell(x, y) {
        this.cells.push(p2d(x, y));
    }
    add_corner_cell(x, y) {
        this.corner_cells.push(p2d(x, y));
    }
    compute_normals() {
        this.normals = [];

        for (let i = 0; i <= this.list.length; i++) {
            let prev;
            let next;
            let normal;

            if (i === 0 || i === this.list.length) {
                prev = arrlast(this.list)[0];
                next = this.list[0][0];
            } else {
                prev = this.list[i - 1][0];
                next = this.list[i][0];
            }
            switch (prev) {
                case 0: // up
                    switch (next) {
                        case 0: // up
                            normal = p2d(-1, 0);
                            break;
                        case 2: // left
                            normal = p2d(-deg90, deg90);
                            break;
                        case 3: // right
                            normal = p2d(-deg90, -deg90);
                            break;
                    }
                    break;
                case 1: // down
                    switch (next) {
                        case 1: // down
                            normal = p2d(1, 0);
                            break;
                        case 2: // left
                            normal = p2d(deg90, deg90);
                            break;
                        case 3: // right
                            normal = p2d(deg90, -deg90);
                            break;
                    }
                    break;
                case 2: // left
                    switch (next) {
                        case 2: // left
                            normal = p2d(0, 1);
                            break;
                        case 0: // up
                            normal = p2d(-deg90, deg90);
                            break;
                        case 1: // down
                            normal = p2d(deg90, deg90);
                            break;
                    }
                    break;
                case 3: // right
                    switch (next) {
                        case 3: // right
                            normal = p2d(0, -1);
                            break;
                        case 0: // up
                            normal = p2d(-deg90, -deg90);
                            break;
                        case 1: // down
                            normal = p2d(deg90, -deg90);
                            break;
                    }
                    break;
            }
            this.normals.push(normal);
        }
    }
    compute_cells() {
        for (let p of this.points) {
            for (let x = -1; x < 1; x++) {
                for (let y = -1; y < 1; y++) {
                    let cell = p2d(p.x + x, p.y + y);

                    if (this.encloses(cell.x, cell.y)) {
                        this.inner_cells.push(cell);
                    } else {
                        this.outer_cells.push(cell);
                    }
                }
            }
        }
    }
    analyze() {
        let low_x = Infinity;
        let low_y = Infinity;
        let high_x = -Infinity;
        let high_y = -Infinity;

        for (let point of this.points) {
            if (point.x < low_x) {
                low_x = point.x;
            }
            if (point.y < low_y) {
                low_y = point.y;
            }
            if (point.x > high_x) {
                high_x = point.x;
            }
            if (point.y > high_y) {
                high_y = point.y;
            }
        }
        this.width = high_x - low_x;
        this.height = high_y - low_y;

        this.compute_normals();
        this.compute_cells();
    }
    /**
     * Merge lines with same direction
     */
    simplify() {
        if (this.list.length === 0) {
            return new Outline(this._x, this._y);
        }
        let outline = new Outline(this._x, this._y);
        let current_length = this.list[0][1];

        for (let i = 1; i < this.list.length; i++) {
            let prev = this.list[i - 1];
            let curr = this.list[i];

            if (prev[0] === curr[0]) {
                current_length += curr[1];
            } else {
                outline.add_segment(prev[0], current_length);
                current_length = curr[1];
            }
        }
        outline.add_segment(this.list[this.list.length - 1][0], current_length);

        outline.cells = this.cells;
        outline.corner_cells = this.corner_cells;
        outline.analyze();

        return outline;
    }
    encloses(x, y) {
        return point_in_polygon(x + 0.5, y + 0.5, this.points);
    }
    intersects(p1, p2) {
        return line_intersects_polygon(this.points, p1, p2);
    }
    scaled_points(scale) {
        let scaled = [];

        outer:
        for (let i = 1; i < this.points.length; i++) {
            let point = this.points[i];

            for (let j = 1; j < this.points.length - 1; j++) {
                if (j === i) {
                    continue;
                }
                let p1 = this.points[i];
                let p2 = this.points[j];

                if (Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1) {
                    continue outer;
                }
            }
            let normal = this.normals[i];

            scaled.push(p2add(point, p2scale(normal, scale)));
        };
        return scaled;
    }
}