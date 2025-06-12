import Context from "./src/Context.js";

// ===== World Machine =====
class WorldMachine {
    constructor() {
        this.context = new Context({
            useLLM: false,
            textSpeed: 25,
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    worldMachine = new WorldMachine();
});