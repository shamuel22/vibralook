/**
 * Session store: reducer + async orchestration over the service contracts.
 *
 * Invariants enforced here (brief §6–§8):
 *  - Every render starts from the ORIGINAL selfie (`state.sourceImage`), never a result.
 *  - The three variant renders are independent: one failing never clears the others.
 *  - A confirmed edit is validated against constraints/kit BEFORE rendering (no units spent).
 *  - Text, palette and steps of an edit are regenerated from the same recipe that is rendered.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { recipeViolations, type Violation } from '@/domain/constraints';
import type { LookRecipe, SessionState, SourceImage, VariantKey } from '@/domain/types';
import { useI18n } from '@/i18n';
import { AbortError, services, type TranslateInput } from '@/services';

import { initialSession, reducer, type Action } from './reducer';

function newSessionId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isAbort(e: unknown): boolean {
  return e instanceof AbortError || (e instanceof Error && e.name === 'AbortError');
}

export interface SessionActions {
  dispatch: (a: Action) => void;
  /** Runs the selfie check on the prepared image. */
  submitSelfie: (image: Omit<SourceImage, 'check'>) => Promise<void>;
  /** Translate intent → 3 recipes, then start three independent renders. */
  startLooks: () => Promise<void>;
  retryVariant: (variant: VariantKey) => Promise<void>;
  /** Validate, describe and render the current draft. Returns violations if blocked. */
  applyDraft: () => Promise<Violation[]>;
  /** Abandon an in-flight edit; the last valid look stays. */
  cancelEdit: () => void;
  /** Abort in-flight translation and renders (keeps intent, selfie and kit). */
  cancelInFlight: () => void;
  startOver: () => void;
}

interface SessionContextValue {
  state: SessionState;
  actions: SessionActions;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [state, dispatch] = useReducer(reducer, undefined, () => initialSession(newSessionId()));

  // Async flows need the latest state without re-creating callbacks.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const controllers = useRef(new Set<AbortController>());
  const track = useCallback((external?: AbortSignal) => {
    const c = new AbortController();
    external?.addEventListener('abort', () => c.abort());
    controllers.current.add(c);
    return { signal: c.signal, done: () => controllers.current.delete(c) };
  }, []);
  const abortAll = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
  }, []);

  /**
   * Generation of the current inputs (selfie + intent + kit → looks). Any async completion
   * from an older generation is dropped, so a late result can never overwrite newer work.
   */
  const generation = useRef(0);
  const invalidate = useCallback(() => {
    generation.current += 1;
    abortAll();
  }, [abortAll]);

  /** Edit operations: a synchronous lock plus an id, so a double tap or a stale edit can't land. */
  const editOp = useRef(0);
  const editBusy = useRef(false);
  const editAbort = useRef<AbortController | null>(null);
  const cancelEditOp = useCallback(() => {
    editOp.current += 1;
    editBusy.current = false;
    editAbort.current?.abort();
    editAbort.current = null;
  }, []);

  /** Dispatch used by screens: actions that change the generation inputs cancel obsolete work first. */
  const guardedDispatch = useCallback(
    (a: Action) => {
      if (
        a.type === 'looks/reset' ||
        a.type === 'selfie/set' ||
        a.type === 'selfie/clear' ||
        a.type === 'session/reset'
      ) {
        cancelEditOp();
        invalidate();
      } else if (a.type === 'looks/choose') {
        cancelEditOp();
      }
      dispatch(a);
    },
    [cancelEditOp, invalidate],
  );

  const translateInput = useCallback((): TranslateInput => {
    const s = stateRef.current;
    return { intent: s.userIntent, constraints: s.constraints, kit: s.kit, locale: localeRef.current, source: s.sourceImage };
  }, []);

  const renderOne = useCallback(
    async (recipe: LookRecipe, kind: 'variant' | 'edit', gen: number, external?: AbortSignal) => {
      const source = stateRef.current.sourceImage;
      if (!source) throw new Error('No source image');
      const current = () => gen === generation.current;
      const { signal, done } = track(external);
      try {
        const { constraints, kit } = stateRef.current;
        const job = await services.render.render(
          { source, recipe, kind, constraints, kit },
          (status) => {
            if (current()) dispatch({ type: 'render/status', recipeId: recipe.id, status });
          },
          signal,
        );
        if (!current()) return null;
        dispatch({ type: 'render/done', job });
        return job;
      } catch (e) {
        if (isAbort(e) || !current()) return null;
        const job = {
          recipeId: recipe.id,
          status: 'error' as const,
          error: { code: 'network' as const, retriable: true },
          simulated: false,
        };
        dispatch({ type: 'render/done', job });
        return job;
      } finally {
        done();
      }
    },
    [track],
  );

  const submitSelfie = useCallback(
    async (image: Omit<SourceImage, 'check'>) => {
      const withCheck: SourceImage = { ...image, check: { status: 'checking' } };
      guardedDispatch({ type: 'selfie/set', image: withCheck });
      const gen = generation.current;
      const { signal, done } = track();
      try {
        const result = await services.selfie.check(withCheck, signal);
        if (gen === generation.current) dispatch({ type: 'selfie/checked', result });
      } catch (e) {
        if (!isAbort(e) && gen === generation.current)
          dispatch({ type: 'selfie/checked', result: { status: 'invalid', issue: 'unsupported' } });
      } finally {
        done();
      }
    },
    [guardedDispatch, track],
  );

  const startLooks = useCallback(async () => {
    cancelEditOp();
    invalidate();
    const gen = generation.current;
    dispatch({ type: 'translate/start' });
    const { signal, done } = track();
    let variants: LookRecipe[];
    try {
      variants = await services.vibe.translate(translateInput(), signal);
    } catch (e) {
      if (!isAbort(e) && gen === generation.current) dispatch({ type: 'translate/error', retriable: true });
      return;
    } finally {
      done();
    }
    if (gen !== generation.current) return;
    dispatch({ type: 'translate/success', variants });
    // Independent jobs: results arrive in any order and render as they come.
    await Promise.all(variants.map((v) => renderOne(v, 'variant', gen)));
  }, [cancelEditOp, invalidate, renderOne, track, translateInput]);

  const retryVariant = useCallback(
    async (variant: VariantKey) => {
      const recipe = stateRef.current.variants.find((v) => v.variant === variant);
      if (recipe) await renderOne(recipe, 'variant', generation.current);
    },
    [renderOne],
  );

  const applyDraft = useCallback(async (): Promise<Violation[]> => {
    // Synchronous lock: a second tap before React re-renders is a no-op.
    if (editBusy.current) return [];
    const s = stateRef.current;
    const draft = s.draftRecipe;
    if (!draft || !s.selectedRecipe || s.edit.applyingId) return [];
    const violations = recipeViolations(draft, s.constraints, s.kit);
    if (violations.length > 0) return violations;

    editBusy.current = true;
    const op = ++editOp.current;
    const gen = generation.current;
    const stale = () => op !== editOp.current || gen !== generation.current;
    const abort = new AbortController();
    editAbort.current = abort;
    // Lock the editor for the whole operation (describe + render), not only the render.
    dispatch({ type: 'edit/applyStart', recipe: draft });
    const { signal, done } = track(abort.signal);
    try {
      const text = await services.vibe.describe(draft, translateInput(), signal);
      if (stale()) return [];
      const described: LookRecipe = { ...draft, ...text };
      dispatch({ type: 'edit/described', recipe: described });
      const job = await renderOne(described, 'edit', gen, abort.signal);
      if (stale()) return [];
      if (job?.status === 'success') dispatch({ type: 'edit/applySuccess', recipe: described });
      else if (job) dispatch({ type: 'edit/applyError' });
    } catch (e) {
      if (!isAbort(e) && !stale()) dispatch({ type: 'edit/applyError' });
    } finally {
      done();
      if (op === editOp.current) {
        editBusy.current = false;
        editAbort.current = null;
      }
    }
    return [];
  }, [renderOne, track, translateInput]);

  /** Abandon an in-flight edit (e.g. leaving the editor); the last valid look stays. */
  const cancelEdit = useCallback(() => {
    if (!editBusy.current && !stateRef.current.edit.applyingId) return;
    cancelEditOp();
    dispatch({ type: 'edit/cancelApply' });
  }, [cancelEditOp]);

  const cancelInFlight = useCallback(() => {
    cancelEditOp();
    invalidate();
    dispatch({ type: 'session/cancelRenders' });
  }, [cancelEditOp, invalidate]);

  const startOver = useCallback(() => {
    services.endSession();
    guardedDispatch({ type: 'session/reset', sessionId: newSessionId() });
  }, [guardedDispatch]);

  useEffect(() => {
    const set = controllers.current;
    return () => set.forEach((c) => c.abort());
  }, []);

  // Language switch: regenerate the text of every stored recipe in the new language.
  // Recipe ids (and therefore their images) don't change; only tagline, explanation and steps.
  const lastLocale = useRef(locale);
  useEffect(() => {
    if (lastLocale.current === locale) return;
    lastLocale.current = locale;
    const s = stateRef.current;
    const all = [...s.variants, s.selectedRecipe, s.previousRecipe, s.finalRecipe, s.draftRecipe];
    const recipes = [...new Map(all.filter((r): r is LookRecipe => r !== null).map((r) => [r.id, r])).values()];
    if (recipes.length === 0) return;
    const gen = generation.current;
    const input: TranslateInput = { ...translateInput(), locale };
    Promise.all(recipes.map(async (r) => [r.id, await services.vibe.describe(r, input)] as const))
      .then((entries) => {
        if (gen === generation.current) dispatch({ type: 'recipes/retext', texts: Object.fromEntries(entries) });
      })
      .catch(() => {});
  }, [locale, translateInput]);

  const actions = useMemo<SessionActions>(
    () => ({
      dispatch: guardedDispatch,
      submitSelfie,
      startLooks,
      retryVariant,
      applyDraft,
      cancelEdit,
      cancelInFlight,
      startOver,
    }),
    [guardedDispatch, submitSelfie, startLooks, retryVariant, applyDraft, cancelEdit, cancelInFlight, startOver],
  );
  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
