function get_grid_list(video, output_is_next_input, max_num_pairs) {
    let grids = [];

    if (output_is_next_input) {
        for (let i = 0, j = 1; i < max_num_pairs && j < video.grids.length; i++, j++) {
            grids.push(video.grids[j - 1]);
            grids.push(video.grids[j]);
        }
    } else {
        for (let i = 0, j = 1; i < max_num_pairs && j < video.grids.length; i++, j += 2) {
            grids.push(video.grids[j - 1]);
            grids.push(video.grids[j]);
        }
    }
    grids[grids.length - 2] = video.grids[video.grids.length - 2];
    grids[grids.length - 1] = video.grids[video.grids.length - 1];

    return grids;
}

function get_export_name(num_tasks_per_lesson){
    return `cdg_export_${seed}_${num_tasks_per_lesson}_${get_min_pairs()}_${get_max_pairs()}.zip`;
}

function export_curriculum_arc_agi(curriculum, num_tasks_per_lesson, max_num_pairs) {
    let challenges = {};
    let solutions = {};

    let lesson_index = 0;
    let task_index = 0;

    let to_export = [];

    for (let subject of curriculum.subjects) {
        for (let lesson of subject.lessons) {
            if (lesson.exp) {
                to_export.push(lesson);
            }
        }
    }
    if (to_export.length === 0) {
        return;
    }
    button_export.innerText = button_export_abort_txt;

    Math.seedRandom(seed);

    progress_bar_export.style.display = '';
    progress_bar_export.value = 0;
    progress_bar_export.max = to_export.length * num_tasks_per_lesson;

    let next = () => {
        let lesson = to_export[lesson_index];
        let video = lesson.generate_task();
        let grids = get_grid_list(video, lesson.output_is_next_input, max_num_pairs);

        let id = rnd_hex(8);

        let task = {};
        let training_pairs = [];
        let test_inputs = [];
        let test_outputs = [];

        for (let g = 0; g < grids.length - 2; g += 2) {
            let pair = {
                'input': grids[g].to_array(),
                'output': grids[g + 1].to_array()
            };
            training_pairs.push(pair);
        }
        let test_input = {
            'input': grids[grids.length - 2].to_array()
        };
        test_inputs.push(test_input);
        test_outputs.push(grids[grids.length - 1].to_array());

        task['train'] = training_pairs;
        task['test'] = test_inputs;

        challenges[id] = task;
        solutions[id] = test_outputs;

        if (++task_index === num_tasks_per_lesson) {
            task_index = 0;

            if (++lesson_index === to_export.length) {
                let zip = new JSZip();

                zip.file("arc-cdg_challenges.json", JSON.stringify(challenges));
                zip.file("arc-cdg_solutions.json", JSON.stringify(solutions));

                zip.generateAsync({ type: "blob" }).then(function (content) {
                    saveAs(content, get_export_name(num_tasks_per_lesson));
                });
                progress_bar_export.style.display = 'none';
                button_export.innerText = button_export_org_txt;

                return;
            }
        }
        progress_bar_export.value++;

        if (button_export.disabled) {
            progress_bar_export.style.display = 'none';
            button_export.innerText = button_export_org_txt;
            button_export.disabled = false;
        } else {
            window.setTimeout(next, 0);
        }
    };
    next();
}

function export_curriculum_re_arc(curriculum, num_tasks_per_lesson, max_num_pairs) {
    let lesson_index = 0;
    let task_index = 0;

    let to_export = [];

    for (let subject of curriculum.subjects) {
        for (let lesson of subject.lessons) {
            if (lesson.exp) {
                to_export.push(lesson);
            }
        }
    }
    if (to_export.length === 0) {
        return;
    }
    button_export.innerText = button_export_abort_txt;

    Math.seedRandom(seed);

    progress_bar_export.style.display = '';
    progress_bar_export.value = 0;
    progress_bar_export.max = to_export.length * num_tasks_per_lesson;

    let zip = is_being_served() ? null : new JSZip();

    let next = () => {
        let lesson = to_export[lesson_index];
        let video = lesson.generate_task();
        let grids = get_grid_list(video, lesson.output_is_next_input, max_num_pairs);

        let id = rnd_hex(8);

        let pairs = [];

        for (let g = 0; g < grids.length; g += 2) {
            let pair = {
                'input': grids[g].to_array(),
                'output': grids[g + 1].to_array()
            };
            pairs.push(pair);
        }
        if (zip === null) {
            save_file(`${id}.json`, JSON.stringify(pairs));
        } else {
            zip.file(`${id}.json`, JSON.stringify(pairs));
        }
        if (++task_index === num_tasks_per_lesson) {
            task_index = 0;

            if (++lesson_index === to_export.length) {
                if (zip !== null) {
                    zip.generateAsync({ type: "blob" }).then(function (content) {
                        saveAs(content, get_export_name(num_tasks_per_lesson));
                    });
                }
                progress_bar_export.style.display = 'none';
                button_export.innerText = button_export_org_txt;

                return;
            }
        }
        progress_bar_export.value++;

        if (button_export.disabled) {
            progress_bar_export.style.display = 'none';
            button_export.innerText = button_export_org_txt;
            button_export.disabled = false;
        } else {
            window.setTimeout(next, 0);
        }
    };
    next();
}

function export_curriculum_jsonl(curriculum, num_tasks_per_lesson) {
    let lesson_index = 0;
    let task_index = 0;

    let to_export = [];

    for (let subject of curriculum.subjects) {
        for (let lesson of subject.lessons) {
            if (lesson.exp) {
                to_export.push(lesson);
            }
        }
    }
    if (to_export.length === 0) {
        return;
    }
    button_export.innerText = button_export_abort_txt;

    Math.seedRandom(seed);

    progress_bar_export.style.display = '';
    progress_bar_export.value = 0;
    progress_bar_export.max = to_export.length * num_tasks_per_lesson;

    let zip = is_being_served() ? null : new JSZip();

    let next = () => {
        let lesson = to_export[lesson_index];
        let video = lesson.generate_task();
        let grids = video.grids;

        let id = rnd_hex(8);

        let str = '';

        for (let i = 0; i < grids.length; i++) {
            let grid = grids[i];

            str += JSON.stringify(grid.to_array());

            if (i !== grids.length - 1) {
                str += '\n';
            }
        }
        if (zip === null) {
            save_file(`${id}.json`, str);
        } else {
            zip.file(`${id}.json`, str);
        }
        if (++task_index === num_tasks_per_lesson) {
            task_index = 0;

            if (++lesson_index === to_export.length) {
                if (zip !== null) {
                    zip.generateAsync({ type: "blob" }).then(function (content) {
                        saveAs(content, get_export_name(num_tasks_per_lesson));
                    });
                }
                progress_bar_export.style.display = 'none';
                button_export.innerText = button_export_org_txt;

                return;
            }
        }
        progress_bar_export.value++;

        if (button_export.disabled) {
            progress_bar_export.style.display = 'none';
            button_export.innerText = button_export_org_txt;
            button_export.disabled = false;
        } else {
            window.setTimeout(next, 0);
        }
    };
    next();
}