import { describe, it, expect } from 'vitest';
import { createClient, createAuthClient, createAdminClient } from '../setup/helpers';

describe('POST /api/kingdoms/create', () => {
  it('rejects unauthenticated requests', async () => {
    const pb = createClient();
    await expect(
      pb.send('/api/kingdoms/create', {
        method: 'POST',
        body: {
          kdName: 'Sovereign Terra',
          rulerName: 'Emperor Max',
          planetType: 'Terra Form',
          raceType: 'Terran',
        },
      })
    ).rejects.toThrow();
  });

  it('allows authenticated user to found a kingdom with initial assets and bots', async () => {
    const { pb } = await createAuthClient('founder');

    const created = await pb.send<any>('/api/kingdoms/create', {
      method: 'POST',
      body: {
        kdName: 'Nova Avalon',
        rulerName: 'Sovereign Vael',
        planetType: 'Terra Form',
        raceType: 'Terran',
        botNames: [
          'Vanguard Alpha 1',
          'Vanguard Beta 2',
          'Vanguard Gamma 3',
          'Vanguard Delta 4',
          'Vanguard Epsilon 5',
        ],
      },
    });

    expect(created.id).toBeDefined();
    expect(created.kdName).toBe('Nova Avalon');
    expect(created.rulerName).toBe('Sovereign Vael');
    expect(created.planetType).toBe('Terra Form');
    expect(created.raceType).toBe('Terran');
    expect(created.land).toBe(250);
    expect(created.population).toBe(2250);
    expect(created.money).toBe(300000);
    expect(created.power).toBe(10000);
    expect(created.buildings.res).toBe(80);
    expect(created.military.sol).toBe(200);
    expect(created.military.sci).toBe(300);

    // Verify user can read their own kingdom via kingdoms collection
    const userKds = await pb.collection('kingdoms').getList(1, 1, {
      filter: `userId = "${pb.authStore.record?.id}"`,
    });
    expect(userKds.totalItems).toBe(1);
    expect(userKds.items[0].id).toBe(created.id);

    // Verify subordinate bots were created using admin client
    const adminPb = await createAdminClient();
    const bots = await adminPb.collection('kingdoms').getList(1, 10, {
      filter: `botOwnerKd = "${created.id}"`,
    });
    expect(bots.totalItems).toBe(5);
    expect(bots.items[0].kdName).toContain('Vanguard');

    // Prevent duplicate kingdom for the same user
    await expect(
      pb.send('/api/kingdoms/create', {
        method: 'POST',
        body: {
          kdName: 'Second Kingdom',
          rulerName: 'Emperor Max',
          planetType: 'Mountainous',
          raceType: 'Ancients',
        },
      })
    ).rejects.toThrow();
  });
});

describe('POST /api/kingdoms/explore and /api/kingdoms/toggle-auto-explore', () => {
  it('dispatches an exploration expedition and updates queue and treasury', async () => {
    const { pb } = await createAuthClient('explorer_user');

    const created = await pb.send<any>('/api/kingdoms/create', {
      method: 'POST',
      body: {
        kdName: 'Frontier Realm',
        rulerName: 'Scout Master',
        planetType: 'Terra Form',
        raceType: 'Terran',
      },
    });

    // 250 land * 0.1 = 25 acres max explore. Let's explore 24 acres.
    const initialMoney = created.money;
    const exploreRes = await pb.send<any>('/api/kingdoms/explore', {
      method: 'POST',
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
      pb.send('/api/kingdoms/explore', {
        method: 'POST',
        body: { amount: 10 },
      })
    ).rejects.toThrow();

    // Toggle auto-explore
    const autoRes = await pb.send<any>('/api/kingdoms/toggle-auto-explore', {
      method: 'POST',
      body: { autoExplore: 5 },
    });
    expect(autoRes.success).toBe(true);
    expect(autoRes.autoExplore).toBe(5);
  });
});
