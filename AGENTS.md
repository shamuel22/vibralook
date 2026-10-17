# VIBRA LOOK — Agent guide

Read before writing any code in this repo. Applies to every agent (Claude, Codex) and human contributor.

## Sources of truth (in order)
1. `BRIEF_VIBRA_CONCURSO_YOUCAM_2026.md` — product behaviour.
2. `DESIGN.md` — visual system, copy tone, motion, accessibility.
3. `PLAN.md` — stages, ownership, decisions already taken (§2 overrides parts of the boards and adapts DESIGN.md to native mobile).

**Mobile only.** Expo SDK 58 app for iOS and Android. No web target, no web-only APIs, no CSS.

## Stack
- Expo SDK 58, Expo Router (routes in `src/app/`), TypeScript strict, React Compiler on.
- Reanimated 4 + react-native-worklets, Gesture Handler, expo-image, expo-linear-gradient, expo-haptics.
- Fonts: Fraunces (headings) and Manrope (UI), loaded in `src/app/_layout.tsx`.
- Install packages only with `npx expo install <pkg>` and only when the lead approves. If it fails with `EALLOWSCRIPTS` (npm 11), install the version listed in `node_modules/expo/bundledNativeModules.json` with plain `npm install <pkg>@<version>`.
- Reanimated CSS transitions: `transitionTimingFunction` takes `cssEasing.*` from `@/theme` (built with `cubicBezier()`); `'cubic-bezier(...)'` strings crash at runtime.

## Expo has changed — do not trust training data
Before using an Expo / RN API, check the installed types in `node_modules` or the docs for **v58**: https://docs.expo.dev/versions/v58.0.0/ (index: https://docs.expo.dev/llms.txt).

## Project map
```
src/app/            routes (screens only; no shared logic here)
src/components/     reusable UI (DESIGN §5). AppText is the only text primitive.
src/domain/         types, shade library, constraint rules, recipe helpers (pure TS)
src/state/          session reducer + provider (async orchestration), selectors
src/services/       service contracts; http/ = backend client (EXPO_PUBLIC_API_URL); mock/ = dev-only simulation (mock/settings.ts = knobs)
vibralook-api/      backend (NestJS) — separate git repo, ignored here; see its README
src/i18n/           es.ts (source) + en.ts (typed mirror); useT()
src/theme/          tokens (colors, space, radius, shadow, motion, easing) + typography
assets/brand/       approved logo/icon derivatives
assets/art/         final artwork from the graphics team (empty until delivered)
```

## Rules
- **Tokens only.** No raw hex, spacing or durations in components; import from `@/theme`.
- **All copy through i18n.** Add keys to `es.ts` and `en.ts` (English translates intent, not words). Never hardcode user-facing strings.
- **Text:** use `AppText` with a variant. Instructions never below the `label` size (14pt).
- **Accessibility:** touch targets ≥ 44pt (`hitSlop` if the visual is smaller); every pressable has `accessibilityRole` + `accessibilityLabel`; selection state via `accessibilityState`; never color-only selection (add border + check + label); photos have contextual `accessibilityLabel`; decorative layers `accessible={false}` / `importantForAccessibility="no-hide-descendants"`.
- **Motion:** follow `.claude/skills/animate-expo/SKILL.md` (Reanimated, UI thread, transform/opacity only, springs for gestures) with durations from DESIGN §6. Respect reduced motion (`useReducedMotion`). Functionality never waits for an animation.
- **Artwork:** never generate, download, crop from the boards, or draw figurative art. Use `ArtPlaceholder` with the art id and its final aspect ratio.
- **Honesty:** never fake a makeup result. Real renders come from YouCam through `vibralook-api`; simulated renders (dev without `EXPO_PUBLIC_API_URL`) are the original selfie with the simulation seal. No progress percentages for provider jobs. No "100 %", "exact color", skin diagnosis or beauty scoring.
- **State:** screens read `useSession()` and call its actions; never call services directly from a screen. Renders always start from `state.sourceImage`.
- **Shared domain:** `src/domain/` is copied into the API (`cd vibralook-api && pnpm contracts:sync`); after changing it, sync and run the API tests.
- **Done means:** `npm run typecheck` and `npm run lint` clean, all states from DESIGN §5 reachable (use the dev gallery / mock knobs).

## Commands
```bash
npm start              # Expo dev server
npm run android        # open on Android
npm run typecheck
npm run lint
npx expo-doctor
```

## Git
- Only the lead (Claude) commits and pushes, after review. Other agents leave changes uncommitted.
- Conventional Commits in English. Never commit secrets (`.env*` is ignored).
