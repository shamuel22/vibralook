/**
 * Backend implementations of the service contracts (Phase 2). Same contracts as the mock, so
 * screens and the session store do not change. Renders report the provider's real states and
 * the result is downloaded to the app cache (the image never has a public URL).
 */
import { File, Paths } from 'expo-file-system';

import { VARIANTS, type LookRecipe, type RenderErrorCode, type RenderJob, type RenderStatus } from '@/domain/types';

import { AbortError, type RecipeText, type RenderService, type SelfieService, type VibeService } from '../types';
import { API_URL, ApiFailure, request, wait } from './client';
import { SelfieRejected, sessionFor, withSession } from './remote';

const POLL_MS = 1_500;
/** Client-side ceiling per render, above the backend's own 90 s provider timeout. */
const RENDER_TIMEOUT_MS = 120_000;
/** Consecutive failed polls tolerated before reporting a network error. */
const MAX_POLL_FAILURES = 4;

function isAbort(e: unknown): boolean {
  return e instanceof AbortError || (e instanceof Error && e.name === 'AbortError');
}

export const httpVibeService: VibeService = {
  async translate(input, signal) {
    if (!input.source) throw new Error('No selfie in session');
    const { intent, constraints, kit, locale } = input;
    const { variants } = await withSession(input.source, signal, (r) =>
      request<{ variants: LookRecipe[] }>(`/v1/sessions/${r.id}/looks`, {
        method: 'POST',
        token: r.token,
        body: { intent, constraints, kit, locale },
        signal,
        // Up to two model attempts on the backend.
        timeoutMs: 60_000,
      }),
    );
    if (!Array.isArray(variants) || variants.map((v) => v.variant).join() !== VARIANTS.join()) {
      throw new Error('Unexpected looks response');
    }
    return variants;
  },

  async describe(recipe, input, signal) {
    if (!input.source) throw new Error('No selfie in session');
    const { intent, constraints, kit, locale } = input;
    return withSession(input.source, signal, (r) =>
      request<RecipeText>(`/v1/sessions/${r.id}/describe`, {
        method: 'POST',
        token: r.token,
        body: { recipe, intent, constraints, kit, locale },
        signal,
        timeoutMs: 30_000,
      }),
    );
  },
};

interface RenderView {
  recipeId: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: { code: RenderErrorCode; retriable: boolean };
}

function errorJob(recipeId: string, code: RenderErrorCode, retriable: boolean): RenderJob {
  return { recipeId, status: 'error', error: { code, retriable }, simulated: false };
}

/** API failure → what the render card can tell the person. */
function failureJob(recipeId: string, e: ApiFailure): RenderJob {
  switch (e.code) {
    case 'limit':
      return errorJob(recipeId, 'limit', false);
    case 'network':
    case 'rate_limited':
      return errorJob(recipeId, 'network', true);
    case 'timeout':
      return errorJob(recipeId, 'timeout', true);
    case 'look_rejected':
    case 'bad_request':
      return errorJob(recipeId, 'provider', false);
    default:
      return errorJob(recipeId, 'provider', e.retriable);
  }
}

export const httpRenderService: RenderService = {
  async render({ source, recipe, constraints, kit }, onStatus, signal) {
    const emit = (s: RenderStatus) => onStatus(s);
    emit('pending');
    const startedAt = Date.now();
    try {
      return await withSession(source, signal, async (r) => {
        let view = await request<RenderView>(`/v1/sessions/${r.id}/renders`, {
          method: 'POST',
          token: r.token,
          body: { recipe, constraints, kit },
          signal,
        });
        let failures = 0;
        while (view.status === 'pending' || view.status === 'processing') {
          emit(view.status);
          if (Date.now() - startedAt > RENDER_TIMEOUT_MS) return errorJob(recipe.id, 'timeout', true);
          await wait(POLL_MS, signal);
          try {
            view = await request<RenderView>(`/v1/sessions/${r.id}/renders/${recipe.id}`, { token: r.token, signal, timeoutMs: 10_000 });
            failures = 0;
          } catch (e) {
            if (!(e instanceof ApiFailure) || !e.retriable || ++failures > MAX_POLL_FAILURES) throw e;
          }
        }
        if (view.status === 'error') {
          const job = errorJob(recipe.id, view.error?.code ?? 'provider', view.error?.retriable ?? true);
          emit('error');
          return job;
        }
        // Download into the app cache with the session token; the screens only see a local file.
        const file = new File(Paths.cache, `vibralook-${r.id}-${recipe.id}.jpg`);
        const saved = await File.downloadFileAsync(`${API_URL}/v1/sessions/${r.id}/renders/${recipe.id}/image`, file, {
          headers: { Authorization: `Bearer ${r.token}` },
          idempotent: true,
          signal,
        });
        emit('success');
        return { recipeId: recipe.id, status: 'success', imageUri: saved.uri, simulated: false } satisfies RenderJob;
      });
    } catch (e) {
      if (isAbort(e) || signal?.aborted) throw new AbortError();
      const job = e instanceof ApiFailure ? failureJob(recipe.id, e) : errorJob(recipe.id, 'network', true);
      emit('error');
      return job;
    }
  },
};

export const httpSelfieService: SelfieService = {
  async check(image, signal) {
    try {
      await sessionFor(image, signal);
      return { status: 'valid' };
    } catch (e) {
      if (isAbort(e)) throw e;
      if (e instanceof SelfieRejected) return { status: 'invalid', issue: e.issue };
      // Backend unreachable: the photo itself is fine. The upload is retried on first use,
      // and translation reports the connection problem with its own retry.
      return { status: 'valid' };
    }
  },
};
