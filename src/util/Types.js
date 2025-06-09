const ActionType = {
    Question: "Question",
    Wait: "Wait",
    Zone: "Zone",
    Mode: "Mode"
};

const ConsoleType = {
    Question: "Question",
    Text: "Text",
    System: "System",
    Matrix: "Matrix",
    Mode: "Mode",
    Zone: "Zone"
}

const BlockType = {
    Question: "Question",
    Text: "Text"
}

const ZONES = {
    RANDOM: {
        name: "Random"
    },
    ENVIRONMENT: {
        name: "Environment",
        description: "Flora, fauna, climate, geography, ecosystems.",
        colorClass: "zone-environment",
        cssColorVar: "--environment-color",
    },
    PHYSICS: {
        name: "Physics",
        description: "Laws of nature, gravity, matter, energy.",
        colorClass: "zone-physics",
        cssColorVar: "--physics-color",
    },
    AGENT_INTERACTIONS: {
        name: "Agent Interactions",
        description: "Social relations, communication, conflicts, cooperation.",
        colorClass: "zone-interactions",
        cssColorVar: "--interactions-color",
    },
    ECONOMY_CIRCULATION: {
        name: "Economy / Circulation",
        description: "Economic systems, money, trade, supply chains.",
        colorClass: "zone-economy",
        cssColorVar: "--economy-color",
    },
    HISTORY_EVOLUTION: {
        name: "History / Evolution",
        description: "World's past, myths, legends, significant events.",
        colorClass: "zone-history",
        cssColorVar: "--history-color",
    },
    TIME_SPACE: {
        name: "Time / Space",
        description: "Time travel, parallel universes, dimensions.",
        colorClass: "zone-time",
        cssColorVar: "--time-color",
    },
    LORE: {
        name: "Lore",
        description: "Magic, metaphysics, belief systems, arcane knowledge.",
        colorClass: "zone-lore",
        cssColorVar: "--lore-color",
    },
    ENERGY: {
        name: "Energy",
        description: "Energy sources, flow, transformations, energetic manifestations.",
        colorClass: "zone-energy",
        cssColorVar: "--energy-color",
    },
    TECH_MAGIC: {
        name: "Tech / Magic",
        description: "Technological advancements, magical systems, alchemy.",
        colorClass: "zone-tech-magic",
        cssColorVar: "--tech-color",
    },
    ANOMALIES: {
        name: "Anomalies",
        description: "Unusual phenomena, paradoxes, exceptions to rules.",
        colorClass: "zone-anomalies",
        cssColorVar: "--anomalies-color",
    },
    BEINGS_AFFECTS_FLUIDS: {
        name: "Beings / Affects / Fluids",
        description: "External forces, extraterrestrial beings, other dimensions, divine interventions.",
        colorClass: "zone-beings-affects-fluids",
        cssColorVar: "--affects-color",
    }
};

const MODES = {
    RANDOM: {
        name: "Random"
    },
    ZERO_GRAVITY: {
        name: "ZERO GRAVITY",
        description: "Initialization phase: Explore foundational assumptions.",
    },
    SEARCH: {
        name: "Search",
        description: "Investigate hidden knowledge and information systems.",
    },
    CONNECTIONS: {
        name: "Connections",
        description: "Explore relationships between world elements.",
    },
    GENERATION: {
        name: "Generation",
        description: "Investigate processes of creation and destruction.",
    },
    GLITCH_ANOMALIES: {
        name: "Glitch / Anomalies",
        description: "Explore system errors and anomalies.",
    },
};