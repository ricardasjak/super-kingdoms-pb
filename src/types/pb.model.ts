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
	GameStatus: "gameStatus",
	Kingdoms: "kingdoms",
	SpyReports: "spyReports",
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

export type GameStatusRecord = {
	currentTick?: number
	endTick: number
	id: string
	kingdomCount?: number
	roundNumber: number
}

export type KingdomsRecord<TbotSettings = unknown, Tbuildings = unknown, TlandQueue = unknown, Tmilitary = unknown, Tresearch = unknown, TresearchAutoAssign = unknown> = {
	autoBuild?: boolean
	autoExplore?: number
	botOwnerKd?: string
	botSettings?: null | TbotSettings
	buildings?: null | Tbuildings
	id: string
	kdName: string
	land: number
	landQueue?: null | TlandQueue
	military?: null | Tmilitary
	money?: number
	moneyIncome?: number
	nw: number
	planetType: string
	popChange?: number
	population: number
	power?: number
	powerIncome?: number
	probes?: number
	raceType: string
	radius?: number
	research?: null | Tresearch
	researchAutoAssign?: null | TresearchAutoAssign
	researchPts?: number
	rulerName: string
	state?: string
	tier?: number
	userId?: RecordIdString
}

export type SpyReportsRecord<Tbuildings = unknown, Tmilitary = unknown> = {
	buildings?: null | Tbuildings
	honor?: number
	id: string
	land: number
	maProtection?: number
	maxDefPotential?: number
	maxOffPotential?: number
	military?: null | Tmilitary
	money: number
	networth: number
	population: number
	power: number
	probes?: number
	scientists?: number
	spiedAt: number
	targetKdName: string
	targetLevel: number
	targetPlanetType: string
	targetRaceType: string
	targetRulerName: string
	userId: RecordIdString
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
export type GameStatusResponse<Texpand = unknown> = Required<GameStatusRecord> & BaseSystemFields<Texpand>
export type KingdomsResponse<TbotSettings = unknown, Tbuildings = unknown, TlandQueue = unknown, Tmilitary = unknown, Tresearch = unknown, TresearchAutoAssign = unknown, Texpand = unknown> = Required<KingdomsRecord<TbotSettings, Tbuildings, TlandQueue, Tmilitary, Tresearch, TresearchAutoAssign>> & BaseSystemFields<Texpand>
export type SpyReportsResponse<Tbuildings = unknown, Tmilitary = unknown, Texpand = unknown> = Required<SpyReportsRecord<Tbuildings, Tmilitary>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	gameStatus: GameStatusRecord
	kingdoms: KingdomsRecord
	spyReports: SpyReportsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	gameStatus: GameStatusResponse
	kingdoms: KingdomsResponse
	spyReports: SpyReportsResponse
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
