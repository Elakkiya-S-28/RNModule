import { logger } from '../logger';
import { storage } from '../db/storage';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  /** Timeout for a single attempt (ms). Default 8000. */
  timeout?: number;
  /** Number of retries for retryable failures. Default 2. */
  retries?: number;
  /** Cache the GET response under this key (enables offline reads). */
  cacheKey?: string;
  /** Max age of a cached response before refetch. Default 5 min. */
  cacheTtlMs?: number;
  /** If true, return cached data on failure (stale-while-revalidate). */
  useCachedOnError?: boolean;
  /** Validator: throws / returns false when the payload shape is wrong. */
  validate?: (data: unknown) => boolean;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(
    message: string,
    opts: {
      status?: number;
      code?: string;
      retryable?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code ?? 'API_ERROR';
    this.retryable = opts.retryable ?? false;
    this.cause = opts.cause;
  }
}

export const ApiErrorCodes = {
  TIMEOUT: 'TIMEOUT',
  NETWORK: 'NETWORK',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  RATE_LIMIT: 'RATE_LIMIT',
  NOT_FOUND: 'NOT_FOUND',
  FAILURE: 'FAILURE',
} as const;

export interface CachedEnvelope<T> {
  data: T;
  ts: number;
}

type SessionHandler = (reason: string) => void;
let sessionHandler: SessionHandler | null = null;
export function setSessionExpiryHandler(handler: SessionHandler | null): void {
  sessionHandler = handler;
}

// ---- Transport --------------------------------------------------------------------------------

export type TransportResponse = {
  status: number;
  ok: boolean;
  /** Unknown so validation is down to the caller. */
  data: unknown;
  headers?: Record<string, string>;
};

export type Transport = (
  url: string,
  method: HttpMethod,
  headers: Record<string, string>,
  body?: unknown,
) => Promise<TransportResponse>;

/** Placeholder transport that always fails — swap with a real fetch-based impl. */
export const defaultTransport: Transport = async () => {
  throw new ApiError('No transport configured', {
    code: ApiErrorCodes.NETWORK,
    retryable: true,
  });
};

// Offline-first support --------------------------------------------------------------------------

let offlineHandler:
  | ((on: { offline: boolean; queued?: number }) => void)
  | null = null;

export function setConnectivityHandler(
  handler: ((on: { offline: boolean; queued?: number }) => void) | null,
): void {
  offlineHandler = handler;
}

const queueKey = 'api/offline-queue';
interface QueuedRequest {
  id: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
  ts: number;
}

async function readQueue(): Promise<QueuedRequest[]> {
  return (await storage.getJSON<QueuedRequest[]>(queueKey)) ?? [];
}

export async function getQueueSize(): Promise<number> {
  return (await readQueue()).length;
}

async function enqueue(req: Omit<QueuedRequest, 'id' | 'ts'>): Promise<void> {
  const queue = await readQueue();
  queue.push({ ...req, id: `${Date.now()}-${Math.random()}`, ts: Date.now() });
  await storage.setJSON(queueKey, queue);
  offlineHandler?.({ offline: true, queued: queue.length });
}

async function dequeueAll(): Promise<QueuedRequest[]> {
  const queue = await readQueue();
  await storage.setJSON(queueKey, []);
  return queue;
}

/**
 * Flush the offline queue. Called when connectivity returns. Mutating requests
 * are replayed against the transport; failures are re-queued.
 */
export async function flushOfflineQueue(
  transport: Transport = defaultTransport,
): Promise<{ flushed: number; remaining: number }> {
  const queued = await dequeueAll();
  let flushed = 0;
  const failed: QueuedRequest[] = [];
  for (const req of queued) {
    try {
      const headers = { 'content-type': 'application/json', ...req.headers };
      await transport(req.url, req.method, headers, req.body);
      flushed++;
    } catch {
      failed.push(req);
    }
  }
  if (failed.length > 0) {
    await storage.setJSON(queueKey, failed);
  }
  offlineHandler?.({ offline: failed.length > 0, queued: failed.length });
  return { flushed, remaining: failed.length };
}

// ---------------------------------------------------------------------------------------------------

/** Simulate variable network latency (mock-data realism). */
function simulateNetwork(): Promise<void> {
  const latency = 100 + Math.random() * 1300;
  return new Promise(resolve => setTimeout(resolve, latency));
}

function wait(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new ApiError(`Request timed out: ${label}`, {
            code: ApiErrorCodes.TIMEOUT,
            retryable: true,
          }),
        ),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const RETRYABLE_CODES = new Set<string>([
  ApiErrorCodes.TIMEOUT,
  ApiErrorCodes.NETWORK,
  ApiErrorCodes.RATE_LIMIT,
  ApiErrorCodes.FAILURE,
]);

const DEFAULT_TTL = 5 * 60 * 1000;

async function readCache<T>(key: string, ttlMs: number): Promise<T | null> {
  const entry = await storage.getJSON<CachedEnvelope<T>>(`cache/${key}`);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) return null;
  return entry.data;
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  await storage.setJSON(`cache/${key}`, { data, ts: Date.now() });
}

export class ApiClient {
  transport: Transport;
  readonly cacheEnabled: boolean;

  constructor(opts: { transport?: Transport; cacheEnabled?: boolean } = {}) {
    this.transport = opts.transport ?? defaultTransport;
    this.cacheEnabled = opts.cacheEnabled ?? true;
  }

  /** Swap the underlying transport (e.g. point at the mock server or a real backend). */
  useTransport(transport: Transport): this {
    this.transport = transport;
    return this;
  }

  async request<T>(url: string, cfg: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 8000,
      retries = 2,
      cacheKey,
      cacheTtlMs = DEFAULT_TTL,
      useCachedOnError = true,
      validate,
    } = cfg;

    const fullHeaders = { 'content-type': 'application/json', ...headers };
    const freshCacheKey = method === 'GET' && cacheKey ? cacheKey : undefined;

    // Offline-first: serve fresh cache on the fast path for GETs.
    if (freshCacheKey) {
      const cached = await readCache<T>(freshCacheKey, cacheTtlMs);
      if (cached !== null) {
        logger.debug(`Cache hit: ${freshCacheKey}`);
        return cached;
      }
    }

    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const responsePromise = simulateNetwork().then(() =>
          this.transport(url, method, fullHeaders, body),
        );
        const response = await withTimeout(responsePromise, timeout, url);

        if (response.status === 401 || response.status === 403) {
          sessionHandler?.('Session expired or unauthorized');
          throw new ApiError('Unauthorized', {
            status: response.status,
            code: ApiErrorCodes.UNAUTHORIZED,
          });
        }
        if (response.status === 404) {
          throw new ApiError('Not found', {
            status: 404,
            code: ApiErrorCodes.NOT_FOUND,
          });
        }
        if (response.status === 429) {
          throw new ApiError('Rate limited', {
            status: 429,
            code: ApiErrorCodes.RATE_LIMIT,
            retryable: true,
          });
        }
        if (!response.ok || response.status >= 500) {
          throw new ApiError(`Request failed (${response.status})`, {
            status: response.status,
            code: ApiErrorCodes.FAILURE,
            retryable: true,
          });
        }

        if (validate) {
          try {
            validate(response.data);
          } catch {
            throw new ApiError('Invalid response payload', {
              code: ApiErrorCodes.INVALID_RESPONSE,
            });
          }
        }

        const data = response.data as T;
        if (freshCacheKey) {
          await writeCache(freshCacheKey, data);
        }
        return data;
      } catch (err) {
        const apiErr =
          err instanceof ApiError
            ? err
            : new ApiError('Request error', {
                code: ApiErrorCodes.NETWORK,
                retryable: true,
                cause: err,
              });

        if (!apiErr.retryable || !RETRYABLE_CODES.has(apiErr.code)) {
          if (freshCacheKey && useCachedOnError) {
            const stale = await readCache<T>(freshCacheKey, Number.MAX_SAFE_INTEGER);
            if (stale !== null) {
              logger.warn(`Using stale cache for ${url}`);
              return stale;
            }
          }
          throw apiErr;
        }

        if (attempt < retries) {
          attempt++;
          await wait(300 * Math.pow(2, attempt - 1));
          logger.warn(`Retrying ${url} (attempt ${attempt}/${retries})`);
          continue;
        }

        if (freshCacheKey && useCachedOnError) {
          const stale = await readCache<T>(freshCacheKey, Number.MAX_SAFE_INTEGER);
          if (stale !== null) {
            logger.warn(`Using stale cache for ${url} after retries`);
            return stale;
          }
        }

        // Offline: queue mutating requests for later sync.
        if (method !== 'GET') {
          await enqueue({ url, method, headers: fullHeaders, body });
          logger.warn(`Queued offline ${method} ${url}`);
          throw new ApiError(`Queued for offline sync: ${url}`, { code: 'QUEUED_OFFLINE' });
        }

        throw apiErr;
      }
    }
  }

  async get<T>(url: string, cfg: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...cfg, method: 'GET' });
  }

  async post<T>(
    url: string,
    body?: unknown,
    cfg: Omit<RequestConfig, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(url, { ...cfg, method: 'POST', body });
  }

  async put<T>(
    url: string,
    body?: unknown,
    cfg: Omit<RequestConfig, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(url, { ...cfg, method: 'PUT', body });
  }

  async delete<T>(url: string, cfg: Omit<RequestConfig, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...cfg, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;