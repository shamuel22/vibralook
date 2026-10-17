/**
 * Session store: reducer + async orchestration over the service contracts.
 *
 * Invariants enforced here (brief §6–§8):
 *  - Every render starts from the ORIGINAL selfie (`state.sourceImage`), never a result.
 *  - The three variant renders are independent: one failing never clears the others.
 *  - A confirmed edit is validated against constraints/kit BEFORE rendering (no units spent).
 *  - Text, palette and steps of an edit are regenerated from the same recipe that is rendered.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';

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
  const track = useCallback(() => {
    const c = new AbortController();
    controllers.current.add(c);
    return { signal: c.signal, done: () => controllers.current.delete(c) };
  }, []);

  const translateInput = useCallback((): TranslateInput => {
    const s = stateRef.current;
    return { intent: s.userIntent, constraints: s.constraints, kit: s.kit, locale: localeRef.current };
  }, []);

  const renderOne = useCallback(
    async (recipe: LookRecipe, kind: 'variant' | 'edit') => {
      const source = stateRef.current.sourceImage;
      if (!source) throw new Error('No source image');
      const { signal, done } = track();
      try {
        const job = await services.render.render(
          { source, recipe, kind },
          (status) => dispatch({ type: 'render/status', recipeId: recipe.id, status }),
          signal,
        );
        dispatch({ type: 'render/done', job });
        return job;
      } catch (e) {
        if (isAbort(e)) return null;
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
      dispatch({ type: 'selfie/set', image: withCheck });
      const { signal, done } = track();
      try {
        const result = await services.selfie.check(withCheck, signal);
        dispatch({ type: 'selfie/checked', result });
      } catch (e) {
        if (!isAbort(e)) dispatch({ type: 'selfie/checked', result: { status: 'invalid', issue: 'unsupported' } });
      } finally {
        done();
      }
    },
    [track],
  );

  const startLooks = useCallback(async () => {
    dispatch({ type: 'translate/start' });
    const { signal, done } = track();
    let variants: LookRecipe[];
    try {
      variants = await services.vibe.translate(translateInput(), signal);
    } catch (e) {
      if (!isAbort(e)) dispatch({ type: 'translate/error', retriable: true });
      return;
    } finally {
      done();
    }
    dispatch({ type: 'translate/success', variants });
    // Independent jobs: results arrive in any order and render as they come.
    await Promise.all(variants.map((v) => renderOne(v, 'variant')));
  }, [renderOne, track, translateInput]);

  const retryVariant = useCallback(
    async (variant: VariantKey) => {
      const recipe = stateRef.current.variants.find((v) => v.variant === variant);
      if (recipe) await renderOne(recipe, 'variant');
    },
    [renderOne],
  );

  const applyDraft = useCallback(async (): Promise<Violation[]> => {
    const s = stateRef.current;
    const draft = s.draftRecipe;
    if (!draft || s.edit.applyingId) return [];
    const violations = recipeViolations(draft, s.constraints, s.kit);
    if (violations.length > 0) return violations;

    const { signal, done } = track();
    let described: LookRecipe;
    try {
      const text = await services.vibe.describe(draft, translateInput(), signal);
      described = { ...draft, ...text };
    } catch (e) {
      if (!isAbort(e)) dispatch({ type: 'edit/applyError' });
      return [];
    } finally {
      done();
    }
    dispatch({ type: 'edit/applyStart', recipe: described });
    const job = await renderOne(described, 'edit');
    if (job?.status === 'success') dispatch({ type: 'edit/applySuccess', recipe: described });
    else if (job) dispatch({ type: 'edit/applyError' });
    return [];
  }, [renderOne, track, translateInput]);

  const cancelInFlight = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    dispatch({ type: 'session/cancelRenders' });
  }, []);

  const startOver = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    dispatch({ type: 'session/reset', sessionId: newSessionId() });
  }, []);

  useEffect(() => {
    const set = controllers.current;
    return () => set.forEach((c) => c.abort());
  }, []);

  const actions = useMemo<SessionActions>(
    () => ({ dispatch, submitSelfie, startLooks, retryVariant, applyDraft, cancelInFlight, startOver }),
    [submitSelfie, startLooks, retryVariant, applyDraft, cancelInFlight, startOver],
  );
  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
