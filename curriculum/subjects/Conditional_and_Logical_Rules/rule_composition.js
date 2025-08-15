class RuleComposition extends CurriculumLesson {
    constructor(){
        super('Rule Composition', 'Apply sequential logical steps.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
