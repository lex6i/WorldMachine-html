import { AsciiAnimation, MatrixAnimation } from "./animations.js";

export default class UI {
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

    loadDomElements() {
        this.domElements = {};
        const dom = this.domElements;

        dom.consoleOutput = document.getElementById("console-output");
        dom.btnInitialize = document.getElementById("btn-initialize");
        dom.btnArea = document.getElementById("btn-area");
        dom.btnQuestion = document.getElementById("btn-question");
        dom.btnHint = document.getElementById("btn-hint");
        dom.statusSystem = document.getElementById("status-system");
        dom.statusArea = document.getElementById("status-area");
        dom.statusMode = document.getElementById("status-mode");
        dom.counterRounds = document.getElementById("counter-rounds");
        dom.currentAreaDiv = document.getElementById("current-area");
        dom.areaDescriptionDiv = document.getElementById("area-description");
        dom.macromatrixHintDiv = document.getElementById("macromatrix-hint");
        dom.historyLog = document.getElementById("history-log");
        dom.asciiAnimationDiv = document.getElementById("ascii-animation");
        dom.matrix3dContainer = document.getElementById("matrix3d");
        dom.matrixInput = document.getElementById("matrix-input");
        dom.matrixSubmit = document.getElementById("matrix-submit");
        dom.matrixData = document.getElementById("matrix-data");
        dom.matrixDetails = document.querySelector(".matrix-container details");
        dom.matrixCanvas = document.getElementById("matrix3d");
    }

    updateUI(buttons=false){
        this.updateStatus();
        this.updateButtons(buttons);
    }


    updateStatus() {
        const dom = this.domElements;
        const state = this.context.state;
        const area = state.area;
        const mode = state.mode;
        // Toggle status indicators
        dom.statusSystem.classList.toggle("active", state.initialized);
        dom.statusArea.classList.toggle("active", !!state.area);
        dom.statusMode.classList.toggle("active", !!state.mode);

        // Update area name
        const areaNameSpan = dom.statusArea.nextElementSibling;
        if(!!area){
            areaNameSpan.textContent = `Zone: ${AREAS[area].name}`;
            areaNameSpan.style.color = this.getCssVariable(AREAS[area].cssColorVar) || "var(--area-color)";
        } else {
            areaNameSpan.textContent = "Active Zone";
            areaNameSpan.style.color = "var(--text-color)";
        }
        
        // Update mode name
        const modeNameSpan = dom.statusMode.nextElementSibling;
        if(!!mode){
            modeNameSpan.textContent = `Mode: ${MODES[mode].name}`;
            modeNameSpan.style.color = mode === "ZERO_GRAVITY" ? "var(--highlight-color)" : "var(--mode-color)";
        } else {
            modeNameSpan.textContent = "Machine Mode";
            modeNameSpan.style.color = "var(--text-color)";
        }

        // Update rounds counter
        if(
            state.initialized && 
            state.area && 
            state.mode !== "ZERO_GRAVITY"
        ){
            dom.counterRounds.textContent = `Rounds: ${state.round}/${this.context.settings.maxRounds}`;
            dom.counterRounds.style.display = "block";
        } else {
            dom.counterRounds.style.display = "none";
        }
    }

    updateButtons(isLoading = false) {
        const dom = this.domElements;
        const state = this.context.state;
        const settings = this.context.settings;

        // Conditions
        const isMaxRounds = state.round >= settings.maxRounds;
        const isZeroGravity = state.mode === "ZERO_GRAVITY";

        // Update button states
        dom.btnInitialize.disabled = state.initialized;
        dom.btnArea.disabled = 
            !state.initialized || 
            (isZeroGravity && !state.zeroGravityQuestionsAsked) ||
            (!!state.area && !isMaxRounds) ||
            isLoading;

        dom.btnQuestion.disabled = 
            !state.initialized || 
            isZeroGravity || 
            isMaxRounds || 
            !state.area ||
            isLoading;
        dom.btnHint.disabled = 
            !state.initialized || 
            isZeroGravity || 
            isMaxRounds || 
            !state.area ||
            isLoading;
        }

    addListeners() {
        const dom = this.domElements;
        const context = this.context;

        dom.btnInitialize.addEventListener("click", () => {
            context.initialize();
        });
        dom.btnArea.addEventListener("click", () => {
            context.generateZone();
        });
        dom.btnQuestion.addEventListener("click", () => {
            context.generateQuestions();
        });
        dom.btnHint.addEventListener("click", () => {
            context.generateHint();
        });
        dom.matrixSubmit.addEventListener("click", function(){
            context.addMatrixData(dom.matrixInput.value.trim()); 
        });
        dom.matrixInput.addEventListener("keypress", function(e){
            if(e.key === "Enter"){
                context.addMatrixData(dom.matrixInput.value.trim()); 
            }
        });
    }

    async updateConsole(text, prompt="", classes=[]){
        const line = document.createElement("div");
        const promptSpan = document.createElement("span");
        const textSpan = document.createElement("span");
        const consoleOutput = document.getElementById("console-output");
        line.classList.add("console-line");
        classes.forEach((cls) => line.classList.add(cls));

        promptSpan.classList.add("console-prompt");
        promptSpan.textContent = prompt;
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
    }

    addToHistory(type, content){
        const dom = this.domElements;
        const context = this.context;
        const state = context.state;
        
        //Pick Color
        let badgeColor =
            state.mode === "ZERO_GRAVITY" ?
                "--highlight-color" :
                AREAS[state.area].cssColorVar;

        switch (type) {
            case "QUESTION":
                content = `[${MODES[state.mode].name}] ${content}`;
                break;
            case "HINT":
                badgeColor = "--secondary-color";
                break;
            case "SYSTEM":
                badgeColor = "--text-color";
                break;
            case "MATRIX":
                badgeColor = "--matrix-color";
                break;
        }


        //Create badge
        const badge = document.createElement("span");
        badge.classList.add("category-badge");
        badge.textContent = type;
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

    getCssVariable(varName) {
        return window.getComputedStyle(document.body)
            .getPropertyValue(varName);
    } 

    showAreaInfo(){
        const dom = this.domElements;
        const areaInfo = AREAS[this.context.state.area];
        const zoneColor =
            this.getCssVariable(areaInfo.cssColorVar) || "var(--area-color)";

        dom.currentAreaDiv.textContent = `Current Zone: ${areaInfo.name}`;
        dom.currentAreaDiv.style.borderColor = zoneColor;
        dom.currentAreaDiv.style.display = "block";

        dom.areaDescriptionDiv.textContent = `Description: ${areaInfo.description}`;
        dom.areaDescriptionDiv.style.borderColor = zoneColor;
        dom.areaDescriptionDiv.style.display = "block";
    }

    showHint(hintText){
        const dom = this.domElements;
        dom.macromatrixHintDiv.textContent = `[Macromatrix]: ${hintText}`;
        dom.macromatrixHintDiv.style.display = "block";
        this.addToHistory("HINT", hintText);
    }

    initializeHistory(){
        const dom = this.domElements;
        dom.consoleOutput.innerHTML = "";
        dom.historyLog.innerHTML = "";
        dom.currentAreaDiv.style.display = "none";
        dom.areaDescriptionDiv.style.display = "none";
        dom.macromatrixHintDiv.style.display = "none";
        dom.matrixData.innerHTML = "";
    }

    initializeAnimations(){
        this.asciiAnimation = new AsciiAnimation(this);
        this.matrixAnimation = new MatrixAnimation(this);
    }
}