import PocketBase from "pocketbase";

export const TEST_PB_URL = "http://127.0.0.1:8092";
export const ADMIN_EMAIL = "test-admin@example.com";
export const ADMIN_PASSWORD = "test-admin-password";

/** Create a fresh PB client (unauthenticated) for each test. */
export function createClient(): PocketBase {
	return new PocketBase(TEST_PB_URL);
}

/** Create a client authenticated as a new random test user. */
export async function createAuthClient(
	suffix = Math.random().toString(36).slice(2),
) {
	const pb = createClient();
	const email = `test-${suffix}@example.com`;
	const password = "Test1234!";
	await pb
		.collection("users")
		.create({ email, password, passwordConfirm: password });
	await pb.collection("users").authWithPassword(email, password);
	return { pb, email, password };
}

/** Create a client authenticated as the superuser (for admin operations). */
export async function createAdminClient(): Promise<PocketBase> {
	const pb = createClient();
	try {
		await pb
			.collection("_superusers")
			.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
	} catch {
		if (typeof (pb as any).admins?.authWithPassword === "function") {
			await (pb as any).admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
		} else {
			throw new Error("Could not authenticate as admin/superuser");
		}
	}
	return pb;
}

/**
 * Seed a kingdom record for a given user.
 * Requires an authenticated admin client to bypass collection rules.
 */
export async function seedKingdom(
	adminPb: PocketBase,
	ownerId: string,
	overrides: Record<string, unknown> = {},
) {
	return adminPb.collection("kingdoms").create({
		name: "Test Kingdom",
		hp: 100,
		gold: 500,
		owner: ownerId,
		...overrides,
	});
}
