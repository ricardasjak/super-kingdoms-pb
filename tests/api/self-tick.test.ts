import { describe, expect, it } from "vitest";
import {
	createAdminClient,
	createAuthClient,
	createClient,
} from "../setup/helpers";

async function createKingdomOwner(userTag: string) {
	const { pb } = await createAuthClient(userTag);
	const created = await pb.send<any>("/api/kingdoms/create", {
		method: "POST",
		body: {
			kdName: `Realm of ${userTag}`,
			rulerName: `Ruler ${userTag}`,
			planetType: "Terra Form",
			raceType: "Terran",
		},
	});
	return { pb, created };
}

async function setPhase(pb: any, status: string) {
	await pb.send<any>("/api/game/status", {
		method: "POST",
		body: { status },
	});
}

async function expectDisplayableError(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (err) {
		const data = (err as { data?: { error?: unknown } })?.data;
		expect(
			typeof data?.error === "string" && (data.error as string).length > 0,
		).toBe(true);
		return;
	}
	throw new Error("Expected request to fail");
}

describe("POST /api/kingdoms/self-tick/step & /api/kingdoms/self-tick", () => {
	it("starts new kingdoms with 8-step Newbie Mode (192 ticks total)", async () => {
		const { created } = await createKingdomOwner("budget");
		expect(created.newbiemode).toBe(192);
		expect(created.is_newbie).toBe(true);
		expect(created.newbie_step).toBe(0);
	});

	it("advances kingdom by 24 ticks per step and increments newbie step", async () => {
		const { pb, created } = await createKingdomOwner("step_advance");
		const adminPb = await createAdminClient();
		await setPhase(pb, "registration");

		const statusBefore = await pb.send<any>("/api/game/status", {
			method: "GET",
		});

		const res = await pb.send<any>("/api/kingdoms/self-tick/step", {
			method: "POST",
		});
		expect(res.success).toBe(true);
		expect(res.ticksAdvanced).toBe(24);
		expect(res.step).toBe(1);
		expect(res.newbiemode).toBe(168);
		expect(res.isNewbie).toBe(true);

		// Kingdom simulated 24 ticks: treasury and population grew
		const after = await adminPb.collection("kingdoms").getOne(created.id);
		expect(after.newbie_step).toBe(1);
		expect(after.is_newbie).toBe(true);
		expect(after.money).toBeGreaterThan(created.money);
		expect(after.population).toBeGreaterThan(created.population);

		// Global round tick is untouched by a self-tick
		const statusAfter = await pb.send<any>("/api/game/status", {
			method: "GET",
		});
		expect(statusAfter.currentTick).toBe(statusBefore.currentTick);

		// A second step advances another 24 ticks to step 2
		const res2 = await pb.send<any>("/api/kingdoms/self-tick/step", {
			method: "POST",
		});
		expect(res2.success).toBe(true);
		expect(res2.step).toBe(2);
		expect(res2.newbiemode).toBe(144);
	});

	it("completes newbie mode after 8 steps and rejects further step advances", async () => {
		const { pb, created } = await createKingdomOwner("exhaust_steps");
		await setPhase(pb, "registration");

		// Run all 8 steps
		for (let s = 1; s <= 8; s++) {
			const res = await pb.send<any>("/api/kingdoms/self-tick/step", {
				method: "POST",
			});
			expect(res.success).toBe(true);
			expect(res.step).toBe(s);
		}

		const adminPb = await createAdminClient();
		const finalKd = await adminPb.collection("kingdoms").getOne(created.id);
		expect(finalKd.newbie_step).toBe(8);
		expect(finalKd.is_newbie).toBe(false);

		// 9th advance must be rejected
		await expectDisplayableError(
			pb.send("/api/kingdoms/self-tick/step", { method: "POST" }),
		);
	});

	it("rejects unauthenticated callers", async () => {
		const pb = createClient();
		await expect(
			pb.send("/api/kingdoms/self-tick/step", { method: "POST" }),
		).rejects.toThrow();
	});

	it("resets kingdom via POST /api/kingdoms/reset during newbie mode", async () => {
		const { pb, created } = await createKingdomOwner("reset_realm");
		await setPhase(pb, "registration");

		// Advance 1 step
		await pb.send("/api/kingdoms/self-tick/step", { method: "POST" });

		// Reset kingdom
		const res = await pb.send<any>("/api/kingdoms/reset", {
			method: "POST",
		});
		expect(res.success).toBe(true);

		// Kingdom record was deleted, allowing refounding
		const adminPb = await createAdminClient();
		const check = await adminPb.collection("kingdoms").getList(1, 1, {
			filter: `id = "${created.id}"`,
		});
		expect(check.totalItems).toBe(0);

		// User can now found a new kingdom
		const refounded = await pb.send<any>("/api/kingdoms/create", {
			method: "POST",
			body: {
				kdName: "Refounded Realm",
				rulerName: "New Ruler",
				planetType: "VI",
			},
		});
		expect(refounded.id).toBeDefined();
		expect(refounded.planet_type).toBe("VI");
		expect(refounded.newbie_step).toBe(0);
		expect(refounded.is_newbie).toBe(true);
	});
});
