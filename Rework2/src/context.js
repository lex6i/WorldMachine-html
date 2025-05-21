class Context {
    constructor(){
        // Initialize state
        this.state = {
            initialized: false,
            mode: null,
            area: null,
            round: 0,
            maxRounds: 5,
            zeroGravityQuestionsAsked: false,
            maxZeroGravityQuestions: 3,
            history: [],
            usedQuestions: {}
        }
    }
}
