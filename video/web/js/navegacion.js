/*
 * Navegación: estado de la diapositiva actual, teclado, clic, botones y hash.
 * No sabe nada del contenido; avisa a los demás módulos con el evento
 * "diapositiva:entrar" (detail: { indice, elemento }).
 */
(function (Saber) {
  "use strict";

  const TECLAS_SIGUIENTE = new Set(["ArrowRight", "ArrowDown", "PageDown"]);
  const TECLAS_ANTERIOR = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);
  const INTERACTIVOS = "a, button, input, select, textarea, [data-territorio], figure";

  function limitar(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
  }

  /* Devuelve el índice pedido en el hash (#1 a #9) o null si el hash no es un número. */
  function indiceDesdeHash(total) {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    return Number.isFinite(n) ? limitar(n - 1, 0, total - 1) : null;
  }

  function crearNavegacion({ mazo, diapositivas, botonAnterior, botonSiguiente, contador, anuncio }) {
    const total = diapositivas.length;
    let actual = -1;

    function pintarControles() {
      botonAnterior.disabled = actual === 0;
      botonSiguiente.disabled = actual === total - 1;
      contador.textContent = `${actual + 1} de ${total}`;
    }

    function anunciar() {
      anuncio.textContent = diapositivas[actual].getAttribute("aria-label");
    }

    function mostrar(indice, { enfocar = false } = {}) {
      const nuevo = limitar(indice, 0, total - 1);
      if (nuevo === actual) return;
      diapositivas.forEach((d, i) => {
        d.classList.toggle("es-actual", i === nuevo);
        d.hidden = i !== nuevo;
      });
      actual = nuevo;
      history.replaceState(null, "", `#${actual + 1}`);
      pintarControles();
      anunciar();
      if (enfocar) diapositivas[actual].querySelector(".marca--actual")?.focus();
      mazo.dispatchEvent(new CustomEvent("diapositiva:entrar", {
        detail: { indice: actual, elemento: diapositivas[actual] },
      }));
    }

    const siguiente = () => mostrar(actual + 1);
    const anterior = () => mostrar(actual - 1);

    function alPulsarTecla(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest("input, textarea, select")) return;
      const enBoton = e.target.closest("button, a");
      if (TECLAS_SIGUIENTE.has(e.key) || (e.key === " " && !e.shiftKey && !enBoton)) siguiente();
      else if (TECLAS_ANTERIOR.has(e.key) || (e.key === " " && e.shiftKey && !enBoton)) anterior();
      else if (e.key === "Home") mostrar(0);
      else if (e.key === "End") mostrar(total - 1);
      else return;
      e.preventDefault();
    }

    function alHacerClic(e) {
      const marca = e.target.closest("[data-ir]");
      if (marca) {
        mostrar(Number(marca.dataset.ir), { enfocar: true });
        return;
      }
      if (e.target.closest(INTERACTIVOS)) return;
      if (window.getSelection()?.toString()) return;
      siguiente();
    }

    function iniciar() {
      document.addEventListener("keydown", alPulsarTecla);
      mazo.addEventListener("click", alHacerClic);
      botonAnterior.addEventListener("click", anterior);
      botonSiguiente.addEventListener("click", siguiente);
      window.addEventListener("hashchange", () => {
        const pedido = indiceDesdeHash(total);
        if (pedido !== null) mostrar(pedido);
      });
      mostrar(indiceDesdeHash(total) ?? 0);
    }

    return { iniciar, mostrar, siguiente, anterior, get actual() { return actual; } };
  }

  Saber.crearNavegacion = crearNavegacion;
})((window.Saber = window.Saber || {}));
