import { describe, expect, it } from "vitest";
import { createAdminClient, createClient } from "../setup/helpers";

describe("Game Round Lifecycle API", () => {
	it("resets round ticks, increments round number, and clears all existing kingdoms", async () => {
		const pb = createClient();
		const adminPb = await createAdminClient();

		// 1. Populate some test kingdoms
		const popRes = await pb.send<any>("/api/game/populate", {
			method: "POST",
		});
		expect(popRes.success).toBe(true);
		expect(popRes.added).toBe(1000);

		// 2. Verify kingdoms exist in db and status reflects this
		const kingdomsBefore = await adminPb.collection("kingdoms").getList(1, 20);
		expect(kingdomsBefore.totalItems).toBeGreaterThanOrEqual(1000);

		const statusBefore = await pb.send<any>("/api/game/status", {
			method: "GET",
		});
		expect(statusBefore.kingdomCount).toBeGreaterThanOrEqual(1000);
		const initialRound = statusBefore.roundNumber;

		// 3. Trigger restart
		const restartRes = await pb.send<any>("/api/game/restart", {
			method: "POST",
		});
		expect(restartRes.success).toBe(true);

		// 4. Verify status after restart: tick 0, round incremented, 0 kingdoms
		const statusAfter = await pb.send<any>("/api/game/status", {
			method: "GET",
		});
		expect(statusAfter.currentTick).toBe(0);
		expect(statusAfter.roundNumber).toBe(initialRound + 1);
		expect(statusAfter.kingdomCount).toBe(0);

		// 5. Verify database collection is actually empty
		const kingdomsAfter = await adminPb.collection("kingdoms").getList(1, 20);
		expect(kingdomsAfter.totalItems).toBe(0);
	});

	it("advances simulation tick and processes all active kingdoms", async () => {
		const pb = createClient();
		const adminPb = await createAdminClient();

		// Populate test kingdoms
		await pb.send<any>("/api/game/populate", { method: "POST" });

		// Open the round — ticks run only while the phase is in-progress
		await pb.send<any>("/api/game/status", {
			method: "POST",
			body: { status: "in-progress" },
		});

		// Fetch initial sample kingdom
		const sampleBefore = (await adminPb.collection("kingdoms").getList(1, 1))
			.items[0];
		const moneyBefore = sampleBefore.money;

		// Advance 1 tick
		const tickRes = await pb.send<any>("/api/game/advance-tick", {
			method: "POST",
		});

		expect(tickRes.success).toBe(true);
		expect(tickRes.currentTick).toBe(1);
		expect(tickRes.processedCount).toBeGreaterThanOrEqual(1000);
		expect(tickRes.executionTimeMs).toBeGreaterThan(0);

		// Verify game status reflects tick 1
		const status = await pb.send<any>("/api/game/status", { method: "GET" });
		expect(status.currentTick).toBe(1);
		expect(status.status).toBe("in-progress");

		// Verify sample kingdom processed tick logic (population economics and auto-growth exploration)
		const sampleAfter = (await adminPb.collection("kingdoms").getList(1, 1))
			.items[0];
		expect(sampleAfter.population).toBe(2363);
		expect(sampleAfter.money).toBeGreaterThan(moneyBefore);
		expect(sampleAfter.landQueue.length).toBeGreaterThan(0);
	});

	it("exposes and controls the gameStatus.status enum via the admin API", async () => {
		const pb = createClient();

		// Ensure the status record exists (lazy-created on first GET)
		const initial = await pb.send<any>("/api/game/status", { method: "GET" });
		expect(["registration", "in-progress", "stopped"]).toContain(
			initial.status,
		);

		// Set a valid phase — reflected by subsequent GETs
		const setRes = await pb.send<any>("/api/game/status", {
			method: "POST",
			body: { status: "stopped" },
		});
		expect(setRes.success).toBe(true);
		expect(setRes.status).toBe("stopped");

		const afterSet = await pb.send<any>("/api/game/status", { method: "GET" });
		expect(afterSet.status).toBe("stopped");

		// Reject values outside the enum
		await expect(
			pb.send("/api/game/status", {
				method: "POST",
				body: { status: "paused" },
			}),
		).rejects.toThrow();

		// Restart re-opens the round as registration
		await pb.send<any>("/api/game/restart", { method: "POST" });
		const afterRestart = await pb.send<any>("/api/game/status", {
			method: "GET",
		});
		expect(afterRestart.status).toBe("registration");
	});

	it("refuses to advance ticks unless the phase is in-progress", async () => {
		const pb = createClient();

		for (const phase of ["registration", "stopped"]) {
			await pb.send<any>("/api/game/status", {
				method: "POST",
				body: { status: phase },
			});
			const before = await pb.send<any>("/api/game/status", { method: "GET" });

			await expect(
				pb.send("/api/game/advance-tick", { method: "POST" }),
			).rejects.toThrow();

			const after = await pb.send<any>("/api/game/status", { method: "GET" });
			expect(after.currentTick).toBe(before.currentTick);
			expect(after.status).toBe(phase);
		}

		// Re-opening the round lets ticks run again
		await pb.send<any>("/api/game/status", {
			method: "POST",
			body: { status: "in-progress" },
		});
		const tickRes = await pb.send<any>("/api/game/advance-tick", {
			method: "POST",
		});
		expect(tickRes.success).toBe(true);
	});

	it("spawns 10 bot kingdoms with randomized profiles, autoBuild enabled, and randomized planet types", async () => {
		const pb = createClient();
		const adminPb = await createAdminClient();

		// Restart game to clean state
		await pb.send<any>("/api/game/restart", { method: "POST" });
		const statusInitial = await pb.send<any>("/api/game/status", {
			method: "GET",
		});
		expect(statusInitial.kingdomCount).toBe(0);

		// Call create-bots
		const res = await pb.send<{
			success: boolean;
			created: number;
			ids: string[];
		}>("/api/game/create-bots", {
			method: "POST",
			body: { count: 10 },
		});

		expect(res.success).toBe(true);
		expect(res.created).toBe(10);
		expect(res.ids).toHaveLength(10);

		const validLabels = [
			"Aggressive",
			"Extreme Offense",
			"Probe Specialist",
			"Defensive",
			"Standard Balanced",
			"Balanced Attacker",
			"Balanced Scientist",
			"NW Booster",
			"Economic Growth",
			"Growth & Probes",
			"Growth & Science",
			"Pure Growth",
		];

		const validPlanets = [
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
		];

		for (const id of res.ids) {
			const kd = await adminPb.collection("kingdoms").getOne(id);
			expect(kd.autoBuild).toBe(true);
			expect(validPlanets).toContain(kd.planetType);
			expect(kd.botOwnerKd).toBe("freelancer");

			const botSettings = kd.botSettings as any;
			expect(botSettings).toBeDefined();
			expect(typeof botSettings.label).toBe("string");
			expect(validLabels).toContain(botSettings.label);
			expect(typeof botSettings.exploration).toBe("number");
			expect(botSettings.buildings).toBeDefined();
			expect(typeof botSettings.buildings.pf).toBe("number");
			expect(typeof botSettings.buildings.tc).toBe("number");
			expect(Array.isArray(botSettings.researchPriority)).toBe(true);
		}

		// Verify game telemetry updated
		const statusAfter = await pb.send<any>("/api/game/status", {
			method: "GET",
		});
		expect(statusAfter.kingdomCount).toBe(10);
	});
});
