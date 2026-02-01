class Bounds {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get top() {
        return this.y;
    }
    get bottom() {
        return this.y + this.height;
    }
    get left() {
        return this.x;
    }
    get right() {
        return this.x + this.width;
    }
    get top_left() {
        return {
            x: this.x,
            y: this.y
        };
    }
    get top_right() {
        return {
            x: this.x + this.width,
            y: this.y
        };
    }
    get bottom_left() {
        return {
            x: this.x,
            y: this.y + this.height
        };
    }
    get bottom_right() {
        return {
            x: this.x + this.width,
            y: this.y + this.height
        };
    }
    pad(val) {
        return new Bounds(this.x + val, this.y + val, this.width - val * 2, this.height - val * 2);
    }
    polygon() {
        return [this.top_left, this.top_right, this.bottom_right, this.bottom_left, this.top_left];
    }
    contains_point(x, y, open = true) {
        if (open) {
            return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
        } else {
            return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
        }
    }
    contains_points(points, open = true) {
        for (let point of points) {
            if (!this.contains_point(point.x, point.y, open)) {
                return false;
            }
        }
        return true;
    }
    contains_bounds(bounds, open = false) {
        return this.contains_points([bounds.top_left, bounds.top_right, bounds.bottom_left, bounds.bottom_right], open);
    }
    overlaps(bounds, open = true) {
        if (open) {
            return !(
                this.right <= bounds.left ||
                this.left >= bounds.right ||
                this.bottom <= bounds.top ||
                this.top >= bounds.bottom
            );
        } else {
            return !(
                this.right < bounds.left ||
                this.left > bounds.right ||
                this.bottom < bounds.top ||
                this.top > bounds.bottom
            );
        }
    }
    touches(bounds) {
        let edgeTouch =
            (this.right === bounds.left || this.left === bounds.right) &&
            (this.bottom > bounds.top && this.top < bounds.bottom); // vertical alignment

        let verticalTouch =
            (this.bottom === bounds.top || this.top === bounds.bottom) &&
            (this.right > bounds.left && this.left < bounds.right); // horizontal alignment

        let cornerTouch =
            (this.right === bounds.left || this.left === bounds.right) &&
            (this.bottom === bounds.top || this.top === bounds.bottom); // exact point

        return edgeTouch || verticalTouch || cornerTouch;
    }
}