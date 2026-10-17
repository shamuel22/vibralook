# VIBRA LOOK — Paquete de artes v01

Nueve piezas finales A0–A8 del inventario, incluida la cinta opcional. Sin texto incrustado ni marcas. Los recursos de marca existentes no se vuelven a incluir ni se sustituyen.

## Contenido

- `assets/art/`: 9 WebP de producción, con los nombres y tamaños solicitados.
- `maestros_png/`: 9 PNG maestros, RGB/RGBA de 8 bits, perfil sRGB.
- `art-assets.ts`: imports estáticos preparados para Expo/React Native; copiar junto a la carpeta `assets`.
- `documentacion/VISTA_GENERAL.jpg`: vista de las nueve piezas sobre crema.
- `documentacion/ARTES_REQUERIDOS.md`: inventario original.
- `documentacion/exportaciones.json`: dimensiones, pesos, calidad y resolución original de generación por pieza.
- `documentacion/prompts.md`: dirección utilizada para crear los artes.

## Integración

1. Copiar el contenido de `assets/art/` a la carpeta del mismo nombre en el proyecto.
2. Registrar A0–A7 en `ART_REGISTRY` de `src/components/ArtPlaceholder.tsx`, usando las claves existentes de la app. `art-assets.ts` proporciona los `require` estáticos; ajustar su ruta relativa si se mueve el archivo.
3. A8 se usa directamente en `RibbonAccent`, reemplazando las bandas actuales. Conservar la deriva de 4–8 px, la pausa cuando la pantalla no está visible y el comportamiento de movimiento reducido.
4. Conservar los radios de esquina de los componentes en código. Las imágenes no incorporan esquinas redondeadas ni textos.
5. A0–A3 y A5–A7 son opacas. A4 y A8 tienen transparencia real. Usar `contain` para A4; mantener 4:5 en A0, 16:9 en las escenas, 1:1 en texturas y 3:1 en A8. No deformar.
6. A0 reserva el centro inferior para el sello. A8 deja el tercio superior transparente y aumenta la opacidad hacia abajo. Apoyar ambas piezas transparentes sobre `#FFF8F2`.
7. Todas las piezas son decorativas según el inventario: no duplicar en lectores de pantalla lo ya expresado por el texto de la UI. Ninguna pieza representa una respuesta de YouCam.

## Exportación y revisión

Los PNG maestros y WebP tienen las dimensiones exactas del inventario. Los maestros se reescalan con filtro Lanczos desde la resolución original de generación, documentada por pieza; el aumento de dimensiones no implica detalle nativo adicional. La opacidad de A8 se ajusta en exportación para cumplir la zona de lectura. Todos los WebP quedan dentro del peso objetivo en KB decimales. Se revisaron composición, transparencia sobre crema, archivos decodificables y tamaños; la integración dentro de la app debe comprobarse al copiar los recursos.

Para cambiar una pieza posteriormente, entregar `_v02` y actualizar su referencia sin sobrescribir `_v01`.
