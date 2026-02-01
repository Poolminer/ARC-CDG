class GridCanvas {
    constructor(cell_size = 1, border_size = 1) {
        this.cell_size = cell_size;
        this.border_size = border_size;

        this.buffer = document.createElement('canvas');
        this.element = document.createElement('canvas');

        this.buffer_ctx = this.element.getContext('2d');
        this.element_ctx = this.element.getContext('2d');

        this.use_cache = false;

        this.sticky = true;

        this.element.width = 1;
        this.element.height = 1;
    }
    set_cell(x, y, color) {
        this.buffer_ctx.fillStyle = color.hex;
        this.buffer_ctx.fillRect(x * this.cell_size + this.border_size, y * this.cell_size + this.border_size, this.cell_size - this.border_size, this.cell_size - this.border_size);
    }
    fit_to(grid) {
        this.fit_to_wh(grid.width, grid.height);
    }
    fit_to_wh(width, height) {
        let target_width = width * this.cell_size + this.border_size;
        let target_height = height * this.cell_size + this.border_size;

        if(this.sticky){
            if (this.element.width < target_width) {
                this.element.width = target_width;
            }
            if (this.element.height < target_height) {
                this.element.height = target_height;
            }
        } else {
            if (this.element.width !== target_width || this.element.height !== target_height) {
                this.element.width = target_width;
                this.element.height = target_height;
            }
        }
    }
    render(grid, fit_to = true) {
        if (fit_to) {
            this.fit_to(grid);
        }
        if (this.use_cache && grid.img_data !== null && grid.img_data.width === this.element.width && grid.img_data.height === this.element.height) {
            this.buffer_ctx.putImageData(grid.img_data, 0, 0);
        } else {
            this.buffer_ctx.clearRect(0, 0, this.element.width, this.element.height);

            this.buffer_ctx.fillStyle = '#555555';
            this.buffer_ctx.fillRect(grid.bounds.x * this.cell_size, grid.bounds.y * this.cell_size, grid.bounds.width * this.cell_size + 1, grid.bounds.height * this.cell_size + 1);

            for (let x = 0; x < grid.bounds.width; x++) {
                for (let y = 0; y < grid.bounds.height; y++) {
                    let color = colors[grid.array[y][x]];

                    this.set_cell(grid.bounds.x + x, grid.bounds.y + y, color);
                }
            }
            this.element_ctx.drawImage(this.buffer, 0, 0);

            if (this.use_cache) {
                grid.img_data = this.buffer_ctx.getImageData(0, 0, this.element.width, this.element.height);
            }
        }
    }
}