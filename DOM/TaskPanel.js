class TaskPanel extends DOMElement {
    #header = document.getElementById('task_panel_header');
    #title_span = document.getElementById('task_panel_header_title');
    #close_button = document.getElementById('task_panel_close');
    #panel = document.getElementById('task_panel');
    #video = null;
    #output_is_next_input = null;
    #visible = false;

    constructor() {
        super('task_panel_content');

        this.#close_button.addEventListener('click', () => {
            this.hide();
        });
        dragElement(this.#panel, this.#header);
    }
    set_title(title) {
        this.#title_span.innerText = title;
    }
    show() {
        this.#panel.style.display = 'flex';
        this.#visible = true;
    }
    hide() {
        this.#panel.style.display = 'none';
        this.#visible = false;
    }
    visible() {
        return this.#visible;
    }
    show_task(video, output_is_next_input) {
        this.clear();

        this.#video = video;
        this.#output_is_next_input = output_is_next_input;

        let max_pairs = get_max_pairs();
        let grids = get_grid_list(video, output_is_next_input, max_pairs);

        if (export_format.value === 'JSONL') {
            this.set_title(`${export_format.value} format, ${grids.length} grids.`);

            for (let grid of grids) {
                let grid_div = document.createElement('div');
                grid_div.className = 'task_panel_grid';
                grid_div.appendChild(grid.element(192));
                this.appendChild(grid_div);
                this.br();
            }
        } else {
            let num_pairs = grids.length / 2;
            this.set_title(`${export_format.value} format, ${num_pairs} pair${num_pairs === 1 ? '' : 's'}.`);

            let i = 0;
            let j = 1;

            for (let g = 0; g < grids.length; g++) {
                let grid = grids[g];
                let grid_div = document.createElement('div');
                grid_div.className = 'task_panel_grid';

                let span = document.createElement('span');
                let span2 = document.createElement('span');

                span2.style.float = "right";

                let txt;
                let txt2;

                if (export_format.value === 'ARC-AGI') {
                    if (g > grids.length - 3) {
                        txt = document.createTextNode(i % 2 === 0 ? `Test Input` : `Test Output`);
                    } else {
                        txt = document.createTextNode(i % 2 === 0 ? `Ex. ${j} Input` : `Ex. ${j} Output`);
                    }
                } else {
                    txt = document.createTextNode(i % 2 === 0 ? `Input` : `Output`);
                }
                txt2 = document.createTextNode(`(${grid.width}x${grid.height})`);
                
                span.appendChild(txt);
                span2.appendChild(txt2);

                grid_div.appendChild(span);
                grid_div.appendChild(span2);

                br(grid_div);

                grid_div.appendChild(grid.element(192));

                this.appendChild(grid_div);
                i++;
                if (i === 2) {
                    i = 0;
                    j += 1;
                    this.br();
                }
            }
        }
        this.show();
    }
    refresh() {
        this.show_task(this.#video, this.#output_is_next_input);
    }
}