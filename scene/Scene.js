class Scene {
    static TOP = Symbol();
    static BOTTOM = Symbol();
    static LEFT = Symbol();
    static RIGHT = Symbol();

    objects = [];
    video = null;
    #record = false;

    collide_top = true;
    collide_bottom = true;
    collide_left = true;
    collide_right = true;

    always_detect_collisions = false;
    noclip = false;

    constructor(width, height, bg_color) {
        this.width = width;
        this.height = height;
        this.bg_color = bg_color;
        this.grid = new Grid(width, height, bg_color);
        this.bounds = new Bounds(0, 0, width, height);
    }
    set_collide(collide) {
        this.collide_top = collide;
        this.collide_bottom = collide;
        this.collide_left = collide;
        this.collide_right = collide;
    }
    add_object(obj) {
        this.objects.push(obj);
    }
    remove_object(obj) {
        let obj_index = this.objects.indexOf(obj);

        if (obj_index === -1) {
            return;
        }
        this.objects.splice(obj_index, 1);
    }
    within_bounds(obj) {
        return this.bounds.contains_bounds(obj.bounds);
    }
    obj_unoccluded_cell_count(obj) {
        let grid = obj.grid.clone();

        obj.set_color(12);
        this.render(false);

        let count = this.grid.count_color(12);

        obj.grid = grid;
        obj.compute_transform();
        this.render(false);

        return count;
    }
    decompose_obj(obj) {
        for (let x = 0; x < obj.grid.width; x++) {
            for (let y = 0; y < obj.grid.height; y++) {
                if (obj.grid.array[y][x] === 10) {
                    continue;
                }
                let cell = new SceneObject(new Grid(1, 1, obj.grid.array[y][x]));
                cell.grid_x = x + obj.grid_x;
                cell.grid_y = y + obj.grid_y;
                cell.source_obj = obj;

                this.add_object(cell);
            }
        }
        this.remove_object(obj);
    }
    cell_visible(cell, p_src, direction, fov, ignore_objs = [], ignore_source) {
        p_src = p2add(p_src, p2d(0.5, 0.5));
        cell = p2add(cell, p2d(0.5, 0.5));

        if (!point_within_fov(p_src, direction, fov, cell)) {
            return false;
        }
        for (let obj of this.objects) {
            if (obj.source_obj !== undefined && obj.source_obj === ignore_source || ignore_objs.includes(obj)) {
                continue;
            }
            if (obj.line_intersects(p_src, cell)) {
                return false;
            }
        }
        return true;
    }
    set_obj_visible_cell_color(obj, p_src, direction, fov, visible_color, invisible_color, ignore_additional_objs = []) {
        let ignore_objs = [obj, ...ignore_additional_objs];

        for (let x = 0; x < obj.grid.width; x++) {
            for (let y = 0; y < obj.grid.height; y++) {
                if (obj.grid.array[y][x] === 10) {
                    continue;
                }
                if (this.cell_visible(p2d(x + obj.grid_x, y + obj.grid_y), p_src, direction, fov, ignore_objs, obj.source_obj)) {
                    obj.grid.array[y][x] = visible_color;
                } else {
                    obj.grid.array[y][x] = invisible_color;
                }
            }
        }
        obj.compute_transform();
    }
    obj_visibility(obj, p_src, direction, fov, ignore_additional_objs = []) {
        let ignore_objs = [obj, ...ignore_additional_objs];
        let has_visible = false;
        let has_invisible = false;

        for (let x = 0; x < obj.grid.width; x++) {
            for (let y = 0; y < obj.grid.height; y++) {
                if (obj.grid.array[y][x] === 10) {
                    continue;
                }
                if (this.cell_visible(p2d(x + obj.grid_x, y + obj.grid_y), p_src, direction, fov, ignore_objs)) {
                    has_visible = true;
                } else {
                    has_invisible = true;
                }
                if (has_visible && has_invisible) {
                    return 0;
                }
            }
        }
        return has_visible ? 1 : -1;
    }
    obj_has_blocked_cell(obj, p_src, direction, fov, ignore_additional_objs = []) {
        let ignore_objs = [obj, ...ignore_additional_objs];

        for (let x = 0; x < obj.grid.width; x++) {
            for (let y = 0; y < obj.grid.height; y++) {
                if (obj.grid.array[y][x] === 10) {
                    continue;
                }
                let p = p2d(x + obj.grid_x, y + obj.grid_y);

                if (!point_within_fov(p_src, direction, fov, p)) {
                    continue;
                }
                if (!this.cell_visible(p, p_src, direction, fov, ignore_objs)) {
                    return true;
                }
            }
        }
        return false;
    }
    line_has_intersection(p1, p2) {
        for (let obj of this.objects) {
            if (obj.line_intersects(p1, p2)) {
                return true;
            }
        }
        return false;
    }
    path_has_intersection(path) {
        for (let obj of this.objects) {
            for (let i = 1; i < path.length; i++) {
                let p1 = path[i - 1];
                let p2 = path[i + 0];

                if (obj.line_intersects(p1, p2)) {
                    return true;
                }
            }
        }
        return objects;
    }
    random_non_overlapping_path(start, segments = 1) {
        let path = [start];

        outer:
        for (let i = 0; i < segments; i++) {
            let line;
            let attempts = 0;

            do {
                let p1 = arrlast(path);
                let p2;

                do {
                    p2 = p2d(rnd_int(0, this.width - 1), rnd_int(0, this.height - 1));
                } while (p2deq(p1, p2));

                line = line2d(p1, p2);

                if (++attempts === 8) {
                    break outer;
                }
            } while (this.path_has_intersection(line));

            path = path.concat(line);
        }
        return path;
    }
    contains_overlapping_objects(check_bounds_only = false) {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                if (this.objects[i].overlaps_with(this.objects[j], check_bounds_only)) {
                    return true;
                }
            }
        }
        return false;
    }
    contains_touching_objects(check_bounds_only = false) {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                if (this.objects[i].touches(this.objects[j], check_bounds_only)) {
                    return true;
                }
            }
        }
        return false;
    }
    contains_connected_objects(check_bounds_only = false) {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                if (this.objects[i].connected_to(this.objects[j], check_bounds_only)) {
                    return true;
                }
            }
        }
        return false;
    }
    contains_equivalent_grids() {
        for (let a of this.objects) {
            for (let b of this.objects) {
                if (a === b) {
                    continue;
                }
                if (a.grid.equals(b.grid)) {
                    return true;
                }
            }
        }
        return false;
    }
    contains_out_of_bounds_objects() {
        for (let obj of this.objects) {
            if (!this.within_bounds(obj)) {
                return true;
            }
        }
        return false;
    }
    #depth_sort() {
        this.objects.sort((a, b) => a.z - b.z);
    }
    cls() {
        this.grid.clear(this.bg_color);
    }
    render_objects() {
        this.#depth_sort();

        for (let obj of this.objects) {
            obj.draw_onto(this.grid, false);
        }
    }
    render(recording_allowed = true, render_hook = function () { }) {
        this.cls();
        this.render_objects();

        render_hook();

        if (recording_allowed && this.#record) {
            this.video.add_grid(this.grid.clone());
        }
    }
    clear() {
        this.objects.length = 0;
    }
    /** Does not work for diagonal movement in edge cases — use overlap detection to detect fauly scenes */
    move_with_collisions(obj, dx, dy) {
        let original_position = p2d(obj.x, obj.y);
        let original_positions = [];

        let speed_x = obj.speed_x;
        let speed_y = obj.speed_y;

        let x = obj.x;
        let y = obj.y;

        for (let _obj of this.objects) {
            if (_obj === obj) {
                continue;
            }
            original_positions.push({
                obj: _obj,
                pos: p2d(_obj.x, _obj.y)
            });
        }
        if (dx !== 0) {
            obj.x += dx;

            if (this.collide_right && obj.bounds.right > this.bounds.right) {
                obj.x--;
                obj.new_speed_x = 0;

                obj.on_collide(Scene.RIGHT);
            }
            if (this.collide_left && obj.bounds.left < this.bounds.left) {
                obj.x++;
                obj.new_speed_x = 0;

                obj.on_collide(Scene.LEFT);
            }
        }
        if (dy !== 0) {
            obj.y += dy;

            if (this.collide_bottom && obj.bounds.bottom > this.bounds.bottom) {
                obj.y--;
                obj.new_speed_y = 0;

                obj.on_collide(Scene.BOTTOM);
            }
            if (this.collide_top && obj.bounds.top < this.bounds.top) {
                obj.y++;
                obj.new_speed_y = 0;

                obj.on_collide(Scene.TOP);
            }
        }
        let hits = [];

        for (let other_obj of this.objects) {
            if (other_obj === obj || !other_obj.collisions_enabled || other_obj.z !== obj.z || obj.ignore.includes(other_obj)) {
                continue;
            }
            if (other_obj.obj_outline_projection_intersects(obj, -(obj.x - x), -(obj.y - y)) || obj.overlaps_with(other_obj)) {
                hits.push(other_obj);
                other_obj.ignore.push(obj);
            }
        }
        let pushed_x = true;
        let pushed_y = true;

        if (!this.noclip) {
            for (let hit of hits) {
                if (hit.pushable_x && hit.pushable_y) {
                    let prev_x = hit.x;
                    let prev_y = hit.y;

                    this.move_with_collisions(hit, dx, dy);

                    if (hit.x === prev_x) {
                        pushed_x = false;
                    }
                    if (hit.y === prev_y) {
                        pushed_y = false;
                    }
                } else if (dx !== 0 && hit.pushable_x) {
                    let prev_x = hit.x;

                    this.move_with_collisions(hit, dx, 0);

                    if (hit.x === prev_x) {
                        pushed_x = false;
                    }
                } else if (dy !== 0 && hit.pushable_y) {
                    let prev_y = hit.y;

                    this.move_with_collisions(hit, 0, dy);

                    if (hit.y === prev_y) {
                        pushed_y = false;
                    }
                }
            }
        }
        if (!pushed_x) {
            obj.x -= dx;
        }
        if (!pushed_y) {
            obj.y -= dy;
        }
        if (obj.transfer_momentum_on_collide) {
            if (hits.length !== 0) {
                obj.x = original_position.x;
                obj.y = original_position.y;
                obj.new_speed_x = 0;
                obj.new_speed_y = 0;

                for (let hit of hits) {
                    hit.new_speed_x = speed_x;
                    hit.new_speed_y = speed_y;
                }
            }
        }
        for (let hit of hits) {
            obj.on_collide(hit);
        }
        if (this.noclip) {
            return;
        }
        if (p2eq(p2d(obj.grid_x, obj.grid_y), original_position)) {
            for (let org of original_positions) {
                org.obj.x = org.pos.x;
                org.obj.y = org.pos.y;
            }
        }
    }
    step(objects = this.objects) {
        for (let obj of objects) {
            obj.new_speed_x = obj.speed_x;
            obj.new_speed_y = obj.speed_y;
        }
        for (let obj of objects) {
            if (obj.collisions_enabled) {
                let sx = Math.sign(obj.speed_x);
                let sy = Math.sign(obj.speed_y);

                this.move_with_collisions(obj, sx, sy);
            } else {
                obj.x += obj.speed_x;
                obj.y += obj.speed_y;

                if (this.always_detect_collisions) {
                    for (let other_obj of objects) {
                        if (other_obj === obj || other_obj.z !== obj.z) {
                            continue;
                        }
                        if (obj.overlaps_with(other_obj)) {
                            obj.on_collide(other_obj);
                        }
                    }
                }
            }
            obj.r += obj.speed_r;
        }
        for (let obj of this.objects) {
            obj.speed_x = obj.new_speed_x;
            obj.speed_y = obj.new_speed_y;
        }
    }
    start_recording() {
        this.video = new GridVideo();
        this.#record = true;
    }
    stop_recording() {
        this.#record = false;
    }
}