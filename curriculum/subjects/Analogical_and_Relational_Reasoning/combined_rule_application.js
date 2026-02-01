class CombinedRuleApplication extends CurriculumLesson {
    constructor(){
        super('Combined Rule Application', 'Perform multi‑step reasoning.');
    }
    generate_task(demo=false){
        // TODO: implement proper task generation logic
        return null;
    }
    generate_demo_task(){
        return this.generate_task(true);
    }
}
