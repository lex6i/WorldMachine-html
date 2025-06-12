import EventProcessor from './EventProcessor.js'
import UIManager from './UIManager.js'

export default class Context {
    constructor(settings) {
        this.settings = settings;

        // Initialize State
        this.state = this.resetState();

        // Initialize Handlers
        this.eventProcessor = new EventProcessor(this);
        this.ui = new UIManager(this);

        // Wait for initialization and start update loop
        const intervalID = window.setInterval(()=>{
            if(this.state.initialized) {
                window.clearInterval(intervalID);
                this.ui.matrixAnimation.start();
                this.ui.asciiAnimation.start();
                window.setInterval(this.update.bind(this), 10);
            }
        }, 10);

        this.isLoading = false;
    }

    resetState(){
        return {
            initialized: false,
            event: null,
            mode: null,
            zone: null,
            round: 0,
            basic: 0,
            repeat: 0,
            wait: false,
            modeChange: true,
        }
    }

    // Main Loop
    // TODO: Implement setting for if zones can be repeated
    async update(){
        if(this.isLoading) return;

        const action =this.eventProcessor.getEvent();
        switch(action.type){
            case ActionType.Zone:
                console.log("Setting Zone", action.data);
                this.state.zone = 
                action.data == ZONES.RANDOM ?
                    ZONES[Object.keys(ZONES)[Math.floor(Math.random() * (Object.keys(ZONES).length-1))+1]] : // Exclude RANDOM zone
                    action.data;
                this.isLoading = true;
                this.ui.showAreaInfo();
                await this.ui.updateConsole("Zone " + this.state.zone.name + " activated", ConsoleType.Zone, ["hint"]);
                this.isLoading = false;
                break;
            case ActionType.Mode:
                this.isLoading = true;
                console.log("Setting Mode", action.data);
                this.state.mode = 
                action.data == MODES.RANDOM ?
                    MODES[Object.keys(MODES)[Math.floor(Math.random() * (Object.keys(MODES).length-2))+2]] : // Exclude RANDOM mode and ZERO_GRAVITY mode
                    action.data;
                console.log("Mode", this.state.mode);
                this.ui.update();
                await this.ui.updateConsole("Activating Mode: ", ConsoleType.Text, [], false);
                await this.ui.updateConsole(this.state.mode.name + ": " + this.state.mode.description, ConsoleType.Text, ["hint"], false);
                await this.ui.addToHistory(ConsoleType.Mode, this.state.mode.name + " activated");
                this.isLoading = false;
                break;
            case ActionType.Question:
                this.isLoading = true;
                this.ui.update();
                await this.ui.updateConsole(action.data, ConsoleType.Question);
                if (this.state.mode != MODES.ZERO_GRAVITY){ 
                    this.state.wait = true;
                    console.log("Waiting for mode");
                }
                this.isLoading = false;
                break;
            case ActionType.Text:
                this.isLoading = true;
                this.ui.update();
                await this.ui.updateConsole(action.data[0], action.data[1], action.data[2], action.data[3]);
                this.state.round++;
                this.isLoading = false;
                break;
            case ActionType.Wait:
                console.log("Waiting");
                break;
        }

        this.ui.update();
    }       

    async addUserData(text){
        this.isLoading = true;
        await this.ui.updateConsole(text, ConsoleType.Matrix);
        this.isLoading = false;
    }

    async generateHint(){
        this.ui.addHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
    }
}