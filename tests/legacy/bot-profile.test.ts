import { describe, expect, it } from "vitest";
import { createAdminClient, createAuthClient } from "../setup/helpers";

async function createKingdomOwner(tag: string) {
	const { pb } = await createAuthClient(`botprofile_${tag}_${Date.now()}`);
	const created = await pb.send<any>("/api/kingdoms/create", {
		method: "POST",
		body: {
			kdName: `Bot Realm ${tag}`,
			rulerName: "Governor Bot",
			planetType: "Terra Form",
			raceType: "Terran",
		},
	});
	return { pb, created };
}

describe("Governor Bot Profile Directives", () => {
	it("updates bot profile and dynamically controls targets during tick simulation", async () => {
		const adminPb = await createAdminClient();
		// Restart round so currentTick is 0 and tick 1 triggers Phase 6 autonomous growth
		await adminPb.send("/api/game/restart", { method: "POST" });

		const { pb, created } = await createKingdomOwner("balanced");

		// 1. Assign Standard Balanced profile
		const balancedProfile = {
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
			researchPriority: ["mil", "money", "warp"],
		};

		const updateRes = await pb.send<any>("/api/kingdoms/update-bot-profile", {
			method: "POST",
			body: { botSettings: balancedProfile },
		});
		expect(updateRes.success).toBe(true);
		expect(updateRes.kingdom).toBeDefined();
		expect(updateRes.kingdom.buildings.target.tc).toBe(5);
		expect(updateRes.kingdom.buildings.target.pf).toBe(10);

		// 2. Enable autoBuild on kingdom so Phase 6 bot growth executes
		await adminPb
			.collection("kingdoms")
			.update(created.id, { autoBuild: true });

		// 3. Run self-tick (simulates 8 ticks)
		const tickRes = await pb.send<any>("/api/kingdoms/self-tick", {
			method: "POST",
		});
		expect(tickRes.success).toBe(true);

		// 4. Verify kingdom state after ticks
		const after = await adminPb.collection("kingdoms").getOne(created.id);

		// Since land is 250 < 1000, exploration was automatically set to 10
		expect(after.autoExplore).toBe(10);
		expect(after.landQueue.length).toBeGreaterThan(0);

		// Building targets were dynamically set by HandleBotParams
		expect(after.buildings.target).toBeDefined();
		expect(after.buildings.target.tc).toBe(5);
		expect(after.buildings.target.pf).toBe(10);
		expect(after.buildings.target.plants).toBeGreaterThan(0);
		expect(after.buildings.target.res).toBeGreaterThan(0);
		expect(after.buildings.target.sm).toBeGreaterThan(0);

		// Military targets were dynamically assigned
		expect(after.military.target).toBeDefined();
		expect(after.military.target.sci).toBe(18);
		expect(after.military.target.tr).toBe(20);
		expect(after.military.target.lt).toBe(50);
		expect(after.military.target.t).toBe(12);

		// Building queues were constructed towards targets
		const totalQueuedBuildings = Object.values(
			after.buildings.queue || {},
		).reduce(
			(acc: number, q: any) =>
				acc + (Array.isArray(q) ? q.reduce((a, b) => a + b, 0) : 0),
			0,
		);
		expect(totalQueuedBuildings).toBeGreaterThan(0);
	});

	it("immediately recalculates building targets to 25% PF when Probes Specialist is selected", async () => {
		const { pb } = await createKingdomOwner("probes");

		const probesProfile = {
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
			researchPriority: ["mil", "money"],
		};

		const updateRes = await pb.send<any>("/api/kingdoms/update-bot-profile", {
			method: "POST",
			body: { botSettings: probesProfile },
		});

		expect(updateRes.success).toBe(true);
		expect(updateRes.kingdom).toBeDefined();
		expect(updateRes.kingdom.buildings.target.pf).toBe(25);
		expect(updateRes.kingdom.buildings.target.tc).toBe(3);
	});

	it("only buys soldiers and scientists while newbiemode > 24, and buys military units when newbiemode <= 24", async () => {
		const adminPb = await createAdminClient();
		await adminPb.send("/api/game/restart", { method: "POST" });

		const { pb, created } = await createKingdomOwner("newbiemil");

		const profile = {
			label: "Balanced Bot",
			exploration: 5,
			offense: 25,
			defense: 25,
			flex: 25,
			science: 25,
			buildings: { pf: 5, tc: 5 },
			researchPriority: ["mil"],
		};

		await pb.send<any>("/api/kingdoms/update-bot-profile", {
			method: "POST",
			body: { botSettings: profile },
		});

		// Provide enough money, soldiers, and enable autoBuild
		await adminPb.collection("kingdoms").update(created.id, {
			autoBuild: true,
			money: 1000000,
			military: {
				sol: 5000,
				sci: 0,
				tr: 0,
				dr: 0,
				ft: 0,
				tf: 0,
				lt: 0,
				ld: 0,
				lf: 0,
				f74: 0,
				t: 0,
				ht: 0,
			},
			newbiemode: 96,
		});

		// 1. Tick when newbiemode is 96 (> 24)
		await pb.send<any>("/api/kingdoms/self-tick", { method: "POST" });

		const afterFirstTick = await adminPb
			.collection("kingdoms")
			.getOne(created.id);
		expect(afterFirstTick.newbiemode).toBe(88);

		const q1 = afterFirstTick.military?.queue || {};
		const sumQueue = (arr: any) =>
			Array.isArray(arr) ? arr.reduce((a: number, b: number) => a + b, 0) : 0;
		const combatUnitsQueued1 =
			sumQueue(q1.tr) +
			sumQueue(q1.dr) +
			sumQueue(q1.ft) +
			sumQueue(q1.tf) +
			sumQueue(q1.lt) +
			sumQueue(q1.ld) +
			sumQueue(q1.lf) +
			sumQueue(q1.f74) +
			sumQueue(q1.t) +
			sumQueue(q1.ht);

		// No combat military units allowed while newbiemode > 24
		expect(combatUnitsQueued1).toBe(0);
		// Scientists are allowed
		expect(sumQueue(q1.sci)).toBeGreaterThan(0);

		// 2. Set newbiemode to 24 (<= 24)
		await adminPb.collection("kingdoms").update(created.id, {
			newbiemode: 24,
			money: 1000000,
		});

		// Tick when newbiemode is 24 (<= 24)
		await pb.send<any>("/api/kingdoms/self-tick", { method: "POST" });

		const afterSecondTick = await adminPb
			.collection("kingdoms")
			.getOne(created.id);
		expect(afterSecondTick.newbiemode).toBe(16);

		const q2 = afterSecondTick.military?.queue || {};
		const combatUnitsQueued2 =
			sumQueue(q2.tr) +
			sumQueue(q2.dr) +
			sumQueue(q2.ft) +
			sumQueue(q2.tf) +
			sumQueue(q2.lt) +
			sumQueue(q2.ld) +
			sumQueue(q2.lf) +
			sumQueue(q2.f74) +
			sumQueue(q2.t) +
			sumQueue(q2.ht);

		// Combat military units ARE purchased once 24 or fewer newbiemode ticks remain
		expect(combatUnitsQueued2).toBeGreaterThan(0);
	});
});
