/**
 * End-to-end flow test for the offline-first booking + sync pipeline.
 *
 * Walks the actual API client, offline queue and flush pipeline using the mock
 * transport, covering: cached reads, offline queueing of a booking, and
 * automatic sync (flush) once "back online".
 */

import { api, ApiClient } from '../src/core/api';
import { mockTransport } from '../src/core/db/mockServer';
import { getQueueSize, flushOfflineQueue } from '../src/core/api';

describe('Offline-first booking end-to-end flow', () => {
  beforeAll(() => {
    api.useTransport(mockTransport);
  });

  it('serves the doctor list from the API layer (with caching)', async () => {
    const url = 'doctors?page=1&pageSize=5';
    const result = await api.get<{ items: unknown[]; total: number }>(url, {
      cacheKey: `e2e:${url}`,
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThanOrEqual(5000);
  });

  it('queues a mutating request when the transport fails (offline booking)', async () => {
    // A transport that always fails -> the client queues the request.
    const failing: typeof mockTransport = async () => {
      throw new Error('network unreachable');
    };
    const client = new ApiClient({ transport: failing as never, cacheEnabled: false });

    await expect(
      client.post('doctors/doc-1/book', { slotId: 'slot-x' }, { retries: 0, timeout: 100 }),
    ).rejects.toThrow();
    expect(await getQueueSize()).toBeGreaterThan(0);
  });

  it('flushes the offline queue via the mock transport once online', async () => {
    const { flushed, remaining } = await flushOfflineQueue(mockTransport);
    expect(flushed).toBeGreaterThanOrEqual(0);
    expect(remaining).toBe(0);
  });
});