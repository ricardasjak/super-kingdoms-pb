export const PLANET_TYPES = [
	"Mountainous",
	"Forest and Wilderness",
	"Herbal Jungle",
	"Terra Form",
	"Mystical Lands",
	"Volcanic Inferno",
	"Jagged Tundra",
	"Oceanic",
	"Desert Wasteland",
	"Ice Giant",
	"Shadow Lands",
	"Multiple Terrain",
	"Helium",
	"Eternal Plains",
] as const;

export type PlanetType = (typeof PLANET_TYPES)[number];

export const RACE_TYPES = [
	"Ancients",
	"Terran",
	"Xivornai",
	"Gistrami",
	"Mafielven",
	"Qanut",
	"Shadow",
] as const;

export type RaceType = (typeof RACE_TYPES)[number];

export const BOT_NAME_PREFIXES = [
	"Alpha",
	"Beta",
	"Gamma",
	"Delta",
	"Omega",
	"Sector",
	"Void",
	"Star",
	"Nova",
	"Cosmic",
	"Nebula",
	"Xenon",
	"Orion",
	"Astra",
	"Polaris",
	"Sirius",
	"Vega",
	"Altair",
	"Antares",
	"Rigel",
	"Betelgeuse",
	"Aldebaran",
	"Spica",
	"Centauri",
	"Kepler",
	"Zenith",
	"Nadir",
	"Horizon",
];

export const BOT_NAME_SUFFIXES = [
	"Prime",
	"Major",
	"Minor",
	"Outpost",
	"Colony",
	"Nexus",
	"Station",
	"Bastion",
	"Redoubt",
	"Keep",
	"Citadel",
	"Sanctuary",
	"Foundry",
	"Sector",
	"Enclave",
	"Dominion",
	"Vanguard",
];

export function generateRandomBotName(basePrefix?: string): string {
	const prefix =
		basePrefix && basePrefix.trim().length > 0
			? basePrefix.trim().split(" ")[0]
			: BOT_NAME_PREFIXES[Math.floor(Math.random() * BOT_NAME_PREFIXES.length)];
	const suffix =
		BOT_NAME_SUFFIXES[Math.floor(Math.random() * BOT_NAME_SUFFIXES.length)];
	const num = Math.floor(Math.random() * 900) + 100;
	return `${prefix} ${suffix} ${num}`;
}

export const PLANET_INFO: Record<
	PlanetType,
	{ description: string; badgeColor: string }
> = {
	Mountainous: {
		description: "Craggy peaks and rich mineral veins",
		badgeColor: "#94a3b8",
	},
	"Forest and Wilderness": {
		description: "Lush arboreal expanses and high biomass",
		badgeColor: "#10b981",
	},
	"Herbal Jungle": {
		description: "Dense bio-canopies rich in rare compounds",
		badgeColor: "#059669",
	},
	"Terra Form": {
		description: "Engineered balance of atmosphere and biome",
		badgeColor: "#06b6d4",
	},
	"Mystical Lands": {
		description: "Anomalous resonance and ancient energy veins",
		badgeColor: "#a855f7",
	},
	"Volcanic Inferno": {
		description: "Geothermal surges and immense raw thermal energy",
		badgeColor: "#ef4444",
	},
	"Jagged Tundra": {
		description: "Permafrost ridges with fortified sub-surface bases",
		badgeColor: "#38bdf8",
	},
	Oceanic: {
		description: "Vast planetary seas with floating platforms",
		badgeColor: "#0284c7",
	},
	"Desert Wasteland": {
		description: "Arid solar dunes harboring elusive minerals",
		badgeColor: "#f59e0b",
	},
	"Ice Giant": {
		description: "Atmospheric cryo-mining over frozen cores",
		badgeColor: "#7dd3fc",
	},
	"Shadow Lands": {
		description: "Starlight-shielded twilight world of covert intrigue",
		badgeColor: "#64748b",
	},
	"Multiple Terrain": {
		description: "Diverse ecosystem supporting varied planetary industries",
		badgeColor: "#6366f1",
	},
	Helium: {
		description: "Gas-rich skies powering massive particle drives",
		badgeColor: "#eab308",
	},
	"Eternal Plains": {
		description: "Boundless grasslands primed for rapid empire expansion",
		badgeColor: "#84cc16",
	},
};

export const RACE_INFO: Record<
	RaceType,
	{ description: string; trait: string }
> = {
	Ancients: {
		description: "Guardians of archaic technologies and deep knowledge",
		trait: "+Scientific Insights",
	},
	Terran: {
		description:
			"Adaptable and industrious pioneers with high economic synergy",
		trait: "+Economic Agility",
	},
	Xivornai: {
		description: "Fierce militaristic tacticians bred for conquest",
		trait: "+Offensive Mastery",
	},
	Gistrami: {
		description: "Cybernetic builders excelling in infrastructure scaling",
		trait: "+Construction Speed",
	},
	Mafielven: {
		description: "Esoteric channelers wielding planetary power",
		trait: "+Energy Efficiency",
	},
	Qanut: {
		description: "Tenacious survivalists who fortify their frontiers",
		trait: "+Defensive Resilience",
	},
	Shadow: {
		description: "Subtle operatives specializing in stealth and espionage",
		trait: "+Espionage & Concealment",
	},
};
