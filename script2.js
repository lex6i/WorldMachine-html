import * as util from "./util.js";

/// ========== Machine Class ========== ///
class Machine {

    constructor() {
        // Initialize machine properties
        this.initialized = false;
        this.mode = null;
        this.area = null;
        this.round = 0;
        this.maxRounds = 5;
        this.zeroGravityQuestionsAsked = 0;
        this.maxZeroGravityQuestions = 3;
        this.history = [];
        this.usedQuestions = {};
        this.animationInterval = null;
        this.matrix = {};
        this.matrix.Scene = null;
        this.matrix.Camera = null;
        this.matrix.Renderer = null;
        this.matrix.Points = null;
        this.matrix.AnimationId = null;

        // Set machine instance
        util.setMachineInstance(this);

        // Load DOM elements
        util.loadDomElements();

        // Initialize UI
        util.updateStatus();
        util.updateButtons();

        // Add event listeners
        util.addListeners();
    }

    /**
     * Initializes the machine.
     */
    initializeMachine() {
        if(machine.initialized) return;
        machine.mode = "ZERO_GRAVITY";

        // Initialize usedQuestions
        this.usedQuestions = {};
        Object.keys(AREAS).forEach(key => {
            this.usedQuestions[key] = {};
            Object.keys(MODES).forEach(mode => {
                if(mode !== "ZERO_GRAVITY") {
                    this.usedQuestions[key][mode] = [];
                } else {
                    this.usedQuestions["ZERO_GRAVITY"] = [];
                }
            });
        });

        // Initialize history
        const dom = machine.domElements;
        dom.consoleOutput.innerHTML = "";
        dom.historyLog.innerHTML = "";
        dom.currentAreaDiv.style.display = "none";
        dom.areaDescriptionDiv.style.display = "none";
        dom.macromatrixHintDiv.style.display = "none";
        dom.matrixData.innerHTML = "";

        // Initialize ASCII animation
        // TODO: Implement ASCII animation

        machine.initialized = true;
        console.log("Machine initialized");
        
        // Initialize matrix
        //TODO: machine.initializeMatrix();

        util.updateButtons();
        util.updateStatus();

        // Start main loop
        machine.mainLoop();
    }

    async mainLoop() {
        await util.writeToConsole(
            "Initializing WORLD MACHINE system...", 
            ">", 
            [], 
            15
        );

        await util.writeToConsole(
            "System ready. Starting ZERO GRAVITY phase...",
            ">",
            [],
            15
        );

        const modeInfo = MODES[machine.mode];
        await util.writeToConsole(
            `Active mode: ${modeInfo.name}`,
            ">",
            [],
            20
        );

        await util.writeToConsole(
            modeInfo.description,
            "...",
            ["hint"],
            20
        );
        
        
    }


    
}

/// ========== Main Entry Point ========== ///

let machine;
document.addEventListener("DOMContentLoaded", function () {
    machine = new Machine();
    //machine.initializeMachine();
});
