/**
 * Phase 1 mock of the YouCam render pipeline. It reports the same asynchronous states the
 * real provider will (pending → processing → success | error) but DOES NOT draw makeup:
 * the "result" is the original selfie with `simulated: true`, and the UI shows a seal.
 */
import type { RenderJob, RenderStatus } from '@/domain/types';

import { AbortError, type RenderService, type SelfieService } from '../types';
import { consume, consumeVariantFailure, getMockSettings } from './settings';

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortError());
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new AbortError());
    });
  });
}

function between([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}

export const mockRenderService: RenderService = {
  async render({ source, recipe, kind }, onStatus, signal) {
    const emit = (s: RenderStatus) => onStatus(s);
    emit('pending');
    await wait(250 + Math.random() * 500, signal);
    emit('processing');
    await wait(between(getMockSettings().renderLatency), signal);

    const fail = kind === 'edit' ? consume('failEditOnce', false) : consumeVariantFailure(recipe.variant);

    const job: RenderJob = fail
      ? { recipeId: recipe.id, status: 'error', error: { code: 'provider', retriable: true }, simulated: true }
      : { recipeId: recipe.id, status: 'success', imageUri: source.uri, simulated: true };
    emit(job.status);
    return job;
  },
};

export const mockSelfieService: SelfieService = {
  async check(_image, signal) {
    await wait(900, signal);
    const issue = consume('selfieIssueOnce', null);
    return issue ? { status: 'invalid', issue } : { status: 'valid' };
  },
};
