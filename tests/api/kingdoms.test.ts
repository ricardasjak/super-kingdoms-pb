import { describe, expect, it } from "vitest";
import {
	createAdminClient,
	createAuthClient,
	createClient,
} from "../setup/helpers";

describe("POST /api/kingdoms/create", () => {
	it("rejects unauthenticated requests", async () => {
		const pb = createClient();
		await expect(
			pb.send("/api/kingdoms/create", {
				method: "POST",
				body: {
					kdName: "Sovereign Terra",
					rulerName: "Emperor Max",
					planetType: "Terra Form",
					raceType: "Terran",
				},
			}),
		).rejects.toThrow();
	});

	it("allows authenticated user to found a kingdom with initial assets and bots", async () => {
		const { pb } = await createAuthClient("founder");

		const created = await pb.send<any>("/api/kingdoms/create", {
			method: "POST",
			body: {
				kdName: "Nova Avalon",
				rulerName: "Sovereign Vael",
				planetType: "Terra Form",
				raceType: "Terran",
				botNames: [
					"Vanguard Alpha 1",
					"Vanguard Beta 2",
					"Vanguard Gamma 3",
					"Vanguard Delta 4",
					"Vanguard Epsilon 5",
				],
			},
		});

		expect(created.id).toBeDefined();
		expect(created.kdName).toBe("Nova Avalon");
		expect(created.rulerName).toBe("Sovereign Vael");
		expect(created.planetType).toBe("Terra Form");
		expect(created.raceType).toBe("Terran");
		expect(created.land).toBe(250);
		expect(created.population).toBe(2250);
		expect(created.money).toBe(300000);
		expect(created.power).toBe(10000);
		expect(created.buildings.res).toBe(80);
		expect(created.military.sol).toBe(200);
		expect(created.military.sci).toBe(300);

		// Verify user can read their own kingdom via kingdoms collection
		const userKds = await pb.collection("kingdoms").getList(1, 1, {
			filter: `user = "${pb.authStore.record?.id}"`,
		});
		expect(userKds.totalItems).toBe(1);
		expect(userKds.items[0].id).toBe(created.id);

		// Verify subordinate bots were not created (connected bots disabled per user request)
		const adminPb = await createAdminClient();
		const allKds = await adminPb.collection("kingdoms").getList(1, 10);
		expect(allKds.totalItems).toBe(1);

		// Prevent duplicate kingdom for the same user
		await expect(
			pb.send("/api/kingdoms/create", {
				method: "POST",
				body: {
					kdName: "Second Kingdom",
					rulerName: "Emperor Max",
					planetType: "Mountainous",
					raceType: "Ancients",
				},
			}),
		).rejects.toThrow();
	});
});

describe("POST /api/kingdoms/explore and /api/kingdoms/toggle-auto-explore", () => {
	it("dispatches an exploration expedition and updates queue and treasury", async () => {
		const { pb } = await createAuthClient("explorer_user");

		const created = await pb.send<any>("/api/kingdoms/create", {
			method: "POST",
			body: {
				kdName: "Frontier Realm",
				rulerName: "Scout Master",
				planetType: "Terra Form",
				raceType: "Terran",
			},
		});

		// 250 land * 0.1 = 25 acres max explore. Let's explore 24 acres.
		const initialMoney = created.money;
		const exploreRes = await pb.send<any>("/api/kingdoms/explore", {
			method: "POST",
			body: { amount: 24 },
		});

		expect(exploreRes.success).toBe(true);
		expect(exploreRes.explored).toBe(24);
		expect(exploreRes.cost).toBeGreaterThan(0);
		expect(exploreRes.landQueue).toBeDefined();
		expect(exploreRes.landQueue.length).toBe(24);
		expect(exploreRes.kingdom.money).toBe(initialMoney - exploreRes.cost);

		// Reject exploration exceeding 10% limit (only 1 remaining acre possible)
		await expect(
			pb.send("/api/kingdoms/explore", {
				method: "POST",
				body: { amount: 10 },
			}),
		).rejects.toThrow();

		// Toggle auto-explore
		const autoRes = await pb.send<any>("/api/kingdoms/toggle-auto-explore", {
			method: "POST",
			body: { autoExplore: 5 },
		});
		expect(autoRes.success).toBe(true);
		expect(autoRes.autoExplore).toBe(5);
	});
});

describe("POST /api/kingdoms/build-buildings and /api/kingdoms/raze-buildings", () => {
	// Mirrors the Growth page payload: every building key as a string, blanks for untouched rows
	const BLANK_BUILDINGS = {
		res: "",
		plants: "",
		rax: "",
		sm: "",
		pf: "",
		tc: "",
		asb: "",
		ach: "",
	};

	async function createBuilderKingdom(pb: any, tag: string) {
		return pb.send<any>("/api/kingdoms/create", {
			method: "POST",
			body: {
				kdName: `Build Realm ${tag}`,
				rulerName: "Master Builder",
				planetType: "Terra Form",
				raceType: "Terran",
			},
		});
	}

	it("queues buildings, deducts cost, and preserves existing buildings", async () => {
		const { pb } = await createAuthClient("builder_user");
		const created = await createBuilderKingdom(pb, "one");

		const costPerBuilding = Math.round(Math.sqrt(created.land) * 63);
		const res = await pb.send<any>("/api/kingdoms/build-buildings", {
			method: "POST",
			body: { buildings: { ...BLANK_BUILDINGS, res: "16" } },
		});

		expect(res.success).toBe(true);
		const queuedRes = (res.kingdom.buildings.queue.res || []).reduce(
			(a: number, b: number) => a + b,
			0,
		);
		expect(queuedRes).toBe(16);
		// Existing buildings must survive the queue update (regression: JSON field
		// reads must not reset counts to zero)
		expect(res.kingdom.buildings.res).toBe(created.buildings.res);
		expect(res.kingdom.buildings.sm).toBe(created.buildings.sm);
		expect(res.kingdom.money).toBe(created.money - 16 * costPerBuilding);

		// Queue persists on re-read from the collection API
		const reread = await pb.collection("kingdoms").getOne(res.kingdom.id);
		expect(reread.buildings.res).toBe(created.buildings.res);
		const rereadQueued = (reread.buildings.queue.res || []).reduce(
			(a: number, b: number) => a + b,
			0,
		);
		expect(rereadQueued).toBe(16);
	});

	it("rejects builds exceeding free land and empty requests", async () => {
		const { pb } = await createAuthClient("builder_user2");
		await createBuilderKingdom(pb, "two");

		await expect(
			pb.send("/api/kingdoms/build-buildings", {
				method: "POST",
				body: { buildings: { ...BLANK_BUILDINGS, res: "9999" } },
			}),
		).rejects.toThrow();

		await expect(
			pb.send("/api/kingdoms/build-buildings", {
				method: "POST",
				body: { buildings: { ...BLANK_BUILDINGS } },
			}),
		).rejects.toThrow();
	});

	it("razes owned buildings and refunds half cost", async () => {
		const { pb } = await createAuthClient("builder_user3");
		const created = await createBuilderKingdom(pb, "three");

		const refundPerBuilding = Math.floor(
			Math.round(Math.sqrt(created.land) * 63) / 2,
		);
		const res = await pb.send<any>("/api/kingdoms/raze-buildings", {
			method: "POST",
			body: { buildings: { ...BLANK_BUILDINGS, res: "10" } },
		});

		expect(res.success).toBe(true);
		expect(res.kingdom.buildings.res).toBe(created.buildings.res - 10);
		expect(res.kingdom.buildings.rubble).toBe(10);
		expect(res.kingdom.money).toBe(created.money + 10 * refundPerBuilding);

		// Cannot raze more than owned
		await expect(
			pb.send("/api/kingdoms/raze-buildings", {
				method: "POST",
				body: { buildings: { ...BLANK_BUILDINGS, res: "9999" } },
			}),
		).rejects.toThrow();
	});
});
