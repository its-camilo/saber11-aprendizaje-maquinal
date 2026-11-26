/*
 * Barras de brechas de la diapositiva 6: crecen desde cero una vez por cada
 * entrada a la diapositiva. Se animan por JS con Saber.animacion (no con clases
 * CSS), así que cada entrada empieza de cero sin depender del navegador.
 * El HTML pintado es el estado final; con movimiento reducido o al imprimir
 * las barras quedan en su tamaño completo.
 */
(function (Saber) {
  "use strict";

  const DURACION_BARRA_MS = 700;  // igual a --dur-barra
  const DURACION_VALOR_MS = 200;
  const ESCALON_MS = 90;
  const RETARDO_MS = 120;

  function crearBrechas(zona) {
    const coreografia = Saber.animacion.crearCoreografia();
    const filas = Array.from(zona.querySelectorAll(".brecha")).map((fila) => ({
      barra: fila.querySelector(".brecha__barra"),
      valor: fila.querySelector(".brecha__valor"),
      i: Number(fila.style.getPropertyValue("--i")),
    }));

    function mostrarFinal() {
      coreografia.cancelar();
      filas.forEach(({ barra, valor }) => {
        barra.style.transform = "";
        valor.style.opacity = "";
      });
    }

    function animar() {
      coreografia.cancelar();
      filas.forEach(({ barra, valor, i }) => {
        const inicio = RETARDO_MS + i * ESCALON_MS;
        barra.style.transform = "scaleX(0)";
        valor.style.opacity = "0";
        coreografia.animar({
          retardo: inicio,
          duracion: DURACION_BARRA_MS,
          alCuadro: (p) => { barra.style.transform = `scaleX(${p})`; },
        });
        coreografia.animar({
          retardo: inicio + DURACION_BARRA_MS,
          duracion: DURACION_VALOR_MS,
          alCuadro: (p) => { valor.style.opacity = String(p); },
        });
      });
    }

    return { animar, mostrarFinal };
  }

  Saber.crearBrechas = crearBrechas;
})((window.Saber = window.Saber || {}));
