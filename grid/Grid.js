class Grid {
    static #OUTL = [[[-1, -1, 2, 2], [0, -1, 4, 0], [0, 0, 1, 3]], [[1, 1, 1, 3], [0, 1, 8, 1], [0, 0, 2, 2]], [[-1, 1, 8, 1], [-1, 0, 2, 2], [0, 0, 4, 0]], [[1, -1, 4, 0], [1, 0, 1, 3], [0, 0, 8, 1]]];

    constructor(width = 1, height = 1, bg_color = 10, array) {
        this.width = width;
        this.height = height;
        this.bounds = new Bounds(0, 0, width, height);
        this.array = array ?? arr2du8(width, height, bg_color);

        if (array) {
            this.width = array[0].length;
            this.height = array.length;
        }
        this.area = this.width * this.height;
    }
    get_outlines() {
        let cells_processed_sides = arr2du8(this.width, this.height, 0);
        let outline_cells_added = arr2du8(this.width, this.height, 0);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let color = this.array[y][x];

                if (color === 10) {
                    cells_processed_sides[y][x] = 15; // all
                    continue;
                }
                color = this.color_at(x, y - 1);
                if (color !== null && color !== 10) {
                    cells_processed_sides[y][x] |= 1; // top
                }
                color = this.color_at(x, y + 1);
                if (color !== null && color !== 10) {
                    cells_processed_sides[y][x] |= 2; // bottom
                }
                color = this.color_at(x - 1, y);
                if (color !== null && color !== 10) {
                    cells_processed_sides[y][x] |= 4; // left
                }
                color = this.color_at(x + 1, y);
                if (color !== null && color !== 10) {
                    cells_processed_sides[y][x] |= 8; // right
                }
            }
        }
        let outlines = [];
        let outlines_simplified = [];

        while (true) {
            let found = false;
            let outline;
            let direction;
            let prev_direction;

            inner:
            for (let cx = 0; cx < this.width; cx++) {
                for (let cy = 0; cy < this.height; cy++) {
                    let x = cx;
                    let y = cy;

                    let cps = cells_processed_sides[y][x];

                    if (cps !== 15) {
                        found = true;

                        if ((cps & 1) === 0) { // top
                            outline = new Outline(x, y);
                            direction = 3;
                            outline.add_segment(direction, 1); // right
                            outline.add_cell(x, y);
                            cells_processed_sides[y][x] |= 1;
                        } else if ((cps & 8) === 0) { // right
                            outline = new Outline(x + 1, y);
                            direction = 1;
                            outline.add_segment(direction, 1); // down
                            outline.add_cell(x, y);
                            cells_processed_sides[y][x] |= 8;
                        } else if ((cps & 2) === 0) { // bottom
                            outline = new Outline(x + 1, y + 1);
                            direction = 2;
                            outline.add_segment(direction, 1); // left
                            outline.add_cell(x, y);
                            cells_processed_sides[y][x] |= 2;
                        } else if ((cps & 4) === 0) { // left
                            outline = new Outline(x, y + 1);
                            direction = 0;
                            outline.add_segment(direction, 1); // up
                            outline.add_cell(x, y);
                            cells_processed_sides[y][x] |= 4;
                        }
                        let first_direction = direction;
                        let closed = false;

                        while (!closed) {
                            for (let i = 0; i < 3; i++) {
                                let dat = Grid.#OUTL[direction][i];

                                let color = this.color_at(x + dat[0], y + dat[1]);

                                if (color === null || color === 10) {
                                    continue;
                                }
                                prev_direction = direction;
                                direction = dat[3];

                                x += dat[0];
                                y += dat[1];

                                if (direction !== prev_direction) {
                                    outline.add_corner_cell(x, y);
                                }
                                if (outline_cells_added[y][x] === 0) {
                                    outline.add_cell(x, y);
                                    outline_cells_added[y][x] = 1;
                                }
                                if (cells_processed_sides[y][x] & dat[2]) {
                                    closed = true;
                                    break;
                                }
                                outline.add_segment(direction, 1);
                                cells_processed_sides[y][x] |= dat[2];
                                break;
                            }
                        }
                        if (direction !== first_direction) {
                            outline.add_corner_cell(cx, cy);
                        }
                        outline.analyze();
                        outlines.push(outline);
                        //outlines_simplified.push(outline.simplify());
                        break inner;
                    }
                }
            }
            if (!found) {
                break;
            }
        }
        return outlines;
    }
    rot90(k = 1) {
        let result = this.array;

        for (let r = 0; r < k; r++) {
            let rows = result.length;
            let cols = result[0].length;
            let rotated = Array.from({ length: cols }, () => Array(rows));

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    rotated[j][rows - 1 - i] = result[i][j];
                }
            }
            result = rotated;
        }
        return new Grid(result[0].length, result.length, 0, result);
    }
    flipud() {
        let flipped = new Grid(this.width, this.height);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                flipped.array[y][x] = this.array[this.height - 1 - y][x];
            }
        }
        return flipped;
    }
    fliplr() {
        let flipped = new Grid(this.width, this.height);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                flipped.array[y][x] = this.array[y][this.width - 1 - x];
            }
        }
        return flipped;
    }
    clear(bg_color) {
        for (let y = 0; y < this.height; y++) {
            this.array[y].fill(bg_color);
        }
    }
    count_color(color) {
        let count = 0;

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.array[y][x] === color) {
                    count++;
                }
            }
        }
        return count;
    }
    draw(x, y, other, use_transparency = true, wrap = false, scale_x = 1, scale_y = 1) {
        for (let read_x = 0; read_x < other.width; read_x++) {
            for (let read_y = 0; read_y < other.height; read_y++) {
                for (let offset_x = 0; offset_x < scale_x; offset_x++) {
                    for (let offset_y = 0; offset_y < scale_y; offset_y++) {
                        let target_x = x + read_x * scale_x + offset_x;
                        let target_y = y + read_y * scale_y + offset_y;

                        if (wrap) {
                            target_x = ((target_x % this.width) + this.width) % this.width;
                            target_y = ((target_y % this.height) + this.height) % this.height;
                        }
                        if (!this.bounds.contains_point(target_x, target_y)) {
                            continue;
                        }
                        let read_color = other.array[read_y][read_x];

                        if (use_transparency && read_color == 10) {
                            continue;
                        }
                        this.array[target_y][target_x] = read_color;
                    }
                }
            }
        }
    }
    draw_line(p1, p2, color, skip_first = false) {
        p1 = p2round(p1);
        p2 = p2round(p2);

        let line = line2d(p1, p2);

        for (let p of line) {
            if (skip_first && p === line[0]) {
                continue;
            }
            if (!this.bounds.contains_point(p.x, p.y)) {
                continue;
            }
            this.array[p.y][p.x] = color;
        }
    }
    draw_outline(outline, offset_x, offset_y, color) {
        for (let i = 0; i < outline.outer_cells.length; i++) {
            let cell = outline.outer_cells[i];
            let x = Math.round(cell.x + offset_x);
            let y = Math.round(cell.y + offset_y);

            if (!this.bounds.contains_point(x, y)) {
                continue;
            }
            this.array[y][x] = color;
        }
    }
    element(target_size = 282.75) {
        let max = Math.max(this.width, this.height);
        let cell_size = target_size / max;
        cell_size -= max / (target_size / cell_size) * 2;

        let container = document.createElement('div');
        container.className = 'container';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = `${cell_size}px`;
                cell.style.height = cell.style.width;
                cell.style.backgroundColor = colors[this.array[y][x]].hex;

                container.appendChild(cell);
            }
            let br = document.createElement('br');
            container.appendChild(br);
        }
        return container;
    }
    copy(x, y, width, height) {
        let grid = new Grid(width, height);

        grid.draw(-x, -y, this, false);

        return grid;
    }
    clone() {
        return this.copy(0, 0, this.width, this.height);
    }
    bound(bg_color=10) {
        let min_x = 30;
        let min_y = 30;
        let max_x = 0;
        let max_y = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.array[y][x] !== bg_color) {
                    min_x = Math.min(min_x, x);
                    min_y = Math.min(min_y, y);
                    max_x = Math.max(max_x, x);
                    max_y = Math.max(max_y, y);
                }
            }
        }
        let grid = new Grid(max_x - min_x + 1, max_y - min_y + 1);

        grid.draw(-min_x, -min_y, this, false);

        return grid;
    }
    cell_neighbor_count(x, y, colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        let count = 0;

        for (let dy = -1; dy < 2; dy++) {
            for (let dx = -1; dx < 2; dx++) {
                if (dx == 0 && dy == 0) {
                    continue;
                }
                let target_x = x + dx;
                let target_y = y + dy;

                if (!this.bounds.contains_point(target_x, target_y)) {
                    continue;
                }
                if (colors.includes(this.array[target_y][target_x])) {
                    count++;
                }
            }
        }
        return count;
    }
    color_at(x, y) {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        if (!this.bounds.contains_point(x, y)) {
            return null;
        }
        return this.array[y][x];
    }
    equals(other) {
        if (other == undefined) {
            return false;
        }
        if (other.width !== this.width || this.height !== this.height) {
            return false;
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (other.array[y][x] !== this.array[y][x]) {
                    return false;
                }
            }
        }
        return true;
    }
    scale(x, y) {
        let grid = new Grid(this.width * x, this.height * y);

        grid.draw(0, 0, this, false, false, x, y);

        return grid;
    }
    toString() {
        let str = "";

        for (let y = 0; y < this.height; y++) {
            str += `[${this.array[y].toString()}]`;

            if (y !== this.height - 1) {
                str += ',';
            }
        }
        return `[${str}]`;
    }
    to_array() {
        return this.array.map(u8 => Array.from(u8));
    }
}