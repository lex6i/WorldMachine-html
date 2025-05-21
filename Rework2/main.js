import Machine from "./machine.js";
import UI from "./ui.js";
import * as util from "./util.js";

class WorldMachine {
    initialize(){
        this.machine.initialize();
    }
}

let worldMachine;
document.addEventListener("DOMContentLoaded", function(){
    worldMachine = new WorldMachine();
});