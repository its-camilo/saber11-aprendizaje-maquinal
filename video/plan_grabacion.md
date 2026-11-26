# Plan de grabación — Video Proyecto 3 (Saber 11 2025)

- **Límite:** 6:00 minutos. El guion (`guion_video.md`) tiene 872 palabras, ~5:50 a 150 palabras/minuto.
- **Formato exigido:** presentación de diapositivas explicando todo, con las caras de los dos expositores visibles.
- **Diapositivas:** `video/presentacion.pdf` (9 diapositivas, Beamer). Fuente editable: `video/presentacion.tex` — se recompila con `pdflatex presentacion.tex` (dos veces). Las figuras salen de `informe/fig/`.
- **Entrega:** 9 dic 2026, 11:00 (Bogotá). Presentación final ese mismo día.
- **No grabado todavía:** esto es preparación para revisión de Camilo y Luis.

## Orden de grabación

Grabar en el orden del guion, un bloque por toma si se graba por segmentos, o de corrido si se graba en vivo. Cada bloque termina con el cambio de diapositiva indicado.

| # | Bloque | Quién | Diapositiva | Tiempo |
|---|---|---|---|---|
| 1 | Presentación | Camilo | 1 Portada | 0:00–0:35 |
| 2 | Problema y datos | Luis | 2 Problema y datos | 0:35–1:20 |
| 3 | K-means colegios | Camilo | 3 Tipos de colegio | 1:20–2:05 |
| 4 | K-means estudiantes | Luis | 4 Estudiantes (ilustrativo) | 2:05–2:30 |
| 5 | J48 | Camilo | 5 Clasificación | 2:30–3:25 |
| 6 | Hallazgos | Luis | 6 Hogar vs. colegio | 3:25–4:10 |
| 7 | Bandit | Camilo | 7 Tutor virtual | 4:10–4:50 |
| 8 | Comparación | Luis | 8 Comparación 2022 | 4:50–5:20 |
| 9 | Conclusiones | Camilo | 9 Conclusiones | 5:20–6:00 |

## Recomendación de herramienta (Camilo decide)

| Herramienta | Pros | Contras |
|---|---|---|
| **Zoom gratis, grabación local (juntos en vivo)** — recomendada | Los dos en pantalla a la vez, caras visibles; graba en local y descarga el MP4; límite de 40 min en grupo, sobra para 6 min | Hay que compartir pantalla con las diapositivas y revisar que la cámara no tape el texto |
| **Segmentos asíncronos + Clipchamp** | Cada uno graba su bloque cuando pueda, sin coordinar horario; fácil recortar y re-grabar un bloque que salga mal | Unir 9 segmentos y nivelar audio toma más edición; hay que cuidar que el cambio de voz no se note brusco |
| OBS (gratis) | Sin límite ni marca de agua; graba pantalla + cámara a la vez | Hay que configurarlo antes (escena, micrófono, resolución) |
| PowerPoint, grabación por diapositiva | Graba directo sobre cada diapositiva y exporta MP4; natural para re-grabar una sola | Requiere pasar el deck a PowerPoint; la cámara queda en una esquina pequeña |
| Loom gratis | Simple | Corta a 5 min y es de un solo presentador: **no sirve para este video** |
| StreamYard gratis | Hasta 6 en pantalla | No deja descargar la grabación: **no sirve** |
| Google Meet personal gratis | — | No graba; con cuenta UNAL no está verificado si graba |

**Sugerencia si no hay preferencia:** Zoom gratis en vivo, los dos juntos, compartiendo la pantalla con el PDF de diapositivas en pantalla completa y la cámara encendida. Una sola toma de 6 minutos; si algo sale mal, se repite solo desde el bloque que falló y se corta en edición.

## Lista de verificación antes de grabar

- [ ] Ensayar el guion una vez con cronómetro (meta: 5:40–5:55, para dejar margen).
- [ ] Decidir la herramienta y probarla 5 minutos antes (audio, cámara, pantalla compartida).
- [ ] Diapositivas en pantalla completa; letra legible en la grabación.
- [ ] Micrófono cerca, lugar silencioso, buena luz de frente.
- [ ] Las dos caras visibles en todo momento (cámara encendida en ambos).
- [ ] Al terminar, revisar duración total ≤6:00 y que se oigan los dos.
- [ ] Exportar/guardar el MP4 final y verificar que se reproduce completo.

## Si se pasan de 6:00 al ensayar

1. Recortar primero el bloque 8 (comparación con 2022): quitar la frase de las brechas, que ya se dijeron en el bloque 6.
2. Luego el bloque 4 (K-means de estudiantes): dejar solo la advertencia de inestabilidad.
3. No recortar los bloques 3, 5 y 6: son el núcleo del video.
