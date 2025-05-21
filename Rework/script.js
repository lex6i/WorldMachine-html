import * as util from "./util.js";
import Context from "./context.js";

/// ========== Machine Class ========== ///
class Machine {

    constructor() {
        // Initialize machine propertiesd
        this.animationInterval = null;

        this.state = {
            initialized: false,
            mode: null,
            area: null,
            round: 0,
            zeroGravityQuestionsAsked: false,
            usedQuestions: {},
        }

        this.settings = {
            maxRounds: 5,
            maxZeroGravityQuestions: 3,
            textSpeed: 25
        }

        this.matrix = {
            scene: null,
            camera: null,
            renderer: null,
            points: null,
            animationId: null,
        };

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
        machine.usedQuestions = {};
        Object.keys(AREAS).forEach(key => {
            machine.usedQuestions[key] = {};
            Object.keys(MODES).forEach(mode => {
                if(mode !== "ZERO_GRAVITY") {
                    machine.usedQuestions[key][mode] = [];
                } else {
                    machine.usedQuestions["ZERO_GRAVITY"] = [];
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

        machine.initializeMatrix();

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

        machine.addToHistory("SYSTEM", "System initialized.");

        await util.writeToConsole(
            "System ready. Starting ZERO GRAVITY phase...",
            ">",
            [],
            15
        );

        machine.addToHistory("MODE", "ZERO GRAVITY phase started.");

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
        
        machine.askZeroGravityQuestions();
        
    }

    /// ========== Machine Functions ========== ///
    async askQuestion() {
        const questionPool = 
            machine.mode === "ZERO_GRAVITY" ? 
            QUESTIONS.ZERO_GRAVITY : 
            QUESTIONS[machine.area][machine.getMode()];
        
        
        const availableQuestions = 
            machine.mode === "ZERO_GRAVITY" ?
            questionPool.filter(
                item => !machine.usedQuestions[machine.mode].includes(item)
            ) :
            questionPool.filter(
                item => !machine.usedQuestions[machine.area][machine.mode].includes(item)
            );
        

        if(availableQuestions.length === 0) {
            await util.writeToConsole(
                `Question pool exhausted for "${MODES[machine.mode].name}" mode.`,
                "> "
            );
            return;
        }

        // Change mode if not ZERO_GRAVITY
        if(machine.mode !== "ZERO_GRAVITY") {
            util.updateStatus();
            await util.writeToConsole(
                `Mode drawn for this round: ${MODES[machine.mode].name}`,
                ">",
                ["hint"],
                20
            );
        }

        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

        if(machine.mode !== "ZERO_GRAVITY"){
            machine.usedQuestions[machine.area][machine.mode].push(question);
        } else {
            machine.usedQuestions["ZERO_GRAVITY"].push(question);
        }

        await util.writeToConsole(
            question,
            "?",
            ["question-text"],
            30
        );

        machine.addToHistory("QUESTION", question);
        
    }

    getMode(){
        const availableModes = Object.keys(MODES).slice(1);
        const mode = availableModes[Math.floor(Math.random() * availableModes.length)];

        machine.mode = mode;

        return mode;
    }

    async generateZone(){
        console.log("Generating zone");

        machine.area = Object.keys(AREAS)[Math.floor(Math.random() * Object.keys(AREAS).length)];
        machine.mode = null;
        machine.round = 0;

        util.updateButtons(true);
        util.updateStatus();

        machine.addToHistory("ZONE", `Activated zone: ${AREAS[machine.area].name}`);

        util.showAreaInfo();

        await util.writeToConsole(
            `Activated new zone: ${AREAS[machine.area].name}`,
            ">",
            [],
            20
        );

        await util.writeToConsole(
            `Starting question rounds for this zone (modes will be drawn randomly)...`,
            ">",
            [],
            20
        );
        
        util.updateButtons();
    }

    async generateQuestions(){
        console.log("Generating questions");
        util.updateButtons(true); //disable buttons

        machine.round++;

        const question = await machine.askQuestion();

        if(machine.round >= machine.maxRounds){
            await util.writeToConsole(
                `Finished rounds (${machine.round}/${machine.maxRounds}) for zone ${AREAS[machine.area].name}.`,
                ">",
                [],
                20
            );

            await util.writeToConsole(
                "You can now generate a new zone.",
                ">",
                [],
                20
            );
        }

        util.updateButtons();
    }

    async generateHint(){
       util.showHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
    }

    async askZeroGravityQuestions(){
        for (let i = 0; i < machine.maxZeroGravityQuestions; i++) {
            await machine.askQuestion();
        }

        machine.zeroGravityQuestionsAsked = true;

        await util.writeToConsole(
            "Zero Gravity phase complete. Generate the first zone.",
            ">",
            [],
            20
        );

        util.startAsciiAnimation();
        util.updateStatus();
        util.updateButtons();
        //TODO: initialize Matrix
    }

    addToHistory(type, content){
        const dom = machine.domElements;

        //Pick Color
        let badgeColor = 
            machine.mode === "ZERO_GRAVITY" ?
            "--highlight-color" :
            AREAS[machine.area].cssColorVar;

        switch(type){
            case "QUESTION":
                content = `[${MODES[machine.mode].name}] ${content}`;
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

        badgeColor = util.getCssVariable(badgeColor);

        // Adjust text color for contrast
        const rgb = [
            parseInt(badgeColor.slice(1,3), 16),
            parseInt(badgeColor.slice(3,5), 16),
            parseInt(badgeColor.slice(5,7), 16)
        ];

        // Calculate luminance
        const lum = 
            0.2126 * (rgb[0] / 255) +
            0.7152 * (rgb[1] / 255) +
            0.0722 * (rgb[2] / 255);

        // Set text color based on luminance 
        if(lum > 0.6){
            badge.style.color = "var(--bg-color)";
        } else {
            badge.style.color = "var(--text-color)";
            badge.style.textShadow = "1px 0px black"
        }

        console.log(lum);

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

    initializeMatrix(){
        const dom = machine.domElements;
        // Clear previous canvas if any
        while(dom.matrixCanvas.firstChild){
            dom.matrixCanvas.removeChild(dom.matrixCanvas.firstChild);
        }

        // Initialize Three.js scene
        try {
            machine.matrixScene = new THREE.Scene();
            machine.matrixScene.background = new THREE.Color(0x000502);

            const width = dom.matrixCanvas.clientWidth || 400;
            const height = dom.matrixCanvas.clientHeight || 400;

            machine.matrixCamera = new THREE.PerspectiveCamera(
                75,
                width / height,
                0.1,
                1000
            );
            machine.matrixCamera.position.z = 5;

            machine.matrixRenderer = new THREE.WebGLRenderer({
                antialias: true,
            });
            machine.matrixRenderer.setSize(width, height);
            dom.matrixCanvas.appendChild(machine.matrixRenderer.domElement);

            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const numPoints = 5000;
            for(let i = 0; i < numPoints; i++){
                vertices.push(
                    (Math.random() - 0.5) * 10, 
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
            }
            geometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(vertices, 3)
            )

            const matrixColorCSS = util.getCssVariable("--matrix-color") || "#00ff41";
            const material = new THREE.PointsMaterial({
                color: matrixColorCSS,
                size: 0.05,
                transparent: true,
                opacity: 0.7,
                sizeAttenuation: true,
            });

            machine.matrixPoints = new THREE.Points(geometry, material);
            machine.matrixScene.add(machine.matrixPoints);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            machine.matrixScene.add(ambientLight);

            function animate(){
                if (machine.matrixAnimationId)
                    cancelAnimationFrame(machine.matrixAnimationId);
                machine.matrixAnimationId = requestAnimationFrame(animate);
                if (machine.matrixPoints){
                    machine.matrixPoints.rotation.x += 0.001;
                    machine.matrixPoints.rotation.y += 0.002;
                }
                if (machine.matrixRenderer && machine.matrixScene && machine.matrixCamera){
                    machine.matrixRenderer.render(
                        machine.matrixScene,
                        machine.matrixCamera
                    );
                }
            }
            animate();

            const resizeObserver = new ResizeObserver((entries) => {
                console.log("Resizing matrix");
                for(let entry of entries){
                    if(entry.target === dom.matrixCanvas && dom.matrixDetails.open){
                        const width = dom.matrixCanvas.clientWidth || 400;
                        const height = dom.matrixCanvas.clientHeight > 50 ?
                            dom.matrixCanvas.clientHeight : 400;
                        machine.matrixRenderer.setSize(width, height);
                        machine.matrixCamera.aspect = width / height;
                        machine.matrixCamera.updateProjectionMatrix();
                    }
                }
            });

            resizeObserver.observe(dom.matrixCanvas);
            
        } catch (error) {
            console.error("Error initializing matrix viewer:", error);
        }
    }

    addMatrixData(dataText){
        if(dataText === "") return;

        

        const dom = machine.domElements;
        const dataLine = document.createElement("div");
        dataLine.textContent = `> ${dataText}`;
        dom.matrixData.prepend(dataLine);
        dom.matrixData.scrollTop = dom.matrixData.scrollHeight;
        
        if(!machine.initialized) {
            util.writeToConsole("System is not initialized.", "! ");
            return;
        }
        
        dom.matrixInput.value = "";

        machine.addToHistory("MATRIX", dataText);
    }
}

/// ========== Main Entry Point ========== ///

let machine;
document.addEventListener("DOMContentLoaded", function () {
    machine = new Machine();
});
