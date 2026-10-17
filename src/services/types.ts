/**
 * Service contracts. Screens depend only on these interfaces.
 * Phase 1 wires the mock implementations; Phase 2 swaps in the real backend client
 * (LLM translation + look compiler + YouCam) without touching the UI.
 */
import type {
  Constraint,
  Kit,
  Locale,
  LookRecipe,
  RenderJob,
  RenderStatus,
  SelfieIssue,
  SourceImage,
  UserIntent,
} from '@/domain/types';

export interface TranslateInput {
  intent: UserIntent;
  constraints: Constraint[];
  kit: Kit;
  locale: Locale;
  /** The session's selfie: the backend binds every call to the session that holds it. */
  source: SourceImage | null;
}

export type RecipeText = Pick<LookRecipe, 'tagline' | 'explanation' | 'steps'>;

export interface VibeService {
  /** Three validated recipes in VARIANTS order (whisper, balance, statement). */
  translate(input: TranslateInput, signal?: AbortSignal): Promise<LookRecipe[]>;
  /**
   * Regenerates tagline, explanation and steps for an edited recipe so text, palette,
   * render and steps always come from the same saved recipe (brief §6, honesty rule).
   */
  describe(recipe: LookRecipe, input: TranslateInput, signal?: AbortSignal): Promise<RecipeText>;
}

export interface RenderRequest {
  source: SourceImage;
  recipe: LookRecipe;
  /** Re-validated by the backend before any provider unit is spent. */
  constraints: Constraint[];
  kit: Kit;
  /** `variant`: one of the three initial looks. `edit`: a confirmed change in the editor. */
  kind: 'variant' | 'edit';
}

export interface RenderService {
  /**
   * Renders the recipe on the ORIGINAL selfie (never on a previous result).
   * Reports real provider states through `onStatus`; resolves with the final job
   * (success or error — it does not throw for provider errors).
   */
  render(req: RenderRequest, onStatus: (s: RenderStatus) => void, signal?: AbortSignal): Promise<RenderJob>;
}

export type SelfieCheckResult = { status: 'valid' } | { status: 'invalid'; issue: SelfieIssue };

export interface SelfieService {
  /** Basic validation: format, size, visible face. */
  check(image: SourceImage, signal?: AbortSignal): Promise<SelfieCheckResult>;
}

export interface Services {
  vibe: VibeService;
  render: RenderService;
  selfie: SelfieService;
  /** Ends the backend session now (provider tasks and the uploaded photo are deleted). Fire-and-forget. */
  endSession(): void;
}

export class AbortError extends Error {
  constructor() {
    super('Aborted');
    this.name = 'AbortError';
  }
}
