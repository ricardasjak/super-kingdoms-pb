export const DEFAULT_RESEARCH_PRIORITY = [
  "mil",
  "money",
  "warp",
  "pop",
  "power",
  "r_fusion",
  "r_long",
  "r_core",
  "r_ld",
  "r_lf",
  "r_armor",
  "r_dr",
  "r_ft",
  "r_f74",
  "r_tf",
  "r_ht",
];

export interface BotProfile {
  label: string;
  exploration: number;
  offense: number;
  defense: number;
  flex: number;
  science: number;
  buildings: {
    pf: number;
    tc: number;
  };
  researchPriority: string[];
}

export const BOT_PROFILES: Record<string, BotProfile> = {
  aggressive: {
    label: "Aggressive",
    exploration: 2,
    offense: 30,
    defense: 30,
    flex: 32,
    science: 8,
    buildings: {
      pf: 5,
      tc: 10,
    },
    researchPriority: [
      "mil",
      "money",
      "warp",
      "pop",
      "r_fusion",
      "r_core",
      "r_long",
      "r_ld",
      "r_dr",
      "r_armor",
      "r_ft",
      "r_tf",
      "r_lf",
      "r_f74",
      "r_ht",
    ],
  },
  aggressiveMax: {
    label: "Extreme Offense",
    exploration: 1,
    offense: 50,
    defense: 0,
    flex: 44,
    science: 6,
    buildings: {
      pf: 0,
      tc: 10,
    },
    researchPriority: [
      "mil",
      "money",
      "warp",
      "pop",
      "r_fusion",
      "r_core",
      "r_long",
      "r_ld",
      "r_dr",
      "r_armor",
      "r_ft",
      "r_tf",
      "r_lf",
      "r_f74",
      "r_ht",
    ],
  },
  probes: {
    label: "Probe Specialist",
    exploration: 4,
    offense: 0,
    defense: 70,
    flex: 18,
    science: 12,
    buildings: {
      pf: 25,
      tc: 3,
    },
    researchPriority: [
      "mil",
      "money",
      "warp",
      "pop",
      "r_fusion",
      "r_core",
      "r_armor",
      "r_long",
      "r_ld",
      "r_dr",
      "r_ft",
      "r_tf",
      "r_lf",
      "r_f74",
      "r_ht",
    ],
  },
  defensive: {
    label: "Defensive",
    exploration: 3,
    offense: 0,
    defense: 80,
    flex: 12,
    science: 8,
    buildings: {
      pf: 10,
      tc: 10,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  balanced: {
    label: "Standard Balanced",
    exploration: 6,
    offense: 20,
    defense: 50,
    flex: 12,
    science: 18,
    buildings: {
      pf: 10,
      tc: 5,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  balancedAttacker: {
    label: "Balanced Attacker",
    exploration: 5,
    offense: 30,
    defense: 40,
    flex: 18,
    science: 12,
    buildings: {
      pf: 10,
      tc: 10,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  balancedScientist: {
    label: "Balanced Scientist",
    exploration: 5,
    offense: 20,
    defense: 40,
    flex: 0,
    science: 40,
    buildings: {
      pf: 10,
      tc: 5,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  nwBooster: {
    label: "NW Booster",
    exploration: 1,
    offense: 0,
    defense: 0,
    flex: 100,
    science: 0,
    buildings: {
      pf: 0,
      tc: 10,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  growth: {
    label: "Economic Growth",
    exploration: 8,
    offense: 0,
    defense: 75,
    flex: 12,
    science: 13,
    buildings: {
      pf: 5,
      tc: 0,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  growthProbes: {
    label: "Growth & Probes",
    exploration: 7,
    offense: 0,
    defense: 80,
    flex: 10,
    science: 10,
    buildings: {
      pf: 15,
      tc: 0,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  growthScientists: {
    label: "Growth & Science",
    exploration: 7,
    offense: 0,
    defense: 65,
    flex: 0,
    science: 35,
    buildings: {
      pf: 5,
      tc: 0,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
  growthMax: {
    label: "Pure Growth",
    exploration: 10,
    offense: 0,
    defense: 75,
    flex: 0,
    science: 25,
    buildings: {
      pf: 5,
      tc: 0,
    },
    researchPriority: DEFAULT_RESEARCH_PRIORITY,
  },
};

export const BOT_PARAMS = {
  soldiersLimitPerLand: 4,
  soldiersMinimum: 4000,
};
