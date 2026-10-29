export const PLANET_CODES = [
	"FW",
	"VI",
	"Oc",
	"Mo",
	"MT",
	"TF",
	"DW",
	"ML",
] as const;

export type PlanetTypeCode = (typeof PLANET_CODES)[number];
export type PlanetType = PlanetTypeCode;

export const PLANET_CODE_TO_NAME: Record<PlanetTypeCode, string> = {
	FW: "Forest and Wilderness",
	VI: "Volcanic Inferno",
	Oc: "Oceanic",
	Mo: "Mountainous",
	MT: "Multiple Terrain",
	TF: "Terra Form",
	DW: "Desert Wasteland",
	ML: "Mystical Lands",
};

export function getPlanetDisplayName(code?: string | null): string {
	if (!code) return "Terra Form";
	return (
		PLANET_CODE_TO_NAME[code as PlanetTypeCode] ||
		(Object.values(PLANET_CODE_TO_NAME).includes(code) ? code : code)
	);
}

export interface PlanetTypeDetail {
	code: PlanetTypeCode;
	name: string;
	advantage: string;
	secondaryAdvantage: string;
	disadvantage: string;
	starterPerks: string;
	color: string;
	icon: string;
}

export const PLANET_DETAILS: Record<PlanetTypeCode, PlanetTypeDetail> = {
	FW: {
		code: "FW",
		name: "Forest and Wilderness",
		advantage: "+15% to +30% Civilian Population Capacity",
		secondaryAdvantage: "+$25 Money / tick per Star Mine",
		disadvantage: "+15% to +20% Attack Travel Time",
		starterPerks: "Starts with +500 Soldiers (700 Total Garrison)",
		color: "#10b981",
		icon: "🌿",
	},
	DW: {
		code: "DW",
		name: "Desert Wasteland",
		advantage: "+17.5% to +30% Offensive Combat Power",
		secondaryAdvantage: "-90% Trooper & Dragoon Training Costs",
		disadvantage: "-10% Civilian Population Capacity",
		starterPerks: "Starts with Dragoons unlocked; FDC fixed at 25%",
		color: "#f59e0b",
		icon: "🏜️",
	},
	VI: {
		code: "VI",
		name: "Volcanic Inferno",
		advantage: "-70% to -85% Power Drain Required",
		secondaryAdvantage:
			"Power Plants store 10,000 MWh Power (vs 1,000 standard)",
		disadvantage: "-10% to -15% Civilian Population Capacity",
		starterPerks: "Starts with Fusion Technology & 10 Fusion Missiles",
		color: "#ef4444",
		icon: "🌋",
	},
	ML: {
		code: "ML",
		name: "Mystical Lands",
		advantage: "-30% Attack Travel Time",
		secondaryAdvantage: "-50% Power Drain Required",
		disadvantage: "-10% Offensive Strength",
		starterPerks: "Starts with Fusion Technology unlocked",
		color: "#a855f7",
		icon: "✨",
	},
	Mo: {
		code: "Mo",
		name: "Mountainous",
		advantage: "+15% to +25% Gross Income",
		secondaryAdvantage: "+75% Attack War Honor & +15% Probe Defense",
		disadvantage: "-20% Power Plant Production",
		starterPerks: "Starts with Laser Dragoons unlocked",
		color: "#94a3b8",
		icon: "⛰️",
	},
	Oc: {
		code: "Oc",
		name: "Oceanic",
		advantage: "+10% to +20% Defensive Combat Power",
		secondaryAdvantage: "-25% Infrastructure Construction Cost",
		disadvantage: "+10% to +25% Research Points Required",
		starterPerks: "Starts with 250 Laser Troopers garrisoned",
		color: "#0284c7",
		icon: "🌊",
	},
	TF: {
		code: "TF",
		name: "Terra Form",
		advantage: "+40% Scientific Research Efficiency",
		secondaryAdvantage: "Maximum Continual Research Cap +20%",
		disadvantage: "-10% Gross Tax Income",
		starterPerks:
			"Starts with 1,500 research pre-invested in Pop, Power, Mil, Money",
		color: "#06b6d4",
		icon: "🌐",
	},
	MT: {
		code: "MT",
		name: "Multiple Terrain",
		advantage: "+5% Offense & +5% Defense Power",
		secondaryAdvantage: "+5% Civilian Population Capacity",
		disadvantage: "-5% Star Mine Income & +5% Attack Travel Time",
		starterPerks:
			"Starts with Dragoons, Laser Dragoons & Tactical Fighters unlocked",
		color: "#6366f1",
		icon: "❄️",
	},
};

export function getPlanetDetail(codeOrName?: string | null): PlanetTypeDetail {
	if (!codeOrName) return PLANET_DETAILS.TF;
	if (PLANET_DETAILS[codeOrName as PlanetTypeCode]) {
		return PLANET_DETAILS[codeOrName as PlanetTypeCode];
	}
	const match = Object.values(PLANET_DETAILS).find(
		(d) => d.name.toLowerCase() === codeOrName.toLowerCase(),
	);
	return match || PLANET_DETAILS.TF;
}

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
