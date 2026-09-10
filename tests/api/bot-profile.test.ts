import { describe, it, expect } from 'vitest';
import { createAuthClient, createAdminClient } from '../setup/helpers';

async function createKingdomOwner(tag: string) {
  const { pb } = await createAuthClient(`botprofile_${tag}_${Date.now()}`);
  const created = await pb.send<any>('/api/kingdoms/create', {
    method: 'POST',
    body: {
      kdName: `Bot Realm ${tag}`,
      rulerName: 'Governor Bot',
      planetType: 'Terra Form',
      raceType: 'Terran',
    },
  });
  return { pb, created };
}

describe('Governor Bot Profile Directives', () => {
  it('updates bot profile and dynamically controls targets during tick simulation', async () => {
    const adminPb = await createAdminClient();
    // Restart round so currentTick is 0 and tick 1 triggers Phase 6 autonomous growth
    await adminPb.send('/api/game/restart', { method: 'POST' });

    const { pb, created } = await createKingdomOwner('balanced');

    // 1. Assign Standard Balanced profile
    const balancedProfile = {
      label: 'Standard Balanced',
      exploration: 6,
      offense: 20,
      defense: 50,
      flex: 12,
      science: 18,
      buildings: {
        pf: 10,
        tc: 5,
      },
      researchPriority: ['mil', 'money', 'warp'],
    };

    const updateRes = await pb.send<any>('/api/kingdoms/update-bot-profile', {
      method: 'POST',
      body: { botSettings: balancedProfile },
    });
    expect(updateRes.success).toBe(true);

    // 2. Enable autoBuild on kingdom so Phase 6 bot growth executes
    await adminPb.collection('kingdoms').update(created.id, { autoBuild: true });

    // 3. Run self-tick (simulates 8 ticks)
    const tickRes = await pb.send<any>('/api/kingdoms/self-tick', { method: 'POST' });
    expect(tickRes.success).toBe(true);

    // 4. Verify kingdom state after ticks
    const after = await adminPb.collection('kingdoms').getOne(created.id);

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
    const totalQueuedBuildings = Object.values(after.buildings.queue || {}).reduce(
      (acc: number, q: any) => acc + (Array.isArray(q) ? q.reduce((a, b) => a + b, 0) : 0),
      0
    );
    expect(totalQueuedBuildings).toBeGreaterThan(0);
  });
});
