class SceneObject {
    #x = 0;
    #y = 0;
    #z = 0;
    #r = 0;
    #scale_x = 1;
    #scale_y = 1;
    #grid_x = 0;
    #grid_y = 0;
    #fliplr = false;
    #flipud = false;
    #outline_color = 0;
    #outline_size = 0;

    speed_x = 0;
    speed_y = 0;
    speed_r = 0;

    new_speed_x = 0;
    new_speed_y = 0;

    ignore = [];

    scale_from_corner = true;
    bounds = new Bounds(0, 0, 0, 0);
    outlines;
    outlines_simplified;
    source_obj;

    collisions_enabled = false;
    transfer_momentum_on_collide = false;

    pushable_x = false;
    pushable_y = false;

    on_collide = function (other_obj) { };

    constructor(grid) {
        this.grid = grid;
        this.grid_transformed = this.grid.clone();
        this.x = this.#x;
        this.y = this.#y;
        this.r = this.#r;
    }
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }
    get z() {
        return this.#z;
    }
    get r() {
        return this.#r;
    }
    get width() {
        return this.grid_transformed.width;
    }
    get height() {
        return this.grid_transformed.height;
    }
    get size() {
        return this.width * this.height;
    }
    get scale_x() {
        return this.#scale_x;
    }
    get scale_y() {
        return this.#scale_y;
    }
    get grid_x() {
        return this.#grid_x;
    }
    get grid_y() {
        return this.#grid_y;
    }
    get fliplr() {
        return this.#fliplr;
    }
    get flipud() {
        return this.#flipud;
    }
    get outline_color() {
        return this.#outline_color;
    }
    get outline_size() {
        return this.#outline_size;
    }
    set x(val) {
        this.#x = val;
        this.#grid_x = this.x - Math.floor(this.grid_transformed.width / 2 + 0.5);
        this.update_bounds();
    }
    set y(val) {
        this.#y = val;
        this.#grid_y = this.y - Math.floor(this.grid_transformed.height / 2 + 0.5);
        this.update_bounds();
    }
    set z(val) {
        this.#z = val;
    }
    set r(val) {
        this.#r = val % 4;
        this.compute_transform();
        this.x = this.x;
        this.y = this.y;
        this.update_bounds();
    }
    set scale_x(val) {
        this.#scale_x = val;
        this.compute_transform();

        this.#set_anchor();
        this.update_bounds();
    }
    set scale_y(val) {
        this.#scale_y = val;
        this.compute_transform();

        this.#set_anchor();
        this.update_bounds();
    }
    set grid_x(val) {
        this.x = val + Math.floor(this.grid_transformed.width / 2 + 0.5);
    }
    set grid_y(val) {
        this.y = val + Math.floor(this.grid_transformed.height / 2 + 0.5);
    }
    set fliplr(val) {
        this.#fliplr = val;
        this.compute_transform();
    }
    set flipud(val) {
        this.#flipud = val;
        this.compute_transform();
    }
    set outline_size(val) {
        this.#outline_size = Math.max(0, val);
        this.compute_transform();
        this.update_bounds();
    }
    set outline_color(val) {
        this.#outline_color = clamp(val, 0, 9);
        this.compute_transform();
        this.update_bounds();
    }
    bounce() {
        this.speed_x *= -1;
        this.speed_y *= -1;
    }
    set_pushable(pushable) {
        this.pushable_x = pushable;
        this.pushable_y = pushable;
    }
    set_scale(val) {
        this.#scale_x = val;
        this.#scale_y = val;
        this.compute_transform();

        this.#set_anchor();
        this.update_bounds();
    }
    to_local(p) {
        return p2sub(p, p2d(this.grid_x, this.grid_y))
    }
    to_world() {

    }
    #set_anchor() {
        if (this.scale_from_corner) {
            this.grid_x = this.grid_x;
            this.grid_y = this.grid_y;
        } else {
            this.x = this.x;
            this.y = this.y;
        }
    }
    get_transformed_grid() {
        let grid = this.grid;

        if (this.fliplr) {
            grid = grid.fliplr();
        }
        if (this.flipud) {
            grid = grid.flipud();
        }
        grid = grid.scale(this.scale_x, this.scale_y).rot90(this.r);

        return grid;
    }
    compute_transform() {
        this.grid_transformed = this.get_transformed_grid();
        this.outlines = this.grid_transformed.get_outlines();

        for (let i = 0; i < this.outline_size; i++) {
            this.bake_outline();
        }
    }
    update_bounds() {
        this.bounds.x = this.grid_x;
        this.bounds.y = this.grid_y;
        this.bounds.width = this.grid_transformed.width;
        this.bounds.height = this.grid_transformed.height;
    }
    set_color(color, sx=0, sy=0, width=this.grid.width, height=this.grid.height) {
        for (let x = sx; x < sx + width; x++) {
            for (let y = sy; y < sy + height; y++) {
                if (this.grid.array[y][x] !== 10) {
                    this.grid.array[y][x] = color;
                }
            }
        }
        this.compute_transform();
    }
    flood_fill(color, p, keep_outline = true) {
        if (p !== undefined && !(p instanceof Outline)) {
            let oc = this.grid.color_at(p);

            if (oc === null) {
                return;
            }
            // Queue for BFS
            let q = [[p.x, p.y]];

            // Change the starting pixel's color
            this.grid.array[p.y][p.x] = color;

            // Direction vectors for 4 adjacent directions
            let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

            // BFS loop
            while (q.length > 0) {
                let [x, y] = q.shift();

                for (let [dx, dy] of directions) {
                    let nx = x + dx;
                    let ny = y + dy;

                    // Check boundary conditions and color match
                    if (this.outlines[0].encloses(nx, ny) && this.grid.array[ny][nx] === oc) {
                        // Change color and add to queue
                        this.grid.array[ny][nx] = color;
                        q.push([nx, ny]);
                    }
                }
            }
            this.compute_transform();

            return this;
        }
        let outline = p === undefined ? this.outlines[0] : p;

        let grid = arr2d(this.grid.width, this.grid.height);

        if (keep_outline) {
            for (let cell of outline.cells) {
                let { x, y } = cell;

                grid[y][x] = 1;
            }
        }
        for (let x = 0; x < this.grid.width; x++) {
            for (let y = 0; y < this.grid.height; y++) {
                if (outline.encloses(x, y) && grid[y][x] === 0) {
                    this.grid.array[y][x] = color;
                }
            }
        }
        this.compute_transform();

        return this;
    }
    fill_all_holes_but_biggest(color) {
        for (let i = 1; i < this.outlines.length; i++) {
            this.flood_fill(color, this.outlines[i], false);
        }
        this.compute_transform();
    }
    set_color_fov(p_src, direction, fov, color_in, color_out) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.grid.array[y][x] === 10) {
                    continue;
                }
                if (point_within_fov(p_src, direction, fov, p2d(x + this.grid_x, y + this.grid_y))) {
                    this.grid.array[y][x] = color_in;
                } else {
                    this.grid.array[y][x] = color_out;
                }
            }
        }
        this.compute_transform();
    }
    draw_onto(grid, wrap = false) {
        grid.draw(this.grid_x, this.grid_y, this.grid_transformed, true, wrap);
    }
    split_vertically(at, edge_color=-1){
        let grid = this.grid.clone();

        at = Math.floor(at);

        let x1 = at;
        let x2 = at + 1;

        if(edge_color !== -1){
            for (let y = 0; y < grid.height; y++) {
                grid.array[y][x1] = edge_color;
                grid.array[y][x2] = edge_color;
            }
        }
        let left_half = new SceneObject(grid.copy(0, 0, x2, grid.height).bound());
        let right_half = new SceneObject(grid.copy(x2, 0, grid.width - x1, grid.height).bound());

        return [left_half, right_half];
    }
    split_horizontally(at, edge_color=-1){
        let grid = this.grid.clone();

        at = Math.floor(at);

        let y1 = at;
        let y2 = at + 1;

        if(edge_color !== -1){
            for (let x = 0; x < grid.width; x++) {
                grid.array[y1][x] = edge_color;
                grid.array[y2][x] = edge_color;
            }
        }
        let upper_half = new SceneObject(grid.copy(0, 0, grid.width, y2).bound());
        let lower_half = new SceneObject(grid.copy(0, y2, grid.width, grid.height - y1).bound());

        return [upper_half, lower_half];
    }
    copy(x, y, width, height){
        return new SceneObject(this.grid.copy(x, y, width, height).bound());
    }
    mutate(mutation_rate, color) {
        for (let x = 0; x < this.grid.width; x++) {
            for (let y = 0; y < this.grid.height; y++) {
                if (Math.random() > mutation_rate) {
                    continue;
                }
                if (this.grid.array[y][x] === 10) {
                    if (this.grid.cell_neighbor_count(x, y) !== 0) {
                        this.grid.array[y][x] = color;
                    }
                }
            }
        }
        this.compute_transform();

        return this;
    }
    eviscerate() {
        let outline = this.outlines[0];

        let grid = arr2d(this.grid.width, this.grid.height);

        for (let cell of outline.cells) {
            let { x, y } = cell;

            grid[y][x] = 1;
        }
        for (let x = 0; x < this.grid.width; x++) {
            for (let y = 0; y < this.grid.height; y++) {
                if (this.grid.array[y][x] !== 10 && grid[y][x] === 0) {
                    this.grid.array[y][x] = 10;
                }
            }
        }
        this.compute_transform();

        return this;
    }
    bake_outline() {
        let grid = new Grid(this.grid_transformed.width + 2, this.grid_transformed.height + 2, 10);
        grid.draw(1, 1, this.grid_transformed);
        grid.draw_outline(this.outlines[0], 1, 1, this.outline_color);

        this.grid_transformed = grid;
        this.outlines = this.grid_transformed.get_outlines();
    }
    num_unique_rotations() {
        // 1) Try 90°
        let r90 = this.grid.rot90(1);
        if (this.grid.equals(r90)) {
            // fixed by 90° ⇒ all four the same
            return 1;
        }
        // 2) Try 180°
        let r180 = this.grid.rot90(2);
        if (this.grid.equals(r180)) {
            // fixed by 180° only ⇒ two unique (0°≡180° vs. 90°≡270°)
            return 2;
        }
        // 3) Neither 90° nor 180° fixes it ⇒ all four are distinct
        return 4;
    }
    is_rotation_invariant() {
        return this.grid.equals(this.grid.rot90(1));
    }
    is_vertically_symmetrical() {
        return this.grid.equals(this.grid.fliplr());
    }
    is_horizontally_symmetrical() {
        return this.grid.equals(this.grid.flipud());
    }
    is_diagonally_symmetrical() {
        return this.grid.equals(this.grid.flipud().fliplr());
    }
    is_within_fov(p_src, direction, fov, fully = true) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.grid.array[y][x] === 10) {
                    continue;
                }
                let within_fov = point_within_fov(p_src, direction, fov, p2d(x, y));

                if (fully) {
                    if (!within_fov) {
                        return false;
                    }
                } else if (within_fov) {
                    return true;
                }
            }
        }
        return true;
    }
    line_intersects(p1, p2) {
        let outline = this.outlines[0];

        p1 = translate_point(-this.grid_x, -this.grid_y, p1);
        p2 = translate_point(-this.grid_x, -this.grid_y, p2);

        return outline.intersects(p1, p2);
    }
    obj_outline_projection_intersects(obj, dx, dy) {
        let outline = obj.outlines[0];
        let offset = p2d(obj.grid_x, obj.grid_y);
        let diff = p2d(dx, dy);

        for (let p of outline.scaled_points(-0.25)) {
            let p1 = p2add(p, offset);
            let p2 = p2add(p1, diff);

            if (this.line_intersects(p1, p2)) {
                return true;
            }
        }
        return false;
    }
    overlaps_with(obj, check_bounds_only = false) {
        if (!this.bounds.overlaps(obj.bounds)) {
            return false;
        } else if (check_bounds_only) {
            return true;
        }
        if (this.is_partially_within(obj) || obj.is_partially_within(this)) {
            return true;
        }
        for (let x = 0; x < this.grid_transformed.width; x++) {
            for (let y = 0; y < this.grid_transformed.height; y++) {
                if (this.grid_transformed.array[y][x] === 10) {
                    continue;
                }
                let _x = x + this.grid_x;
                let _y = y + this.grid_y;

                if (obj.bounds.contains_point(_x, _y)) {
                    let __x = _x - obj.grid_x;
                    let __y = _y - obj.grid_y;

                    if (obj.grid_transformed.array[__y][__x] !== 10) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    is_partially_within(obj) {
        if (!this.bounds.overlaps(obj.bounds)) {
            return false;
        }
        let has_inside = false;
        let has_outside = false;

        for (let x = 0; x < this.grid_transformed.width; x++) {
            for (let y = 0; y < this.grid_transformed.height; y++) {
                if (this.grid_transformed.array[y][x] === 10) {
                    continue;
                }
                let _x = x + this.grid_x;
                let _y = y + this.grid_y;

                if (obj.bounds.contains_point(_x, _y)) {
                    let __x = _x - obj.grid_x;
                    let __y = _y - obj.grid_y;

                    if (obj.outlines[0].encloses(__x, __y)) {
                        has_inside = true;
                    } else {
                        has_outside = true;
                    }
                    if (has_inside && has_outside) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    has_cell_within(obj) {
        if (!this.bounds.overlaps(obj.bounds)) {
            return false;
        }
        for (let x = 0; x < this.grid_transformed.width; x++) {
            for (let y = 0; y < this.grid_transformed.height; y++) {
                if (this.grid_transformed.array[y][x] === 10) {
                    continue;
                }
                let _x = x + this.grid_x;
                let _y = y + this.grid_y;

                if (obj.bounds.contains_point(_x, _y)) {
                    let __x = _x - obj.grid_x;
                    let __y = _y - obj.grid_y;

                    if (obj.outlines[0].encloses(__x, __y)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    touches(obj, check_bounds_only = false) {
        if (!this.bounds.overlaps(obj.bounds) && !this.bounds.touches(obj.bounds)) {
            return false;
        } else if (check_bounds_only) {
            return true;
        }
        for (let x = 0; x < this.grid_transformed.width; x++) {
            for (let y = 0; y < this.grid_transformed.height; y++) {
                let _x = x + this.grid_x;
                let _y = y + this.grid_y;

                let __x = _x - obj.grid_x;
                let __y = _y - obj.grid_y;

                if (this.grid_transformed.array[y][x] !== 10) {
                    if (obj.bounds.contains_point(_x, _y) && obj.grid_transformed.array[__y][__x] !== 10) {
                        return true;
                    }
                    if (obj.grid_transformed.cell_neighbor_count(__x, __y) !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    connected_to(obj, check_bounds_only = false) {
        return this.overlaps_with(obj, check_bounds_only) || this.touches(obj, check_bounds_only);
    }
    is_above(obj) {
        return this.bounds.bottom <= obj.bounds.top;
    }
    is_below(obj) {
        return this.bounds.top >= obj.bounds.bottom;
    }
    is_left_to(obj) {
        return this.bounds.right <= obj.bounds.left;
    }
    is_right_to(obj) {
        return this.bounds.left >= obj.bounds.right;
    }
    set_random_position(bounds, padding = 0) {
        if (padding > 0) {
            bounds = bounds.pad(padding);
        }
        if (this.width >= bounds.width) {
            this.grid_x = bounds.x;
        } else {
            this.grid_x = rnd_int(bounds.x, bounds.x + (bounds.width - this.width - padding));
        }
        if (this.height >= bounds.height) {
            this.grid_y = bounds.y;
        } else {
            this.grid_y = rnd_int(bounds.y, bounds.y + (bounds.height - this.height - padding));
        }
    }
    static random(color = 2, max_width = 30, max_height = 30, symmetry = 0, area_min = 0.0, area_max = 0.9) {
        let grid = new Grid(max_width, max_height);
        let grid_x = Math.floor(max_width / 2);
        let grid_y = Math.floor(max_height / 2);
        let area = max_width * max_height;
        let bounds_max = new Bounds(0, 0, max_width, max_height);

        grid.array[grid_y][grid_x] = color;

        let r = clamp(Math.random(), area_min, area_max);

        let num_cells = Math.max(1, Math.round(r * area));

        let cell_indices = [];
        let symmetry_coords_array = get_symmetry_coords(grid_x, grid_y, bounds_max, symmetry);

        for (let symmtery_coords of symmetry_coords_array) {
            let target_x = symmtery_coords[0];
            let target_y = symmtery_coords[1];

            grid.array[target_y][target_x] = color;
            cell_indices.push(
                {
                    x: target_x,
                    y: target_y
                }
            );
        }

        while (cell_indices.length < num_cells) {
            let cell_index = rnd_val(cell_indices);
            let target_x = cell_index.x + rnd_val(directions);
            let target_y = cell_index.y + rnd_val(directions);

            if (!bounds_max.contains_point(target_x, target_y)) {
                continue;
            }
            let cell_color = grid.array[target_y][target_x];

            if (cell_color == color) {
                continue;
            }
            let symmetry_coords_array = get_symmetry_coords(target_x, target_y, bounds_max, symmetry);

            for (let symmtery_coords of symmetry_coords_array) {
                target_x = symmtery_coords[0];
                target_y = symmtery_coords[1];

                grid.array[target_y][target_x] = color;
                cell_indices.push(
                    {
                        x: target_x,
                        y: target_y
                    }
                );
            }
        }
        return new SceneObject(grid.bound());
    }
    static wine_glass() {
        let grid = new Grid(30, 24, 10, [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);
        return new SceneObject(grid.bound());
    }
    clone() {
        let grid = this.grid.clone();
        let obj = new SceneObject(grid);

        obj.x = this.x;
        obj.y = this.y;
        obj.z = this.z;
        obj.r = this.r;
        obj.scale_x = this.scale_x;
        obj.scale_y = this.scale_y;
        obj.fliplr = this.fliplr;
        obj.flipud = this.flipud;
        obj.speed_x = this.speed_x;
        obj.speed_y = this.speed_y;
        obj.speed_r = this.speed_r;

        return obj;
    }
}