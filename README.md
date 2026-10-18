# VIBRA LOOK

**From a feeling to a look you can actually wear.** Describe a vibe — "jazz on a rooftop", "an important but relaxed meeting", "sakura on a rainy afternoon" — and VIBRA LOOK turns it into three makeup looks (Whisper, Balance, Statement) tried on **your own selfie** with the YouCam AI Makeup Virtual Try-On API. Adjust one area while keeping the rest, then take home a 3–5 step guide that fits your time and the products you own.

Mobile app (iOS and Android, Expo) in English and Spanish, plus a small backend ([`vibra-look-api`](https://github.com/shamuel22/vibra-look-api)).

## How it works

1. **Intent** — free-text vibe, time available (5/10/20 min), preferred intensity and optional limits (no eyeshadow, no shine, discreet lips).
2. **Selfie** — camera or photo library; oriented and downscaled on the device, then uploaded privately by the backend to the try-on provider.
3. **My kit (optional)** — up to two shades per category you own. Without a kit, the palette is labelled as a guide.
4. **Three translations** — a language model interprets the vibe; deterministic code validates every recipe against your limits and kit and compiles it to whitelisted YouCam effects. Each look is a real render on the same original selfie, arriving progressively.
5. **Make it yours** — change one area's intensity, shade or finish, or borrow it from another look. The other areas keep exactly the same parameters; the new image is rendered again from the original selfie. One-step undo.
6. **Result** — final image with before/after, the explanation of the translation, the steps, and a downloadable PNG card.

Honesty rules: no skin smoothing or feature changes, colors are visual approximations, no fake results (a failed render says so and can be retried), editorial fallback recipes are labelled as such.

## Run it

Requirements: Node.js ≥ 22, the Expo Go app (SDK 58) or an Android emulator, and a running [`vibra-look-api`](https://github.com/shamuel22/vibra-look-api) (YouCam + DeepSeek keys live only there).

```bash
# 1. Backend (separate repo)
git clone https://github.com/shamuel22/vibra-look-api.git && cd vibra-look-api
corepack enable && pnpm install
cp .env.example .env        # YOUCAM_API_KEY, DEEPSEEK_API_KEY
pnpm build && pnpm start    # http://localhost:3000/health

# 2. App
git clone https://github.com/shamuel22/vibralook.git && cd vibralook
npm install
cp .env.example .env.local  # EXPO_PUBLIC_API_URL=...
npx expo start
```

`EXPO_PUBLIC_API_URL`:

- Android emulator or USB device: `adb reverse tcp:3000 tcp:3000` and `http://127.0.0.1:3000`
- Phone on the same Wi-Fi: `http://<computer-LAN-IP>:3000`
- Release builds: the deployed HTTPS URL

Without `EXPO_PUBLIC_API_URL`, a **development** build runs simulated services for UI work; every simulated image carries a visible "UI simulation" seal. Release builds never fall back to simulation.

### Builds

```bash
npx eas-cli env:create --name EXPO_PUBLIC_API_URL --value https://api.example.com --environment preview --visibility plaintext
npx eas-cli build -p android --profile preview      # installable APK
npx eas-cli build -p android --profile production   # Play Store bundle
```

## Demo route (judges)

1. Type `jazz on a rooftop`, keep 10 min and Balanced, tap **Translate my vibe**.
2. Upload an authorized selfie (front-facing, even light, face filling a good part of the frame).
3. Skip the kit (or pick a few shades to see kit-only recipes).
4. Watch the three looks arrive; compare any of them with the original; pick Balance.
5. In **Make it yours**, change the lip shade: the summary confirms eyes and cheeks were kept; undo is one tap.
6. Keep the look: steps, explanation and the PNG card come from the same saved recipe.

## Development

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

Project map, rules and stages: [`AGENTS.md`](AGENTS.md),...

```
src/app/         screens (Expo Router)
src/components/  UI kit
src/domain/      types, shade library, constraint rules, recipe helpers (shared with the API)
src/state/       session reducer + async orchestration
src/services/    service contracts; http/ (backend) and mock/ (simulated, dev only)
src/i18n/        es / en
```

## Privacy

The selfie is sent only to the VIBRA LOOK API, which uploads it privately to the try-on provider. Results are downloaded into the app's cache with a session token; nothing is published on open URLs. Sessions expire after 30 idle minutes, and the provider tasks and the uploaded photo are then deleted. Nothing is stored in a database.
