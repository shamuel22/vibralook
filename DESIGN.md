# VIBRA LOOK — Sistema de diseño y experiencia

**Versión 1.1 · Prototipo para concurso · 17 de octubre de 2026**

## 0. Instrucción para el modelo que implemente la interfaz

Lee primero el brief funcional de VIBRA LOOK (@BRIEF_VIBRA_CONCURSO_YOUCAM_2026.md) y este documento. Inspecciona el repositorio, las imágenes de referencia y los recursos disponibles antes de construir pantallas. **Descubre las Skills instaladas** relacionadas con diseño de interfaces, animación, accesibilidad, imágenes y pruebas visuales; lee y aplica las pertinentes. Si alguna no está disponible, consulta la documentación oficial de las herramientas que ya use el proyecto y continúa con un enfoque equivalente. No introduzcas una biblioteca de animación sin comprobar si es necesaria y compatible con el stack.

Implementa la experiencia completa y prueba sus estados, no solo una captura estática. Prioriza una web app móvil funcional: intención → selfie → kit opcional → tres interpretaciones → edición → guía final. Usa los mockups como dirección visual; la lógica, los textos y los estados descritos aquí son la referencia de comportamiento.

### Referencias visuales de esta entrega (ver carpeta /img)

- `VIBRA_LOOK_Branding_Kit.png`: identidad, colores, textura, marca.
- `VIBRA_LOOK_Logo.png`: logo horizontal con transparencia.
- `VIBRA_LOOK_Icono.png`: icono cuadrado de la marca.
- `VIBRA_LOOK_UI_UX.png`: intención, interpretación, edición y resultado.
- `VIBRA_LOOK_Proceso_Selfie.png`: preparación, cámara y revisión.
- `VIBRA_LOOK_Proceso_Looks.png`: kit, progreso y tres interpretaciones.

Las láminas son **ilustraciones de diseño**. En el producto, las tres pruebas proceden de **una misma selfie original**: se debe conservar identidad, encuadre y pose. La imagen de la selfie se muestra sin maquillaje antes de renderizar los looks.

### Producción de artes y entrega al equipo gráfico (obligatorio)

**Un equipo de diseño gráfico producirá todos los artes finales nuevos.** El modelo que implemente la UI/UX debe diseñar las pantallas, la composición y los estados con **placeholders explícitos** para cualquier ilustración, fotografía editorial, textura artística o pieza gráfica que todavía no haya sido entregada y aprobada. No generar imágenes con IA, buscar imágenes de stock, extraer recortes de las láminas, dibujar ilustraciones sustitutas en CSS/SVG/canvas, ni presentar un arte inventado como si fuera final. Las láminas anteriores sirven únicamente de referencia; el logo y el icono suministrados sí son recursos de marca utilizables en sus contextos previstos.

Cada placeholder debe conservar las dimensiones o proporción del arte previsto, indicar su identificador y mostrar un rótulo discreto «Arte pendiente». Debe ser accesible y no simular una obra terminada. La interfaz debe poder recibir el archivo final sin rehacer el layout ni romper las transiciones. Los controles, muestras de color, bordes, cintas decorativas simples y otros elementos funcionales definidos por estos tokens pueden implementarse con CSS; esta autorización no incluye ilustraciones figurativas ni composiciones artísticas nuevas. La selfie tomada o subida por la persona y las respuestas reales de prueba virtual son contenido del flujo, no artes encargados al equipo gráfico.

Al terminar la estructura de UI/UX, crear **`ARTES_REQUERIDOS.md`** como entregable independiente para el equipo gráfico. Registrar **solo** los artes que la interfaz realmente necesita, uno por fila, con estos campos: nombre exacto y único del archivo, pantalla/componente y estado donde aparece, propósito y breve dirección visual, dimensiones en píxeles y proporción (incluidas variantes móvil/escritorio o densidad si proceden), fondo transparente u opaco, zona segura para recorte o superposición, formato de entrega, peso objetivo, prioridad y texto alternativo cuando aporte información. Añadir las variantes necesarias y criterios de aceptación (por ejemplo, legibilidad, consistencia con la marca, ausencia de texto incrustado y conservación de textura de piel real). Marcar qué recursos ya existen y están aprobados, como logo e icono, sin volver a encargarlos.

Nombrar los archivos nuevos con un patrón estable, por ejemplo `vl_onboarding_cintas_v01.webp` o `vl_selfie_guia_encuadre_v01.png`; usar minúsculas y guiones bajos. Solicitar **PNG** para ilustraciones maestras que requieren transparencia y fidelidad de edición; para entrega en web, preferir **WebP optimizado** cuando conserve la calidad y transparencia necesarias, especialmente en fotografías o piezas de mayor superficie. Si el WebP causa artefactos perceptibles o la pieza necesita exactitud de borde/color, conservar PNG en producción. El documento debe indicar ambos archivos cuando se requieran un maestro PNG y su derivado WebP, con nombres y dimensiones concretos. No bloquear el funcionamiento de la app mientras llegan esos artes.

## 1. Esencia de marca

**Nombre:** VIBRA LOOK. Escribir siempre así en la marca; «Vibra Look» solo en prosa cuando el contexto gramatical lo pida.

**Idea:** una sensación difícil de describir se convierte en una dirección visual que la persona puede explorar, ajustar y llevar a la vida real.

**Promesa:** «De la vibra al look». El producto ayuda a expresarse; nunca califica la belleza, prescribe un rostro ideal ni modifica facciones.

**Personalidad:** creativa, cercana, segura, editorial, serena. Debe sentirse como un estudio personal de maquillaje con criterio, sin la presión de una tienda ni la frialdad de un formulario.

**Principios:**

1. **Primero la persona.** El rostro y las elecciones del usuario protagonizan la pantalla.
2. **Interpretar sin imponer.** Tres maneras diferentes de expresar la misma intención; no existe una «correcta».
3. **Control visible.** Cuando cambian labios, ojos y mejillas conservan sus parámetros, y la interfaz lo comunica.
4. **Realismo honesto.** La prueba en foto es una aproximación visual. No afirmar precisión de producto, duración de fórmula ni diagnóstico.
5. **Movimiento con propósito.** La animación explica continuidad, selección, espera y transformación.

## 2. Identidad gráfica

### Logo y símbolo

El símbolo es una **V de dos trazos asimétricos** que parecen muestras fluidas de color: orquídea a la izquierda, coral a la derecha, con un pequeño punto degradado bajo la convergencia. Sugiere dos entradas que se encuentran en una elección propia. No añadir destellos, brochas, labios, rostros, corazones ni señales genéricas de IA.

Usar el logo horizontal en encabezados amplios y el símbolo solo en espacios reducidos. Mantener área libre equivalente a al menos el diámetro del punto alrededor del conjunto. No deformar, rotar, aplicar bisel o sombra ni situar sobre una fotografía de bajo contraste. El icono de app usa un cuadrado ciruela; no dibujar esquinas redondeadas dentro del archivo, pues la plataforma puede enmascararlo.

### Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `ink` | `#24172B` | Texto principal, CTA, fondos oscuros |
| `cream` | `#FFF8F2` | Fondo general |
| `orchid` | `#B58BDD` | Identidad, acento creativo, selección secundaria |
| `coral` | `#F46E64` | Acento cálido, énfasis, selección visible |
| `rose` | `#D8A2AB` | Superficies suaves y muestras |
| `sand` | `#D6BFAE` | Superficies neutras y muestras |
| `white` | `#FFFFFF` | Tarjetas y controles |
| `muted` | `#6C5A70` | Texto secundario |
| `line` | `#E9DDE5` | Bordes y divisores |
| `success` | `#396B58` | Éxito funcional, siempre con texto/icono |
| `error` | `#A23E4B` | Error funcional, siempre con texto/icono |

Los degradados se reservan para símbolo, acentos y cintas expresivas. **Nunca** usar coral u orquídea como texto pequeño sobre crema. Los botones primarios llevan texto blanco sobre `ink`; los secundarios, `ink` sobre crema o blanco. Comprobar contraste real de cada combinación en implementación.

### Tipografía

- **Titulares editoriales:** Fraunces, pesos 400–500, con serif elegante y personalidad. Si no está disponible, usar Georgia y ajustar interlineado.
- **Texto funcional:** Manrope, pesos 400–700; fallback `system-ui, sans-serif`.
- **Logotipo:** usar el archivo de marca suministrado, sin intentar reconstruirlo con fuente web.
- Titular H1 móvil: `clamp(2rem, 7vw, 2.75rem)`, altura de línea `1.05–1.12`. H2: `1.7rem`, altura `1.16`. Cuerpo: `1rem`, altura `1.45–1.6`. Etiquetas: `0.875rem`. Nunca bajar de `0.875rem` para instrucciones importantes.
- Los titulares pueden ocupar dos líneas; los botones conservan textos breves. Evitar capitalización total en párrafos.

### Texturas e imágenes

Las cintas translúcidas de color representan la interpretación de una emoción. En UI son decorativas, permanecen detrás del contenido y no compiten con el retrato. Retratos naturales, diversos, con textura de piel real; nada de suavizado automático, cambio de facciones o filtros de «perfección». La fotografía se recorta con intención editorial, pero en la selfie de captura debe permanecer el rostro completo.

## 3. Tokens implementables

```css
:root {
  --vl-ink: #24172b;
  --vl-cream: #fff8f2;
  --vl-orchid: #b58bdd;
  --vl-coral: #f46e64;
  --vl-rose: #d8a2ab;
  --vl-sand: #d6bfae;
  --vl-white: #ffffff;
  --vl-muted: #6c5a70;
  --vl-line: #e9dde5;
  --vl-success: #396b58;
  --vl-error: #a23e4b;
  --vl-ribbon: linear-gradient(115deg, #b58bdd 0%, #d8a2ab 52%, #f46e64 100%);

  --vl-space-1: 4px;
  --vl-space-2: 8px;
  --vl-space-3: 12px;
  --vl-space-4: 16px;
  --vl-space-6: 24px;
  --vl-space-8: 32px;
  --vl-space-12: 48px;
  --vl-space-16: 64px;

  --vl-radius-sm: 12px;
  --vl-radius-md: 18px;
  --vl-radius-lg: 24px;
  --vl-radius-pill: 999px;
  --vl-shadow-card: 0 8px 28px rgba(36, 23, 43, .08);
  --vl-shadow-float: 0 16px 48px rgba(36, 23, 43, .16);

  --vl-motion-quick: 120ms;
  --vl-motion-base: 220ms;
  --vl-motion-emphasis: 360ms;
  --vl-motion-scene: 560ms;
  --vl-ease-standard: cubic-bezier(.22, 1, .36, 1);
  --vl-ease-enter: cubic-bezier(.16, 1, .3, 1);
}
```

**Layout:** base móvil de 360–430 px, contenido con 16–20 px de margen y máximo de 560 px en pantallas grandes. En tablet/escritorio, ampliar el área de comparación de looks a dos columnas o tres tarjetas, manteniendo la selfie protagonista. Usar `env(safe-area-inset-*)` para los controles de cámara y CTA inferiores. Áreas táctiles mínimas de 44 × 44 px; foco visible de 2 px o más.

## 4. Recorrido y estructura de pantallas

El progreso es contextual, no una navegación de redes sociales. Encabezado con botón atrás, marca pequeña y, si conviene, texto discreto «Paso 2 de 5». No incluir pestañas «Perfil», «Tienda» o «Looks» en esta entrega sin funciones reales.

| Paso | Pantalla | Objetivo | Acción principal |
| --- | --- | --- | --- |
| 1 | Intención | Escribir una escena o emoción y elegir tiempo, intensidad y límites | «Traducir mi vibra» |
| 2 | Preparar selfie | Explicar rostro visible, luz uniforme, sin filtros y uso de foto | «Abrir cámara» / «Subir foto» |
| 3 | Cámara | Encuadrar un rostro completo sin distracciones | Disparador |
| 4 | Revisar selfie | Ver la foto original y repetir o aceptar | «Usar esta foto» |
| 5 | Kit opcional | Elegir categorías, tonos y acabados disponibles | «Continuar» / «Omitir por ahora» |
| 6 | Creación | Mostrar estado honesto de tres tareas independientes | Esperar o cancelar sesión |
| 7 | Tres looks | Comparar tres interpretaciones sobre la misma foto | «Elegir este look» |
| 8 | Hazlo tuyo | Ajustar una zona sin alterar las otras | «Ver cambio» |
| 9 | Resultado | Guardar imagen, paleta y pasos realizables | «Guardar look» |

En la primera visita, se puede mostrar un ejemplo de vibra como sugerencia editable. El usuario siempre puede escribir libremente.

### Selfie: contrato de experiencia

El permiso de cámara se solicita **después** de pulsar «Abrir cámara». Si se deniega, ofrecer «Subir foto» y explicación breve. Una captura válida necesita rostro completo, mirada relativamente frontal, luz suficiente y ausencia de filtros fuertes. Las indicaciones se presentan como ayuda, no como diagnóstico. Si la imagen no es procesable, conservar intención y kit, señalar el motivo comprensible y permitir repetir.

La pantalla de revisión muestra la selfie **tal como se tomó**, sin maquillaje. Incluir texto corto: «Usaremos esta foto para probar tus looks». No mostrar puntuación del rostro, tipo de piel ni supuesta medición de belleza.

### Kit opcional

Tres categorías: labios, ojos, mejillas. Hasta dos tonos por categoría, acabado mate/satinado/brillo cuando sea pertinente. Cada muestra debe tener nombre accesible, por ejemplo «rosa malva», no solo un HEX. Al omitir el kit, rotular la guía como «paleta orientativa». La miniatura de esta pantalla sigue siendo la selfie natural.

### Tres interpretaciones

`Susurro`, `Equilibrio` y `Declaración` son intensidad y expresión, no una escala de atractivo. Cada tarjeta muestra retrato, nombre, razón breve y muestras de color. Todas deben partir de la misma selfie y conservar encuadre. Un trabajo puede completarse antes que otro: renderizar ese resultado sin esperar artificialmente a las otras tarjetas. En caso de fallo parcial, mantener los resultados disponibles y ofrecer reintento solo de la tarjeta fallida.

### Edición

Cada zona tiene su bloque y acciones: intensidad, tono y «usar esta zona de otro look». La UI distingue de forma explícita qué se conserva y qué se modifica. Durante un nuevo render, mantener visible el último resultado válido con estado «Aplicando cambio…» y mostrar el nuevo solo cuando llegue. Deshacer restituye la receta anterior y su imagen correspondiente. No aplicar un efecto incremental sobre la imagen ya procesada.

### Resultado

Retrato final, paleta, explicación de la vibra en una o dos frases, guía de tres a cinco pasos y tiempo previsto. Si el kit fue declarado, mencionar únicamente sus categorías y muestras disponibles. Un botón descarga una tarjeta PNG. No prometer que un tono digital coincide exactamente con un producto físico.

## 5. Componentes y estados

| Componente | Especificación | Estados esenciales |
| --- | --- | --- |
| `BrandHeader` | Logo compacto, atrás, progreso contextual | normal, cámara, sin volver durante subida crítica |
| `EditorialHeading` | Titular serif y soporte breve sans | normal, dos líneas, traducción larga |
| `VibeComposer` | Texto libre con ejemplos editables; límite razonable de caracteres | vacío, válido, error |
| `ChoiceChips` | tiempo, intensidad, restricciones | normal, activo, inhabilitado, foco |
| `PrimaryButton` | tinta ciruela, alto 52–56 px, esquinas pill | normal, hover, pressed, loading, disabled |
| `SecondaryButton` | fondo claro, borde tinta | mismos estados |
| `SelfieGuide` | ilustración de encuadre y tres consejos | normal, permiso denegado |
| `CameraFrame` | feed real, guía oval discreta, disparador, alternativa subir | buscando rostro, listo, captura, error |
| `PhotoReview` | foto original, «Repetir» / «Usar esta foto» | cargando, válida, inválida |
| `KitSelector` | tres categorías con hasta dos muestras cada una | vacío, seleccionado, omitido |
| `LookProgressCard` | paleta + estado individual de tarea | pendiente, procesando, listo, error |
| `LookVariantCard` | foto, nombre, razón y colores | listo, elegido, cargando, error |
| `CompareSlider` | foto original y resultado, arrastre/teclado | inicio, arrastre, teclado |
| `ZoneEditor` | ojos/labios/mejillas + opciones de tono | cerrado, abierto, editado, bloqueado por restricción |
| `ResultRecipe` | pasos ordenados y categoría/color | kit propio, orientativo |
| `InlineNotice` | mensaje concreto cercano al problema | info, error, éxito |
| `RibbonAccent` | capa ornamental en secciones específicas | quieto, movimiento suave |

Usar los componentes de forma consistente; controles nativos o accesibles primero. Ninguna muestra de color depende únicamente de su color para comunicar selección: añadir borde, marca y etiqueta.

## 6. Sistema de movimiento

La interfaz debe sentirse viva sin distraer de la cara ni ralentizar las decisiones. Cada animación tiene un propósito reconocible:

| Evento | Movimiento | Duración orientativa |
| --- | --- | --- |
| Entrada de pantalla | opacidad 0→1 y desplazamiento vertical de 8–12 px | 360–560 ms |
| Chips y botones | escala `1→0.97→1`, cambio de superficie | 120–220 ms |
| Apertura de zona | expansión de contenido y rotación breve de indicador | 220–360 ms |
| Elección de look | borde y marca aparecen; tarjeta eleva 2–4 px | 220–360 ms |
| Antes/después | el divisor acompaña el dedo o teclado sin retraso perceptible | directo |
| Resultado nuevo | disolver entre imagen vieja y nueva cuando la nueva está lista | 360 ms |
| Cinta decorativa | deriva lenta de 4–8 px y opacidad leve | ciclo de 6–10 s |
| Espera de YouCam | estados por tarjeta, shimmer discreto en una sola zona | mientras dure la tarea |
| Descarga completada | confirmación pequeña, sin confeti | 220–360 ms |

Escalonar la entrada de tarjetas a intervalos aproximados de 70–90 ms, máximo tres. No animar varias regiones grandes con blur continuo; preferir `transform` y `opacity`. Reservar una única cinta decorativa animada por pantalla, lejos del área de lectura. La foto **nunca** cambia de facciones, se deforma o parpadea para simular una prueba virtual.

**Semántica del progreso:** el backend entrega estados reales `pending / processing / success / error`. No inventar porcentajes de finalización de un proveedor asíncrono. Se pueden mostrar etapas descriptivas («Interpretando tu vibra», «Probando colores en tu foto») y progreso por variante sin porcentaje numérico.

**Movimiento reducido:** respetar `prefers-reduced-motion: reduce`; quitar bucles, desplazamientos y escalados, conservar cambios inmediatos de estado y, si ayuda a comprenderlos, una transición de opacidad mínima. El proceso debe funcionar íntegramente sin animación. Pausar movimiento decorativo cuando la página no sea visible. Probar en un móvil de rendimiento medio.

**Implementación:** CSS para interacción simple; una biblioteca de movimiento solo si ya existe en el proyecto o si una transición compartida compleja lo justifica. La funcionalidad no debe depender del fin de una animación. Evitar animar `width`, `height` o sombras grandes en bucles; medir bloqueos de interacción y cambios de layout.

## 7. Voz, prosa y microcopy

Hablar de expresión, elección y posibilidad. Tono cercano, directo, sin exceso de entusiasmo ni jerga de IA. Una oración por instrucción; ninguna pantalla necesita un párrafo para funcionar.

| Situación | Texto recomendado |
| --- | --- |
| Entrada | «¿Qué vibra quieres transmitir?» |
| Selfie | «Una selfie con luz uniforme nos ayuda a probar los looks en tu rostro.» |
| Uso de foto | «Tu foto se usa para crear la prueba virtual.» |
| Captura | «Centra tu rostro» |
| Revisión | «¿Se ve bien tu selfie?» |
| Kit | «¿Qué tienes a mano?» / «Es opcional.» |
| Procesamiento | «Tu vibra toma forma» |
| Comparación | «Tres maneras de sentirlo» |
| Edición | «Conservamos tus ojos. Cambiamos solo los labios.» |
| Resultado | «Tu look, a tu manera» |
| Foto inválida | «No vemos tu rostro completo. Prueba con más luz y vuelve a intentarlo.» |
| Fallo de una variante | «Este look no se pudo generar. Puedes reintentarlo; los otros siguen disponibles.» |

No escribir «la IA detectó tus defectos», «100 % perfecto», «el color exacto» o «reconocemos tu sensibilidad». La versión inglesa debe traducir intención y naturalidad, no palabras mecánicamente.

## 8. Accesibilidad y comprobación visual

- Todas las acciones alcanzables con teclado; el control antes/después admite flechas y tiene nombre accesible.
- Etiquetas persistentes para campos y muestras; mensajes de error asociados al campo que los originó; foco trasladado al aviso cuando bloquea el avance.
- El selector de foto tiene alternativa a la cámara. Permiso denegado y hardware no disponible tienen salida clara.
- Fotos con texto alternativo contextual; cintas y texturas decorativas `aria-hidden`.
- Comprobar contraste de textos, estados de foco, tamaños táctiles, zoom al 200 %, `prefers-reduced-motion`, español e inglés con textos largos.
- Capturas de revisión en móvil 360/390/430 px y escritorio; revisar cada estado: vacío, cámara denegada, selfie inválida, kit omitido, una variante fallida, edición en curso y final.

## 9. Reglas de fidelidad para el desarrollo

1. Construir componentes reales y reutilizables, con datos y estados conectados. Las láminas no se usan como fondo de pantalla de la aplicación.
2. Mantener la paleta y el símbolo consistentes con los archivos maestros. Evitar añadir colores saturados ajenos como acentos globales.
3. Preservar exactamente la selfie fuente en todas las variantes; la API cambia maquillaje, no rostro o pose.
4. Mostrar espera real, errores parciales y recuperación. Nunca hacer pasar una maqueta precargada por una respuesta nueva.
5. Las opciones del kit afectan de verdad a la receta y a los pasos; si el kit se omite, indicarlo.
6. Entregar una interfaz animada con intención y accesible también sin movimiento.
7. Antes de finalizar, comparar el producto en dispositivo con las referencias y corregir diferencias de jerarquía, espaciado, contraste, legibilidad y estado.
8. Mantener placeholders visibles para artes no entregados y entregar `ARTES_REQUERIDOS.md` con especificaciones exactas; integrar solo archivos finales aprobados por el equipo gráfico.

**Referencia funcional:** `BRIEF_VIBRA_CONCURSO_YOUCAM_2026.md`. En caso de diferencia entre una imagen conceptual y el brief, aplicar el comportamiento del brief y mantener la dirección visual de este sistema.
