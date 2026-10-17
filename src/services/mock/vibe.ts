/**
 * Phase 1 mock of the translation engine. Deterministic, constraint- and kit-aware, so the
 * UI can be exercised with realistic recipes. It is NOT the product's interpretation logic:
 * every recipe is tagged `origin: 'simulated'`.
 */
import { DISCREET_LIPS_MAX, isFinishAllowed, isZoneAllowed } from '@/domain/constraints';
import { recipeId } from '@/domain/recipe';
import { getShade } from '@/domain/shades';
import {
  VARIANTS,
  type Finish,
  type Locale,
  type LookRecipe,
  type RecipeStep,
  type VariantKey,
  type Zone,
  type ZoneIntensity,
  type ZoneRecipe,
} from '@/domain/types';
import { translate, type TKey } from '@/i18n';

import { AbortError, type RecipeText, type TranslateInput, type VibeService } from '../types';
import { consume, getMockSettings } from './settings';

type Mood = 'cool' | 'warm';

const WARM_WORDS =
  /jazz|rooftop|azotea|atardecer|sunset|verano|summer|cálid|warm|fuego|dorad|golden|otoño|autumn|fall/i;

/** Preferred shade per mood × variant × zone. */
const PALETTES: Record<Mood, Record<VariantKey, Record<Zone, string>>> = {
  cool: {
    whisper: { eyes: 'eye-lavender', lips: 'lip-dusty-pink', cheeks: 'cheek-petal' },
    balance: { eyes: 'eye-mauve', lips: 'lip-mauve', cheeks: 'cheek-soft-mauve' },
    statement: { eyes: 'eye-smoky-plum', lips: 'lip-plum', cheeks: 'cheek-brick-rose' },
  },
  warm: {
    whisper: { eyes: 'eye-champagne', lips: 'lip-nude-rose', cheeks: 'cheek-peach' },
    balance: { eyes: 'eye-bronze', lips: 'lip-terracotta', cheeks: 'cheek-coral' },
    statement: { eyes: 'eye-chocolate', lips: 'lip-wine', cheeks: 'cheek-terracotta' },
  },
};

const BASE_INTENSITY: Record<VariantKey, number> = { whisper: 2, balance: 3, statement: 4 };
const PREF_SHIFT = { subtle: -1, balanced: 0, expressive: 1 } as const;

const PREFERRED_FINISH: Record<VariantKey, Record<Zone, Finish>> = {
  whisper: { eyes: 'satin', lips: 'satin', cheeks: 'luminous' },
  balance: { eyes: 'satin', lips: 'satin', cheeks: 'satin' },
  statement: { eyes: 'metallic', lips: 'matte', cheeks: 'matte' },
};

function clampIntensity(n: number, max: number = 5): ZoneIntensity {
  return Math.max(1, Math.min(max, Math.round(n))) as ZoneIntensity;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new AbortError());
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new AbortError());
    });
  });
}

function buildZone(zone: Zone, variant: VariantKey, mood: Mood, input: TranslateInput): ZoneRecipe {
  const { constraints, kit, intent } = input;
  const preferredShade = PALETTES[mood][variant][zone];
  let finish = PREFERRED_FINISH[variant][zone];
  if (!isFinishAllowed(finish, constraints)) finish = 'satin';
  const max = zone === 'lips' && constraints.includes('discreetLips') ? DISCREET_LIPS_MAX : 5;
  const intensity = clampIntensity(BASE_INTENSITY[variant] + PREF_SHIFT[intent.intensity], max);

  if (!isZoneAllowed(zone, constraints)) {
    return {
      enabled: false,
      disabledReason: 'constraint',
      shadeId: preferredShade,
      finish,
      intensity,
      source: 'guide',
    };
  }

  if (kit.status !== 'declared') {
    return { enabled: true, shadeId: preferredShade, finish, intensity, source: 'guide' };
  }

  const usable = kit.items[zone].filter((i) => isFinishAllowed(i.finish, constraints));
  if (usable.length === 0) {
    return { enabled: false, disabledReason: 'notInKit', shadeId: preferredShade, finish, intensity, source: 'kit' };
  }
  // Whisper takes the lightest kit shade, statement the deepest, balance the first declared.
  const byLightness = [...usable].sort(
    (a, b) => lightness(getShade(b.shadeId).hex) - lightness(getShade(a.shadeId).hex),
  );
  const pick =
    variant === 'whisper' ? byLightness[0] : variant === 'statement' ? byLightness[byLightness.length - 1] : usable[0];
  return { enabled: true, shadeId: pick.shadeId, finish: pick.finish, intensity, source: 'kit' };
}

function lightness(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
}

// ─── Text (Phase 2: produced by the language model) ─────────────────────────

const TAGLINES: Record<Locale, Record<VariantKey, string>> = {
  es: {
    whisper: 'Fresca, luminosa y natural.',
    balance: 'Sofisticada, versátil y atemporal.',
    statement: 'Más intensidad para destacar.',
  },
  en: {
    whisper: 'Fresh, luminous and natural.',
    balance: 'Polished, versatile and timeless.',
    statement: 'More intensity to stand out.',
  },
};

function shadeName(locale: Locale, shadeId: string): string {
  return translate(locale, getShade(shadeId).nameKey as TKey);
}

function describeRecipe(r: Omit<LookRecipe, 'tagline' | 'explanation' | 'steps'>, input: TranslateInput): RecipeText {
  const { locale, intent } = input;
  const vibe = intent.text.trim();
  const zones = (['eyes', 'lips', 'cheeks'] as const).filter((z) => r[z].enabled);
  if (zones.length === 0) {
    return {
      tagline: translate(locale, 'mockNoZones.tagline'),
      explanation: translate(locale, 'mockNoZones.explanation', { vibe }),
      steps: buildSteps(r, input),
    };
  }
  const parts = zones.map((z) => {
    const name = shadeName(locale, r[z].shadeId);
    if (locale === 'es') {
      return { eyes: `ojos en ${name}`, lips: `un labio ${name}`, cheeks: `mejillas ${name}` }[z];
    }
    return { eyes: `${name} eyes`, lips: `a ${name} lip`, cheeks: `${name} cheeks` }[z];
  });
  const joined =
    parts.length > 1
      ? `${parts.slice(0, -1).join(', ')}${locale === 'es' ? ' y ' : ' and '}${parts.at(-1)}`
      : (parts[0] ?? '');
  const pref = translate(locale, `intent.intensity.${intent.intensity}` as TKey).toLowerCase();
  const explanation =
    locale === 'es'
      ? `Tradujimos «${vibe}» en ${joined}, manteniendo la intensidad ${pref} que pediste.`
      : `We translated “${vibe}” into ${joined}, keeping the ${pref} intensity you asked for.`;
  return { tagline: TAGLINES[locale][r.variant], explanation, steps: buildSteps(r, input) };
}

function buildSteps(r: Omit<LookRecipe, 'tagline' | 'explanation' | 'steps'>, input: TranslateInput): RecipeStep[] {
  const { locale, intent } = input;
  const es = locale === 'es';
  const finishName = (f: Finish) => translate(locale, `finishes.${f}` as TKey).toLowerCase();
  const steps: RecipeStep[] = [];
  const zonesOn = (['eyes', 'cheeks', 'lips'] as const).filter((z) => r[z].enabled);
  if (zonesOn.length === 0) {
    return [
      { zone: 'prep', minutes: 1, text: translate(locale, 'mockNoZones.prep') },
      { zone: 'prep', minutes: 1, text: translate(locale, 'mockNoZones.review') },
      { zone: 'finish', minutes: 1, text: translate(locale, 'mockNoZones.finish') },
    ];
  }

  if (intent.time >= 10 || zonesOn.length < 2) {
    steps.push({
      zone: 'prep',
      minutes: 1,
      text: es
        ? 'Hidrata y deja la piel tal como es; no hace falta base.'
        : 'Moisturize and leave your skin as it is; no foundation needed.',
    });
  }
  for (const z of zonesOn) {
    const name = shadeName(locale, r[z].shadeId);
    const fin = finishName(r[z].finish);
    const soft = r[z].intensity <= 2;
    const text = {
      eyes: es
        ? `Aplica la sombra ${name} (${fin}) en el párpado ${soft ? 'con una capa ligera' : 'y difumina hacia afuera'}.`
        : `Apply the ${name} shadow (${fin}) on the lid ${soft ? 'in one light layer' : 'and blend outward'}.`,
      cheeks: es
        ? `Da toques de rubor ${name} (${fin}) en las mejillas y difumina hacia las sienes.`
        : `Tap ${name} blush (${fin}) on your cheeks and blend toward the temples.`,
      lips: es
        ? `Aplica el labial ${name} (${fin}) ${soft ? 'con el dedo, a toques' : 'definiendo el contorno'}.`
        : `Apply the ${name} lipstick (${fin}) ${soft ? 'with your finger, in dabs' : 'defining the outline'}.`,
    }[z];
    steps.push({ zone: z, minutes: 2, text });
  }
  if (steps.length < 3) {
    steps.push({
      zone: 'finish',
      minutes: 1,
      text: es
        ? 'Mírate con luz natural y suaviza cualquier borde.'
        : 'Check yourself in natural light and soften any edges.',
    });
  }
  // Fit the time budget.
  const total = steps.reduce((s, x) => s + x.minutes, 0);
  if (total > intent.time) {
    const scale = intent.time / total;
    steps.forEach((s) => (s.minutes = Math.max(1, Math.floor(s.minutes * scale))));
  }
  return steps.slice(0, 5);
}

function moodFor(text: string): Mood {
  return WARM_WORDS.test(text) ? 'warm' : 'cool';
}

export const mockVibeService: VibeService = {
  async translate(input, signal) {
    await sleep(getMockSettings().translateLatency, signal);
    if (consume('failTranslateOnce', false)) throw new Error('mock-translate-failure');
    const mood = moodFor(input.intent.text);
    return VARIANTS.map((variant) => {
      const eyes = buildZone('eyes', variant, mood, input);
      const lips = buildZone('lips', variant, mood, input);
      const cheeks = buildZone('cheeks', variant, mood, input);
      const kitShortfall =
        input.kit.status === 'declared' && [eyes, lips, cheeks].some((z) => z.disabledReason === 'notInKit');
      const base = {
        variant,
        eyes,
        lips,
        cheeks,
        paletteSource: input.kit.status === 'declared' ? ('kit' as const) : ('guide' as const),
        kitShortfall,
        origin: 'simulated' as const,
      };
      const id = recipeId(base);
      return { ...base, id, ...describeRecipe({ ...base, id }, input) };
    });
  },

  async describe(recipe, input, signal) {
    await sleep(300, signal);
    return describeRecipe(recipe, input);
  },
};
