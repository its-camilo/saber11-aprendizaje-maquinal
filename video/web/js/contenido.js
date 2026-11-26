/*
 * Contenido de las diapositivas (solo datos, sin lógica de presentación).
 * Fuente de todos los números: informe/informe.pdf, results/2025/brechas.csv
 * y results/2025/perfil_colegios_k4.csv. No se agregan cifras nuevas.
 */
(function (Saber) {
  "use strict";

  const COLORES_GRUPO = {
    c1: "#c0504d",
    c2: "#f79646",
    c3: "#4f81bd",
    c4: "#1f4e79",
  };

  const pregunta = {
    texto: "¿Qué pesa más en el puntaje del Saber 11?",
    opciones: [
      { letra: "A", texto: "El hogar" },
      { letra: "B", texto: "El colegio" },
      { letra: "C", texto: "El municipio" },
    ],
  };

  Saber.contenido = {
    meta: {
      titulo: "Hogar, colegio y municipio en Saber 11 de 2025",
      subtitulo: "Agrupación, árboles de decisión y bandits contextuales",
      autores: ["Camilo Alejandro Lagos Malaver", "Luis Gabriel Peraza Muñoz"],
      curso: "Introducción a Sistemas Inteligentes, 2026-2",
      universidad: "Universidad Nacional de Colombia, Bogotá",
      fecha: "9 de diciembre de 2026",
      repositorio: "https://github.com/its-camilo/saber11-aprendizaje-maquinal",
      pie: "Lagos y Peraza, Saber 11 de 2025",
    },

    diapositivas: [
      {
        tipo: "portada",
        titulo: "Hogar, colegio y municipio en Saber 11 de 2025",
        pregunta,
        tecnicas: [
          "K-means, no supervisado",
          "Árbol J48, supervisado",
          "Bandit contextual, refuerzo",
        ],
      },

      {
        tipo: "datos",
        titulo: "El problema y los datos",
        frase: "¿Qué tipos de colegio hay, qué predice el puntaje y qué área reforzar?",
        embudo: [
          { cifra: "661.891", valor: 661891, etiqueta: "inscritos en los microdatos de DataIcfes" },
          { cifra: "661.889", valor: 661889, etiqueta: "tras quitar duplicados" },
          {
            cifra: "561.049",
            valor: 561049,
            etiqueta: "estudiantes de colegio con los cinco puntajes",
            detalle: "21.675 del periodo 20251 y 539.374 del 20252",
          },
        ],
        cruces: [
          { cifra: "99,98 %", etiqueta: "cubiertos por el IPM municipal del DANE 2018" },
          { cifra: "9.692", etiqueta: "colegios con indicadores agregados" },
          { cifra: "254", etiqueta: "puntos, mediana 2025" },
        ],
      },

      {
        tipo: "colegios3d",
        titulo: "K-means sobre 9.692 colegios: cuatro tipos",
        nota3d: "Altura: puntaje medio. Base: número de colegios. Arrastre para girar.",
        grupos: [
          { id: "c1", nombre: "Rural pobre", colegios: 2237, colegiosTxt: "2.237", puntaje: 225.0, puntajeTxt: "225,0", ipm: "51,6", computador: "20", color: COLORES_GRUPO.c1 },
          { id: "c2", nombre: "Oficial intermedio", colegios: 3294, colegiosTxt: "3.294", puntaje: 243.2, puntajeTxt: "243,2", ipm: "29,0", computador: "37", color: COLORES_GRUPO.c2 },
          { id: "c3", nombre: "Urbano conectado", colegios: 2618, colegiosTxt: "2.618", puntaje: 265.5, puntajeTxt: "265,5", ipm: "15,8", computador: "67", color: COLORES_GRUPO.c3 },
          { id: "c4", nombre: "Privado acomodado", colegios: 1543, colegiosTxt: "1.543", puntaje: 310.4, puntajeTxt: "310,4", ipm: "14,8", computador: "92", color: COLORES_GRUPO.c4 },
        ],
        destacados: [
          { cifra: "85", etiqueta: "puntos entre rural pobre y privado acomodado" },
          { cifra: "0,659", etiqueta: "R² de la regresión con los indicadores del colegio" },
          { cifra: "65,1 %", etiqueta: "son oficiales en el 10 % que más supera lo esperado" },
        ],
        figura: { src: "assets/colegios.png", alt: "Figura del informe: indicadores medios por tipo de colegio (computador, madre profesional, estudiante trabaja, 10 libros o menos, IPM del municipio) para los cuatro grupos." },
      },

      {
        tipo: "estudiantes",
        titulo: "K-means con estudiantes: ilustrativo, no robusto",
        grupos: [
          { nombre: "Oficial, mayoría mujeres", pct: 58.9, pctTxt: "58,9 %", puntajeTxt: "245,2" },
          { nombre: "Oficial, mayoría hombres", pct: 20.3, pctTxt: "20,3 %", puntajeTxt: "258,7" },
          { nombre: "Privado acomodado", pct: 20.8, pctTxt: "20,8 %", puntajeTxt: "291,3" },
        ],
        semilla: "k = 3, semilla 42",
        estabilidad: [
          { cifra: "0,17", etiqueta: "ARI frente a la semilla 1" },
          { cifra: "0,02", etiqueta: "ARI frente a la semilla 7" },
        ],
        advertencia: "Con otra semilla los grupos cambian: la conclusión sale de los colegios.",
        figura: { src: "assets/codo.png", alt: "Figura del informe: curvas del codo (SSE frente a k) para estudiantes, con k = 3 marcado, y para colegios, con k = 4 marcado." },
      },

      {
        tipo: "j48",
        titulo: "Árbol J48: ¿quién queda sobre la mediana?",
        leyenda: "Exactitud en validación cruzada de 10 particiones",
        exactitud: [
          { etiqueta: "J48, 48 atributos", valor: 70.71, txt: "70,71 %", principal: true },
          { etiqueta: "Sin cruces", valor: 70.45, txt: "70,45 %" },
          { etiqueta: "18 atributos de 2022", valor: 68.74, txt: "68,74 %" },
          { etiqueta: "ZeroR, línea base", valor: 50.15, txt: "50,15 %" },
        ],
        metricas: "kappa 0,414, AUC 0,769",
        arbol: {
          raiz: "NSE del colegio",
          ramas: [
            { rama: "NSE1", hoja: "Bajo", acierto: "76 %", tono: "bajo" },
            { rama: "NSE2 y NSE3", hoja: "sigue preguntando", tono: "sigue" },
            { rama: "NSE4", hoja: "Alto", acierto: "92 %", tono: "alto" },
          ],
          boton: "Recorrer el árbol",
        },
        nota: "El estrato del hogar queda en el puesto 23.",
      },

      {
        tipo: "brechas",
        titulo: "El colegio pesa más que el hogar",
        estrato: {
          texto: "Un estudiante de estrato 1",
          bajo: { cifra: "237", etiqueta: "en un colegio NSE1" },
          alto: { cifra: "328", etiqueta: "en un colegio NSE4" },
          diferencia: "+91 puntos con el mismo estrato en casa",
        },
        dominio: { min: -36, max: 56 },
        grupos: [
          {
            titulo: "Colegio y municipio",
            filas: [
              { etiqueta: "Colegio privado frente a oficial", valor: 27.7, txt: "+27,7", detalle: "278,0 frente a 250,3" },
              { etiqueta: "Zona urbana frente a rural", valor: 23.9, txt: "+23,9", detalle: "261,5 frente a 237,6" },
              { etiqueta: "Municipio con IPM\u00a0<\u00a020 frente a IPM\u00a0>\u00a050", valor: 44.3, txt: "+44,3", detalle: "268,1 frente a 223,8" },
            ],
          },
          {
            titulo: "Hogar y estudiante",
            filas: [
              { etiqueta: "Más de 100 libros frente a 0 a 10", valor: 42.2, txt: "+42,2", detalle: "291,0 frente a 248,8" },
              { etiqueta: "Computador en casa", valor: 30.2, txt: "+30,2", detalle: "272,8 frente a 242,6" },
              { etiqueta: "Leer 30 a 60 min frente a no leer", valor: 15.3, txt: "+15,3", detalle: "268,0 frente a 252,7" },
              { etiqueta: "Hombres frente a mujeres", valor: 8.9, txt: "+8,9", detalle: "era 7,3 en 2022" },
              { etiqueta: "Trabajar más de 30\u00a0h frente a no trabajar", valor: -34.0, txt: "−34,0", detalle: "232,8 frente a 266,8" },
            ],
          },
        ],
        unidad: "Diferencia en puntos del puntaje global",
        figura: { src: "assets/estrato_nse.png", alt: "Figura del informe: puntaje medio por estrato del hogar (1 a 6) y NSE del colegio (1 a 4); en NSE4 todos los estratos superan 319 puntos." },
      },

      {
        tipo: "bandit",
        titulo: "Bandit contextual: un tutor virtual elige qué área reforzar",
        destacados: [
          { cifra: "−14,6 %", etiqueta: "de arrepentimiento de LinUCB frente al azar", detalle: "319.585 a 272.944" },
          { cifra: "26,1 %", etiqueta: "de acierto del área óptima", detalle: "frente a 20,0 % del azar" },
        ],
        politica: [
          { area: "Inglés", contextos: "oficiales 44 %, rural 58 %, IPM\u00a0>\u00a050 55 %" },
          { area: "Matemáticas", contextos: "privados 34 %" },
        ],
        advertencia: "Encuentra el área más débil; no demuestra que reforzarla suba el puntaje.",
        /*
         * Curva de results/2025/bandit_curvas.npz (la misma de la figura 5 del
         * informe): ventaja acumulada de LinUCB frente al azar, en miles de
         * puntos de arrepentimiento, cada 20 mil estudiantes atendidos (0 a 560 mil).
         */
        curva: {
          pasoMiles: 20,
          ventajaMiles: [0, 1.16, 2.62, 4.10, 5.69, 7.30, 8.88, 10.59, 12.21, 13.87, 15.57, 17.34, 19.07, 20.89,
            22.55, 24.28, 26.00, 27.77, 29.46, 31.15, 32.83, 34.57, 36.26, 37.97, 39.66, 41.30, 43.11, 44.82, 46.54],
          ejeX: { max: 560, marcas: [0, 200, 400], titulo: "Estudiantes atendidos (miles)" },
          ejeY: { max: 50, marcas: [0, 20, 40], titulo: "Ventaja frente al azar (miles)" },
          serie: "LinUCB",
          base: "Azar",
          final: { cifra: "−14,6 %", etiqueta: "de arrepentimiento" },
        },
        descripcion: "Curva de ventaja acumulada frente al azar: LinUCB crece de forma casi lineal hasta unos 45 mil; el azar se queda en cero.",
      },

      {
        tipo: "comparacion",
        titulo: "Frente a 2022, casi lo mismo",
        columnas: ["", "2022", "2025"],
        boton: "Repetir 2022 a 2025",
        /* desde/hasta: valores numéricos para la transición; txt: texto exacto final. */
        filas: [
          { etiqueta: "Estudiantes analizados", desde: 530815, hasta: 561049, decimales: 0, txt: ["530.815", "561.049"] },
          { etiqueta: "Atributos", desde: 18, hasta: 48, decimales: 0, txt: ["18 sin cruces", "48 con cruces"], sufijo: [" sin cruces", " con cruces"] },
          { etiqueta: "Mediana del puntaje global", desde: 247, hasta: 254, decimales: 0, txt: ["247", "254"] },
          { etiqueta: "Brecha por computador", desde: 31.7, hasta: 30.2, decimales: 1, txt: ["31,7", "30,2"] },
          { etiqueta: "Brecha privado frente a oficial", desde: 28.8, hasta: 27.7, decimales: 1, txt: ["28,8", "27,7"] },
          { etiqueta: "Brecha urbano frente a rural", desde: 25.8, hasta: 23.9, decimales: 1, txt: ["25,8", "23,9"] },
          { etiqueta: "Mejor J48", desde: 69.2, hasta: 70.7, decimales: 1, txt: ["69,2 %", "70,7 %"], sufijo: [" %", " %"] },
          { etiqueta: "Mejor bandit frente al azar", desde: -12.3, hasta: -14.6, decimales: 1, txt: ["−12,3 %", "−14,6 %"], sufijo: [" %", " %"] },
        ],
        coincidencias: {
          titulo: "Las tres técnicas coinciden",
          items: [
            "El colegio pesa más que el hogar.",
            "La pobreza del territorio se suma.",
            "El perfil no predice bien a cada persona.",
          ],
        },
      },

      {
        tipo: "cierre",
        titulo: "Conclusiones",
        pregunta,
        respuesta: "B",
        respuestaNota: "El colegio primero. La pobreza del municipio se suma.",
        puntos: [
          "Trabajar, tener pocos libros y no leer restan puntaje.",
          "Las brechas casi no cambiaron desde 2022.",
          "Son asociaciones, no causas.",
        ],
        futuro: "Trabajo futuro: seguir a esta cohorte en Saber Pro y comparar con Random Forest.",
        gracias: "Muchas gracias",
      },
    ],
  };
})((window.Saber = window.Saber || {}));
