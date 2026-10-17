/**
 * Dev-only knobs for the Phase 1 mock, so every UI state can be reached on demand
 * (variant failure, invalid selfie, slow provider…). Exposed in the dev gallery.
 */
import type { SelfieIssue, VariantKey } from '@/domain/types';

export interface MockSettings {
  /** Random latency range per render job, ms. */
  renderLatency: [number, number];
  translateLatency: number;
  /** Fail this variant's next render (consumed on use, so "retry" succeeds). */
  failVariantOnce: VariantKey | null;
  /** Fail the next translation call (consumed on use). */
  failTranslateOnce: boolean;
  /** Fail the next edit render (consumed on use). */
  failEditOnce: boolean;
  /** Next selfie check returns this issue (consumed on use). */
  selfieIssueOnce: SelfieIssue | null;
}

const settings: MockSettings = {
  renderLatency: [1800, 4200],
  translateLatency: 1400,
  failVariantOnce: null,
  failTranslateOnce: false,
  failEditOnce: false,
  selfieIssueOnce: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function getMockSettings(): Readonly<MockSettings> {
  return settings;
}

export function updateMockSettings(patch: Partial<MockSettings>): void {
  Object.assign(settings, patch);
  listeners.forEach((l) => l());
}

export function subscribeMockSettings(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Read-and-clear helper for the `*Once` flags. */
export function consume<K extends keyof MockSettings>(key: K, reset: MockSettings[K]): MockSettings[K] {
  const value = settings[key];
  settings[key] = reset;
  listeners.forEach((l) => l());
  return value;
}
