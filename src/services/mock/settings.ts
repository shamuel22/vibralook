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
  /** Independent one-shot failures; select all three for the all-failed fixture. */
  failVariantsOnce: Partial<Record<VariantKey, boolean>>;
  /** Fail the next translation call (consumed on use). */
  failTranslateOnce: boolean;
  /** Fail the next edit render (consumed on use). */
  failEditOnce: boolean;
  /** Next selfie check returns this issue (consumed on use). */
  selfieIssueOnce: SelfieIssue | null;
}

let settings: MockSettings = {
  renderLatency: [1800, 4200],
  translateLatency: 1400,
  failVariantOnce: null,
  failVariantsOnce: {},
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
  if (Object.entries(patch).every(([key, value]) => Object.is(settings[key as keyof MockSettings], value))) return;
  settings = { ...settings, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeMockSettings(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Read-and-clear helper for the `*Once` flags. */
export function consume<K extends keyof MockSettings>(key: K, reset: MockSettings[K]): MockSettings[K] {
  const value = settings[key];
  if (!Object.is(value, reset)) {
    settings = { ...settings, [key]: reset };
    listeners.forEach((l) => l());
  }
  return value;
}

export function consumeVariantFailure(variant: VariantKey): boolean {
  const mapped = settings.failVariantsOnce[variant] === true;
  const single = settings.failVariantOnce === variant;
  if (!mapped && !single) return false;
  updateMockSettings({
    failVariantsOnce: { ...settings.failVariantsOnce, [variant]: false },
    failVariantOnce: single ? null : settings.failVariantOnce,
  });
  return true;
}
