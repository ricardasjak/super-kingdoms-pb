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
