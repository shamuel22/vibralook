import type { LookRecipe, RenderJob, SessionState, VariantKey } from '@/domain/types';

export function variantRecipe(s: SessionState, v: VariantKey): LookRecipe | undefined {
  return s.variants.find((r) => r.variant === v);
}

export function jobFor(s: SessionState, recipe: LookRecipe | null | undefined): RenderJob | undefined {
  return recipe ? s.renderJobs[recipe.id] : undefined;
}

/** Image for a recipe only when its render succeeded — never a stand-in. */
export function imageFor(s: SessionState, recipe: LookRecipe | null | undefined): string | undefined {
  const job = jobFor(s, recipe);
  return job?.status === 'success' ? job.imageUri : undefined;
}

export function isSimulated(s: SessionState, recipe: LookRecipe | null | undefined): boolean {
  return Boolean(jobFor(s, recipe)?.simulated || recipe?.origin === 'simulated');
}

/** At least one of the three variants is ready to look at. */
export function anyVariantReady(s: SessionState): boolean {
  return s.variants.some((v) => s.renderJobs[v.id]?.status === 'success');
}

export function allVariantsSettled(s: SessionState): boolean {
  return (
    s.variants.length > 0 &&
    s.variants.every((v) => {
      const st = s.renderJobs[v.id]?.status;
      return st === 'success' || st === 'error';
    })
  );
}

/** The five person-facing stages (PLAN §2.3) and which one a route belongs to. */
export const STAGES = ['vibe', 'selfie', 'kit', 'looks', 'result'] as const;
export type Stage = (typeof STAGES)[number];
