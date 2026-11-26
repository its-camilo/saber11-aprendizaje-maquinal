/*
 * Curva del bandit (diapositiva 7): la ventaja acumulada de LinUCB se dibuja
 * de izquierda a derecha al entrar, con una cabeza que marca el avance, y al
 * final aparece el valor. El SVG ya trae la curva completa (estado final).
 */
(function (Saber) {
  "use strict";

  const RETARDO_MS = 250;
  const DURACION_MS = 2000;

  function crearCurvaBandit(figura) {
    const linea = figura.querySelector("[data-linea]");
    const cabeza = figura.querySelector("[data-cabeza]");
    const final = figura.querySelector("[data-final]");
    const coreografia = Saber.animacion.crearCoreografia();

    function moverCabeza(p) {
      const punto = linea.getPointAtLength(p * linea.getTotalLength());
      cabeza.setAttribute("cx", punto.x);
      cabeza.setAttribute("cy", punto.y);
    }

    function mostrarFinal() {
      coreografia.cancelar();
      linea.style.strokeDashoffset = "";
      final.classList.remove("es-oculto");
      moverCabeza(1);
    }

    function dibujar() {
      coreografia.cancelar();
      linea.style.strokeDashoffset = "1";
      final.classList.add("es-oculto");
      moverCabeza(0);
      coreografia.animar({
        retardo: RETARDO_MS,
        duracion: DURACION_MS,
        // avance lineal: la curva crece a ritmo constante, como los estudiantes atendidos
        alCuadro: (_, lineal) => {
          linea.style.strokeDashoffset = String(1 - lineal);
          moverCabeza(lineal);
        },
        alTerminar: mostrarFinal,
      });
    }

    return { dibujar, mostrarFinal };
  }

  Saber.crearCurvaBandit = crearCurvaBandit;
})((window.Saber = window.Saber || {}));
