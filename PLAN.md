# VIBRA LOOK — Plan de construcción

**Documento vivo · creado el 17-oct-2026 · responsable: Claude (senior / líder técnico)**
Fuentes de verdad: `BRIEF_VIBRA_CONCURSO_YOUCAM_2026.md` (comportamiento) y `DESIGN.md` (sistema visual y de experiencia). Si una lámina de `/img` contradice esos documentos, mandan los documentos.

> **Fase actual: 1 — UI/UX (completada el 17-oct-2026, en revisión).** La lógica real (LLM, compilador de looks, YouCam, backend) se construye en la Fase 2, solo cuando la UI/UX esté aprobada.

> **Alcance de plataforma (decisión del equipo, 17-oct-2026): solo app móvil con Expo (iOS y Android).** No se construye ni se prueba ninguna versión web por ahora. Donde `DESIGN.md` hable de «web app», CSS o escritorio, se aplica su equivalente móvil nativo (ver §2).

---

## 0. Estado del proyecto al iniciar

- El repo solo contiene los dos documentos y `/img` (6 láminas). Aún no hay código.
- Recursos de marca utilizables: `VIBRA_LOOK_Logo.png` (2172×724, RGBA) y `VIBRA_LOOK_Icono.png` (1254×1254, opaco). Las demás láminas son solo referencia: **no se recortan ni se usan como fondo**.
- Herramientas: Node 24.19, npm 11.19, Expo SDK estable más reciente = **58** (`expo@58.0.x`), Codex CLI 0.162.1.
- Skills de diseño/animación instaladas en `.claude/skills/` (de https://emilkowal.ski/skill, repo `emilkowalski/skill` @ `2d22863`, licencia incluida):
  - **`animate-expo`** — regla principal de movimiento: Reanimated 4 + Gesture Handler, curvas/springs, hilo de UI, hápticos, reduce motion. Se aplica en Etapas 2–4.
  - **`emil-design-eng`** — criterio de pulido de componentes e interacción. Etapas 2–4.
  - **`break-ui`** — pruebas con datos extremos (textos largos, ES/EN, vacíos). Etapa 5.
  - **`review-animations`** — revisión estricta del movimiento (solo invocación manual). Cierre de Etapa 4.
  - Descartadas: `animate`, `apple-design`, `mobile-native` (orientadas a web), `write-swift`, `ask-sonner`, `pick-ui-library`, `prototype` y el resto (fuera de alcance).
  - Codex recibe en cada encargo la ruta de la skill pertinente para leerla.
  - Donde la skill y DESIGN.md difieren en duraciones, manda DESIGN.md §6 (p. ej. entrada de pantalla 360–560 ms); para press, springs y curvas se usan los valores de `animate-expo`.
- Complemento: documentación oficial de Expo, React Native y Reanimated (cumple DESIGN §0).
- Repositorio remoto del equipo: **https://github.com/shamuel22/vibralook.git** (ver §6).

---

## 1. Decisiones técnicas (Fase 1)

| Tema | Decisión | Motivo |
| --- | --- | --- |
| Framework | **Expo SDK 58 + Expo Router + TypeScript** | El brief exige Expo; Router da rutas por pantalla y acceso directo a cada estado para QA. |
| Plataformas | **iOS y Android únicamente** (Expo Go durante desarrollo; development build si alguna librería lo requiere) | Decisión del equipo: solo app móvil. |
| Nota de dependencias | `react-dom` está fijado a la versión de `react` solo porque es *peer dependency* de módulos internos de Expo Router; **no** implica un objetivo web. | Sin él, npm resuelve un `react-dom` incompatible. |
| Estilos | `StyleSheet` + módulo de tokens `src/theme/tokens.ts` (traducción 1:1 de DESIGN §3) | Sin librerías de UI externas: control total de la identidad. |
| Fuentes | `@expo-google-fonts/fraunces` y `@expo-google-fonts/manrope` | Tipografías indicadas en DESIGN §2. |
| Animación | `react-native-reanimated` (incluido en el template de Expo) | Necesario para el slider antes/después fluido, crossfade y escalonado; respeta `useReducedMotion`. Se justifica por DESIGN §6. |
| Gestos | `react-native-gesture-handler` | Arrastre del `CompareSlider`. |
| Estado | Store único con `useReducer` + Context (o Zustand si crece), **modelado exactamente como el estado del brief §6** | La UI nace sobre el contrato real: `sessionId, sourceImageRef, userIntent, constraints, kit, variants[3], selectedRecipe, previousRecipe, renderJobs, finalRecipe`. |
| i18n | Diccionarios propios `es.ts` / `en.ts` + `expo-localization`; selector de idioma en el menú | Requisito ES/EN; textos ingleses naturales, no literales. |
| Cámara / foto | `expo-camera`, `expo-image-picker`, `expo-image-manipulator` (orientación + reducción) | Contrato de selfie de DESIGN §4. |
| Imágenes | `expo-image` | Crossfade nativo de 360 ms y caché. |
| Tarjeta PNG | `react-native-view-shot` + `expo-media-library` / `expo-sharing` | Resultado guardable en galería o compartible, generado desde los datos de la receta. |
| Datos simulados | Capa `src/services/` con **interfaz idéntica a la del backend futuro** y una implementación `mock` | Permite probar todos los estados (pendiente/procesando/listo/error) sin YouCam. |

### Regla de honestidad en la Fase 1 (crítica)
La implementación `mock` **no dibuja maquillaje** sobre la foto ni usa las láminas como resultados. Un render simulado muestra la selfie original con un sello visible «Simulación de UI — sin prueba virtual real» (solo en modo desarrollo). Así la Fase 2 sustituye el servicio sin tocar pantallas y nunca se confunde una maqueta con una respuesta real (Brief §8.3, DESIGN §9.4).

### Estructura prevista

```
src/app/                  # Expo Router (SDK 58 template usa src/app)
  _layout.tsx             # fuentes, providers, i18n, tema
  index.tsx               # 1 Intención
  selfie/index.tsx        # 2 Preparar selfie
  selfie/camera.tsx       # 3 Cámara
  selfie/review.tsx       # 4 Revisar selfie
  kit.tsx                 # 5 Kit opcional
  creating.tsx            # 6 Creación (progreso por variante)
  looks.tsx               # 7 Tres looks
  edit.tsx                # 8 Hazlo tuyo
  result.tsx              # 9 Resultado
  dev/gallery.tsx         # Galería de componentes y estados (solo dev, para QA)
src/
  domain/                 # tipos, biblioteca de tonos, reglas de restricciones, helpers de receta
  theme/                  # tokens, tipografía, motion
  components/             # BrandHeader, PrimaryButton, ChoiceChips, … (DESIGN §5)
  state/                  # reducer, SessionProvider (orquestación async), selectores
  services/               # interfaces + mock (translate, render, selfieCheck)
  i18n/                   # es.ts, en.ts, hook useT
assets/brand/             # logo e icono aprobados
assets/art/               # (vacío) artes finales del equipo gráfico cuando lleguen
```

---

## 2. Ajustes a las láminas y a DESIGN.md (decisiones ya tomadas)

1. **Sin barra inferior** «Inicio / Vibras / Looks / Perfil»: DESIGN §4 la prohíbe sin funciones reales.
2. El menú ☰ solo tendrá funciones reales: idioma ES/EN, «Empezar de nuevo» y «Cómo usamos tu foto».
3. Progreso contextual en **5 etapas visibles** para la persona: Vibra · Selfie · Kit · Looks · Resultado (las 9 pantallas técnicas se agrupan en ellas).
4. Se evita el copy «100 % tuyo» de la lámina (DESIGN §7 desaconseja «100 %»).
5. Fotografía de escena («Jazz en una azotea»), ilustración de encuadre de selfie, texturas de las tarjetas de progreso y cintas acuareladas → **`ArtPlaceholder`** con id, proporción final y rótulo «Arte pendiente». Las cintas simples permitidas (gradiente de marca vía `expo-linear-gradient`) sí se hacen en código.
6. Las miniaturas de pasos en Resultado (ojos/labios/mejillas) **no son arte**: serán recortes del render final de la propia persona (contenido del flujo). En Fase 1 se muestran recortes de la selfie con el sello de simulación.
7. Botón de Intención: «Traducir mi vibra» (microcopy de DESIGN, prevalece sobre el texto del brief).
8. Conflictos de restricciones: «sin brillo» deshabilita el acabado «Brillo/Luminoso»; «sin sombra» bloquea zona ojos en edición y lo explica; «labios discretos» limita intensidad de labios. Las reglas viven en `src/utils/constraints.ts` y la UI las refleja (chip inhabilitado con razón accesible).
9. **Onboarding (decisión del equipo, 17-oct-2026):** una sola pantalla `/welcome` antes del Paso 1 en la primera apertura (recordada por dispositivo con AsyncStorage) y accesible desde el menú «Ver introducción». Explica qué es y los tres movimientos del recorrido; la ilustración es el arte A0 del equipo gráfico (placeholder hasta su entrega).
10. **Paso 1 simplificado (decisión del equipo, 17-oct-2026):** solo se pide la vibra; «Ideas para empezar», tiempo, intensidad y límites quedan plegados en una tarjeta «Ajusta si quieres», cada fila se abre por separado y muestra su valor actual (por defecto 10 min, equilibrada, sin límites).
11. **Traducción de DESIGN.md a móvil nativo** (al quitar la web):
   - Tokens CSS → objeto TypeScript con los mismos nombres y valores.
   - `prefers-reduced-motion` → ajuste «Reducir movimiento» del sistema (`useReducedMotion` / `AccessibilityInfo`).
   - Zoom 200 % → tamaño de texto del sistema (Dynamic Type / escala de fuente de Android) sin romper layouts.
   - Teclado y foco visible → VoiceOver / TalkBack: orden de lectura, `accessibilityLabel`, `accessibilityRole`, `accessibilityState` y acciones ajustables en el slider.
   - `env(safe-area-inset-*)` → `react-native-safe-area-context`.
   - Pausar animación decorativa cuando la página no es visible → pausar cuando la app pasa a segundo plano (`AppState`) o la pantalla pierde el foco.
   - Layout de escritorio/tablet → solo se comprueba que en tablet el contenido se limite a 560 pt de ancho y no se rompa; no hay versión de escritorio.

---

## 3. Etapas de la Fase 1 (UI/UX)

Cada etapa termina con un **punto de control**: la reviso, ejecuto la app en emulador/dispositivo (anchos de 360, 390 y 430 pt; iOS y Android), hago commit + push a GitHub y te muestro capturas antes de pasar a la siguiente.

### Etapa 1 — Fundaciones (Claude)
- `git init`, `.gitignore` de Expo, `git remote add origin https://github.com/shamuel22/vibralook.git`, commit inicial (documentos + `/img`) y primer push.
- Scaffold Expo SDK 58 + Router + TS, ESLint/Prettier, scripts `start`, `ios`, `android`, `typecheck`, `lint`.
- Tokens (`colors`, `space`, `radius`, `shadow`, `motion`, `type`), fuentes, `useReducedMotion`.
- i18n con todo el microcopy de DESIGN §7 en ES y EN.
- Tipos `LookRecipe`, `SessionState`, `RenderJob`, `KitSwatch`, `Constraint` + reducer + selectores.
- Contratos de servicios (`TranslationService`, `RenderService`, `SelfieCheckService`) e implementación mock configurable (latencias aleatorias, forzar error por variante, foto inválida).
- Biblioteca de muestras del kit con nombres accesibles ES/EN.
- Icono de app y splash con los recursos de marca aprobados.
- **Criterio de salida:** la app arranca en Android e iOS y muestra la galería dev con tokens y tipografía correctos; `typecheck` y `lint` limpios.

### Etapa 2 — Librería de componentes (Claude define + Codex en paralelo)
Componentes de DESIGN §5 con **todos sus estados**, visibles en `app/dev/gallery.tsx`:
- **Claude:** `BrandHeader`, `EditorialHeading`, `PrimaryButton`, `SecondaryButton`, `ChoiceChips`, `InlineNotice`, `ArtPlaceholder`, `RibbonAccent`, `Swatch` (las bases de las que dependen las demás).
- **Codex (después de que existan las bases):** `CompareSlider` (gesto + acciones accesibles de incremento/decremento), `LookProgressCard`, `LookVariantCard`, `KitSelector`, `ZoneEditor`, `ResultRecipe`.
- **Criterio de salida:** cada componente con área táctil ≥44 pt, etiquetas y estados para lector de pantalla, estados de DESIGN §5 demostrables, sin depender solo del color para la selección.

### Etapa 3 — Pantallas, en dos frentes paralelos
| Frente | Responsable | Pantallas |
| --- | --- | --- |
| A — Decisión | Claude | 1 Intención (`VibeComposer`, tiempo, intensidad, restricciones), 5 Kit opcional, 7 Tres looks |
| B — Selfie | Codex | 2 Preparar selfie, 3 Cámara (permiso solo tras pulsar «Abrir cámara»; denegado o sin cámara → «Subir foto»), 4 Revisar selfie (válida / inválida) |

Luego:
| Frente | Responsable | Pantallas |
| --- | --- | --- |
| C — Espera honesta | Codex | 6 Creación: estado real por variante, sin porcentajes, cancelar sesión, resultados que llegan desordenados |
| D — Dirección y cierre | Claude | 8 Hazlo tuyo (zonas, «conservar / cambiar», usar zona de otro look, bloqueo por restricción, deshacer, «Aplicando cambio…» manteniendo la última imagen válida) y 9 Resultado (comparador, paleta, explicación, 3–5 pasos, kit propio vs. orientativo, guardar tarjeta PNG) |

- **Criterio de salida:** recorrido completo intención → resultado navegable con el mock, incluidos: cámara denegada, selfie inválida, kit omitido, una variante fallida + reintento solo de esa, edición en curso, deshacer y final.

### Etapa 4 — Movimiento y pulido (Claude, Codex como apoyo)
- Tabla de DESIGN §6: entrada de pantalla, press de chips/botones, apertura de zona, elección de look, crossfade de resultado, deriva de cinta (una por pantalla, pausada en segundo plano), escalonado 70–90 ms.
- «Reducir movimiento» del sistema: todo funciona sin animación.
- Revisión contra las láminas: jerarquía, espaciado, contraste, legibilidad.
- Prueba en un Android de gama media.

### Etapa 5 — QA de accesibilidad, idioma y tamaños (Claude revisa, Codex ejecuta barrido)
- Contraste medido de cada par de colores; tamaño de texto del sistema al máximo; VoiceOver y TalkBack (labels de muestras, slider ajustable).
- ES y EN con textos largos; anchos 360/390/430 pt y tablet.
- Capturas por estado guardadas en `qa/screenshots/` para revisión del equipo.

### Etapa 6 — Entregable para el equipo gráfico (Claude)
- `ARTES_REQUERIDOS.md` con exactamente los placeholders que la UI usa (nombre de archivo `vl_*_v01`, pantalla/estado, propósito, px y proporción por densidad @1x/@2x/@3x, transparencia, zona segura, PNG maestro + WebP, peso, prioridad, alt) y criterios de aceptación; logo e icono marcados como ya aprobados.
- **Fin de Fase 1** → revisión contigo antes de iniciar lógica.

---

## 4. Fase 2 — Lógica (solo esbozo; se detallará al terminar la Fase 1)

1. **Spike YouCam** (primero, obligatorio por el brief §7): credenciales, carga de selfie, un efecto por categoría (`eye_shadow`, `lip_color`, `blush`, `skin_smooth`=0), tiempos, errores y consumo de unidades → lista blanca de patrones.
2. Backend (propuesta: Node/TypeScript, p. ej. Hono o Fastify): proxy seguro a YouCam, orquestación de 3 tareas, sondeo limitado, caché por selfie+receta, límites por sesión.
3. Motor de traducción: LLM → JSON estricto → validación con esquema (zod) → reintento único → receta editorial de respaldo etiquetada.
4. Compilador de looks determinista + validador de restricciones previo a consumir unidades.
5. Sustituir la implementación `mock` de `src/services/` por la real; la UI no cambia.
6. Distribución para jueces sin pago ni registro (a definir: build de Android instalable vía EAS y/o Expo Go), README en inglés, ruta de demo reproducible, pruebas con 5 personas.

---

## 5. Trabajo con Codex (senior bajo mi cargo)

**Rol:** Codex es otro senior al que asigno trabajo **después** de que yo haya definido contratos (tokens, tipos, interfaces de servicios, componentes base, patrones). Yo sigo siendo responsable de la calidad final.

**Reglas de asignación**
1. Cada encargo tiene: objetivo, archivos que **puede** tocar (lista cerrada), archivos que **no** debe tocar, contratos a respetar, estados exigidos, criterio de aceptación y la instrucción de leer `DESIGN.md`, `PLAN.md` y el código base existente.
2. Frentes paralelos solo sobre conjuntos de archivos disjuntos, para evitar conflictos.
3. Prohibido para Codex: añadir dependencias sin pedirlo, generar o descargar imágenes, modificar tokens/tipos/i18n compartidos (me propone cambios y yo los aplico), **hacer commit o push**.
4. Revisión: leo el diff completo (`git diff`), ejecuto `typecheck`, `lint` y la app, comparo con DESIGN; si no cumple, devuelvo con correcciones (`codex exec resume`) o lo corrijo yo. Solo entonces hago commit.

**Forma de invocación** (en segundo plano, mientras yo trabajo en otro frente):
```bash
codex exec -C /home/lu/vibralook -s workspace-write \
  -o <scratchpad>/codex_<tarea>.md "<encargo detallado>"
```

---

## 6. Control de versiones y comunicación con el equipo (GitHub)

- **Remoto:** `origin` → https://github.com/shamuel22/vibralook.git. Se configura en la Etapa 1.
- **Objetivo:** que el equipo pueda revisar el proyecto y su avance en todo momento, y respaldarlo.
- **Rama:** trabajo directo sobre `main` mientras el equipo no pida otro flujo; cada commit deja la app arrancando y con `typecheck` limpio.
- **Frecuencia:**
  - Commit por unidad lógica terminada y revisada (p. ej. «tokens y tipografía», «pantalla Intención»).
  - **Push al final de cada unidad revisada y siempre al cerrar cada etapa**, de modo que el equipo vea el avance de forma continua.
  - El trabajo de Codex se commitea solo tras mi revisión, indicando en el mensaje qué parte hizo Codex.
- **Mensajes:** en inglés, estilo Conventional Commits (`feat(ui): …`, `chore: …`, `docs: …`), con la línea de coautoría requerida.
- **Cierre de etapa:** además del push, se actualiza el «Registro de avance» de este plan (§8) y, cuando aporte, se añaden capturas en `qa/screenshots/`.
- **Seguridad:** nunca se suben credenciales; `.env*` en `.gitignore` y un `.env.example` documentado cuando haya variables (Fase 2).

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Cámara frontal y permisos difieren entre iOS y Android | «Subir foto» siempre disponible; probar en ambos sistemas desde la Etapa 3. |
| Librería que no funciona en Expo Go | Verificar compatibilidad con SDK 58 antes de añadirla; si hace falta, development build. |
| Rendimiento del slider y animaciones en Android de gama media | Reanimated en hilo de UI; probar en dispositivo real en la Etapa 2. |
| Colisiones entre Claude y Codex | Archivos disjuntos + git + revisión de cada diff. |
| Confundir mock con resultado real | Sello visible de simulación y servicio intercambiable. |

---

## 8. Registro de avance

| Fecha | Etapa | Estado | Notas |
| --- | --- | --- | --- |
| 2026-10-17 | Exploración y plan | ✅ | Plan creado. |
| 2026-10-17 | Ajuste de alcance | ✅ | Solo app móvil Expo (sin web). Remoto GitHub `shamuel22/vibralook` añadido al flujo. |
| 2026-10-17 | Etapa 1 — Fundaciones | ✅ | Expo SDK 58 + Router + TS; tokens, tipografía, i18n ES/EN, modelo de dominio, reducer + SessionProvider, servicios mock con knobs, recursos de marca, rutas provisionales, galería dev, `AGENTS.md`. typecheck/lint limpios; bundles iOS/Android compilan. Verificación visual hecha después en emulador. |
| 2026-10-17 | Entorno | ✅ | Instalados Android cmdline-tools, imagen Android 36 x86_64 y AVD `vibra_pixel` (Pixel 7). App probada en Expo Go con capturas por adb. |
| 2026-10-17 | Etapa 2 — Componentes | ✅ | Claude: PressableScale, Button, ChoiceChips, BrandHeader (+ menú en form sheet), EditorialHeading, InlineNotice, ArtPlaceholder, RibbonAccent, Swatch, SimulationSeal, Screen, VibeComposer. Codex: CompareSlider, LookProgressCard, LookVariantCard, KitSelector, ZoneEditor, ResultRecipe, ZoneIcon + `/dev/components`. Revisado en dispositivo; corregidos: curvas CSS de Reanimated, chip activo+deshabilitado ilegible, estado de zonas deshabilitadas. Adelanto de Etapa 3: pantalla Intención. Pendiente de validar en dispositivo: gestos del comparador, hápticos, TalkBack/VoiceOver. |
| 2026-10-17 | Etapa 3 — Pantallas | ✅ | Claude: Intención, Kit, Tres looks (con modal de comparación), Hazlo tuyo, Resultado + tarjeta PNG (`LookCard`). Codex: Preparar selfie, Cámara, Revisión, Creación, `imagePrep`, `FaceGuide`, `SelfieTip`. Recorrido completo probado en emulador (intención → selfie → kit → creación → looks → edición → resultado → PNG guardado). Correcciones de revisión: sonda de cámara oculta eliminada (bloqueaba la apertura), cambiar cámara desde error, guía con halo de contraste, resumen sin zonas fuera del look, guardia de vibra vacía, pie de Resultado. |
| 2026-10-17 | Etapa 4 — Movimiento y pulido | ✅ | Teclado: `react-native-keyboard-controller` mantiene el CTA visible (Android edge-to-edge). Hápticos de éxito/error al guardar tarjeta y aplicar edición. Auditoría estricta de movimiento (Codex, `review-animations`): 1 bloqueante + 7 should-fix + 3 nits, todos aplicados — «Ver antes» inmediato sin fundido, indicadores de carga respetan movimiento reducido (`useMotionAllowed`), un solo shimmer, sin háptico en bordes del comparador, cinta reanuda su ciclo completo, curvas de entrada autorizadas, presión 0.97 uniforme y asimétrica, modal de comparación conserva su contenido al cerrar. Pendiente: medir en build release en un Android de gama media. |
| 2026-10-17 | Etapa 5 — QA accesibilidad, idioma, tamaños | ✅ | Pruebas en emulador a 360 dp con fuente 2.0 y movimiento reducido, ES/EN. Auditoría break-ui + a11y (Codex, solo lectura): 3 bloqueantes, 14 should-fix, 4 nits. Claude: concurrencia de estado (generación para descartar trabajo obsoleto, bloqueo síncrono de edición, `cancelEdit`, `useCancelOnLeave` en Hazlo tuyo/Creación, regeneración de textos al cambiar idioma). Codex: sello de simulación legible, kit con ítems bloqueados, `ButtonRow`, encabezado y tarjeta PNG con texto grande, ocultación iOS de capas decorativas, anuncios iOS, foco en errores, captura PNG esperando la imagen, textos ≥14 pt, mock con fallo de las tres variantes, protección de `/dev/gallery`, plurales. Claude además: pies de dos botones apilables, tarjeta de look apilada, receta y paleta que envuelven, altura del campo de vibra. Diferido a Fase 2 (documentado): plantillas de texto del mock (S10, las reemplaza el LLM) y conteo por grafemas (N2). Pendiente manual: TalkBack/VoiceOver en dispositivo real. |
| 2026-10-17 | Etapa 6 — Artes requeridos | ✅ | `ARTES_REQUERIDOS.md`: 7 artes (3 escenas de Intención, guía de encuadre, 3 texturas de Creación) + 1 opcional (cintas), con nombres, px @3x, maestro PNG + WebP, fondo, zona segura, peso, prioridad y alt; recursos de marca ya aprobados listados aparte. **Fin de la Fase 1 (UI/UX)** — esperando revisión antes de iniciar la Fase 2 (lógica). |
| 2026-10-17 | Ajustes previos a Fase 2 | ✅ | Pantalla de bienvenida (onboarding) con hueco para arte A0 + sello de marca, tres pasos y privacidad; se muestra una vez por dispositivo y desde el menú. Paso 1 simplificado con filas plegables independientes (`Disclosure`). `ARTES_REQUERIDOS.md` v2 con A0 (P1). Probado en emulador. |
| 2026-10-17 | Integración de artes v01 | ✅ | Paquete `VIBRA_LOOK_ARTES_v01` (A0–A8) revisado contra los criterios de aceptación: dimensiones, pesos, transparencia de A4/A8, sin texto, marcas ni personas. WebP en `assets/art/` + `ART_REGISTRY` (marco idéntico al placeholder); A4 con `contain`; A8 sustituye las bandas de `RibbonAccent` (misma deriva/pausas). Héroe de bienvenida a sangre completa. Carpeta de entrega excluida de tsc/eslint y versionada como respaldo. Nota: las piezas declaran haber sido generadas con IA (`prompts.md`); confirmar compatibilidad con las reglas del concurso. |
| 2026-10-17 | Correcciones de UI | ✅ | Héroe de bienvenida con el GIF `vl_onboarding_hero_comparacion_v03` (autoplay solo con movimiento permitido + rótulo «Imagen ilustrativa»). `ButtonRow`: el secundario usa su ancho natural, así «Repetir» y «Omitir por ahora» ya no se parten a mitad de palabra; el principal ocupa el resto. Verificado en español en el emulador. |
