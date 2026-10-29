export interface ResearchData {
	pts: number;
	perc: number;
}

export interface KingdomResearch {
	mil?: ResearchData;
	money?: ResearchData;
	pop?: ResearchData;
	power?: ResearchData;
	warp?: ResearchData;
	fdc?: ResearchData;
	r_fusion?: ResearchData;
	r_core?: ResearchData;
	r_armor?: ResearchData;
	r_long?: ResearchData;
	r_dr?: ResearchData;
	r_ft?: ResearchData;
	r_ld?: ResearchData;
	r_lf?: ResearchData;
	r_f74?: ResearchData;
	r_tf?: ResearchData;
	r_ht?: ResearchData;
	[key: string]: ResearchData | undefined;
}

export interface BuildingsQueue {
	res: number[];
	plants: number[];
	rax: number[];
	sm: number[];
	pf: number[];
	tc: number[];
	asb: number[];
	ach: number[];
	[key: string]: number[];
}

export interface BuildingTargets {
	res: number;
	plants: number;
	rax: number;
	sm: number;
	pf: number;
	tc: number;
	asb: number;
	ach: number;
	[key: string]: number;
}

export interface KingdomBuildings {
	res: number;
	plants: number;
	rax: number;
	sm: number;
	pf: number;
	tc: number;
	asb: number;
	ach: number;
	rubble: number;
	queue?: BuildingsQueue;
	target?: BuildingTargets;
}

export interface MilitaryQueue {
	sol: number[];
	tr: number[];
	dr: number[];
	ft: number[];
	tf: number[];
	lt: number[];
	ld: number[];
	lf: number[];
	f74: number[];
	t: number[];
	ht: number[];
	sci: number[];
	[key: string]: number[];
}

export interface MilitaryTargets {
	sol: number;
	tr: number;
	dr: number;
	ft: number;
	tf: number;
	lt: number;
	ld: number;
	lf: number;
	f74: number;
	t: number;
	ht: number;
	sci: number;
	[key: string]: number;
}

export interface KingdomMilitary {
	sol: number;
	tr: number;
	dr: number;
	ft: number;
	tf: number;
	lt: number;
	ld: number;
	lf: number;
	f74: number;
	t: number;
	ht: number;
	sci: number;
	queue?: MilitaryQueue;
	target?: MilitaryTargets;
}

export type BuildingType =
	| "res"
	| "plants"
	| "rax"
	| "sm"
	| "pf"
	| "tc"
	| "asb";

export type MilitaryUnitType =
	| "sol"
	| "sci"
	| "tr"
	| "dr"
	| "ft"
	| "tf"
	| "lt"
	| "ld"
	| "lf"
	| "f74"
	| "t"
	| "ht";

export type ResearchTopicType =
	| "pop"
	| "power"
	| "mil"
	| "money"
	| "fdc"
	| "warp";

export type ResearchTechType =
	| "r_fusion"
	| "r_core"
	| "r_armor"
	| "r_long"
	| "r_dr"
	| "r_ft"
	| "r_ld"
	| "r_lf"
	| "r_f74"
	| "r_tf"
	| "r_ht";

export type ResearchKey = ResearchTopicType | ResearchTechType;

export interface MilitaryUnitConfig {
	cost: number;
	sol: number;
	power: number;
	housing: number;
	off: number;
	def: number;
	researchRequired?: ResearchTechType;
	buildingRequired?: BuildingType;
}

export interface ResearchTechConfig {
	requirePoints: number;
	requires?: ResearchKey;
	bonus?: number;
}

export interface BuildingConfig {
	label: string;
	researchRequired?: ResearchTechType;
}

export interface BotSettings {
	label?: string;
	defenseRatio?: number;
	growthFocus?: string;
	exploration?: number;
	offense?: number;
	defense?: number;
	flex?: number;
	science?: number;
	buildings?: {
		pf: number;
		tc: number;
	};
	researchPriority?: string[];
}
