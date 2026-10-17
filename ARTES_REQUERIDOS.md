# VIBRA LOOK — Artes requeridos para el equipo gráfico

**Versión 1 · 17-oct-2026 · Fase 1 (UI/UX) · App móvil Expo (iOS y Android)**

Este documento lista **solo** los artes que la interfaz necesita hoy (DESIGN.md §0). Cada uno ya tiene en la app un *placeholder* con su identificador, su proporción final y el rótulo «Arte pendiente». Cuando llegue el archivo aprobado se integra sin rehacer el layout: se copia a `assets/art/` y se registra en `ART_REGISTRY` (`src/components/ArtPlaceholder.tsx`).

Referencias de dirección: `img/VIBRA_LOOK_Branding_Kit.png`, `img/VIBRA_LOOK_UI_UX.png`, `img/VIBRA_LOOK_Proceso_Selfie.png`, `img/VIBRA_LOOK_Proceso_Looks.png`. Son solo referencia: no se recortan ni se reutilizan.

---

## 1. Recursos que ya existen y están aprobados (no encargar)

| Recurso | Archivo maestro | Derivados en la app | Uso |
| --- | --- | --- | --- |
| Logo horizontal | `img/VIBRA_LOOK_Logo.png` (2172×724, transparente) | `assets/brand/vl_logo_horizontal.png` (+ `@2x`, `@3x`, alto 28/56/84 px) | Encabezado de todas las pantallas y tarjeta PNG |
| Símbolo V | recortado del logo aprobado | `assets/brand/vl_symbol.png` (+ `@2x`, `@3x`) | Espacios reducidos |
| Icono de app | `img/VIBRA_LOOK_Icono.png` (1254×1254, opaco) | `assets/brand/icon.png` (1024×1024) | Icono iOS/Android |
| Icono adaptativo Android y splash | símbolo sobre transparente | `assets/brand/adaptive-foreground.png`, `adaptive-monochrome.png` (1024×1024), fondo `#24172B` | Launcher Android y pantalla de inicio |

Si el equipo gráfico prefiere entregar versiones dedicadas del icono adaptativo o del splash, son bienvenidas, pero no bloquean nada.

---

## 2. Artes nuevos

**Formatos.** Para cada pieza se entregan dos archivos:
- un **maestro PNG** (fidelidad, para edición);
- un **derivado WebP** optimizado para producción.

Si el WebP muestra artefactos visibles (bandas en degradados suaves, bordes con halo), se usa PNG en producción y se indica en la entrega.

**Densidad.** La app se muestra en teléfonos de 360–430 pt de ancho y en tablet con un máximo de 560 pt de contenido. Los píxeles indicados cubren @3x del hueco más grande.

| # | Archivo (maestro + producción) | Pantalla · componente · estado | Propósito y dirección visual | Proporción · píxeles | Fondo | Zona segura | Peso objetivo (WebP) | Prioridad | Texto alternativo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | `vl_intencion_escena_jazz_v01.png` (3200×1800) + `vl_intencion_escena_jazz_v01.webp` (1600×900) | Pantalla 1 Intención · `VibeComposer` · cuando el texto coincide con el ejemplo «Jazz en una azotea» (cabecera de la tarjeta) | Evocar la escena, no un look. Azotea al anochecer, luces cálidas, música implícita. Atmósfera editorial y serena, con paleta ciruela/coral/rosa de la marca. Sin personas maquilladas ni rostros reconocibles. | 16:9 · hueco máx. 520 pt → 1560×878 px @3x | Opaco | 8 % en todos los bordes. Las esquinas superiores se recortan con radio 24 pt; nada importante en los 72 px de cada esquina superior. | ≤ 180 KB | **P1** (demo central del brief) | Decorativa (la tarjeta ya muestra el texto). Opcional: «Azotea al anochecer con luces cálidas». |
| A2 | `vl_intencion_escena_sakura_v01.png` (3200×1800) + `.webp` (1600×900) | Igual que A1 · ejemplo «Sakura en una tarde lluviosa» | Ramas de cerezo, lluvia fina, luz difusa de tarde; nostalgia suave. Paleta rosa/orquídea/arena. | Igual que A1 | Opaco | Igual que A1 | ≤ 180 KB | P2 | Decorativa. Opcional: «Flores de cerezo bajo la lluvia». |
| A3 | `vl_intencion_escena_reunion_v01.png` (3200×1800) + `.webp` (1600×900) | Igual que A1 · ejemplo «Reunión importante pero relajada» | Espacio de trabajo luminoso, cercano y ordenado (mesa, luz de ventana, una taza); seguridad sin rigidez. Paleta arena/rosa con acento ciruela. | Igual que A1 | Opaco | Igual que A1 | ≤ 180 KB | P2 | Decorativa. Opcional: «Mesa de trabajo luminosa junto a una ventana». |
| A4 | `vl_selfie_guia_encuadre_v01.png` (2400×2400) + `.webp` (1200×1200) | Pantalla 2 Preparar selfie · bloque central sobre fondo crema | Ilustración lineal de **encuadre**: un rostro neutro de frente, completo, dentro de corchetes de esquina, como en la lámina `Proceso_Selfie`. Trazo fino ciruela; sin maquillaje marcado, sin rasgos «ideales», sin edad ni etnia marcadas. Puede llevar cintas orquídea/coral detrás, siempre suaves. | 1:1 · hueco máx. 392 pt → 1176×1176 px @3x | **Transparente** | 6 % por lado; el óvalo del rostro centrado dentro del 70 % central. | ≤ 120 KB | **P1** | Decorativa: los tres consejos de debajo ya lo explican en texto. |
| A5 | `vl_creacion_textura_susurro_v01.png` (960×960) + `.webp` (480×480) | Pantalla 6 Creación · `LookProgressCard` de **Susurro** · miniatura izquierda, en todos los estados | Textura acuarela/pigmento abstracta que identifica la variante. Susurro: lavanda, crema y rosa empolvado, ligera y luminosa. **No** debe parecer un resultado de maquillaje ni una cara. | 1:1 · hueco máx. 140 pt → 420×420 px @3x | Opaco | Radio 18 pt en las cuatro esquinas; ningún detalle clave a menos de 40 px del borde. | ≤ 60 KB | P2 | Decorativa. |
| A6 | `vl_creacion_textura_equilibrio_v01.png` (960×960) + `.webp` (480×480) | Igual que A5 · tarjeta de **Equilibrio** | Igual que A5. Equilibrio: coral, rosa y malva en mezcla media, sofisticada. | Igual que A5 | Opaco | Igual que A5 | ≤ 60 KB | P2 | Decorativa. |
| A7 | `vl_creacion_textura_declaracion_v01.png` (960×960) + `.webp` (480×480) | Igual que A5 · tarjeta de **Declaración** | Igual que A5. Declaración: ciruela profundo, vino y coral intenso; más contraste. | Igual que A5 | Opaco | Igual que A5 | ≤ 60 KB | P2 | Decorativa. |
| A8 *(opcional)* | `vl_cintas_pie_v01.png` (2880×960) + `.webp` (1440×480) | Pie decorativo de Intención, Selfie, Revisión y Creación (`RibbonAccent`), detrás del botón principal | Cintas de seda translúcidas orquídea → rosa → coral, fluidas, como en las láminas. Hoy la app usa una versión sencilla en código (bandas con el degradado de la marca); este arte la reemplazaría. | 3:1 · ancho máx. 430 pt (teléfono) → 1290 px @3x; el alto visible es de 120–150 pt | **Transparente** con degradado de opacidad hacia arriba (100 % abajo → 0 % en el tercio superior) | El tercio superior queda casi transparente: el texto puede pasar por encima. | ≤ 150 KB | P3 | Decorativa. |

**Nota de integración (A8).** A diferencia de A1–A7, este arte no entra por `ART_REGISTRY`. Se integra sustituyendo las bandas de `RibbonAccent` por la imagen, manteniendo su deriva lenta de 4–8 px y la pausa con movimiento reducido. Es un cambio pequeño de código; está previsto.

---

## 3. Criterios de aceptación (todos los artes)

1. **Sin texto incrustado.** La app traduce todo a ES/EN; ninguna palabra va dentro de la imagen.
2. **Sin marcas** comerciales, logotipos ajenos ni productos reconocibles.
3. **Sin rostros reales maquillados** que puedan confundirse con una prueba virtual. La única cara que la app muestra como resultado es la selfie de la persona.
4. **Coherencia con la marca:** paleta de DESIGN.md §2 (`#24172B`, `#FFF8F2`, `#B58BDD`, `#F46E64`, `#D8A2AB`, `#D6BFAE`), tono editorial y sereno, nada de destellos ni señales genéricas de IA.
5. **Legibilidad:** A1–A3 llevan debajo texto ciruela sobre blanco, separado por un borde; la imagen no necesita contraste propio con el texto. A4 y A8 se apoyan sobre crema `#FFF8F2`: comprobar que se leen sobre ese fondo.
6. **Respeto a la diversidad** (A4): sin rasgos idealizados, sin suavizado de piel ni alteración de facciones (DESIGN.md §2, «Texturas e imágenes»).
7. **Técnico:** sRGB; PNG de 8 bits por canal (con alfa solo donde se indica transparente); WebP con calidad visual equivalente y peso dentro del objetivo; dimensiones exactas de la tabla; nombres exactos en minúsculas con guiones bajos.
8. **Versionado:** una revisión se entrega como `_v02`, `_v03`… sin sobrescribir la anterior.

---

## 4. Cómo se verifica en la app

- **Pantalla 1:** escribe o elige «Jazz en una azotea», «Sakura…» o «Reunión…». La cabecera de la tarjeta muestra A1–A3.
- **Pantalla 2** (Selfie): A4.
- **Pantalla 6** (Creación): A5–A7 en las tres tarjetas, en los estados interpretando, en espera, procesando, listo y error.
- **En desarrollo:** menú ☰ → «Galería de componentes (dev)» → «Componentes compuestos» muestra las tarjetas de progreso en todos sus estados sin recorrer el flujo.
