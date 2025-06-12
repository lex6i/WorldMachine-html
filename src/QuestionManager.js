export default class QuestionManager {
    constructor(context) {
        this.context = context;

        // Initialize used questions
        this.usedQuestions = {};

        const zoneKeys = Object.keys(ZONES);
        const modeKeys = Object.keys(MODES);
        
        zoneKeys.forEach(zoneKey => {
            this.usedQuestions[zoneKey] = {};
            modeKeys.forEach(modeKey => {
                if(modeKey !== "ZERO_GRAVITY"){
                    this.usedQuestions[zoneKey][modeKey] = [];
                } else {
                    this.usedQuestions[modeKey] = [];
                }
            });
        });

        console.log(this.usedQuestions);
    }
    
    getQuestion(){
        const state = this.context.state;
        const questionPool = this.getQuestionPool();
        console.log(questionPool);

        // Get a random question
        const question = questionPool[Math.floor(Math.random() * questionPool.length)];

        const zoneKey = state.zone == null? null : this.getKey("ZONE", state.zone.name);
        const modeKey = this.getKey("MODE", state.mode.name);

        // Add the question to the used questions
        if(state.mode !== MODES.ZERO_GRAVITY)
            this.usedQuestions[zoneKey][modeKey].push(question);
        else 
            this.usedQuestions[modeKey].push(question);

        return question;
    } 

    getBasicQuestion(){
        const zone = this.getKey("ZONE", this.context.state.zone.name);

        const questionPool = QUESTIONS[zone].BASIC;

        return questionPool[Math.floor(Math.random() * questionPool.length)];
    }

    getQuestionPool(){
        const zoneKey = this.context.state.zone == null? null : this.getKey("ZONE", this.context.state.zone.name);
        const modeKey = this.getKey("MODE", this.context.state.mode.name);

        console.log(zoneKey, modeKey);

        // Get the correct question pool
        const questionPool = 
            this.context.state.mode == MODES.ZERO_GRAVITY ?
                QUESTIONS[modeKey] :
                QUESTIONS[zoneKey][modeKey];

        // Filter out used questions
        const availableQuestions =
            this.context.state.mode == MODES.ZERO_GRAVITY ?
                questionPool.filter(question => !this.usedQuestions[modeKey].includes(question)) :
                questionPool.filter(question => !this.usedQuestions[zoneKey][modeKey].includes(question));

        return availableQuestions;
    }

    getKey(type, name){
        if(type == "ZONE"){
            for(const [key, value] of Object.entries(ZONES)){
                if(value.name == name)
                    return key;
            }
        } else if(type == "MODE"){
            for(const [key, value] of Object.entries(MODES)){
                if(value.name == name)
                    return key;
            }
        }

        return null;
    }

}
