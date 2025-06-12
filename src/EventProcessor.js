import QuestionManager from "./QuestionManager.js";
import EventBlock from "./struct/EventBlock.js";
import Action from "./struct/Action.js";

export default class EventProcessor {
    constructor(context) {
        this.context = context;
        this.questionMananger = new QuestionManager(this.context);
        this.eventQueue = this.loadScript();
    }
    
    loadScript(){
        const queue = [];
        for(let i = 0; i < Object.keys(SCRIPT).length; i++){
            queue.push(new EventBlock(i));
        }
        return queue;
    }

    // Get the next action from the event queue
    getEvent(){
        // Check if waiting for input
        if(this.context.state.wait) return new Action(ActionType.Wait);

        // Check if the event is complete
        if(this.pollEvent()) return new Action(ActionType.Wait);
        console.log("poll");
        // Check if the event is a text event
        const state = this.context.state;  // Must happen after pollEvent
        if(state.event.text != null){
            return new Action(ActionType.Text, state.event.text[state.round]);
        }

        // Check if the zone is unset - Implies a zone change
        if(state.zone == null && state.event.zone != null){
            this.context.state.wait = true;
            return new Action(ActionType.Zone, state.event.zone);
        }

        // Check if the basic questions are complete
        if(state.mode != MODES.ZERO_GRAVITY && state.event.basicQuestions > state.basic){
            state.mode = "BASIC";
            state.basic += 1; 
            console.log("Getting basic question");
            const question = this.questionMananger.getBasicQuestion();
            if(question == null) {
                console.log("No questions");
                return new Action(ActionType.Wait);
            }
            state.round++;
            return new Action(ActionType.Question, question);
        }

        // Check if the mode is unset - Implies a mode change
        // TODO: Add option to change mode every question or not
        if(state.modeChange){
            state.modeChange = false;
            //this.context.state.wait = true;
            return new Action(ActionType.Mode, state.event.mode);
        }

        

        // Return a question
        const question = this.questionMananger.getQuestion();
        if(question == null) {
            console.log("No questions");
            return new Action(ActionType.Wait);
        }
        state.round++;
        if(state.mode != MODES.ZERO_GRAVITY) state.modeChange = true;
        return new Action(ActionType.Question, question);
    }

    // Check if the current event is complete
    pollEvent(){
        const state = this.context.state;

        if(state.event == null) return true; // Uninitialized

        // Check if text is complete
        if(state.event.text != null){
            if(state.round >= state.event.rounds){
                console.log("Rounds complete", state.event.halt);
                if(state.event.halt) return true;
                this.loadNext();
                return false;   
            }
        }
        // Check if rounds are complete
        if(state.round >= state.event.rounds){
            if(state.mode == MODES.ZERO_GRAVITY){
                this.loadNext();
                return false;
            }
            this.context.state.zone = null;
            return true;   
        }

        return false;
    }

    // Load the next event from the event queue
    loadNext(){
        const state = this.context.state;

        // Get the next event index
        const index =
            state.event == null ?
                0 : 
                state.event.index+1;

        // Load the next event
        this.context.state = this.context.resetState();
        this.context.state.initialized = true;
        this.context.state.event = this.eventQueue[index];

        console.log(`Loaded event ${index}`);
    }
}