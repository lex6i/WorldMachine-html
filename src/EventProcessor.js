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
        if(this.context.state.wait) return new Action(ActionType.Wait);

        if(this.pollEvent()) return new Action(ActionType.Wait);

        const state = this.context.state;
        if(state.event.text != null){
            return new Action(ActionType.Text, state.event.text[state.round]);
        }
        console.log(state.event.zone, state.zone);
        if(state.zone == null && state.event.zone != null){ // Zone change
            this.context.state.wait = true;
            return new Action(ActionType.Zone, state.event.zone);
        }

        if(state.mode == null ){ // Mode change
            //if(state.event.mode != MODES.ZERO_GRAVITY) this.context.state.wait = true;
            return new Action(ActionType.Mode, state.event.mode);
        }
        
        //if(state.mode != MODES.ZERO_GRAVITY) return new Action(ActionType.Wait);
        // Get a question
        const question = this.questionMananger.getQuestion();
        if(question == null) {
            console.log("No questions");
            return new Action(ActionType.Wait);
        }
        state.round++;
        return new Action(ActionType.Question, question);

        console.log("No action");
        return new Action(ActionType.Wait);
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