class Proximity extends CurriculumLesson {
    constructor(){
        super('Proximity', 'Group nearby objects together.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
