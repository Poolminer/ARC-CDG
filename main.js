const init_seed = 'b0f477';
let seed = init_seed;

Math.seedRandom(seed);

let content = new DOMElement('content');
let sidebar = new Sidebar();
let task_panel = new TaskPanel();
let top_text = document.getElementById('top_text');

let button_export = document.getElementById('button_export');
let button_random_seed = document.getElementById('button_random_seed');
let button_custom_seed = document.getElementById('button_custom_seed');
let button_select_all_lessons = document.getElementById('button_select_all_lessons');
let button_deselect_all_lessons = document.getElementById('button_deselect_all_lessons');

let button_export_org_txt = button_export.innerText;
let button_export_abort_txt = 'Cancel export';

let progress_bar_export = document.getElementById('progress_bar_export');
let num_tasks_per_lesson = document.getElementById('num_tasks_per_lesson');
let max_num_pairs_per_task = document.getElementById('max_num_pairs_per_task');
let option_inf = document.getElementById('option_inf');
let prev_option = document.getElementById(`option_${max_num_pairs_per_task.value}`);
let export_format = document.getElementById('export_format');
let export_format_arc_agi = document.getElementById('export_format_arc_agi');
let export_format_re_arc = document.getElementById('export_format_re_arc');

let scroll_tip_shown = false;

content.element.style.lineHeight = '0px';

let curriculum = new Curriculum('default');

let subject;

subject = new CurriculumSubject('Object Continuity and Transformation');
subject.add_lesson(new LineDrawing());
subject.add_lesson(new PositionTrackingLesson());
subject.add_lesson(new RotationTrackingLesson());
subject.add_lesson(new OutlineLesson());
subject.add_lesson(new ScaleTrackingLesson());
subject.add_lesson(new ReflectionAndFlippingLesson());
subject.add_lesson(new ColorTransformationLesson());
subject.add_lesson(new CompositeTransformationsLesson());
subject.add_lesson(new PartialOcclusionLesson(), false);
subject.add_lesson(new IdentityDisambiguationLesson());
curriculum.add_subject(subject);

subject = new CurriculumSubject('Spatial Relations');
subject.add_lesson(new RelativePositioningLesson());
subject.add_lesson(new ContainmentLesson());
subject.add_lesson(new FillLesson());
subject.add_lesson(new AlignmentAndGridStructureLesson());
curriculum.add_subject(subject);

subject = new CurriculumSubject('Physical Interaction and Dynamics');
subject.add_lesson(new GravityLesson(), false);
subject.add_lesson(new GravityNoInbetweenLesson());
subject.add_lesson(new FluidDynamicsLesson(), false);
subject.add_lesson(new FluidDynamicsNoInbetweenLesson());
subject.add_lesson(new LightEmissionAndBlockingLesson(), false);
subject.add_lesson(new LineOfSightLesson(), false);
subject.add_lesson(new CollisionDynamicsLesson(), false);
curriculum.add_subject(subject);

sidebar.set_curriculum(curriculum);

function get_max_pairs() {
    if (/^\d+$/.test(max_num_pairs_per_task.value)) {
        return parseInt(max_num_pairs_per_task.value);
    } else {
        return Infinity;
    }
}

button_export.addEventListener('click', () => {
    if (button_export.innerText === button_export_abort_txt) {
        button_export.disabled = true;
        return;
    }
    let num_tasks = num_tasks_per_lesson.value;
    let max_pairs = get_max_pairs();

    if (!/^\d+$/.test(num_tasks)) {
        if (is_being_served()) {
            num_tasks = prompt('Choose the number of tasks per lesson.');
        } else {
            num_tasks = prompt('Choose the number of tasks per lesson.\n\nHigher values will cause the export to fail because of how the dataset is stored in memory before being zipped.\n\nTo generate an arbitrary number of tasks, clone the GitHub repo and serve it with "node serve.py", the files will then be saved directly to the local "./output" directory (supports only the RE-ARC and JSONL export formats).');
        }
        if (!/^\d+$/.test(num_tasks)) {
            return;
        }
    }
    num_tasks = parseInt(num_tasks);

    if (num_tasks === 0) {
        return;
    }
    let start = () => {
        switch (export_format.value) {
            case 'ARC-AGI':
                if (is_being_served()) {
                    break;
                }
                export_curriculum_arc_agi(curriculum, parseInt(num_tasks), max_pairs);
                break;
            case 'RE-ARC':
                export_curriculum_re_arc(curriculum, parseInt(num_tasks), max_pairs);
                break;
            case 'JSONL':
                export_curriculum_jsonl(curriculum, parseInt(num_tasks));
                break;
        }
    };
    if (is_being_served()) {
        is_output_dir_empty().then((yay) => {
            if (yay) {
                start();
            } else {
                alert('The output directory must be empty or nonexistent');
            }
        });
    } else {
        start();
    }
});

button_random_seed.addEventListener('click', () => {
    seed = (Math.round(Math.random_org() * 9999999)).toString(16);
    Math.seedRandom(seed);
    sidebar.set_curriculum(curriculum);
});

button_custom_seed.addEventListener('click', () => {
    custom = prompt('Set the task generator seed', seed);

    if (custom === null) {
        return;
    }
    seed = custom;
    Math.seedRandom(seed);
    sidebar.set_curriculum(curriculum);
});

button_select_all_lessons.addEventListener('click', () => {
    let inputs = document.getElementsByTagName('input');

    for (let input of inputs) {
        if (input.type === 'checkbox') {
            if (!input.checked) {
                input.click();
            }
        }
    }
});

button_deselect_all_lessons.addEventListener('click', () => {
    let inputs = document.getElementsByTagName('input');

    for (let input of inputs) {
        if (input.type === 'checkbox') {
            if (input.checked) {
                input.click();
            }
        }
    }
});

max_num_pairs_per_task.addEventListener('change', () => {
    prev_option = document.getElementById(`option_${max_num_pairs_per_task.value}`);

    if (task_panel.visible()) {
        task_panel.refresh();
    }
});

export_format.addEventListener('change', () => {
    if (export_format.value === 'JSONL') {
        option_inf.selected = true;
        max_num_pairs_per_task.disabled = true;
    } else {
        prev_option.selected = true;
        max_num_pairs_per_task.disabled = false;
    }
    if (task_panel.visible()) {
        task_panel.refresh();
    }
});

if (is_being_served()) {
    export_format_re_arc.selected = true;
    export_format_arc_agi.disabled = true;
}