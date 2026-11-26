/*
 * Recorrido del árbol J48 (diapositiva 5): una ficha de lápiz baja desde la
 * raíz por cada rama, una a la vez, y al llegar revela la hoja.
 * El HTML ya trae el árbol completo (estado final); aquí solo se anima.
 */
(function (Saber) {
  "use strict";

  const PAUSA_INICIAL_MS = 350;
  const DURACION_RAMA_MS = 750;
  const PAUSA_HOJA_MS = 450;

  function crearArbolJ48(figura) {
    const raiz = figura.querySelector("[data-raiz]");
    const ficha = figura.querySelector("[data-ficha]");
    const ramas = Array.from(figura.querySelectorAll("[data-rama]")).map((g) => {
      const arista = g.querySelector(".arbolj48__arista");
      return { g, arista };
    });
    const coreografia = Saber.animacion.crearCoreografia();

    function estadoInicial() {
      raiz.classList.add("es-activa");
      ficha.classList.remove("es-visible");
      ramas.forEach(({ g, arista }) => {
        g.classList.add("es-pendiente");
        g.classList.remove("es-activa");
        arista.style.strokeDashoffset = "1";
      });
    }

    function mostrarFinal() {
      coreografia.cancelar();
      raiz.classList.remove("es-activa");
      ficha.classList.remove("es-visible");
      ramas.forEach(({ g, arista }) => {
        g.classList.remove("es-pendiente", "es-activa");
        arista.style.strokeDashoffset = "";
      });
    }

    function bajarPor(rama, retardo, esUltima) {
      coreografia.animar({
        retardo,
        duracion: DURACION_RAMA_MS,
        alCuadro: (p) => {
          ramas.forEach((r) => r.g.classList.toggle("es-activa", r === rama));
          ficha.classList.add("es-visible");
          rama.arista.style.strokeDashoffset = String(1 - p);
          const punto = rama.arista.getPointAtLength(p * rama.arista.getTotalLength());
          ficha.setAttribute("cx", punto.x);
          ficha.setAttribute("cy", punto.y);
        },
        alTerminar: () => {
          rama.g.classList.remove("es-pendiente");
          // tras la última hoja, una pausa breve y el árbol queda en su estado final
          if (esUltima) coreografia.animar({ retardo: PAUSA_HOJA_MS, duracion: 1, alCuadro: () => {}, alTerminar: mostrarFinal });
        },
      });
    }

    function recorrer() {
      if (Saber.entorno.prefiereMenosMovimiento()) {
        mostrarFinal();
        return;
      }
      coreografia.cancelar();
      estadoInicial();
      const tramo = DURACION_RAMA_MS + PAUSA_HOJA_MS;
      ramas.forEach((rama, i) => bajarPor(rama, PAUSA_INICIAL_MS + i * tramo, i === ramas.length - 1));
    }

    figura.querySelector("[data-recorrer]").addEventListener("click", recorrer);
    return { recorrer, mostrarFinal };
  }

  Saber.crearArbolJ48 = crearArbolJ48;
})((window.Saber = window.Saber || {}));
