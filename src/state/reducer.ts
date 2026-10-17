/**
 * Pure session reducer. Async orchestration (translation, renders, aborts) lives in
 * `SessionProvider`; this file only describes state transitions, so it is easy to test.
 */
import { toggleConstraint } from '@/domain/constraints';
import { changedZones, preservedZones, withZone } from '@/domain/recipe';
import {
  FINISHES_BY_ZONE,
  KIT_MAX_PER_ZONE,
  type Constraint,
  type Finish,
  type IntensityPreference,
  type Kit,
  type LookRecipe,
  type RenderJob,
  type RenderStatus,
  type SessionState,
  type SourceImage,
  type TimeBudget,
  type VariantKey,
  type Zone,
  type ZoneRecipe,
} from '@/domain/types';

export type Action =
  | { type: 'intent/text'; text: string }
  | { type: 'intent/time'; time: TimeBudget }
  | { type: 'intent/intensity'; intensity: IntensityPreference }
  | { type: 'intent/toggleConstraint'; constraint: Constraint }
  | { type: 'selfie/set'; image: SourceImage }
  | { type: 'selfie/checked'; result: SourceImage['check'] }
  | { type: 'selfie/clear' }
  | { type: 'kit/toggleShade'; zone: Zone; shadeId: string; defaultFinish: Finish }
  | { type: 'kit/finish'; zone: Zone; shadeId: string; finish: Finish }
  | { type: 'kit/skip' }
  | { type: 'kit/declare' }
  | { type: 'translate/start' }
  | { type: 'translate/success'; variants: LookRecipe[] }
  | { type: 'translate/error'; retriable: boolean }
  | { type: 'render/status'; recipeId: string; status: RenderStatus }
  | { type: 'render/done'; job: RenderJob }
  | { type: 'looks/choose'; variant: VariantKey }
  | { type: 'edit/zone'; zone: Zone; next: ZoneRecipe }
  | { type: 'edit/copyZone'; zone: Zone; from: VariantKey }
  | { type: 'edit/discard' }
  | { type: 'edit/applyStart'; recipe: LookRecipe }
  | { type: 'edit/applySuccess'; recipe: LookRecipe }
  | { type: 'edit/applyError' }
  | { type: 'edit/undo' }
  | { type: 'result/finalize' }
  | { type: 'session/cancelRenders' }
  | { type: 'session/reset'; sessionId: string };

export const emptyKit = (): Kit => ({ status: 'unset', items: { eyes: [], lips: [], cheeks: [] } });

export function initialSession(sessionId: string): SessionState {
  return {
    sessionId,
    userIntent: { text: '', time: 10, intensity: 'balanced' },
    constraints: [],
    sourceImage: null,
    kit: emptyKit(),
    translation: { status: 'idle' },
    variants: [],
    renderJobs: {},
    chosenVariant: null,
    selectedRecipe: null,
    draftRecipe: null,
    previousRecipe: null,
    finalRecipe: null,
    edit: { applyingId: null, failed: false, lastChange: null, undone: false },
  };
}

/** Clears everything derived from translation (variants, renders, edits). Intent, selfie and kit stay. */
function clearLooks(s: SessionState): SessionState {
  return {
    ...s,
    translation: { status: 'idle' },
    variants: [],
    renderJobs: {},
    chosenVariant: null,
    selectedRecipe: null,
    draftRecipe: null,
    previousRecipe: null,
    finalRecipe: null,
    edit: { applyingId: null, failed: false, lastChange: null, undone: false },
  };
}

function setKitItems(kit: Kit, zone: Zone, items: Kit['items'][Zone]): Kit {
  return { ...kit, items: { ...kit.items, [zone]: items } };
}

export function reducer(s: SessionState, a: Action): SessionState {
  switch (a.type) {
    case 'intent/text':
      return { ...s, userIntent: { ...s.userIntent, text: a.text } };
    case 'intent/time':
      return { ...s, userIntent: { ...s.userIntent, time: a.time } };
    case 'intent/intensity':
      return { ...s, userIntent: { ...s.userIntent, intensity: a.intensity } };
    case 'intent/toggleConstraint':
      return { ...s, constraints: toggleConstraint(s.constraints, a.constraint) };

    case 'selfie/set':
      return clearLooks({ ...s, sourceImage: a.image });
    case 'selfie/checked':
      return s.sourceImage ? { ...s, sourceImage: { ...s.sourceImage, check: a.result } } : s;
    case 'selfie/clear':
      return clearLooks({ ...s, sourceImage: null });

    case 'kit/toggleShade': {
      const items = s.kit.items[a.zone];
      const exists = items.some((i) => i.shadeId === a.shadeId);
      if (exists) return { ...s, kit: setKitItems(s.kit, a.zone, items.filter((i) => i.shadeId !== a.shadeId)) };
      if (items.length >= KIT_MAX_PER_ZONE) return s;
      const finish = FINISHES_BY_ZONE[a.zone].includes(a.defaultFinish) ? a.defaultFinish : FINISHES_BY_ZONE[a.zone][0];
      return { ...s, kit: setKitItems(s.kit, a.zone, [...items, { shadeId: a.shadeId, finish }]) };
    }
    case 'kit/finish': {
      const items = s.kit.items[a.zone].map((i) => (i.shadeId === a.shadeId ? { ...i, finish: a.finish } : i));
      return { ...s, kit: setKitItems(s.kit, a.zone, items) };
    }
    case 'kit/skip':
      return { ...s, kit: { status: 'skipped', items: emptyKit().items } };
    case 'kit/declare':
      return { ...s, kit: { ...s.kit, status: 'declared' } };

    case 'translate/start':
      return { ...clearLooks(s), translation: { status: 'loading' } };
    case 'translate/success': {
      const renderJobs: Record<string, RenderJob> = {};
      for (const v of a.variants) renderJobs[v.id] = { recipeId: v.id, status: 'pending', simulated: false };
      return { ...s, translation: { status: 'success' }, variants: a.variants, renderJobs };
    }
    case 'translate/error':
      return { ...s, translation: { status: 'error', retriable: a.retriable } };

    case 'render/status': {
      const prev = s.renderJobs[a.recipeId];
      return {
        ...s,
        renderJobs: {
          ...s.renderJobs,
          [a.recipeId]: { ...(prev ?? { recipeId: a.recipeId, simulated: false }), status: a.status, error: undefined },
        },
      };
    }
    case 'render/done':
      return { ...s, renderJobs: { ...s.renderJobs, [a.job.recipeId]: a.job } };

    case 'looks/choose': {
      const recipe = s.variants.find((v) => v.variant === a.variant) ?? null;
      return {
        ...s,
        chosenVariant: a.variant,
        selectedRecipe: recipe,
        draftRecipe: null,
        previousRecipe: null,
        finalRecipe: null,
        edit: { applyingId: null, failed: false, lastChange: null, undone: false },
      };
    }

    case 'edit/zone': {
      const base = s.draftRecipe ?? s.selectedRecipe;
      if (!base || s.edit.applyingId) return s;
      const draft = withZone(base, a.zone, a.next);
      // Editing back to the rendered state cancels the draft.
      const isNoop = s.selectedRecipe && changedZones(s.selectedRecipe, draft).length === 0;
      return { ...s, draftRecipe: isNoop ? null : draft, edit: { ...s.edit, failed: false, undone: false } };
    }
    case 'edit/copyZone': {
      const from = s.variants.find((v) => v.variant === a.from);
      if (!from) return s;
      return reducer(s, { type: 'edit/zone', zone: a.zone, next: from[a.zone] });
    }
    case 'edit/discard':
      return { ...s, draftRecipe: null, edit: { ...s.edit, failed: false } };
    case 'edit/applyStart':
      return {
        ...s,
        draftRecipe: a.recipe,
        renderJobs: { ...s.renderJobs, [a.recipe.id]: { recipeId: a.recipe.id, status: 'pending', simulated: false } },
        edit: { ...s.edit, applyingId: a.recipe.id, failed: false, undone: false },
      };
    case 'edit/applySuccess': {
      if (!s.selectedRecipe) return s;
      return {
        ...s,
        previousRecipe: s.selectedRecipe,
        selectedRecipe: a.recipe,
        draftRecipe: null,
        edit: {
          applyingId: null,
          failed: false,
          undone: false,
          lastChange: { kept: preservedZones(s.selectedRecipe, a.recipe), changed: changedZones(s.selectedRecipe, a.recipe) },
        },
      };
    }
    case 'edit/applyError':
      return { ...s, edit: { ...s.edit, applyingId: null, failed: true } };
    case 'edit/undo':
      if (!s.previousRecipe || s.edit.applyingId) return s;
      return {
        ...s,
        selectedRecipe: s.previousRecipe,
        previousRecipe: null,
        draftRecipe: null,
        edit: { applyingId: null, failed: false, lastChange: null, undone: true },
      };

    case 'result/finalize':
      return { ...s, finalRecipe: s.selectedRecipe };

    case 'session/cancelRenders': {
      const renderJobs = { ...s.renderJobs };
      for (const [id, job] of Object.entries(renderJobs)) {
        if (job.status === 'pending' || job.status === 'processing') delete renderJobs[id];
      }
      const translation = s.translation.status === 'loading' ? { status: 'idle' as const } : s.translation;
      return { ...s, translation, renderJobs, edit: { ...s.edit, applyingId: null } };
    }
    case 'session/reset':
      return initialSession(a.sessionId);
  }
}
