import { describe, it, expect } from 'vitest';
import { createClient, createAdminClient } from '../setup/helpers';

describe('Game Round Lifecycle API', () => {
  it('resets round ticks, increments round number, and clears all existing kingdoms', async () => {
    const pb = createClient();
    const adminPb = await createAdminClient();

    // 1. Populate some test kingdoms
    const popRes = await pb.send<any>('/api/game/populate', {
      method: 'POST',
    });
    expect(popRes.success).toBe(true);
    expect(popRes.added).toBe(1000);

    // 2. Verify kingdoms exist in db and status reflects this
    const kingdomsBefore = await adminPb.collection('kingdoms').getList(1, 20);
    expect(kingdomsBefore.totalItems).toBeGreaterThanOrEqual(1000);

    const statusBefore = await pb.send<any>('/api/game/status', {
      method: 'GET',
    });
    expect(statusBefore.kingdomCount).toBeGreaterThanOrEqual(1000);
    const initialRound = statusBefore.roundNumber;

    // 3. Trigger restart
    const restartRes = await pb.send<any>('/api/game/restart', {
      method: 'POST',
    });
    expect(restartRes.success).toBe(true);

    // 4. Verify status after restart: tick 0, round incremented, 0 kingdoms
    const statusAfter = await pb.send<any>('/api/game/status', {
      method: 'GET',
    });
    expect(statusAfter.currentTick).toBe(0);
    expect(statusAfter.roundNumber).toBe(initialRound + 1);
    expect(statusAfter.kingdomCount).toBe(0);

    // 5. Verify database collection is actually empty
    const kingdomsAfter = await adminPb.collection('kingdoms').getList(1, 20);
    expect(kingdomsAfter.totalItems).toBe(0);
  });

  it('advances simulation tick and processes all active kingdoms', async () => {
    const pb = createClient();
    const adminPb = await createAdminClient();

    // Populate test kingdoms
    await pb.send<any>('/api/game/populate', { method: 'POST' });

    // Fetch initial sample kingdom
    const sampleBefore = (await adminPb.collection('kingdoms').getList(1, 1)).items[0];
    const moneyBefore = sampleBefore.money;

    // Advance 1 tick
    const tickRes = await pb.send<any>('/api/game/advance-tick', {
      method: 'POST',
    });

    expect(tickRes.success).toBe(true);
    expect(tickRes.currentTick).toBe(1);
    expect(tickRes.processedCount).toBeGreaterThanOrEqual(1000);
    expect(tickRes.executionTimeMs).toBeGreaterThan(0);

    // Verify game status reflects tick 1
    const status = await pb.send<any>('/api/game/status', { method: 'GET' });
    expect(status.currentTick).toBe(1);

    // Verify sample kingdom processed tick logic (population economics and auto-growth exploration)
    const sampleAfter = (await adminPb.collection('kingdoms').getList(1, 1)).items[0];
    expect(sampleAfter.population).toBe(2363);
    expect(sampleAfter.popChange).toBe(113);
    expect(sampleAfter.money).toBeGreaterThan(0);
    expect(sampleAfter.landQueue.length).toBeGreaterThan(0);
  });
});
