class InterExampleRuleInference extends CurriculumLesson {
    constructor(){
        super('Inter-Example Rule Inference', 'Infer rules from multiple demonstrations.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
