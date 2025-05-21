let machine = null;

export function setMachineInstance(instance) {
    machine = instance;
}

export function getMachineInstance() {
    return machine;
}

export async function writeToConsole(
    text,
    prompt = "",
    classes = [],
    speed = 25,
    callback
) {
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

    for(let i = 0; i < text.length; i++) {
        textSpan.textContent += text.charAt(i);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, speed));
    }

    textSpan.classList.remove("typing");
    line.classList.add("finished-typing");
    if(callback) callback();
}

export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function getRandomKey(obj) {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
}

export function getCssVariable(varName) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim() || "#ffffff";
} 


export function updateStatus() {
    const dom = machine.domElements;
    // Toggle status indicators
    dom.statusSystem.classList.toggle("active", machine.initialized);
    dom.statusArea.classList.toggle("active", !!machine.area);
    dom.statusMode.classList.toggle("active", !!machine.mode);

    // Update area name
    const areaNameSpan = dom.statusArea.nextElementSibling;
    if(!!machine.area){
        areaNameSpan.textContent = `Zone: ${AREAS[machine.area].name}`;
        areaNameSpan.style.color = getCssVariable(AREAS[machine.area].cssColorVar) || "var(--area-color)";
    } else {
        areaNameSpan.textContent = "Active Zone";
        areaNameSpan.style.color = "var(--text-color)";
    }
        
    // Update mode name
    const modeNameSpan = dom.statusMode.nextElementSibling;
    if(!!machine.mode){
        modeNameSpan.textContent = `Mode: ${MODES[machine.mode].name}`;
        modeNameSpan.style.color = machineInstance.mode === "ZERO_GRAVITY" ? "var(--highlight-color)" : "var(--mode-color)";
    } else {
        modeNameSpan.textContent = "Machine Mode";
        modeNameSpan.style.color = "var(--text-color)";
    }

    // Update rounds counter
    if(
        machine.initialized && 
        machine.area && 
        machine.mode !== "ZERO_GRAVITY"
    ){
        dom.counterRounds.textContent = `Rounds: ${machine.round}/${machine.maxRounds}`;
        dom.counterRounds.style.display = "block";
    } else {
        dom.counterRounds.style.display = "none";
    }
}

export function updateButtons() {
    const dom = machine.domElements;

    // Conditions
    const isMaxRounds = machine.round >= machine.maxRounds;
    const isZeroGravity = machine.mode === "ZERO_GRAVITY";
    const isMaxZeroGravity = machine.zeroGravityQuestionsAsked >= machine.maxZeroGravityQuestions;

    // Update button states
    dom.btnInitialize.disabled = machine.initialized;
    dom.btnArea.disabled = 
        !machine.initialized || 
        (isZeroGravity && !isMaxZeroGravity) ||
        (!!machine.area && !isMaxRounds);
    dom.btnQuestion.disabled = 
        !machine.initialized || 
        isZeroGravity || 
        isMaxRounds || 
        !machine.area;
    dom.btnHint.disabled = 
        !machine.initialized || 
        isZeroGravity || 
        isMaxRounds || 
        !machine.area;
}

export function loadDomElements() {
    machine.domElements = {};
    const dom = machine.domElements;

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
}

export function addListeners() {
    const dom = machine.domElements;

    dom.btnInitialize.addEventListener("click", machine.initializeMachine);
    dom.btnArea.addEventListener("click", machine.generateZone);
    dom.btnQuestion.addEventListener("click", machine.generateQuestion);
    dom.btnHint.addEventListener("click", machine.generateHint);
}