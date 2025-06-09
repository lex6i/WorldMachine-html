import { AsciiAnimation, MatrixAnimation } from "./UI/Animation.js";

export default class UIManager {
    constructor(context) {
        this.context = context;
        this.textSpeed = context.settings.textSpeed;
        this.loadDomElements();

        this.updateStatus();
        this.updateButtons();
        this.addListeners();
        this.initializeAnimations();
        this.initializeHistory();
    }

     /*====
     Initialization
     ====*/
    loadDomElements() {
        this.domElements = {};
        const dom = this.domElements;

        dom.consoleOutput = document.getElementById("console-output");
        dom.btnInitialize = document.getElementById("btn-initialize");
        dom.btnZone = document.getElementById("btn-area");
        dom.btnQuestion = document.getElementById("btn-question");
        dom.btnHint = document.getElementById("btn-hint");
        dom.statusSystem = document.getElementById("status-system");
        dom.statusZone = document.getElementById("status-area");
        dom.statusMode = document.getElementById("status-mode");
        dom.counterRounds = document.getElementById("counter-rounds");
        dom.currentZoneDiv = document.getElementById("current-area");
        dom.zoneDescriptionDiv = document.getElementById("area-description");
        dom.macromatrixHintDiv = document.getElementById("macromatrix-hint");
        dom.historyLog = document.getElementById("history-log");
        dom.asciiAnimationDiv = document.getElementById("ascii-animation");
        dom.matrix2dContainer = document.getElementById("matrix3d");
        dom.matrixInput = document.getElementById("matrix-input");
        dom.matrixSubmit = document.getElementById("matrix-submit");
        dom.matrixData = document.getElementById("matrix-data");
        dom.matrixDetails = document.querySelector(".matrix-container details");
        dom.matrixCanvas = document.getElementById("matrix3d");
    }

    initializeHistory(){
        const dom = this.domElements;
        dom.consoleOutput.innerHTML = "";
        dom.historyLog.innerHTML = "";
        dom.currentZoneDiv.style.display = "none";
        dom.zoneDescriptionDiv.style.display = "none";
        dom.macromatrixHintDiv.style.display = "none";
        dom.matrixData.innerHTML = "";
    }

    initializeAnimations(){
        this.asciiAnimation = new AsciiAnimation(this);
        this.matrixAnimation = new MatrixAnimation(this);
    }

    addListeners() {
        const dom = this.domElements;
        const context = this.context;

        dom.btnInitialize.addEventListener("click", () => {
            this.btnInit();
        });
        dom.btnZone.addEventListener("click", () => {
            this.btnGenZone();
        });
        dom.btnQuestion.addEventListener("click", () => {
            this.btnGenQuest();
        });
        dom.btnHint.addEventListener("click", () => {
            this.btnGenHint();
        });
        dom.matrixSubmit.addEventListener("click", () =>{
            this.btnAddUserData(dom.matrixInput.value.trim()); 
        });
        dom.matrixInput.addEventListener("keypress", (e) =>{
            if(e.key === "Enter"){
                this.btnAddUserData(dom.matrixInput.value.trim()); 
            }
        });
    }

    /*====
    UI Updates
    ====*/

    update(buttons=false){
        this.updateStatus();
        this.updateButtons(buttons);
    }


    updateStatus() {
        const dom = this.domElements;
        const state = this.context.state;
        const zone = state.zone;
        const mode = state.mode;
        // Toggle status indicators
        dom.statusSystem.classList.toggle("active", state.initialized);
        dom.statusZone.classList.toggle("active", !!state.zone);
        dom.statusMode.classList.toggle("active", !!state.mode);

        // Update area name
        const zoneNameSpan = dom.statusZone.nextElementSibling;
        if(!!zone){
            zoneNameSpan.textContent = `Zone: ${zone.name}`;
            zoneNameSpan.style.color = this.getCssVariable(zone.cssColorVar) || "var(--area-color)";
        } else {
            zoneNameSpan.textContent = "Active Zone";
            zoneNameSpan.style.color = "var(--text-color)";
        }
        
        // Update mode name
        const modeNameSpan = dom.statusMode.nextElementSibling;
        if(!!mode){
            modeNameSpan.textContent = `Mode: ${mode.name}`;
            modeNameSpan.style.color = mode.name === "ZERO_GRAVITY" ? "var(--highlight-color)" : "var(--mode-color)";
        } else {
            modeNameSpan.textContent = "Machine Mode";
            modeNameSpan.style.color = "var(--text-color)";
        }

        // Update rounds counter
        if(
            state.initialized && 
            state.zone && 
            state.mode &&
            state.mode.name !== "ZERO_GRAVITY"
        ){
            dom.counterRounds.textContent = `Rounds: ${state.round}/${state.event.rounds}`;
            dom.counterRounds.style.display = "block";
        } else {
            dom.counterRounds.style.display = "none";
        }
    }

    updateButtons() {
        const dom = this.domElements;
        const state = this.context.state;
        const settings = this.context.settings;
        
        const isLoading = this.context.isLoading;

        // Conditions
        const isMaxRounds = state.event ? state.round >= state.event.rounds : false;
        const isZeroGravity = state.mode === "ZERO_GRAVITY";

        // Update button states
        dom.btnInitialize.disabled = state.initialized;
        dom.btnZone.disabled = 
            !state.initialized || 
            (isZeroGravity && state.round >= state.event.rounds) ||
            (!!state.zone && !isMaxRounds) ||
            isLoading;

        dom.btnQuestion.disabled = 
            !state.initialized || 
            isZeroGravity || 
            isMaxRounds || 
            !state.zone ||
            isLoading;
        dom.btnHint.disabled = 
            !state.initialized || 
            isZeroGravity || 
            isMaxRounds || 
            !state.zone ||
            isLoading;
        }

    async updateConsole(text, type=ConsoleType.Text, classes=[], addToHistory=true){
        const line = document.createElement("div");
        const promptSpan = document.createElement("span");
        const textSpan = document.createElement("span");
        const consoleOutput = document.getElementById("console-output");
        line.classList.add("console-line");
        classes.forEach((cls) => line.classList.add(cls));

        let promptChar = "";
        switch(type){
            case ConsoleType.Question:
                promptChar = "?";
                break;
            default:
                promptChar = ">";
        }

        promptSpan.classList.add("console-prompt");
        promptSpan.textContent = promptChar;
        line.appendChild(promptSpan);

        textSpan.classList.add("console-text");
        line.appendChild(textSpan);
        textSpan.classList.add("typing");

        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        for (let i = 0; i < text.length; i++) {
            textSpan.textContent += text.charAt(i);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, this.textSpeed));
        }

        textSpan.classList.remove("typing");
        line.classList.add("finished-typing");

        // Add to history
        if(addToHistory) this.addToHistory(type, text);
    }


    addToHistory(type, content){
        const dom = this.domElements;
        const context = this.context;
        const state = context.state;
        

        //Pick Color
        let badgeColor =
            state.zone === null ||
            state.mode === MODES.ZERO_GRAVITY ?
                "--highlight-color" :
                state.zone.cssColorVar;

        let badgeText = "";

        console.log(type);

        switch (type) {
            case ConsoleType.Question:
                content = `[${state.mode.name}] ${content}`;
                badgeText = "Question";
                break;
            case ConsoleType.Zone:
                badgeText = "Zone";
                break;
            case ConsoleType.Mode:
                badgeText = "Mode";
                break;
            case ConsoleType.Hint:
                badgeColor = "--secondary-color";
                badgeText = "Hint";
                break;
            case ConsoleType.System:
                badgeColor = "--text-color";
                badgeText = "System";
                break;
            case ConsoleType.Matrix:
                badgeColor = "--matrix-color";
                badgeText = "Matrix";
                break;
        }


        //Create badge
        const badge = document.createElement("span");
        badge.classList.add("category-badge");
        badge.textContent = badgeText;
        badge.style.backgroundColor = `var(${badgeColor})`;

        badgeColor = this.getCssVariable(badgeColor);

        // Adjust text color for contrast
        const rgb = [
            parseInt(badgeColor.slice(1, 3), 16),
            parseInt(badgeColor.slice(3, 5), 16),
            parseInt(badgeColor.slice(5, 7), 16)
        ];

        // Calculate luminance
        const lum =
            0.2126 * (rgb[0] / 255) +
            0.7152 * (rgb[1] / 255) +
            0.0722 * (rgb[2] / 255);

        // Set text color based on luminance 
        if (lum > 0.6) {
            badge.style.color = "var(--bg-color)";
        } else {
            badge.style.color = "var(--text-color)";
            badge.style.textShadow = "1px 0px black"
        }

        const historyItem = document.createElement("div");
        historyItem.classList.add("history-item");
        historyItem.appendChild(badge);

        // Create text span
        const textSpan = document.createElement("span");
        textSpan.classList.add("console-text");
        textSpan.textContent = content;

        historyItem.appendChild(textSpan);

        dom.historyLog.appendChild(historyItem);
        dom.historyLog.scrollTop = dom.historyLog.scrollHeight;
    }

    addHint(hintText){
        const dom = this.domElements;
        dom.macromatrixHintDiv.textContent = `[Macromatrix]: ${hintText}`;
        dom.macromatrixHintDiv.style.display = "block";
        this.addToHistory(ConsoleType.Hint, hintText);
    }

    
    /*====
    Button Handlers
    ====*/

    btnInit(){
        const state = this.context.state;

        if(state.initialized) return;

        state.initialized = true;
        this.context.eventProcessor.loadNext();
    }

    btnGenZone(){
        this.context.eventProcessor.loadNext();
    }

    btnGenQuest(){
        this.context.state.wait = false;
    }

    btnGenHint(){
        this.context.generateHint();
    }

    btnAddUserData(text){
        this.context.addUserData(text);
    }

    /*====
    Utility
    ====*/
    getCssVariable(varName) {
        return window.getComputedStyle(document.body)
            .getPropertyValue(varName);
    } 

    showAreaInfo(){
        const dom = this.domElements;
        const zoneInfo = this.context.state.zone;
        const zoneColor =
            this.getCssVariable(zoneInfo.cssColorVar) || "var(--area-color)";

        dom.currentZoneDiv.textContent = `Current Zone: ${zoneInfo.name}`;
        dom.currentZoneDiv.style.borderColor = zoneColor;
        dom.currentZoneDiv.style.display = "block";

        dom.zoneDescriptionDiv.textContent = `Description: ${zoneInfo.description}`;
        dom.zoneDescriptionDiv.style.borderColor = zoneColor;
        dom.zoneDescriptionDiv.style.display = "block";
    }
}