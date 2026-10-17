/**
 * The backend session that holds the current selfie. One remote session per selfie: a new
 * photo opens a new session and closes the previous one (its provider tasks and files are
 * deleted server-side). If the backend forgot the session (expired, restarted), callers drop
 * it and `sessionFor` transparently opens a new one by uploading the same local selfie again.
 */
import { File, UploadType } from 'expo-file-system';

import type { SelfieIssue, SourceImage } from '@/domain/types';

import { AbortError } from '../types';
import { API_URL, ApiFailure, deadline, failureFrom, request } from './client';

export interface Remote {
  id: string;
  token: string;
  /** Local selfie this session was opened for. */
  uri: string;
}

/** The backend refused the image itself (format, size); the person can pick another photo. */
export class SelfieRejected extends Error {
  constructor(readonly issue: SelfieIssue) {
    super(`Selfie rejected: ${issue}`);
    this.name = 'SelfieRejected';
  }
}

const UPLOAD_TIMEOUT_MS = 45_000;
const ISSUES: readonly SelfieIssue[] = ['noFace', 'multipleFaces', 'tooDark', 'tooSmall', 'unsupported'];

let current: Remote | null = null;
let opening: { uri: string; promise: Promise<Remote> } | null = null;

async function open(uri: string): Promise<Remote> {
  const created = await request<{ sessionId: string; token: string }>('/v1/sessions', { method: 'POST' });
  const remote: Remote = { id: created.sessionId, token: created.token, uri };
  const d = deadline(UPLOAD_TIMEOUT_MS);
  try {
    const result = await new File(uri).upload(`${API_URL}/v1/sessions/${remote.id}/selfie`, {
      httpMethod: 'PUT',
      uploadType: UploadType.BINARY_CONTENT,
      mimeType: 'image/jpeg',
      headers: { Authorization: `Bearer ${remote.token}`, 'Content-Type': 'image/jpeg' },
      sessionType: 'foreground',
      signal: d.signal,
    });
    if (result.status < 200 || result.status >= 300) {
      const failure = failureFrom(result.status, result.body);
      const issue = (failure.details as { issue?: SelfieIssue } | undefined)?.issue;
      if (failure.code === 'invalid_image') throw new SelfieRejected(issue && ISSUES.includes(issue) ? issue : 'unsupported');
      throw failure;
    }
    return remote;
  } catch (e) {
    void close(remote);
    if (e instanceof SelfieRejected || e instanceof ApiFailure) throw e;
    throw new ApiFailure(0, d.timedOut() ? 'timeout' : 'network', true);
  } finally {
    d.done();
  }
}

/** Resolves the session for this selfie, opening (and uploading) it once if needed. */
export async function sessionFor(source: SourceImage, signal?: AbortSignal): Promise<Remote> {
  if (signal?.aborted) throw new AbortError();
  if (current?.uri === source.uri) return current;
  if (!opening || opening.uri !== source.uri) {
    const previous = current;
    current = null;
    const promise = open(source.uri).then((remote) => {
      // Only the latest selfie's session becomes current.
      if (opening?.promise === promise) {
        current = remote;
        opening = null;
        if (previous) void close(previous);
      } else {
        void close(remote);
      }
      return remote;
    });
    promise.catch(() => {
      if (opening?.promise === promise) opening = null;
    });
    opening = { uri: source.uri, promise };
  }
  // The shared upload keeps going for other callers; this caller just stops waiting.
  const shared = opening.promise;
  if (!signal) return shared;
  return new Promise<Remote>((resolve, reject) => {
    const onAbort = () => reject(new AbortError());
    signal.addEventListener('abort', onAbort);
    shared.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

/** Forget a session the backend no longer knows; the next call opens a new one. */
export function drop(remote: Remote): void {
  if (current === remote) current = null;
}

export async function close(remote: Remote): Promise<void> {
  drop(remote);
  await request(`/v1/sessions/${remote.id}`, { method: 'DELETE', token: remote.token, timeoutMs: 8_000 }).catch(() => undefined);
}

/**
 * Runs `fn` on the selfie's session; if the backend lost it (`not_found`), opens a new session
 * once — re-uploading the same selfie — and runs `fn` again.
 */
export async function withSession<T>(source: SourceImage, signal: AbortSignal | undefined, fn: (r: Remote) => Promise<T>): Promise<T> {
  const remote = await sessionFor(source, signal);
  try {
    return await fn(remote);
  } catch (e) {
    if (!(e instanceof ApiFailure) || e.code !== 'not_found') throw e;
    drop(remote);
    return fn(await sessionFor(source, signal));
  }
}

/** Closes the current session (e.g. "Start over"); a later call opens a new one. */
export function endCurrent(): void {
  opening = null;
  if (current) void close(current);
}
