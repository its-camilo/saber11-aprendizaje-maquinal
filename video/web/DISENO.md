# Plan de diseño: diapositivas web del Proyecto 3 (Saber 11 2025)

Proceso de la skill frontend-design en tres pasadas: primero un borrador (pasada 1), luego una revisión contra el brief que corrige lo genérico (pasada 2) y, sobre lo construido, un rediseño con menos texto y más movimiento con sentido (pasada 3). El sistema de tokens vigente está al final de este archivo.

## Brief resumido

- **Tema:** resultados del Saber 11 de 2025 (561.049 estudiantes de colegio) y tres técnicas de aprendizaje maquinal: K-means, J48 y un bandit contextual. El hallazgo central es territorial y escolar: el colegio y el municipio pesan más que el hogar.
- **Público:** el profesor y los compañeros del curso, que ven un video de unos 6 minutos con las caras de los dos expositores en cámara.
- **Trabajo principal de la página:** acompañar el guion (9 bloques, 9 diapositivas) con un número legible por diapositiva y una sola visual que el expositor pueda señalar. Debe imprimirse a un PDF de 9 páginas 16:9.

## Pasada 1: borrador

Lo primero que salió al pensar en "presentación de datos educativos de Colombia":

- **Color:** fondo azul noche `#0E1A2B`, acento amarillo bandera `#FCD116`, rojo `#CE1126` para lo negativo. Texto blanco.
- **Tipo:** una grotesca geométrica (tipo Inter o Manrope) para todo, con cifras grandes en peso 800.
- **Portada:** el número 561.049 enorme con la etiqueta "estudiantes" debajo y un degradado amarillo.
- **Estructura:** una etiqueta en mayúsculas espaciadas sobre cada título ("TÉCNICA 1 · NO SUPERVISADO"), y las cifras de cada diapositiva repartidas en tarjetas redondeadas iguales con sombra suave.
- **Progreso:** una barra fina arriba, y el número "03 / 09".
- **3D:** columnas por tipo de colegio, girando solas todo el tiempo.

```
+--------------------------------------------------+
| TÉCNICA 1 · NO SUPERVISADO                       |
| Cuatro tipos de colegio                          |
| [tarjeta 225] [tarjeta 243] [tarjeta 266] [310]  |
|            ( columnas 3D girando )               |
|                                        03 / 09   |
+--------------------------------------------------+
```

## Pasada 2: revisión contra el brief

Probé el ejercicio que pide la skill: con un brief parecido (cualquier tema de datos sociales de cualquier país) llego casi al mismo borrador. Por eso casi todo cambió. Cada cambio y su razón:

| Borrador | Problema | Cambio |
|---|---|---|
| Azul noche + amarillo bandera | Es el default "fondo oscuro con un acento brillante", y los colores patrios no dicen nada del Saber 11. | La identidad sale del objeto físico del examen: la **hoja de respuestas de lectura óptica**. Papel blanco frío, tinta de formulario verde (las hojas usan un color de "tinta ciega" que el lector óptico ignora) y grafito de lápiz para los datos, que es lo que el lector sí lee. |
| Primer acento pensado en rosa salmón de formulario | Quedaba cerca del terracota que la skill marca y chocaba con el rojo C1 de las figuras del informe. | Tinta verde azulada `#2C7F6E`, que no se confunde con ninguno de los cuatro colores de los grupos. |
| Colores propios para los grupos | Las figuras del informe ya codifican C1–C4 en rojo, naranja, azul claro y azul oscuro; inventar otros obligaría a la audiencia a aprender dos claves. | Los cuatro tipos de colegio usan exactamente los colores de `code/2025/04_figuras.py` en el 3D, la tabla y la figura. |
| Cifra gigante con etiqueta en la portada | Es el tratamiento de héroe por defecto. | La portada es un **ítem de la hoja de respuestas**: la pregunta del guion ("¿qué pesa más…?") con tres burbujas vacías: hogar, colegio, municipio. En la diapositiva 9 vuelve la misma pregunta con la burbuja "colegio" rellenada a lápiz. El hilo narrativo es la respuesta al ítem. |
| Etiqueta ALL-CAPS sobre cada título | Cromo de plantilla. | Sin etiquetas sobre los títulos. La técnica se nombra dentro del título en frase normal ("K-means sobre 9.692 colegios"). |
| Tarjetas iguales con sombra | Kit SaaS. | No hay tarjetas. Las cifras viven en **casillas de formulario**: recuadros con borde de tinta de 1,5 px, sin sombra ni radio, con la etiqueta pequeña dentro del recuadro como en un formulario impreso. Solo las burbujas son redondas, porque en la hoja también lo son. |
| Barra de progreso arriba + "03 / 09" | Default. | Las hojas ópticas tienen **marcas de sincronización** (pequeños rectángulos negros en el borde) que el lector usa para ubicar cada fila. El borde izquierdo de cada diapositiva lleva 9 marcas: las vistas en grafito, la actual más larga. Son solo un indicador visual: no reciben clic ni foco. El número va como "Diapositiva 3 de 9". Aquí sí hay secuencia real (el orden del guion), así que numerar está justificado. |
| Grotesca geométrica genérica | Se usa en cualquier proyecto. | **Archivo** (Omnibus-Type, OFL), con eje de ancho variable 62–125 %. Los formularios impresos usan grotescas condensadas para caber en casillas; aquí el ancho es un recurso: títulos en ancho 112 % y peso 750, cifras en ancho 75 % y peso 800 con números tabulares, notas en ancho 100 %. Una sola familia, tres anchos con roles claros. Nada en monoespaciada. |
| 3D girando solo | Movimiento decorativo. | Las columnas **suben una vez** al entrar a la diapositiva 3 (C1 a C4, en orden de puntaje) y luego quedan quietas. El expositor puede arrastrar para girar; eso es movimiento que responde a una acción. |
| Animaciones de entrada en todas | Fade-and-slide genérico. | Entre diapositivas solo hay un fundido de 160 ms. Los dos únicos momentos animados son el 3D de la diapositiva 3 y las barras de brechas de la diapositiva 6, que crecen desde cero una sola vez. |
| Flecha → en botones | Tell de la skill. | Botones "Anterior" y "Siguiente" en texto, sin flechas. |
| Separadores con punto medio "A · B" | Tell de la skill. | Metadatos en líneas separadas o con coma. |

Una sola cosa es la memorable: **el territorio 3D de la diapositiva 3**. Todo lo demás es tinta de formulario y grafito, quieto y disciplinado. Quité además un accesorio antes de construir (consejo de Chanel en la skill): había pensado en un mapa de Colombia de fondo en la portada; se fue, porque la pregunta con las burbujas ya hace el trabajo.

## Pasada 3: menos texto, más movimiento con sentido

Al ensayar con el guion, las diapositivas repetían en pantalla lo que el expositor dice. Regla nueva: titular corto y una o dos cifras o frases por diapositiva; el detalle queda en `video/guion_video.md`. Ninguna cifra se borró del todo: las que salieron de la pantalla están en el guion.

### Texto recortado por diapositiva

| Diapositiva | Antes | Ahora |
|---|---|---|
| 2 Datos | Cuatro preguntas numeradas; notas bajo cada cruce ("El IPM es del municipio…", "Calculados sin usar puntajes"). | Una frase: "¿Qué tipos de colegio hay, qué predice el puntaje y qué área reforzar?". Las tres casillas de cruces pasan a filas, sin notas. El embudo 661.891 → 661.889 → 561.049 (21.675 + 539.374) se mantiene. |
| 3 Colegios | Igual. | Igual de texto; solo cambian las etiquetas 3D y las casillas (ver pulido). |
| 4 Estudiantes | Advertencia de dos frases. | Una frase: "Con otra semilla los grupos cambian: la conclusión sale de los colegios." |
| 5 J48 | Intro de dos frases, cuatro barras con etiquetas largas, casillas de kappa y AUC, árbol en texto, figura de ganancia de información y nota larga del puesto 23. | Leyenda de una línea, cuatro barras con etiquetas cortas (70,71 %, 70,45 %, 68,74 %, 50,15 %), "kappa 0,414, AUC 0,769" en una línea, "El estrato del hogar queda en el puesto 23." y el árbol animado en lugar de la figura. |
| 6 Brechas | Igual. | Igual. |
| 7 Bandit | Tabla de cuatro filas de política, advertencia de dos frases y figura PNG. | Dos filas (Inglés: oficiales 44 %, rural 58 %, IPM > 50 55 %; Matemáticas: privados 34 %), advertencia de una frase y curva SVG animada en lugar de la figura. |
| 8 Comparación | Tres coincidencias largas (una con 70,7 % y 26,1 %). | Tres frases cortas; las dos cifras ya están en la tabla y en la diapositiva 7. |
| 9 Cierre | Cinco conclusiones largas, con trabajo futuro. | Tres frases: "Trabajar, tener pocos libros y no leer restan puntaje.", "Las brechas casi no cambiaron desde 2022.", "Son asociaciones, no causas." El trabajo futuro vuelve en una línea corta: "Trabajo futuro: seguir a esta cohorte en Saber Pro y comparar con Random Forest." |

### Movimiento nuevo

Todo el movimiento se dispara con el evento `diapositiva:entrar` (al llegar por teclado, deslizar, clic en el fondo o hash) y se repite cada vez que se vuelve a entrar. Ninguna animación corre en bucle. El HTML que pintan las plantillas ya es el estado final; los módulos solo ponen el estado inicial un instante y lo llevan al final, así que con `prefers-reduced-motion`, en el PDF o si falla un script, se ve el resultado completo.

| Diapositiva | Qué se mueve | Disparo | Módulo |
|---|---|---|---|
| 3 | Las columnas 3D suben una vez, C1 a C4 (sin cambios). | Al entrar. Arrastre para girar. | `territorio3d.js` |
| 5 | Una ficha de lápiz baja desde la raíz "NSE del colegio" por cada rama, una a la vez: NSE1 → Bajo 76 %, NSE2 y NSE3 → sigue preguntando, NSE4 → Alto 92 %. Cada hoja aparece al llegar la ficha. | Al entrar y con el botón "Recorrer el árbol". | `arbolJ48.js` |
| 6 | Barras de brechas que crecen desde cero (sin cambios). | Al entrar. | `brechas.js` |
| 7 | La ventaja acumulada de LinUCB frente al azar se dibuja de izquierda a derecha, a ritmo constante, hasta unos 45 mil; el azar queda en cero. Al final aparece "−14,6 % de arrepentimiento". | Al entrar. | `bandit.js` |
| 8 | Cada valor de la columna 2025 parte del valor de 2022 y avanza hasta el de 2025 (530.815 → 561.049, 69,2 % → 70,7 %…). Al terminar se escribe el texto exacto de `contenido.js`. | Al entrar y con el botón "Repetir 2022 a 2025". | `comparacion.js` |

Decisión sobre el 3D: el árbol y la curva son planos por naturaleza, así que van en SVG; Three.js sigue solo en la diapositiva 3, donde la tercera dimensión codifica algo (base = número de colegios). La curva usa los puntos reales de `results/2025/bandit_curvas.npz` (los mismos de la figura 5 del informe), muestreados cada 20 mil estudiantes y guardados en `contenido.js`.

Código: `js/animacion.js` es el único que llama a `requestAnimationFrame`. Da la curva de suavizado, `animar()` (que salta al final con movimiento reducido) y `crearCoreografia()` para cancelar varias animaciones juntas al repetir. `territorio3d.js`, `brechas.js` (las barras de la 6 se animan por JS, no con clases CSS) y los demás módulos pasan por ahí, así que no hay lógica de animación duplicada. `app.js` solo conecta cada tipo de diapositiva con su módulo y, antes de imprimir, llama a `mostrarFinal()` de todos.

### Pulido

- **Etiquetas 3D (diapositiva 3).** La cifra y el nombre eran un solo bloque sobre la columna, y en la más alta "310,4" rozaba "Privado acomodado". Ahora son dos etiquetas: la cifra flota sobre el tope con 1,1u de aire y el nombre va al pie, delante de la base, en dos líneas como máximo y con un fondo de papel translúcido. Ya no pueden tocarse con ningún tamaño de lienzo.
- **Casillas R² y 65,1 % (diapositiva 3).** En el PDF las dos compartían media columna y el texto quedaba apretado. Las tres casillas destacadas pasan a filas de ancho completo (`casilla--fila`): cifra a la izquierda, etiqueta a la derecha a 1,35u de cuerpo, con interlineado 1,35 y más relleno. La misma pieza se usa en las casillas de cruces de la diapositiva 2.
- **Árbol J48.** Las condiciones (NSE1, NSE2 y NSE3, NSE4) van sobre la arista con un halo de papel, para que la línea no las tache.

## Sistema de tokens vigente

### Color

| Nombre | Hex | Rol |
|---|---|---|
| Papel | `#F4F6F3` | Fondo. Blanco frío, ligeramente verdoso como papel bond de formulario; no crema. |
| Grafito | `#24272B` | Texto, burbujas rellenas, marcas de sincronización, barras de datos. Contraste 14,9:1 sobre papel. |
| Tinta de formulario | `#2C7F6E` | Bordes de casillas, burbujas vacías, rejilla del suelo 3D, enlaces y foco. Contraste 4,7:1 sobre papel (válido para texto). |
| Tinta clara | `#CFE3DC` | Fondo de casillas activas, rejilla secundaria, pista de las barras. |
| Lápiz suave | `#6B7076` | Texto secundario y notas al pie. Contraste 4,9:1 sobre papel. |
| Alerta | `#A33B2F` | Solo para valores negativos (trabajar más de 30 h) y advertencias ("no robusto"). Contraste 5,9:1. |

Datos, tomados sin cambios de las figuras del informe: C1 rural pobre `#C0504D`, C2 oficial intermedio `#F79646`, C3 urbano conectado `#4F81BD`, C4 privado acomodado `#1F4E79`.

### Tipografía

Una familia, **Archivo** variable (archivo local `assets/fonts/archivo-var.woff2`, sin CDN).

| Rol | Ancho | Peso | Tamaño (u = 1 % del ancho de la diapositiva) |
|---|---|---|---|
| Título de diapositiva | 112 % | 750 | 3,1u, interlineado 1,05, tracking −0,01em |
| Título de portada | 112 % | 780 | 4,6u |
| Cifra de casilla | 75 % | 800 | 4,4u, números tabulares |
| Cuerpo | 100 % | 420 | 1,55u, interlineado 1,4, máximo 60 caracteres |
| Etiqueta de casilla y nota | 100 % | 500 | 1,05u, frase normal (sin versalitas ni mayúsculas) |

Escala modular aproximada de razón 1,5 (1,05 → 1,55 → 2,3 → 3,1 → 4,6), siguiendo la idea de escala de *The Elements of Typographic Style*.

### Layout

Lienzo 16:9 que escala con la ventana (en pantalla y en el PDF), con un margen izquierdo que lleva la pista de marcas de sincronización. Todo alineado a la izquierda sobre una rejilla de 12 columnas; nada centrado salvo la burbuja de la portada. El contador "N de 9" va como texto en la esquina inferior derecha. La navegación es solo con teclado (← → ↑ ↓, PageUp/PageDown, Home/End, barra espaciadora), con deslizar en táctil y con clic en el fondo; no hay botones. La portada y el pie muestran "Usa ← → para navegar" solo en escritorio.

Pantallas de 900 px o menos (portátil pequeño, tablet y móvil): la diapositiva deja de ser un lienzo fijo y se apila en una columna que crece con su contenido (`--u` pasa a `clamp(8px, 2.4vw, 11px)`). El contador se oculta porque el pie ya dice "Diapositiva N de 9". El corte de 900 px está en `tokens.css`, `base.css` y `diapositivas.css`; las media queries no leen variables, así que hay que cambiarlo en los tres.

Portada (1) y cierre (9), el ítem de la hoja:

```
+--+-----------------------------------------------+
|▮ | Hogar, colegio y municipio en Saber 11 de 2025|
|▮ | Agrupación, árboles de decisión y bandits     |
|▯ |                                               |
|▯ |  ¿Qué pesa más en el puntaje?                 |
|▯ |   ( ) Hogar   ( ) Colegio   ( ) Municipio     |
|▯ |                                               |
|▯ | Camilo Lagos   Luis Peraza    UNAL 2026-2     |
+--+-----------------------------------------------+
```

Diapositiva 3, el momento 3D:

```
+--+-----------------------------------------------+
|▮ | K-means sobre 9.692 colegios: cuatro tipos    |
|▮ | +---------------------------+ +-------------+ |
|▮ | |        3D: columnas       | | C1 ... 225,0| |
|▯ | |   altura = puntaje medio  | | C2 ... 243,2| |
|▯ | |   base = n.º de colegios  | | C3 ... 265,5| |
|▯ | |   (arrastre para girar)   | | C4 ... 310,4| |
|▯ | +---------------------------+ | R² 0,659    | |
|▯ |  [Ver figura del informe]     +-------------+ |
+--+-----------------------------------------------+
```

Diapositiva 6, barras que crecen:

```
+--+-----------------------------------------------+
|▮ | El colegio pesa más que el hogar              |
|▮ | Estrato 1:             | Computador   ███ 30,2 |
|▮ |  NSE1 237  NSE4 328    | Privado      ███ 27,7 |
|▮ |  +91 puntos            | Urbano       ██  23,9 |
|▮ | [figura estrato×NSE]   | Trabajo >30h ███-34   |
|▯ |                        | ...                  |
+--+-----------------------------------------------+
```

Diapositiva 5, el árbol que se recorre:

```
+--+-----------------------------------------------+
|▮ | Árbol J48: ¿quién queda sobre la mediana?     |
|▮ | J48 ████████ 70,71 %  | +-------------------+ |
|▮ | ...                   | |  [NSE del colegio] | |
|▮ | ZeroR █████ 50,15 %   | |   /     |      \   | |
|▮ | kappa 0,414, AUC 0,769| | Bajo  sigue   Alto | |
|▯ | | estrato: puesto 23  | | 76 %         92 %  | |
|▯ |                       | | [Recorrer el árbol]| |
+--+-----------------------------------------------+
```

Diapositiva 7, la curva que se dibuja, y 8, la tabla que pasa de 2022 a 2025, siguen la misma rejilla de dos columnas: casillas a la izquierda y la visual SVG (o la tabla) en el lado ancho.

Las demás con figura del informe (4 y 6) usan la variante de dos columnas: texto y casillas a la izquierda (5 de 12 columnas), figura a la derecha (7 de 12) sobre un recuadro de papel blanco con borde de tinta, que respeta que las figuras matplotlib tienen fondo blanco.

### Principios

1. **La hoja de respuestas es el sistema, no la decoración.** Burbujas, casillas y marcas de sincronización solo aparecen donde codifican algo: opciones de respuesta, cifras, posición en la presentación.
2. **Tinta para la estructura, grafito para los datos.** Lo que es formulario va en verde de tinta ciega; lo que es medición va en grafito o en los colores de los grupos del informe.
3. **Una cifra protagonista por diapositiva**, la que el guion pronuncia con más peso.
4. **El movimiento explica, no decora.** Hay movimiento en cinco diapositivas (3D de la 3, recorrido del árbol de la 5, barras de la 6, curva de la 7 y paso de 2022 a 2025 en la 8). Cada uno muestra cómo se llega al dato: crece, se recorre o cambia. Se dispara al entrar a la diapositiva (o con un botón en la 5 y la 8), se repite al volver y nunca corre en bucle. Con `prefers-reduced-motion`, en el PDF o sin JavaScript de animación, todo aparece en su estado final.
5. **Ningún número nuevo.** Todo sale del informe, de `results/2025/brechas.csv`, de `results/2025/perfil_colegios_k4.csv` o, para la forma de la curva del bandit, de `results/2025/bandit_curvas.npz`. La única operación es la resta que ya hace el informe en las brechas. Los valores intermedios de la transición de la diapositiva 8 duran menos de 2 segundos y terminan en el texto exacto.
6. **Menos texto en pantalla que en el guion.** Titular corto y una o dos cifras o frases por diapositiva; lo demás lo dice el expositor.

## Pasada 4: navegación por teclado, transiciones y responsive

Cambios sobre la pasada 3. Se verificaron con Chromium headless (`exportar.cjs capturas` a 1920, 1024 y 390 px, y una prueba de navegación, foco, movimiento reducido, deslizar y desbordes).

- **Sin botones.** Se quitaron "Anterior" y "Siguiente", el enlace de salto a los controles y el CSS y JS que solo servían a esos elementos. La navegación es con ← → ↑ ↓, PageUp/PageDown, Home/End y la barra espaciadora. En táctil, un gesto horizontal de al menos 50 px (y más horizontal que vertical) pasa de diapositiva; un gesto sobre el lienzo 3D sigue girando la escena.
- **Marcas sin interacción.** Las 9 marcas del borde son `span` decorativos (`aria-hidden`): sin clic, sin foco y sin `data-ir`.
- **Pista de teclado.** "Usa ← → para navegar" aparece en el pie de la portada, solo en escritorio (oculta con ancho ≤ 900 px o puntero táctil) y nunca en el PDF.
- **Contador.** "N de 9" queda como texto en la esquina inferior derecha de escritorio. En pantallas angostas el pie ya lo muestra, así que el contador se oculta.
- **Foco.** Al cambiar de diapositiva con teclado, gesto o clic, el foco pasa a la `section` de la diapositiva activa (sin contorno visible, porque el anuncio `aria-live` ya la nombra). Así no se pierde el foco al ocultarse el botón o enlace que lo tenía.
- **Transición.** La entrante sube 12 px mientras aparece (220 ms). La saliente se desvanece (150 ms) y luego se oculta. Un cambio rápido corta la salida en curso. Con `prefers-reduced-motion` el cambio es instantáneo.
- **Barras de la diapositiva 6.** Pasan de clases CSS a JS (`js/brechas.js`, con `Saber.animacion`). Cada entrada reinicia las barras desde cero y hace una sola pasada. Antes de este cambio, una medición en Chromium ya mostraba el reinicio correcto (escala 0 a 30 ms de volver, 1 tras 1,5 s); el cambio es para no depender del reflujo del navegador. Con movimiento reducido o al imprimir, quedan en su tamaño final.
- **Responsive.** Por debajo de 900 px la diapositiva se apila y crece con su contenido. Antes, la altura mínima dejaba hueco en la diapositiva 5. El árbol J48 y la etiqueta de la rama recta (NSE2 y NSE3) tienen tamaños propios en pantallas angostas. Las etiquetas del nombre de cada columna 3D se ocultan solo por debajo de 600 px; la tabla de la diapositiva 3 ya los muestra.
- **Árbol J48.** La condición de la rama recta va a la derecha de la línea, a media altura entre la raíz y la hoja. Antes, "NSE2 y NSE3" quedaba sobre la línea.
- **3D.** Las etiquetas de las líneas de referencia tienen fondo de papel y más separación de la columna.
- **PDF.** La impresión sigue con 9 páginas 16:9 sin animaciones a medias; la pista de teclado y el contador no salen.

## Notas para próximas pasadas

- Probado: identidad de hoja óptica, Archivo con eje de ancho, Three.js r158 en script clásico (funciona con `file://`, a diferencia de los módulos ES), animaciones SVG con `pathLength="1"` y `stroke-dashoffset`, que se imprimen bien en su estado final.
- Si se repite el tema, explorar otra metáfora del mismo mundo (el cuadernillo de preguntas, el reporte de resultados individual) en lugar de volver a la hoja óptica.
