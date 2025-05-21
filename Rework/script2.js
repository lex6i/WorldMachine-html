import Context from "./machine/context.js";

/// ========== Machine Class ========== ///
class Machine {
    constructor() {
        this.context = new Context({
            maxRounds: 5,
            maxZeroGravityQuestions: 3,
            textSpeed: 1 //25
        });
    }
}

/// ========== Main Entry Point ========== ///
let machine;
document.addEventListener("DOMContentLoaded", function () {
    machine = new Machine();
});
