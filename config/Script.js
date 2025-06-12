//TODO: Add repeat to the script
const SCRIPT = {
    0: {
        type: BlockType.Text,
        text: [
            ["Initializing WORLD MACHINE system...", ConsoleType.System, [], false],
            ["System initialized", ConsoleType.System, [], true]
        ],
        halt: false
    },
    1: {
        type: BlockType.Question,
        zone: null,
        mode: MODES.ZERO_GRAVITY,
        rounds: 3,
    },
    2: {
        type: BlockType.Text,
        text: [
            ["Zero Gravity phase completed, Generate first zone", ConsoleType.System, [], false]
        ],
        halt: true
    },
    3: {
        type: BlockType.Question,
        zone: ZONES.ENVIRONMENT,
        mode: MODES.RANDOM,
        rounds: 5,
        basicQuestions: 2,
    },
    4: {
        type: BlockType.Question,
        zone: ZONES.ENVIRONMENT,
        mode: MODES.RANDOM,
        rounds: 2,
        basicQuestions: 0,
    },
    5: {
        type: BlockType.Question,
        zone: ZONES.RANDOM,
        mode: MODES.RANDOM,
        rounds: 2,
        basicQuestions: 0,
    }
}