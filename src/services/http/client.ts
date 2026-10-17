/**
 * Minimal JSON client for the VIBRA LOOK API: timeouts, the API error envelope, and aborts
 * surfaced as `AbortError` so the session store can tell cancellation from failure.
 */
import { AbortError } from '../types';

/** Base URL of the backend, e.g. https://api.example.com (no trailing slash). Empty → mock services. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

export type ApiErrorCode =
  | 'bad_request'
  | 'not_found'
  | 'selfie_required'
  | 'selfie_exists'
  | 'invalid_image'
  | 'look_rejected'
  | 'limit'
  | 'rate_limited'
  | 'busy'
  | 'not_ready'
  | 'upstream'
  | 'internal'
  | 'network'
  | 'timeout';

export class ApiFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    readonly retriable: boolean,
    readonly details?: unknown,
  ) {
    super(`API ${status} ${code}`);
    this.name = 'ApiFailure';
  }
}

/** One signal that fires on the caller's abort or after `ms`; `timedOut()` tells which. */
export function deadline(ms: number, external?: AbortSignal) {
  const c = new AbortController();
  let timedOut = false;
  const id = setTimeout(() => {
    timedOut = true;
    c.abort();
  }, ms);
  const onAbort = () => c.abort();
  if (external?.aborted) c.abort();
  else external?.addEventListener('abort', onAbort);
  return {
    signal: c.signal,
    timedOut: () => timedOut,
    done: () => {
      clearTimeout(id);
      external?.removeEventListener('abort', onAbort);
    },
  };
}

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortError());
    const onAbort = () => {
      clearTimeout(id);
      reject(new AbortError());
    };
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort);
  });
}

/** Turns a non-2xx body into an `ApiFailure` (tolerates non-JSON bodies from proxies). */
export function failureFrom(status: number, text: string): ApiFailure {
  try {
    const body = JSON.parse(text) as { error?: { code?: ApiErrorCode; retriable?: boolean; details?: unknown } };
    if (body.error?.code) return new ApiFailure(status, body.error.code, body.error.retriable ?? status >= 500, body.error.details);
  } catch {
    // fall through
  }
  return new ApiFailure(status, status >= 500 ? 'upstream' : 'bad_request', status >= 500 || status === 429);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  token?: string;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function request<T>(path: string, { method = 'GET', token, body, signal, timeoutMs = 20_000 }: RequestOptions = {}): Promise<T> {
  const d = deadline(timeoutMs, signal);
  try {
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: d.signal,
      });
    } catch {
      if (signal?.aborted) throw new AbortError();
      throw new ApiFailure(0, d.timedOut() ? 'timeout' : 'network', true);
    }
    const text = await res.text();
    if (!res.ok) throw failureFrom(res.status, text);
    return (text ? JSON.parse(text) : undefined) as T;
  } finally {
    d.done();
  }
}
