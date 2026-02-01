class TransformationTransfer extends CurriculumLesson {
    constructor(){
        super('Transformation Transfer', 'Apply learned rules to new examples.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
