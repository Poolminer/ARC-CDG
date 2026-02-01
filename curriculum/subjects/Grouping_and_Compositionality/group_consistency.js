class GroupConsistencyLesson extends CurriculumLesson {
    constructor(){
        super('Group Consistency', 'Apply rules to entire groups of items.');
    }
    generate_task(demo = false) {
        let videos = [];

        let scene_width = 30;
        let scene_height = 30;

        let bg_color = rnd_bg_color();

        let target_num_videos = rnd_num_pairs();

        let category = {};
        let rule = {};

        let rnd_category = () => {
            let category = {};
            let reserved_colors = [bg_color];

            if(rnd_bool()){
                category['outline'] = true;

                if(rnd_bool()){
                    let color = rnd_color(reserved_colors);
                    reserved_colors.push(color);

                    category['outline_color'] = color;
                }
            }
            if(rnd_bool()){
                let color = rnd_color(reserved_colors);
                reserved_colors.push(color);

                category['color'] = color;
            }
            category['reserved_colors'] = reserved_colors;
            return category;
        };

        do {
            category = rnd_category();
        } while(Object.keys(category).length === 1);

        if(category['outline']){
            if(rnd_bool()){
                rule['outline_color'] = rnd_color(category['reserved_colors']);

                if(rnd_bool()){
                    rule['color'] = rnd_color(category['reserved_colors']);
                }
            } else {
                rule['color'] = rnd_color(category['reserved_colors']);
            }
        } else {
            rule['color'] = rnd_color(category['reserved_colors']);
        }

        let subjects = [];

        outer:
        while (videos.length !== target_num_videos) {
            let object_max_width = rnd_obj_size(scene_width, 0.10, 0.20);
            let object_max_height = rnd_obj_size(scene_height, 0.10, 0.20);

            let scene = new Scene(scene_width, scene_height, bg_color);

            let num_objs = rnd_int(4, 8);

            let num_subjects = rnd_int(2, Math.round(num_objs / 2));

            let reserved_colors = category['reserved_colors'];

            for (let i = 0; i < num_subjects; i++) {
                let obj_color = category['color'] ?? rnd_color(reserved_colors);

                let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

                if(category['outline']){
                    obj.outline_color = category['outline_color'] ?? rnd_color([obj_color, ...reserved_colors]);
                    obj.outline_size = 1;
                }
                obj.collisions_enabled = true;
                obj.pushable_x = true;
                obj.pushable_y = true;
                obj.compute_transform();
                obj.update_bounds();

                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while (scene.contains_connected_objects() && ++attempts < 12);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
                subjects.push(obj);
            }
            for (let i = num_subjects; i < num_objs; i++) {
                let obj_color = !category['outline'] ? rnd_color([bg_color, category['color']]) : rnd_color([bg_color]);

                let obj = SceneObject.random(obj_color, object_max_width, object_max_height);

                if(rnd_bool() && !(category['outline'] && !category['outline_color'])){
                    obj.outline_color = rnd_color([bg_color, ...category['reserved_colors']]);
                    obj.outline_size = 1;
                }
                obj.collisions_enabled = true;
                obj.pushable_x = true;
                obj.pushable_y = true;

                scene.add_object(obj);

                let attempts = 0;

                do {
                    obj.set_random_position(scene.bounds);
                } while (scene.contains_connected_objects() && ++attempts < 12);

                if (scene.contains_connected_objects()) {
                    continue outer;
                }
            }
            scene.start_recording();
            scene.render();

            for(let obj of subjects){
                obj.outline_color = bg_color;

                if(rule['color'] !== undefined){
                    obj.set_color(rule['color'])
                }
                if(rule['outline_color'] !== undefined){
                    obj.outline_color = rule['outline_color'];
                    obj.outline_size = 1;
                }
            }
            scene.render();

            scene.video.fps = 1;

            videos.push(scene.video);
        }
        return GridVideo.concat(videos);
    }
    generate_demo_task() {
        return this.generate_task(true);
    }
}