/*
 * Comparación 2022 frente a 2025 (diapositiva 8): al entrar, cada valor de la
 * columna 2025 parte del valor de 2022 y avanza hasta el de 2025. Al terminar
 * se escribe el texto exacto de contenido.js, así que no queda ningún
 * valor intermedio en pantalla.
 */
(function (Saber) {
  "use strict";

  const DURACION_MS = 1300;
  const ESCALON_MS = 90;

  /* Formato colombiano: punto de miles, coma decimal y signo menos tipográfico. */
  function formatear(valor, decimales) {
    const [entera, fraccion] = Math.abs(valor).toFixed(decimales).split(".");
    const conMiles = entera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const signo = valor < 0 && Number(Math.abs(valor).toFixed(decimales)) !== 0 ? "−" : "";
    return signo + conMiles + (fraccion ? `,${fraccion}` : "");
  }

  function crearComparacion(zona, filas) {
    const celdas = filas.map((_, i) => zona.querySelector(`[data-valor="${i}"]`));
    const coreografia = Saber.animacion.crearCoreografia();

    function mostrarFinal() {
      coreografia.cancelar();
      celdas.forEach((celda, i) => {
        celda.textContent = filas[i].txt[1];
        celda.classList.remove("es-cambiando");
      });
    }

    function animar() {
      coreografia.cancelar();
      filas.forEach((f, i) => {
        const celda = celdas[i];
        // el sufijo cambia a mitad de camino (p. ej. "sin cruces" a "con cruces")
        const sufijo = (p) => (f.sufijo ? f.sufijo[p < 0.5 ? 0 : 1] : "");
        celda.textContent = f.txt[0];
        celda.classList.add("es-cambiando");
        coreografia.animar({
          retardo: i * ESCALON_MS,
          duracion: DURACION_MS,
          alCuadro: (p) => { celda.textContent = formatear(f.desde + (f.hasta - f.desde) * p, f.decimales) + sufijo(p); },
          alTerminar: () => {
            celda.textContent = f.txt[1];
            celda.classList.remove("es-cambiando");
          },
        });
      });
    }

    zona.querySelector("[data-repetir-comparacion]").addEventListener("click", animar);
    return { animar, mostrarFinal };
  }

  Saber.crearComparacion = crearComparacion;
})((window.Saber = window.Saber || {}));
