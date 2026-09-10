import { describe, it, expect } from 'vitest';
import { createClient, createAuthClient, createAdminClient } from '../setup/helpers';

async function createKingdomOwner(tag: string) {
  const { pb } = await createAuthClient(`selftick_${tag}_${Date.now()}`);
  const created = await pb.send<any>('/api/kingdoms/create', {
    method: 'POST',
    body: {
      kdName: `SelfTick Realm ${tag}`,
      rulerName: 'Lord Selftick',
      planetType: 'Terra Form',
      raceType: 'Terran',
    },
  });
  return { pb, created };
}

async function setPhase(pb: any, status: string) {
  await pb.send<any>('/api/game/status', {
    method: 'POST',
    body: { status },
  });
}

// Every self-tick rejection must carry a readable `error` string — the
// self-tick button surfaces `data.error` directly, so a missing message
// would fail silently in the UI.
async function expectDisplayableError(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (err) {
    const data = (err as { data?: { error?: unknown } })?.data;
    expect(typeof data?.error === 'string' && (data.error as string).length > 0).toBe(true);
    return;
  }
  throw new Error('Expected request to fail');
}

describe('POST /api/kingdoms/self-tick', () => {
  it('starts new kingdoms with a 96-tick newbie-mode budget', async () => {
    const { created } = await createKingdomOwner('budget');
    expect(created.newbiemode).toBe(96);
  });

  it('advances only the caller kingdom by 8 ticks and deducts 8 newbie ticks', async () => {
    const { pb, created } = await createKingdomOwner('advance');
    const adminPb = await createAdminClient();
    await setPhase(pb, 'registration');

    const statusBefore = await pb.send<any>('/api/game/status', { method: 'GET' });

    const res = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(res.success).toBe(true);
    expect(res.ticksAdvanced).toBe(8);
    expect(res.newbiemode).toBe(88);

    // Kingdom actually simulated 8 ticks: treasury and population grew
    const after = await adminPb.collection('kingdoms').getOne(created.id);
    expect(after.newbiemode).toBe(88);
    expect(after.money).toBeGreaterThan(created.money);
    expect(after.population).toBeGreaterThan(created.population);

    // Protected auto-growth runs during self-ticks: land is explored even
    // though the player's stored autoBuild flag stays off
    expect(after.land).toBeGreaterThan(created.land);
    expect(after.landQueue.length).toBeGreaterThan(0);
    expect(after.autoBuild).toBe(false);

    // Global round tick is untouched by a self-tick
    const statusAfter = await pb.send<any>('/api/game/status', { method: 'GET' });
    expect(statusAfter.currentTick).toBe(statusBefore.currentTick);

    // A second action deducts again
    const res2 = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(res2.success).toBe(true);
    expect(res2.newbiemode).toBe(80);
  });

  it('returns the updated kingdom object in the response', async () => {
    const { pb, created } = await createKingdomOwner('object');
    const adminPb = await createAdminClient();
    await setPhase(pb, 'registration');

    const res = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(res.kingdom).toBeDefined();
    expect(res.kingdom.id).toBe(created.id);
    expect(res.kingdom.newbiemode).toBe(88);
    expect(res.kingdom.money).toBeGreaterThan(created.money);
    // Full object, not a summary: nested state survives the round-trip
    expect(res.kingdom.buildings.res).toBe(80);
    expect(res.kingdom.military.sol).toBeDefined();
    expect(res.kingdom.kdName).toBe(created.kdName);

    // Matches what a fresh read returns — the UI can adopt it directly
    const reread = await adminPb.collection('kingdoms').getOne(created.id);
    expect(res.kingdom.money).toBe(reread.money);
    expect(res.kingdom.population).toBe(reread.population);
    expect(res.kingdom.nw).toBe(reread.nw);
  });

  it('leaves other kingdoms untouched', async () => {
    const first = await createKingdomOwner('solo_a');
    const second = await createKingdomOwner('solo_b');
    const adminPb = await createAdminClient();
    await setPhase(first.pb, 'in-progress');

    const otherBefore = await adminPb.collection('kingdoms').getOne(second.created.id);
    await first.pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    const otherAfter = await adminPb.collection('kingdoms').getOne(second.created.id);

    expect(otherAfter.money).toBe(otherBefore.money);
    expect(otherAfter.population).toBe(otherBefore.population);
    expect(otherAfter.newbiemode).toBe(otherBefore.newbiemode);
  });

  it('works during registration and in-progress, but refuses stopped', async () => {
    const { pb } = await createKingdomOwner('phases');

    await setPhase(pb, 'registration');
    const regRes = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(regRes.success).toBe(true);

    await setPhase(pb, 'in-progress');
    const progRes = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(progRes.success).toBe(true);

    await setPhase(pb, 'stopped');
    await expectDisplayableError(pb.send('/api/kingdoms/self-tick', { method: 'POST' }));

    // Re-open for other suites
    await setPhase(pb, 'in-progress');
  });

  it('rejects exhausted newbie mode (fewer than 8 ticks left)', async () => {
    const { pb, created } = await createKingdomOwner('exhausted');
    const adminPb = await createAdminClient();
    await setPhase(pb, 'registration');

    await adminPb.collection('kingdoms').update(created.id, { newbiemode: 7 });
    await expectDisplayableError(pb.send('/api/kingdoms/self-tick', { method: 'POST' }));

    await adminPb.collection('kingdoms').update(created.id, { newbiemode: 0 });
    await expectDisplayableError(pb.send('/api/kingdoms/self-tick', { method: 'POST' }));

    // Budget untouched by the refused attempts
    const after = await adminPb.collection('kingdoms').getOne(created.id);
    expect(after.newbiemode).toBe(0);
  });

  it('rejects unauthenticated callers', async () => {
    const pb = createClient();
    await expectDisplayableError(pb.send('/api/kingdoms/self-tick', { method: 'POST' }));
  });
});

describe('POST /api/kingdoms/restart-newbie-mode', () => {
  it('resets an exhausted kingdom to creation defaults with a fresh budget', async () => {
    const { pb, created } = await createKingdomOwner('restart');
    const adminPb = await createAdminClient();
    await setPhase(pb, 'registration');

    // Advance once so stats visibly differ from creation defaults
    await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    const ticked = await adminPb.collection('kingdoms').getOne(created.id);
    expect(ticked.money).toBeGreaterThan(300000);
    expect(ticked.newbiemode).toBe(88);

    // Exhaust the budget, then restart
    await adminPb.collection('kingdoms').update(created.id, { newbiemode: 0 });
    const res = await pb.send<any>('/api/kingdoms/restart-newbie-mode', { method: 'POST' });
    expect(res.success).toBe(true);

    const after = await adminPb.collection('kingdoms').getOne(created.id);
    expect(after.newbiemode).toBe(96);
    expect(after.land).toBe(250);
    expect(after.population).toBe(2250);
    expect(after.money).toBe(300000);
    expect(after.power).toBe(10000);
    expect(after.probes).toBe(0);
    expect(after.state).toBe('active');
    expect(after.buildings.res).toBe(80);
    expect(after.military.sol).toBe(200);
    expect(after.military.sci).toBe(300);

    // The fresh budget self-ticks again
    const tickRes = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(tickRes.success).toBe(true);
    expect(tickRes.newbiemode).toBe(88);
  });

  it('rejects restart while newbie budget remains', async () => {
    const { pb } = await createKingdomOwner('restart_early');
    await setPhase(pb, 'registration');
    await expectDisplayableError(pb.send('/api/kingdoms/restart-newbie-mode', { method: 'POST' }));
  });

  it('rejects restart while stopped and when unauthenticated', async () => {
    const { pb, created } = await createKingdomOwner('restart_gated');
    const adminPb = await createAdminClient();
    await adminPb.collection('kingdoms').update(created.id, { newbiemode: 0 });

    await setPhase(pb, 'stopped');
    await expectDisplayableError(pb.send('/api/kingdoms/restart-newbie-mode', { method: 'POST' }));

    await setPhase(pb, 'in-progress');
    const anon = createClient();
    await expectDisplayableError(anon.send('/api/kingdoms/restart-newbie-mode', { method: 'POST' }));
  });
});
