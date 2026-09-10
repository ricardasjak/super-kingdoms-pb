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

    // Global round tick is untouched by a self-tick
    const statusAfter = await pb.send<any>('/api/game/status', { method: 'GET' });
    expect(statusAfter.currentTick).toBe(statusBefore.currentTick);

    // A second action deducts again
    const res2 = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(res2.success).toBe(true);
    expect(res2.newbiemode).toBe(80);
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
    await expect(pb.send('/api/kingdoms/self-tick', { method: 'POST' })).rejects.toThrow();

    // Re-open for other suites
    await setPhase(pb, 'in-progress');
  });

  it('rejects exhausted newbie mode (fewer than 8 ticks left)', async () => {
    const { pb, created } = await createKingdomOwner('exhausted');
    const adminPb = await createAdminClient();
    await setPhase(pb, 'registration');

    await adminPb.collection('kingdoms').update(created.id, { newbiemode: 7 });
    await expect(pb.send('/api/kingdoms/self-tick', { method: 'POST' })).rejects.toThrow();

    await adminPb.collection('kingdoms').update(created.id, { newbiemode: 0 });
    await expect(pb.send('/api/kingdoms/self-tick', { method: 'POST' })).rejects.toThrow();

    // Budget untouched by the refused attempts
    const after = await adminPb.collection('kingdoms').getOne(created.id);
    expect(after.newbiemode).toBe(0);
  });

  it('rejects unauthenticated callers', async () => {
    const pb = createClient();
    await expect(pb.send('/api/kingdoms/self-tick', { method: 'POST' })).rejects.toThrow();
  });
});
