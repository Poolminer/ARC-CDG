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

        this.set_title(`${export_format.value} format`);

        let max_pairs = get_max_pairs();
        let grids = get_grid_list(video, output_is_next_input, max_pairs);

        if (export_format.value === 'JSONL') {
            for (let grid of grids) {
                let grid_div = document.createElement('div');
                grid_div.className = 'task_panel_grid';
                grid_div.appendChild(grid.element(192));
                this.appendChild(grid_div);
                this.br();
            }
        } else {
            let i = 0;
            let j = 1;

            for (let g = 0; g < grids.length; g++) {
                let grid = grids[g];
                let grid_div = document.createElement('div');
                grid_div.className = 'task_panel_grid';

                let span = document.createElement('span');
                let txt;

                if (export_format.value === 'ARC-AGI') {
                    if (g > grids.length - 3) {
                        txt = document.createTextNode(i % 2 === 0 ? `Test Input` : `Test Output`);
                    } else {
                        txt = document.createTextNode(i % 2 === 0 ? `Ex. ${j} Input` : `Ex. ${j} Output`);
                    }
                } else {
                    txt = document.createTextNode(i % 2 === 0 ? `Input` : `Output`);
                }
                span.appendChild(txt);

                grid_div.appendChild(span);

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