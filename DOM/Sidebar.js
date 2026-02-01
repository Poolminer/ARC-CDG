class Sidebar extends DOMElement {
    #num_subjects = 0;
    #active_lesson = null
    
    reload_active_lesson = function(){}

    constructor() {
        super('sidebar');
    }

    set_curriculum(curriculum) {
        demo_mode = true;

        this.clear();

        for (let subject of curriculum.subjects) {
            this.#num_subjects++;

            let span = document.createElement('span');
            span.className = 'subject_title';

            let title = document.createTextNode(`${this.#num_subjects}. ${subject.title}`);
            span.appendChild(title);

            this.appendChild(span);

            this.br(1);

            let num_lessons = 0;

            for (let lesson of subject.lessons) {
                num_lessons++;

                this.br(1);

                let lesson_container = document.createElement('div');
                lesson_container.className = 'lesson_container';

                let checkbox = document.createElement('input');

                checkbox.type = 'checkbox';
                checkbox.checked = lesson.exp;

                checkbox.addEventListener('change', () => {
                    lesson.exp = checkbox.checked;
                });
                lesson_container.appendChild(checkbox);

                span = document.createElement('span');
                span.className = 'lesson_title';
                title = document.createTextNode(`${this.#num_subjects}.${num_lessons}. ${lesson.title}`);
                span.appendChild(title);

                lesson_container.appendChild(span);

                br(lesson_container, 1);

                span = document.createElement('span');
                span.className = 'lesson_description';
                title = document.createTextNode(`${lesson.description}`);
                span.appendChild(title);

                lesson_container.appendChild(span);

                br(lesson_container, 1);

                Math.seedRandom(seed);

                let demo_task = lesson.generate_demo_task();

                if (demo_task instanceof GridVideo) {
                    demo_task.element.style.marginTop = '8px';
                    demo_task.element.style.cursor = 'pointer';

                    lesson_container.appendChild(demo_task.element);

                    for (let warning of lesson.warnings) {
                        span = document.createElement('span');

                        let txt = document.createTextNode(`⚠ ${warning}`);
                        span.className = 'warning';
                        span.appendChild(txt);

                        br(lesson_container, 1);

                        lesson_container.appendChild(span);
                    }
                    let fps = demo_task.fps !== 0 ? demo_task.fps : Math.ceil(demo_task.num_frames / lesson.num_videos);

                    demo_task.play(4, 1, fps);

                    let demo_onclick = () => {
                        this.#active_lesson = lesson;
                        this.reload_active_lesson = demo_onclick;

                        Math.seedRandom(seed);

                        if (!scroll_tip_shown || true) {
                            top_text.innerText = 'Scroll down to generate more tasks ￬';

                            scroll_tip_shown = true;
                        }
                        content.clear();

                        content.addEventListener('click', () => {
                            task_panel.hide();
                        });

                        let tasks = [];

                        function content_add_task() {
                            let task = lesson.generate_task();

                            task.element.style.margin = '4px';
                            task.element.style.cursor = 'pointer';

                            task.element.addEventListener('click', (e) => {
                                e.stopPropagation();
                                task_panel.show_task(task, lesson.output_is_next_input);
                            });

                            content.appendChild(task.element);

                            tasks.push(task);
                        }
                        function play() {
                            for (let task of tasks) {
                                let fps = task.fps !== 0 ? task.fps : Math.ceil(task.num_frames / lesson.num_videos);

                                task.play(4, 1, fps);
                            }
                        }
                        function stop() {
                            for (let task of tasks) {
                                task.stop();
                            }
                        }
                        let add_tasks = (num) => {
                            let start = Date.now();

                            for (let i = 0; i < num; i++) {
                                content_add_task();

                                let delta = (Date.now() - start) / 1000;

                                if (delta > 5) {
                                    break;
                                }
                            }
                        };
                        add_tasks(75);
                        play();

                        let triggered = false;

                        content.addEventListener('wheel', event => {
                            if (triggered || event.deltaY < 0) {
                                return;
                            }
                            top_text.innerText = '';

                            if (content.scrollbar_visible()) {
                                triggered = true;
                                return;
                            }
                            stop();
                            add_tasks(20);
                            play();
                        });
                        { // "wheel" on touch-devices
                            let start_x = 0;
                            let start_y = 0;
                            let threshold = 150; // min vertical distance in px

                            content.addEventListener('touchstart', (e) => {
                                if (e.touches.length > 0) {
                                    start_x = e.touches[0].clientX;
                                    start_y = e.touches[0].clientY;
                                }
                            }, false);
                            content.addEventListener('touchend', (e) => {
                                if (e.changedTouches.length > 0) {
                                    let end_x = e.changedTouches[0].clientX;
                                    let end_y = e.changedTouches[0].clientY;

                                    let dx = end_x - start_x;
                                    let dy = end_y - start_y;

                                    // mostly vertical, upward movement
                                    if (!triggered && Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx) && dy < 0) {
                                        top_text.innerText = '';

                                        if (content.scrollbar_visible()) {
                                            triggered = true;
                                            return;
                                        }
                                        stop();
                                        add_tasks(20);
                                        play();
                                    }
                                }
                            }, false);
                        }
                        content.addEventListener('scroll', event => {
                            const { scrollHeight, scrollTop, clientHeight } = content.element;

                            if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
                                stop();
                                add_tasks(20);
                                play();
                            }
                        });
                        task_panel.hide();
                    };
                    demo_task.element.addEventListener('click', demo_onclick);

                    if (this.#active_lesson == lesson) {
                        demo_mode = false;
                        demo_onclick();
                        demo_mode = true;
                    }
                }
                this.appendChild(lesson_container);
            }
            this.br(2);
        }
        /* Add TODO list */
        let span = document.createElement('span');

        let text = document.createTextNode('Not yet implemented:');
        span.appendChild(text);

        this.appendChild(span);

        this.br(2);

        let todo_items = todo.split('\n');

        let num_lessons = 0;

        this.#num_subjects++;

        for (let item of todo_items) {
            if (item.length === 0) {
                continue;
            }
            if (!item.includes('•')) {
                item = item.replace('Subject: ', '');

                let span = document.createElement('span');
                let title = document.createTextNode(`${this.#num_subjects}. ${item}`);

                span.appendChild(title);

                this.appendChild(span);

                span.className = 'subject_title';

                this.br();

                this.#num_subjects++;
            } else {
                num_lessons++;

                let lesson_container = document.createElement('div');
                lesson_container.className = 'lesson_container';

                item = item.replace('    • ', '');

                let split = item.split(' – ');
                let title = split[0];
                let description = split[1];

                let span = document.createElement('span');

                let title_node = document.createTextNode(`${this.#num_subjects - 1}.${num_lessons}. ${title}`);
                span.appendChild(title_node);

                span.className = 'lesson_title';

                lesson_container.appendChild(span);

                br(lesson_container, 1);

                span = document.createElement('span');

                let description_node = document.createTextNode(description);
                span.appendChild(description_node);

                span.className = 'lesson_description';

                lesson_container.appendChild(span);

                this.appendChild(lesson_container);
            }
            this.br(1);
        }
        demo_mode = false;
    }
    clear() {
        super.clear();

        this.#num_subjects = 0;
    }
}