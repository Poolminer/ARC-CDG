let directions = [-1, 0, 1];

let sqrt30x30x2 = Math.sqrt(30 * 30 * 2);

let deg90 = 0.7071067811865476;

let colors = [
    { id: 0, name: 'black', hex: '#000000' },
    { id: 1, name: 'blue', hex: '#1E93FF' },
    { id: 2, name: 'red', hex: '#F93C31' },
    { id: 3, name: 'green', hex: '#4FCC30' },
    { id: 4, name: 'yellow', hex: '#FFDC00' },
    { id: 5, name: 'gray', hex: '#999999' },
    { id: 6, name: 'magenta', hex: '#E53AA3' },
    { id: 7, name: 'orange', hex: '#FF851B' },
    { id: 8, name: 'голубой', hex: '#87D8F1' },
    { id: 9, name: 'maroon', hex: '#921231' },
    { id: 10, name: 'transparent', hex: '#000000' },
];
function print(msg) {
    console.log(msg);
}
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
function rnd_obj_size(max_size, mul_min, mul_max) {
    return Math.max(1, Math.round(clamp(Math.random(), mul_min, mul_max) * max_size));
}
function rnd_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function rnd_val(array, excludes = []) {
    while(true){
        let val = array[Math.floor(Math.random() * array.length)];

        if(excludes.includes(val)){
            continue;
        }
        return val;
    }
}
function rnd_bool() {
    return Math.random() < Math.random();
}
function rnd_str(len, chars) {
    let str = '';

    for (let i = 0; i < len; i++) {
        str += rnd_val(chars);
    }
    return str;
}
function rnd_hex(len) {
    return rnd_str(len, 'abcdef0123456789'.split(''));
}
function rnd_color(excludes = []) {
    while (true) {
        let color = rnd_int(0, 9);

        if (excludes.includes(color)) {
            continue;
        }
        return color;
    }
}
function rnd_bg_color() {
    return Math.random() > 0.2 ? 0 : rnd_color();
}
function rnd_num_pairs() {
    return rnd_int(get_min_pairs(), get_max_pairs());
}
function arrlast(arr) {
    return arr[arr.length - 1];
}
function arr1d(length, fill_val = 0) {
    return Array(length).fill(fill_val);
}
function arr2d(width, height, fill_val = 0) {
    return Array.from({ length: height }, () => arr1d(width, fill_val));
}
function arr1du8(length, fill_val = 0) {
    return new Uint8Array(length).fill(fill_val);
}
function arr2du8(width, height, fill_val = 0) {
    return Array.from({ length: height }, () => arr1du8(width, fill_val));
}
function arrshuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}
function p2d(x = 0, y = 0) {
    return {
        x: x,
        y: y
    };
}
function p2angle(p1, p2) {
    let l1 = Math.hypot(p1.x, p1.y);
    let l2 = Math.hypot(p2.x, p2.y);
    if (l1 === 0 || l2 === 0) { return NaN; }

    let dot = p1.x * p2.x + p1.y * p2.y;
    let crs = p1.x * p2.y - p1.y * p2.x; // 2D cross (signed area)
    // Angle in [0, π]; atan2 handles small-angle and near-π cases better than acos
    let ang = Math.atan2(Math.abs(crs), dot);
    return ang;
}
function p2rot(p, angle, center = p2d()) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    let _p = p2sub(p, center);

    let x = _p.x * cos - _p.y * sin;
    let y = _p.x * sin + _p.y * cos;

    return p2d(center.x + x, center.y + y);
}
function p2add(p, pval) {
    return p2d(p.x + pval.x, p.y + pval.y);
}
function p2sub(p, pval) {
    return p2d(p.x - pval.x, p.y - pval.y);
}
function p2mul(p, pval) {
    return p2d(p.x * pval.x, p.y * pval.y);
}
function p2div(p, pval) {
    return p2d(p.x / pval.x, p.y / pval.y);
}
function p2mod(p, val) {
    return p2d(p.x % val, p.y % val);
}
function p2pow(p, val) {
    return p2d(p.x ** val, val);
}
function p2scale(p, val) {
    return p2d(p.x * val, p.y * val);
}
function p2eq(p1, p2, epsilon) {
    if (epsilon !== undefined) {
        console.log(epsilon);
        return Math.abs(p1.x - p2.x) < eps && Math.abs(p1.y - p2.y) < eps;
    }
    return p1.x === p2.x && p1.y === p2.y;
}
function p2round(p) {
    let x = Math.round(p.x);
    let y = Math.round(p.y);

    return p2d(x, y);
}
function p2floor(p) {
    let x = Math.floor(p.x);
    let y = Math.floor(p.y);

    return p2d(x, y);
}
function p2ceil(p) {
    let x = Math.ceil(p.x);
    let y = Math.ceil(p.y);

    return p2d(x, y);
}
function line2d(p1, p2) {
    p1 = p2d(p1.x, p1.y);

    // Calculate the difference between points
    let dx = Math.abs(p2.x - p1.x);
    let dy = Math.abs(p2.y - p1.y);

    // Determine the direction of the line
    let sx = p1.x < p2.x ? 1 : -1;  // Step in the x direction
    let sy = p1.y < p2.y ? 1 : -1;  // Step in the y direction

    // Initialize the error term
    let err = dx - dy;

    let points = [];

    while (true) {
        // Set the pixel at the current point
        points.push(p2d(p1.x, p1.y));

        // Check if we've reached the endpoint
        if (p1.x == p2.x && p1.y == p2.y) {
            break;
        }
        // Calculate the error value
        e2 = 2 * err;

        // Move horizontally if the error term is large enough
        if (e2 > -dy) {
            err -= dy
            p1.x += sx
        }
        // Move vertically if the error term is small enough
        if (e2 < dx) {
            err += dx
            p1.y += sy
        }
    }
    return points;
}
function rot90(x, y, cx, cy, k, floor = false) {
    let dx = x - cx;
    let dy = y - cy;

    let rx, ry;

    switch (k % 4) {
        case 0:
            rx = dx;
            ry = dy;
            break;
        case 1:
            rx = -dy;
            ry = dx;
            break;
        case 2:
            rx = -dx;
            ry = -dy;
            break;
        case 3:
            rx = dy;
            ry = -dx;
            break;
    }
    return floor ? [Math.floor(rx + cx), Math.floor(ry + cy)] : [rx + cx, ry + cy];
}
function get_symmetry_coords(x, y, bounds, symmetry) {
    let center_x = bounds.width / 2;
    let center_y = bounds.height / 2;
    let coords = [[x, y]];

    x += 0.5;
    y += 0.5;

    switch (symmetry) {
        case 1: // Full symmetry
            coords.push(rot90(x, y, center_x, center_y, 1, true));
            coords.push(rot90(x, y, center_x, center_y, 2, true));
            coords.push(rot90(x, y, center_x, center_y, 3, true));
            break;
        case 2: // Horizontal symmetry
            coords.push(rot90(x, y, x, center_y, 2, true));
            break;
        case 3: // Vertical symmetry
            coords.push(rot90(x, y, center_x, y, 2, true));
            break;
        case 4: // Diagonal symmetry
            coords.push(rot90(x, y, center_x, center_y, 2, true));
            break;
    }
    return coords;
}
function in_viewport(container, element, partially = true) {
    let containerRect = container.getBoundingClientRect();
    let elementRect = element.getBoundingClientRect();

    if (partially) {
        return (
            elementRect.bottom > containerRect.top &&
            elementRect.top < containerRect.bottom &&
            elementRect.right > containerRect.left &&
            elementRect.left < containerRect.right
        );
    } else {
        return (
            elementRect.top >= containerRect.top &&
            elementRect.left >= containerRect.left &&
            elementRect.bottom <= containerRect.bottom &&
            elementRect.right <= containerRect.right
        );
    }
}
function br(element, n = 1) {
    for (let i = 0; i < n; i++) {
        let br = document.createElement('br');
        element.appendChild(br);
    }
}
function lines_intersect(p1, p2, q1, q2) {
    let det = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);

    if (det === 0) {
        return false; // Parallel lines
    }
    let lambda = ((q2.y - q1.y) * (q2.x - p1.x) + (q1.x - q2.x) * (q2.y - p1.y)) / det;
    let gamma = ((p1.y - p2.y) * (q2.x - p1.x) + (p2.x - p1.x) * (q2.y - p1.y)) / det;

    if (0 <= lambda && lambda <= 1 && 0 <= gamma && gamma <= 1) {
        return true;
    }
    return false;
}
function line_intersects_polygon(polygon, a, b) {
    for (let i = 0; i < polygon.length; i++) {
        let j = (i + 1) % polygon.length;
        let edge_start = polygon[i];
        let edge_end = polygon[j];

        if (lines_intersect(a, b, edge_start, edge_end)) {
            return true;
        }
    }
    return false;
}
function point_in_polygon(x, y, polygon) {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x;
        let yi = polygon[i].y;
        let xj = polygon[j].x;
        let yj = polygon[j].y;

        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}
function polygon_area(points) {
    let sum = 0;
    let n = points.length;

    if (p2eq(points[0], points[points.length - 1], 1e-12)) {
        n -= 1;
    }
    for (let i = 0; i < n; i++) {
        let j = (i + 1) % n; // wraps around to the first point
        sum += points[i].x * points[j].y;
        sum -= points[j].x * points[i].y;
    }

    return Math.abs(sum) / 2;
}
function translate_point(dx, dy, p) {
    return p2d(p.x + dx, p.y + dy);
}
function translate_points(dx, dy, points) {
    return points.map((p) => translate_point(dx, dy, p));
}
function point_within_fov(p_src, direction, fov, p_target) {
    let delta = p2sub(p_target, p_src);
    let dvec = p2rot(p2d(0, 1), direction);

    let angle = p2angle(dvec, delta);

    return angle <= fov;
}
function dragElement(element, handle) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
/* Code for when served with "node serve.js" */
function is_being_served() {
    return window.location.host.includes('127.0.0.1') || window.location.host.includes('localhost');
}
async function is_output_dir_empty() {
    return await fetch('/output_dir_empty').then(r => r.json());
}
async function is_output_dir_empty() {
    try {
        let res = await fetch('/output_dir_empty');

        if (!res.ok) {
            throw new Error('Request failed: ' + res.status);
        }
        return await res.json();
    } catch (err) {
        console.error('Error checking output dir:', err);
        return false;
    }
}
async function save_file(file_name, json_str) {
    let r = await fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file_name, contents: json_str })
    });
    if (!r.ok) {
        let msg = await r.text();
        console.error('File saving failed: ' + msg);
        return false;
    }
    return true;
}