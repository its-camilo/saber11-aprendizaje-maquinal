# Guion del video — Proyecto 3, Aprendizaje Maquinal (Saber 11 2025)

- **Duración total:** 6:00 minutos como máximo (el guion está calculado para ~5:55).
- **Formato:** presentación de diapositivas (`video/presentacion.pdf`), con las caras de los dos expositores visibles en cámara durante todo el video.
- **Expositores:** Camilo Alejandro Lagos Malaver y Luis Gabriel Peraza Muñoz.
- **Ritmo de referencia:** ~150 palabras por minuto. Si al ensayar se pasan de 6:00, recorten primero el bloque 8 (comparación con 2022) y luego el bloque 4 (K-means de estudiantes).
- **Fuente de todos los números:** el informe corregido (`informe/informe.pdf`) y `results/2025/brechas.csv`. No se inventó ningún número.
- **Palabras del texto hablado:** 872 (contadas por bloque, sin contar títulos ni marcas).

---

## Bloque 1 — Presentación (0:00–0:35, 35 s, 78 palabras) — Diapositiva 1

**Camilo:** Hola, somos Camilo Lagos y Luis Peraza, estudiantes de Ingeniería de Sistemas de la Universidad Nacional, y este es nuestro proyecto de Introducción a Sistemas Inteligentes. Tomamos todos los resultados del examen Saber 11 de 2025 y les aplicamos tres técnicas de aprendizaje maquinal, una de cada paradigma, para entender qué se asocia con el desempeño de los estudiantes. La pregunta que nos guía es sencilla: ¿pesa más el hogar, el colegio o el municipio donde se estudia?

## Bloque 2 — Problema y datos (0:35–1:20, 45 s, 94 palabras) — Diapositiva 2

**Luis:** El Saber 11 evalúa matemáticas, lectura crítica, sociales, ciencias naturales e inglés al terminar la educación media, y cada registro trae además un cuestionario socioeconómico y datos del colegio. Trabajamos con los microdatos de DataIcfes: 661.891 inscritos, 661.889 tras quitar duplicados, y 561.049 estudiantes de colegio con los cinco puntajes, 21.675 del periodo 20251 y 539.374 del 20252. Los cruzamos con el índice de pobreza multidimensional municipal del DANE 2018, que cubre al 99,98 % de los estudiantes, y con indicadores agregados de cada colegio, calculados sin usar puntajes para no filtrar la respuesta.

## Bloque 3 — K-means: tipos de colegio (1:20–2:05, 45 s, 111 palabras) — Diapositiva 3

**Camilo:** La primera técnica es agrupación con K-means, sobre 9.692 colegios con al menos diez evaluados, con siete indicadores como el porcentaje con computador, madres profesionales e IPM, sin que el algoritmo viera el puntaje. El codo es claro en cuatro grupos. El rural pobre, con 2.237 colegios, promedia 225 puntos y un IPM de 51,6; el oficial intermedio, 243; el urbano conectado, 266; y el privado acomodado, 310. Entre el primero y el último hay 85 puntos de diferencia. Una regresión sobre esos indicadores explica el 66 % de la varianza entre colegios. Y entre el 10 % que más supera lo esperado por su contexto, el 65,1 % son oficiales.

## Bloque 4 — K-means: estudiantes, con cautela (2:05–2:30, 25 s, 68 palabras) — Diapositiva 4

**Luis:** A nivel de estudiante, K-means con tres grupos sí encuentra un grupo privado acomodado, con 291 puntos, y dos grupos oficiales, con 245 y 259. Pero estos grupos no son estables: al cambiar la semilla, la similitud entre particiones cae a 0,17 y a 0,02. Por eso los presentamos como ilustrativos de una sola corrida, no como un resultado robusto, y la conclusión útil sale del nivel colegio.

## Bloque 5 — J48: qué predice quedar arriba (2:30–3:25, 55 s, 135 palabras) — Diapositiva 5

**Camilo:** La segunda técnica es clasificación con un árbol J48 de Weka, que predice si un estudiante queda sobre la mediana de 2025, de 254 puntos. Con 48 atributos, acierta el 70,7 % en validación cruzada de diez particiones, con kappa de 0,41 y AUC de 0,77, frente al 50,2 % de la línea base. Las variables nuevas y los cruces suben dos puntos frente al modelo de 2022. La raíz del árbol es el nivel socioeconómico del colegio, y los dos atributos más informativos son de nivel colegio: el porcentaje de compañeros con computador y el NSE. Por ejemplo, un colegio NSE4 predice Alto con 92 % de acierto y uno NSE1 predice Bajo con 76 %, mientras el estrato del hogar apenas aparece en el puesto 23. El mensaje es claro: el colegio primero.

## Bloque 6 — Hallazgos: hogar frente a colegio (3:25–4:10, 45 s, 112 palabras) — Diapositiva 6

**Luis:** El cruce de estrato con NSE lo confirma: un estudiante de estrato 1 obtiene 237 puntos en un colegio NSE1 y 328 en uno NSE4, 91 puntos más por el colegio, con el mismo estrato en casa. Otras brechas: computador en casa, 30 puntos; colegio privado, 28; zona urbana, 24; y la brecha por género creció de 7,3 en 2022 a 8,9 en 2025. Trabajar más de 30 horas a la semana resta 34 puntos, tener más de cien libros suma 42 y leer por gusto entre 30 y 60 minutos suma 15. Por municipio, el puntaje baja de 268 donde el IPM es menor a 20, a 224 donde supera 50.

## Bloque 7 — Bandit: el tutor virtual (4:10–4:50, 40 s, 98 palabras) — Diapositiva 7

**Camilo:** La tercera técnica es refuerzo: un bandit contextual, LinUCB, que actúa como tutor virtual y elige qué área reforzar para cada estudiante. La recompensa es qué tan rezagado está el estudiante en el área elegida, así que el agente aprende a identificar el área más débil, no demuestra que reforzarla mejore el puntaje. LinUCB reduce el arrepentimiento 14,6 % frente al azar y acierta el área óptima el 26,1 % de las veces, contra el 20 % del azar. Su política es interpretable: elige inglés en colegios oficiales, rurales y con IPM alto, y matemáticas en los privados.

## Bloque 8 — Comparación con 2022 y entre técnicas (4:50–5:20, 30 s, 85 palabras) — Diapositiva 8

**Luis:** Frente a 2022, las brechas casi no cambiaron en tres años, y las tres técnicas coinciden en lo esencial: el contexto del colegio pesa más que el del hogar, la pobreza del territorio se suma y el perfil no predice bien a cada persona. J48 se queda en 70,7 %, los grupos de estudiantes son inestables y el bandit acierta el área óptima solo una de cada cuatro veces. Cada técnica responde una pregunta distinta, con información distinta, y aun así llegan a lo mismo.

## Bloque 9 — Conclusiones y cierre (5:20–6:00, 40 s, 91 palabras) — Diapositiva 9

**Camilo:** En conclusión, el desempeño se asocia sobre todo con el contexto del colegio, seguido de la jornada, la educación de la madre, la edad y la pobreza del municipio. Trabajar durante el bachillerato, tener pocos libros y no leer por gusto se asocian con puntajes más bajos. Todo esto son asociaciones, no causas. Como trabajo futuro, cuando estén los resultados de Saber Pro de esta cohorte, se podrá seguir a estos estudiantes, y comparar con modelos como Random Forest. El código y los resultados están en nuestro repositorio público. Muchas gracias.

---

## Reparto

| Bloque | Quién | Tiempo |
|---|---|---|
| 1 Presentación | Camilo | 0:00–0:35 |
| 2 Problema y datos | Luis | 0:35–1:20 |
| 3 K-means colegios | Camilo | 1:20–2:05 |
| 4 K-means estudiantes | Luis | 2:05–2:30 |
| 5 J48 | Camilo | 2:30–3:25 |
| 6 Hallazgos | Luis | 3:25–4:10 |
| 7 Bandit | Camilo | 4:10–4:50 |
| 8 Comparación | Luis | 4:50–5:20 |
| 9 Conclusiones | Camilo | 5:20–6:00 |
| **Total** | **Camilo 5 bloques, Luis 4 bloques** | **6:00** |

Camilo habla 513 palabras y Luis 359: Camilo abre y cierra, y Luis lleva los datos, los hallazgos y la comparación. Si quieren repartir más parejo, el bloque 9 (conclusiones) puede pasarlo a Luis sin tocar el resto.
