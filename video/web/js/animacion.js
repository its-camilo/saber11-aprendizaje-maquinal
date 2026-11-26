/*
 * Utilidades de movimiento compartidas por todos los módulos animados:
 * curva de suavizado, interpolación por cuadros que respeta
 * prefers-reduced-motion y coreografías que se cancelan juntas.
 * Ningún módulo debe llamar a requestAnimationFrame por su cuenta.
 */
(function (Saber) {
  "use strict";

  const facilidad = (t) => 1 - Math.pow(1 - t, 3);
  const NADA = { cancelar() {} };

  /*
   * Llama alCuadro(progresoSuavizado, progresoLineal) en cada cuadro durante
   * `duracion` ms, después de `retardo` ms. Con movimiento reducido salta
   * directo al estado final. Devuelve { cancelar }.
   */
  function animar({ duracion, retardo = 0, alCuadro, alTerminar }) {
    if (Saber.entorno.prefiereMenosMovimiento() || duracion <= 0) {
      alCuadro(1, 1);
      if (alTerminar) alTerminar();
      return NADA;
    }
    let cuadro = 0;
    const inicio = performance.now() + retardo;
    const paso = (ahora) => {
      if (ahora < inicio) { // durante el retardo no se toca nada
        cuadro = requestAnimationFrame(paso);
        return;
      }
      const lineal = Math.min((ahora - inicio) / duracion, 1);
      alCuadro(facilidad(lineal), lineal);
      if (lineal < 1) cuadro = requestAnimationFrame(paso);
      else if (alTerminar) alTerminar();
    };
    cuadro = requestAnimationFrame(paso);
    return { cancelar: () => cancelAnimationFrame(cuadro) };
  }

  /* Agrupa varias animaciones para cancelarlas juntas al repetir o salir. */
  function crearCoreografia() {
    let activas = [];
    return {
      animar(opciones) {
        const a = animar(opciones);
        activas.push(a);
        return a;
      },
      cancelar() {
        activas.forEach((a) => a.cancelar());
        activas = [];
      },
    };
  }

  Saber.animacion = { facilidad, animar, crearCoreografia };
})((window.Saber = window.Saber || {}));
