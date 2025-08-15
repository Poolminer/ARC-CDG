class CommonFate extends CurriculumLesson {
    constructor(){
        super('Common Fate', 'Identify objects that move together.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
