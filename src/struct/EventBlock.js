export default class EventBlock {
    constructor(index) {
        this.loadScript(index);
    }

    loadScript(index){
        const block = SCRIPT[index];
        this.index = index;
        if(block.type == BlockType.Text){
            this.text = block.text;
            this.rounds = this.text.length;
            this.zone = null;
            this.halt = block.halt;
        } else {
            this.zone = block.zone;
            this.mode = block.mode;
            this.rounds = block.rounds != null ?
                block.rounds : 0;
            this.basicQuestions = block.basicQuestions != null ?
                block.basicQuestions : 0;
            this.repeat = block.repeat != null ?
                block.repeat : 0;
            this.wait = block.wait != null ?
                block.wait : false;
        }
    }
}