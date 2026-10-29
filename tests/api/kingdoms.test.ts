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
				planetType: "TF",
			},
		});

		expect(created.id).toBeDefined();
		expect(created.kdName).toBe("Nova Avalon");
		expect(created.rulerName).toBe("Sovereign Vael");
		expect(created.planet_type).toBe("TF");
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
		const userKdsAndBots = await adminPb.collection("kingdoms").getList(1, 10, {
			filter: `user = "${pb.authStore.record?.id}"`,
		});
		expect(userKdsAndBots.totalItems).toBe(1);

		// Prevent duplicate kingdom for the same user
		await expect(
			pb.send("/api/kingdoms/create", {
				method: "POST",
				body: {
					kdName: "Second Kingdom",
					rulerName: "Emperor Max",
					planetType: "Mo",
				},
			}),
		).rejects.toThrow();
	});

	it("applies distinct starter packages and assigns sector slots for all 8 archetypes", async () => {
		const archetypes = [
			{
				type: "Forest and Wilderness",
				code: "FW",
				check: (k: any) => expect(k.military.sol).toBe(700),
			},
			{
				type: "Desert Wasteland",
				code: "DW",
				check: (k: any) => expect(k.research.t_dragoons).toBe(true),
			},
			{
				type: "Volcanic Inferno",
				code: "VI",
				check: (k: any) => expect(k.research.t_fusion).toBe(true),
			},
			{
				type: "Mystical Lands",
				code: "ML",
				check: (k: any) => expect(k.research.t_fusion).toBe(true),
			},
			{
				type: "Mountainous",
				code: "Mo",
				check: (k: any) => expect(k.research.t_laser_dragoons).toBe(true),
			},
			{
				type: "Oceanic",
				code: "Oc",
				check: (k: any) => expect(k.military.lt).toBe(250),
			},
			{
				type: "Terra Form",
				code: "TF",
				check: (k: any) => {
					expect(k.research.r_pop).toBe(1500);
					expect(k.research.r_power).toBe(1500);
					expect(k.research.r_mil).toBe(1500);
					expect(k.research.r_money).toBe(1500);
				},
			},
			{
				type: "Multiple Terrain",
				code: "MT",
				check: (k: any) => {
					expect(k.research.t_dragoons).toBe(true);
					expect(k.research.t_laser_dragoons).toBe(true);
					expect(k.research.t_tactical_fighters).toBe(true);
				},
			},
		];

		for (let i = 0; i < archetypes.length; i++) {
			const entry = archetypes[i];
			const { pb } = await createAuthClient(`archetype_${i}`);
			const kd = await pb.send<any>("/api/kingdoms/create", {
				method: "POST",
				body: {
					kdName: `Realm of ${entry.type}`,
					rulerName: `Leader ${i}`,
					planetType: entry.code,
				},
			});

			expect(kd.planet_type).toBe(entry.code);
			expect(kd.sector).toBeDefined();
			expect(kd.sector_slot).toBeGreaterThanOrEqual(0);
			expect(kd.sector_slot).toBeLessThan(10);
			expect(kd.land).toBe(250);
			expect(kd.free_land).toBe(80);
			expect(kd.population).toBe(2250);
			expect(kd.money).toBe(300000);
			expect(kd.power).toBe(10000);
			expect(kd.newbie_step).toBe(0);
			expect(kd.is_newbie).toBe(true);
			entry.check(kd);
		}
	});

	it("advances through all 8 newbie steps (24 ticks per step) to complete newbie mode", async () => {
		const { pb } = await createAuthClient("newbie_progression");
		const kd = await pb.send<any>("/api/kingdoms/create", {
			method: "POST",
			body: {
				kdName: "Progression Realm",
				rulerName: "Stepping Emperor",
				planetType: "Terra Form",
			},
		});

		expect(kd.is_newbie).toBe(true);
		expect(kd.newbie_step).toBe(0);

		// Advance through 8 steps (192 ticks total)
		for (let step = 1; step <= 8; step++) {
			const res = await pb.send<any>("/api/kingdoms/self-tick/step", {
				method: "POST",
			});
			expect(res.success).toBe(true);
			expect(res.step).toBe(step);
			expect(res.ticksAdvanced).toBe(24);
			if (step < 8) {
				expect(res.isNewbie).toBe(true);
			} else {
				expect(res.isNewbie).toBe(false);
			}
		}

		// Re-read kingdom
		const completed = await pb.collection("kingdoms").getOne(kd.id);
		expect(completed.newbie_step).toBe(8);
		expect(completed.is_newbie).toBe(false);
		expect(completed.money).toBeGreaterThan(300000);
		expect(completed.population).toBeGreaterThan(2250);

		// Step 9 is refused
		await expect(
			pb.send("/api/kingdoms/self-tick/step", { method: "POST" }),
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
