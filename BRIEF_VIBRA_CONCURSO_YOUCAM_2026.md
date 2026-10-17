# VIBRA LOOK — Del sentimiento a un look que sí puedes llevar

**Brief de concepto y construcción · Versión de concurso · 28 de septiembre de 2026**

## 1. Tesis

Una persona no piensa «quiero el labial #A04F62 y una sombra satinada». Piensa «quiero verme serena, pero con carácter, para una noche de jazz». VIBRA LOOK interpreta ese lenguaje humano y lo convierte en **tres opciones de maquillaje sobre su propio rostro**, adaptadas al tiempo y a los productos que declara tener. Luego permite dirigir el resultado sin perder lo que ya le gustó: «conserva los ojos de esta opción; cambia solo los labios».

La promesa visible es: **«Describe cómo quieres sentirte. Descubre tres maneras de expresarlo en tu rostro. Quédate con lo que te gusta y conviértelo en pasos que puedes hacer hoy».**

Esta primera versión es una *app móvil*. El prototipo funciona en español e inglés; la presentación del concurso y el video tendrán narración o subtítulos en inglés.

## 2. Razón para competir

El concurso exige al menos una API YouCam y evalúa con el mismo peso implementación, diseño, impacto e idea. Una simple conversión de texto a maquillaje ya tiene antecedentes en Devpost. Por ello, el elemento distintivo de esta propuesta es la **dirección creativa con restricciones reales**: tres interpretaciones de una misma emoción, control independiente de zonas, preservación de una elección previa y una receta realizable con un kit reducido.

**Demostración central:** «Cena en un rooftop, elegante pero nada recargado. Tengo diez minutos y no quiero brillo». La aplicación produce tres interpretaciones, muestra la prueba en el rostro, recibe «me gustan estos ojos, pero prefiero otros labios», genera la versión corregida y entrega cuatro pasos de aplicación con productos disponibles.

No se afirmará que VIBRA LOOK predice cómo durará un cosmético, que iguala exactamente un producto comercial ni que proporciona diagnóstico de la piel. El valor mostrado es la **traducción de intención, comparación y decisión practicable**.

## 3. Usuario y trabajo por resolver

Persona que se maquilla ocasional o habitualmente, tiene una ocasión o una sensación en mente y carece de las palabras técnicas para convertirla en tonos, intensidad y aplicación. Desea decidir en pocos minutos, verse a sí misma y evitar una recomendación que requiera herramientas que no tiene o más tiempo del disponible.

**Resultado satisfactorio:** la persona elige una opción, puede explicar qué le gusta, modifica una zona sin perder el resto y sale con una guía corta que respeta sus restricciones.

## 4. Experiencia completa de la primera versión

### Pantalla 1 — La intención

- Campo principal: «¿Qué VIBRA LOOK quieres transmitir?» con texto libre y tres ejemplos originales: «Sakura en una tarde lluviosa», «reunión importante pero relajada» y «jazz en una azotea».
- Dos controles rápidos: **tiempo disponible** (5, 10 o 20 minutos) e **intensidad preferida** (sutil, equilibrada o expresiva).
- Selector de restricciones opcionales: «sin sombra», «sin brillo» o «labios discretos». Se permiten varias, si no entran en conflicto.
- Botón «Traducir mi VIBRA LOOK».

### Pantalla 2 — Mi kit mínimo

- Se marcan categorías disponibles: **labial, sombra y rubor**. Para cada una, la persona elige entre una pequeña biblioteca de colores y acabados comunes que representan lo que posee. No se le pide marca ni nombre comercial.
- Se pueden marcar **hasta dos variantes por categoría**. La pantalla se puede omitir; entonces la salida se presenta como **paleta orientativa**, sin afirmar «puedes hacerlo con tu kit».
- Cuando el usuario sí define su kit, la recomendación usa solamente esos colores y categorías para su receta. Si una VIBRA LOOK no se puede expresar fielmente con ellos, la aplicación lo dice y ofrece la interpretación más cercana.
- La representación virtual de un color elegido es una **aproximación visual**; no se afirma que coincida con la formulación o pigmentación real de un cosmético.

### Pantalla 3 — Tres traducciones

- Se generan **tres recetas distintas** de la misma intención: **Susurro** (más discreta), **Equilibrio** (apta para la ocasión) y **Declaración** (más expresiva). Sus nombres y textos explican la dirección; los efectos concretos dependen de la descripción y las restricciones.
- Cada tarjeta incluye una frase del tipo «tradujimos “jazz” en profundidad de ojos y un labio cálido, manteniendo la intensidad que pediste», tres muestras de color y la prueba virtual sobre **la misma selfie original**.
- Las imágenes llegan progresivamente. Mientras se procesan, se muestran la paleta y la intención de cada variante, sin simular un resultado ya generado.
- La persona compara el original y cualquiera de las variantes con un control de antes/después y elige una.

### Pantalla 4 — Dirige el look

- Tres zonas editables: **ojos, labios y mejillas**. Cada zona muestra un resumen de tono, acabado e intensidad.
- Acciones rápidas: «menos intensidad», «más intensidad», «cambiar tono» y «usar esta zona de otra variante».
- Al mezclar zonas, se conservan de forma exacta los **parámetros de la receta seleccionada**, no píxeles tomados de imágenes distintas. El sistema produce una nueva imagen mediante YouCam **desde la selfie original**.
- El resumen «Se conservaron ojos y mejillas; cambiaron solo los labios» acompaña la actualización. Hay deshacer de un paso mediante el estado anterior de la receta.
- Si el cambio incumple una restricción (por ejemplo, añadir sombra tras elegir «sin sombra»), no se envía a renderizar; la interfaz propone una alternativa válida.

### Pantalla 5 — Llévalo a la vida real

- Imagen final y comparador con la selfie original.
- Guía de **tres a cinco pasos**, en el orden de aplicación y dentro del tiempo elegido; utiliza nombres de categorías y colores del kit declarado o indica claramente que la paleta es orientativa.
- Explicación breve de la traducción de la VIBRA LOOK: qué evocó el lenguaje del usuario y cómo eso se expresó en ojos, labios y mejillas.
- Tarjeta descargable en PNG con imagen, paleta y pasos. No incluye marcas o promesas de producto inexistentes.

## 5. Dirección visual y tono

La experiencia se siente como un **estudio creativo personal**, no como una tienda, un examen facial o un chatbot genérico. El rostro ocupa el centro; el texto acompaña las decisiones, sin taparlo. Cada interpretación tiene una identidad cromática propia y muestra los colores usados. Los controles expresan acciones humanas («menos dramático», «conserva esto») y pueden revelar parámetros técnicos solo en la documentación o en una vista de desarrollador, nunca como requisito para la persona usuaria.

Diseño móvil primero, tipografía legible, contraste suficiente, tiempos de espera explícitos y mensajes de error que permiten continuar. Las fotos de demostración son propias o cuentan con permiso; las tarjetas y el video no usan marcas comerciales ajenas.

## 6. Motor de traducción: cómo debe funcionar

La IA **interpreta** el lenguaje libre; una capa determinista **decide qué se puede enviar** a YouCam.

1. Un modelo de lenguaje recibe la VIBRA LOOK, tiempo, intensidad, restricciones y kit. Devuelve un objeto JSON estricto con tres recetas semánticas: paleta, énfasis de cada zona, intensidad, explicación y pasos. Nunca inventa nombres de productos.
2. El servidor valida el objeto con un esquema: longitud del texto, enums, colores permitidos, zonas disponibles, tiempo y restricciones. Si el JSON es inválido, se reintenta una vez y luego se utiliza una receta editorial prediseñada identificada como tal.
3. Un **compilador de looks** convierte cada receta a configuraciones permitidas de `eye_shadow`, `lip_color` y `blush` de YouCam. Los patrones provienen de una lista blanca probada en el entorno real; no se deja al modelo inventar identificadores ni campos de la API.
4. Se verifican restricciones *antes* de llamar a YouCam. La elección de un tono del kit se hace mediante mapeo a su muestra configurada; si no hay una coincidencia viable, se informa, no se finge.
5. Cada edición modifica una zona del objeto `LookRecipe`, conserva las otras dos y vuelve a compilar y renderizar desde la selfie base. Así se impide la degradación por encadenar imágenes generadas.

**Modelo mínimo de estado:** `sessionId`, `sourceImageRef`, `userIntent`, `constraints`, `kit`, `variants[3]`, `selectedRecipe`, `previousRecipe`, `renderJobs`, `finalRecipe`. Cada receta contiene `eyes`, `lips`, `cheeks`, `explanation`, `steps` y un indicador de si los tonos provienen del kit o de la paleta orientativa.

**Regla de honestidad:** texto, paleta, parámetros renderizados y pasos deben derivarse de **la misma receta guardada**. Una edición actualiza conjuntamente los cuatro; nunca se muestra una explicación correspondiente a una versión anterior.

## 7. Integración YouCam y arquitectura

**API obligatoria:** AI Makeup Virtual Try-On de Perfect Corp / YouCam. La documentación describe efectos por categoría y un flujo asíncrono de cargar imagen → crear tarea → consultar estado → obtener URL de resultado. Se usarán `eye_shadow`, `lip_color` y `blush`; se enviará `skin_smooth` con intensidad cero para no alterar el aspecto de la piel por defecto. Se validarán sobre rostros reales los patrones y parámetros exactos antes de congelar la lista blanca.

**Punto técnico relevante:** el endpoint REST trabaja sobre una **imagen**, no garantiza un espejo de video continuo. En la interfaz se llama «vista previa en tu foto» o «prueba virtual», nunca «cámara en vivo».

**Stack elegido:** Expo (Ultima version estable) para UI. El backend a eleciono del modelo que construye el backend, que en teoria sera el mismo que construya la UI/UX. 

**Flujo técnico:** captura/carga de selfie → corrección de orientación y reducción de tamaño en cliente → validación básica de formato/tamaño/rostro visible → carga segura a YouCam desde el servidor → generación y validación de las tres recetas → tres tareas de maquillaje independientes sobre la misma imagen → sondeo limitado con reintentos y estado por variante → resultados progresivos → nueva tarea solo cuando el usuario confirma una edición → tarjeta final generada desde los datos de la receta.

El servidor normaliza la respuesta real de la API antes de enviarla a la UI y maneja errores por variante. Una variante fallida no borra las otras. Se limitan las regeneraciones por sesión y se evita duplicar una tarea con la misma selfie y receta mediante una clave de cache temporal. Las imágenes no se publican en URLs propias abiertas ni se conservan más tiempo del necesario para la sesión; la interfaz explica que la foto se procesará por el proveedor de la prueba virtual.

La primera tarea de ingeniería es un **spike real**: conseguir credenciales, comprobar la carga de una selfie, aplicar un efecto de cada categoría y documentar sus respuestas, tiempos, errores y consumo de unidades. Solo después se fija la biblioteca de patrones. La inscripción permite solicitar un código de **1,000 unidades de API** para el hackathon; el consumo de cada efecto y los límites se comprobarán en el panel, sin suponer que 1,000 equivale a cierto número de sesiones.

## 8. Criterios de aceptación del prototipo

1. Una persona sin cuenta puede completar desde un móvil el recorrido intención → kit opcional → tres variantes → edición de una zona → guía final.
2. Las tres variantes son diferenciables en su resultado y respetan las restricciones marcadas; se prueban en varias expresiones de intención, incluidas las tres de la pantalla inicial.
3. Cada variante final presentada proviene de una llamada **real** a YouCam sobre la foto de la sesión. La demo no sustituye llamadas fallidas por capturas preparadas sin indicarlo.
4. Al seleccionar «conserva ojos y mejillas, cambia labios», los datos de ojos y mejillas permanecen idénticos en la receta antes y después; el nuevo render usa la selfie original.
5. Los pasos finales no hacen referencia a categorías ausentes del kit. Si no se configuró kit, se etiquetan como guía orientativa.
6. No hay embellecimiento automático de la piel en los efectos solicitados. Las restricciones se validan antes de consumir unidades.
7. Si falla el proveedor o no se detecta un rostro válido, la UI informa qué ocurrió y permite reintentar sin perder intención y kit.
8. La experiencia, el README y las instrucciones de prueba están disponibles en inglés; la UI también admite español.

## 9. Demostración para jueces

**Video de 1 a 3 minutos, con captura de la aplicación funcionando.** Apertura con el problema en una frase; entrada de una VIBRA LOOK abstracta y límites reales; presentación de tres opciones sobre la misma persona; mezcla de una zona preservando otras; resultado final con pasos y kit; cierre con el valor para consumidores y una posible integración en tiendas de belleza. Mostrar brevemente la relación entre recetas estructuradas y llamadas reales a YouCam. Preparar una cuenta o enlace de prueba sin pago, README con variables de entorno y una ruta de demo reproducible con foto autorizada; el juez también podrá subir su propia imagen.

**Métrica de validación durante el concurso:** probar con al menos cinco personas que no hayan visto el prototipo. Registrar si entienden el valor sin explicación, si distinguen las tres opciones, si logran conservar una zona mientras cambian otra y si consideran realizables los pasos. Presentar estos hallazgos como observaciones cualitativas, no como prueba de mercado.

## 10. Entregables de esta versión

- APP movil funcional con interfaz en inglés y español.
- Integración real de AI Makeup Virtual Try-On y orquestación de las tres recetas.
- Código fuente y README en inglés con instrucciones de ejecución y prueba.
- Demo accesible durante el período de evaluación, sin pago ni registro obligatorio.
- Video público de 1 a 3 minutos, narrado o subtitulado en inglés, y ficha de Devpost en inglés.

## Fuentes operativas verificadas

- [Concurso: descripción, requisitos y criterios](https://youcam-api-skin-ai-ecommerce.devpost.com/)
- [Reglas oficiales y requisitos de entrega](https://youcam-api-skin-ai-ecommerce.devpost.com/rules)
- [YouCam AI Makeup Virtual Try-On: integración y efectos](https://docs.perfectcorp.com/reference/makeup_vto/section/overview/inputs-and-outputs)
- [Antecedente directo: Perfect Corp Try-On Concierge](https://devpost.com/software/perfect-corp-try-on-concierge-w2p9vo)
- [Antecedente directo: MuseMirror](https://devpost.com/software/musemirror)

**Decisión de alcance:** esta entrega apuesta a una sola experiencia completa y verificable. El aprendizaje persistente entre sesiones, voz, diagnóstico cutáneo, lectura automática de envases, coincidencia exacta con productos comerciales y video AR en vivo no forman parte de la versión concursante.
