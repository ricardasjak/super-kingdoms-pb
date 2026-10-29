/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	AidPackages: "aid_packages",
	GameNews: "game_news",
	GameStatus: "game_status",
	Kingdoms: "kingdoms",
	MilitaryDeployments: "military_deployments",
	Sectors: "sectors",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type AidPackagesRecord<Tresources = unknown> = {
	aid_points?: number
	id: string
	recipient_id: RecordIdString
	resources: null | Tresources
	sender_id: RecordIdString
	tick?: number
}

export const GameNewsScopeOptions = {
	"kingdom": "kingdom",
	"sector": "sector",
	"universe": "universe",
} as const
export type GameNewsScopeOptions = typeof GameNewsScopeOptions[keyof typeof GameNewsScopeOptions]
export type GameNewsRecord = {
	content?: string
	event_type: string
	headline: string
	id: string
	kingdom_id?: RecordIdString
	scope: GameNewsScopeOptions
	sector_id?: RecordIdString
	tick?: number
}

export const GameStatusPhaseOptions = {
	"newbie": "newbie",
	"pvp": "pvp",
	"concluded": "concluded",
} as const
export type GameStatusPhaseOptions = typeof GameStatusPhaseOptions[keyof typeof GameStatusPhaseOptions]
export type GameStatusRecord = {
	current_tick?: number
	id: string
	is_paused?: boolean
	max_ticks?: number
	phase: GameStatusPhaseOptions
	phase_ends_at?: IsoDateString
	round_number: number
	tick_interval_seconds?: number
}

export const KingdomsPlanetTypeOptions = {
	"FW": "FW",
	"VI": "VI",
	"Oc": "Oc",
	"Mo": "Mo",
	"MT": "MT",
	"TF": "TF",
	"DW": "DW",
	"ML": "ML",
} as const
export type KingdomsPlanetTypeOptions = typeof KingdomsPlanetTypeOptions[keyof typeof KingdomsPlanetTypeOptions]

export const KingdomsStateOptions = {
	"normal": "normal",
	"trouble": "trouble",
	"dead": "dead",
} as const
export type KingdomsStateOptions = typeof KingdomsStateOptions[keyof typeof KingdomsStateOptions]
export type KingdomsRecord<Tauto_research_allocation = unknown, Tbuilding_queue = unknown, Tbuildings = unknown, Tland_queue = unknown, Tmilitary = unknown, Tresearch = unknown, Tshields = unknown, Ttraining_queue = unknown> = {
	auto_research_allocation?: null | Tauto_research_allocation
	building_queue?: null | Tbuilding_queue
	buildings?: null | Tbuildings
	daily_drafted_soldiers?: number
	daily_explored_land?: number
	free_land?: number
	honor?: number
	id: string
	is_newbie?: boolean
	land: number
	land_queue?: null | Tland_queue
	last_daily_reward_tick?: number
	ma_protection?: number
	military?: null | Tmilitary
	money?: number
	name: string
	networth?: number
	newbie_step?: number
	planet_type: KingdomsPlanetTypeOptions
	population?: number
	power?: number
	probe_credits?: number
	probes?: number
	research?: null | Tresearch
	sector: RecordIdString
	sector_slot?: number
	shields?: null | Tshields
	state?: KingdomsStateOptions
	training_queue?: null | Ttraining_queue
	trouble_until_tick?: number
	user: RecordIdString
	vote_kingdom_id?: RecordIdString
}

export const MilitaryDeploymentsStatusOptions = {
	"outbound": "outbound",
	"returning": "returning",
	"completed": "completed",
} as const
export type MilitaryDeploymentsStatusOptions = typeof MilitaryDeploymentsStatusOptions[keyof typeof MilitaryDeploymentsStatusOptions]
export type MilitaryDeploymentsRecord<Tcombat_report = unknown, Treturn_waves = unknown, Tunits = unknown> = {
	arrival_tick?: number
	attacker_id: RecordIdString
	combat_report?: null | Tcombat_report
	departure_tick?: number
	general_index: number
	id: string
	return_waves: null | Treturn_waves
	status: MilitaryDeploymentsStatusOptions
	target_id: RecordIdString
	units: null | Tunits
	war_shields_power?: number
}

export const SectorsStateOptions = {
	"normal": "normal",
	"peaceful": "peaceful",
	"expansionist": "expansionist",
	"offensive": "offensive",
	"defensive": "defensive",
	"mobilization": "mobilization",
} as const
export type SectorsStateOptions = typeof SectorsStateOptions[keyof typeof SectorsStateOptions]
export type SectorsRecord<Tenhancements = unknown> = {
	enhancements?: null | Tenhancements
	fund?: number
	grid_x?: number
	grid_y?: number
	id: string
	leader_id?: RecordIdString
	name?: string
	sector_number?: number
	state?: SectorsStateOptions
	tax_rate?: number
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AidPackagesResponse<Tresources = unknown, Texpand = unknown> = Required<AidPackagesRecord<Tresources>> & BaseSystemFields<Texpand>
export type GameNewsResponse<Texpand = unknown> = Required<GameNewsRecord> & BaseSystemFields<Texpand>
export type GameStatusResponse<Texpand = unknown> = Required<GameStatusRecord> & BaseSystemFields<Texpand>
export type KingdomsResponse<Tauto_research_allocation = unknown, Tbuilding_queue = unknown, Tbuildings = unknown, Tland_queue = unknown, Tmilitary = unknown, Tresearch = unknown, Tshields = unknown, Ttraining_queue = unknown, Texpand = unknown> = Required<KingdomsRecord<Tauto_research_allocation, Tbuilding_queue, Tbuildings, Tland_queue, Tmilitary, Tresearch, Tshields, Ttraining_queue>> & BaseSystemFields<Texpand>
export type MilitaryDeploymentsResponse<Tcombat_report = unknown, Treturn_waves = unknown, Tunits = unknown, Texpand = unknown> = Required<MilitaryDeploymentsRecord<Tcombat_report, Treturn_waves, Tunits>> & BaseSystemFields<Texpand>
export type SectorsResponse<Tenhancements = unknown, Texpand = unknown> = Required<SectorsRecord<Tenhancements>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	aid_packages: AidPackagesRecord
	game_news: GameNewsRecord
	game_status: GameStatusRecord
	kingdoms: KingdomsRecord
	military_deployments: MilitaryDeploymentsRecord
	sectors: SectorsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	aid_packages: AidPackagesResponse
	game_news: GameNewsResponse
	game_status: GameStatusResponse
	kingdoms: KingdomsResponse
	military_deployments: MilitaryDeploymentsResponse
	sectors: SectorsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
