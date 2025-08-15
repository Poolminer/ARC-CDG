class ObjectAssembly extends CurriculumLesson {
    constructor(){
        super('Object Assembly', 'Combine parts to form complex shapes.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
