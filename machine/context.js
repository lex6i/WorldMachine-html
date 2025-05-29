import UI from './ui.js'

export default class Context {
    constructor(settings) {
        this.settings = settings;

        this.state = {
            initialized: false,
            mode: null,
            area: null,
            round: 0,
            zeroGravityQuestionsAsked: false,
            usedQuestions: {},
        }

        this.ui = new UI(this);
    }

    /*
    Button clicks
    */
    async initialize(){
        const state = this.state;
        const ui = this.ui;
        
        
        if(state.initialized) return;
        state.mode = "ZERO_GRAVITY";

        // Initialize usedQuestions
        state.usedQuestions = {};
        Object.keys(AREAS).forEach(key => {
            state.usedQuestions[key] = {};
            Object.keys(MODES).forEach(mode => {
                if(mode !== "ZERO_GRAVITY") {
                    state.usedQuestions[key][mode] = [];
                } else {
                    state.usedQuestions["ZERO_GRAVITY"] = [];
                }
            });
        });


        state.initialized = true;
        console.log("Machine initialized");        

        ui.matrixAnimation.start();

        ui.updateUI();

        // Start Zero Gravity Mode
        this.startZeroGravity();
    }

    async generateZone(){
        const state = this.state;
        const ui = this.ui;


        state.area = Object.keys(AREAS)[Math.floor(Math.random() * Object.keys(AREAS).length)];
        state.mode = null;
        state.round = 0;

        ui.updateUI(true);

        ui.addToHistory("ZONE", `Activated zone: ${AREAS[state.area].name}`);

        ui.showAreaInfo();

        await ui.updateConsole(`Activated new zone: ${AREAS[state.area].name}`, ">");
        await ui.updateConsole(`Starting question rounds for this zone (modes will be drawn randomly)...`, ">");
        
        ui.updateUI();
    }

    async generateQuestions(){
        const state = this.state;
        const ui = this.ui;

        ui.updateButtons(true); //disable buttons

        state.round++;

        const question = await this.getQuestion();

        if (state.round >= this.settings.maxRounds) {
            await ui.updateConsole(
                `Finished rounds (${state.round}/${this.settings.maxRounds}) for zone ${AREAS[state.area].name}.`,
                ">",
                [],
                20
            );

            await ui.updateConsole(
                "You can now generate a new zone.",
                ">",
                [],
                20
            );
        }

        ui.updateButtons();
    }

    generateHint() {
        this.ui.addHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
    }

    /*
    Matrix
    */

    addMatrixData(data) {
        if (data === "") return;

        const dom = this.ui.domElements;
        const dataLine = document.createElement("div");

        dataLine.textContent = `> ${data}`;
        dom.matrixData.prepend(dataLine);
        dom.matrixData.scrollTop = dom.matrixData.scrollHeight;

        if (!this.state.initialized) {
            this.ui.updateConsole("System is not initialized.", "! ");
            return;
        }

        dom.matrixInput.value = "";

        this.ui.addToHistory("MATRIX", data);
    }

    /*
    Question Generation
    */

    async getQuestion() {
        const state = this.state;
        const ui = this.ui;

        const questionPool =
            state.mode === "ZERO_GRAVITY" ?
                QUESTIONS.ZERO_GRAVITY :
                QUESTIONS[state.area][this.getMode()];

        const availableQuestions =
            state.mode === "ZERO_GRAVITY" ?
                questionPool.filter(
                    item => !state.usedQuestions[state.mode].includes(item)
                ) :
                questionPool.filter(
                    item => !state.usedQuestions[state.area][state.mode].includes(item)
                );


        if (availableQuestions.length === 0) {
            await ui.updateConsole(
                `Question pool exhausted for "${MODES[state.mode].name}" mode.`,
                "> "
            );
            return;
        }

        // Change mode if not ZERO_GRAVITY
        if (state.mode !== "ZERO_GRAVITY") {
            ui.updateStatus();
            await ui.updateConsole(
                `Mode drawn for this round: ${MODES[state.mode].name}`,
                ">",
                ["hint"],
                20
            );
            ui.updateMatrixAnimation(AREAS[state.area].cssColorVar);
        }

        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

        if (state.mode !== "ZERO_GRAVITY") {
            state.usedQuestions[state.area][state.mode].push(question);
        } else {
            state.usedQuestions["ZERO_GRAVITY"].push(question);
        }

        await ui.updateConsole(
            question,
            "?",
            ["question-text"]
        );

        this.ui.addToHistory("QUESTION", question);
    }

    getMode() {
        const availableModes = Object.keys(MODES).slice(1);
        const mode = availableModes[Math.floor(Math.random() * availableModes.length)];

        this.state.mode = mode;

        return mode;
    }

    /*
    Zero Gravity Mode
    */
    async startZeroGravity() {
        const ui = this.ui;

        await ui.updateConsole("INITIALIZING WORLD MACHINE SYSTEM...", ">");
        await ui.addToHistory("SYSTEM", "System initialized.");

        await ui.updateConsole("Starting Zero Gravity Mode...", ">");
        await ui.addToHistory("MODE", "ZERO GRAVITY phase started.");

        await ui.updateConsole("Active mode: ZERO GRAVITY", ">");
        await ui.updateConsole(MODES["ZERO_GRAVITY"].description, ">", ["hint"]);

        this.askZeroGravityQuestions();
    }

    async askZeroGravityQuestions() {
        for (let i = 0; i < this.settings.maxZeroGravityQuestions; i++) {
            await this.getQuestion();
        }

        this.state.zeroGravityQuestionsAsked = true;

        await this.ui.updateConsole("Zero Gravity phase complete. Generate the first zone.", ">");

        this.ui.asciiAnimation.start();
        this.ui.updateUI();
    }
}