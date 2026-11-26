/*
 * Navegación: estado de la diapositiva actual, teclado, deslizar en táctil,
 * clic en el fondo y hash. No sabe nada del contenido; avisa a los demás
 * módulos con el evento "diapositiva:entrar" (detail: { indice, elemento }).
 * Las marcas del borde izquierdo son solo indicador visual; no reciben clics.
 */
(function (Saber) {
  "use strict";

  const TECLAS_SIGUIENTE = new Set(["ArrowRight", "ArrowDown", "PageDown"]);
  const TECLAS_ANTERIOR = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);
  // Elementos que usan el clic o el gesto para sí mismos: no avanzan la diapositiva.
  const INTERACTIVOS = "a, button, input, select, textarea, [data-territorio]";
  const DURACION_SALIDA_MS = 150;   // igual a --dur-salida (tokens.css)
  const DESLIZE_MIN_PX = 50;
  const DESLIZE_RELACION = 1.5;     // el movimiento horizontal debe dominar
  const TREGUA_CLIC_MS = 400;       // tras un deslizar, el clic siguiente no cuenta

  function limitar(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
  }

  /* Devuelve el índice pedido en el hash (#1 a #9) o null si el hash no es un número. */
  function indiceDesdeHash(total) {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    return Number.isFinite(n) ? limitar(n - 1, 0, total - 1) : null;
  }

  function crearNavegacion({ mazo, diapositivas, contador, anuncio }) {
    const total = diapositivas.length;
    let actual = -1;
    let temporizadorSalida = null;
    let ultimoDeslizar = 0;

    function pintarContador() {
      contador.textContent = `${actual + 1} de ${total}`;
    }

    function anunciar() {
      anuncio.textContent = diapositivas[actual].getAttribute("aria-label");
    }

    /* La diapositiva que se va se desvanece 150 ms y luego se oculta; con movimiento reducido se oculta de inmediato. */
    function sacarDeEscena(diapositiva) {
      diapositiva.classList.remove("es-actual");
      if (Saber.entorno.prefiereMenosMovimiento()) {
        diapositiva.hidden = true;
        return;
      }
      diapositiva.classList.add("saliendo");
      temporizadorSalida = setTimeout(() => {
        diapositiva.hidden = true;
        diapositiva.classList.remove("saliendo");
      }, DURACION_SALIDA_MS);
    }

    function mostrar(indice, { enfocar = false } = {}) {
      const nuevo = limitar(indice, 0, total - 1);
      if (nuevo === actual) return;
      const previa = actual >= 0 ? diapositivas[actual] : null;
      const entrante = diapositivas[nuevo];

      // Un cambio rápido corta la salida en curso: lo que no entra ni sale se oculta ya.
      clearTimeout(temporizadorSalida);
      diapositivas.forEach((d) => {
        if (d !== entrante && d !== previa) {
          d.hidden = true;
          d.classList.remove("saliendo", "es-actual");
        }
      });

      entrante.classList.remove("saliendo");
      entrante.hidden = false;
      if (previa) sacarDeEscena(previa);
      actual = nuevo;
      entrante.classList.add("es-actual");

      history.replaceState(null, "", `#${actual + 1}`);
      pintarContador();
      anunciar();
      if (enfocar) entrante.focus();
      mazo.dispatchEvent(new CustomEvent("diapositiva:entrar", {
        detail: { indice: actual, elemento: entrante },
      }));
    }

    const siguiente = () => mostrar(actual + 1, { enfocar: true });
    const anterior = () => mostrar(actual - 1, { enfocar: true });

    function alPulsarTecla(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest("input, textarea, select")) return;
      const enBoton = e.target.closest("button, a");
      if (TECLAS_SIGUIENTE.has(e.key) || (e.key === " " && !e.shiftKey && !enBoton)) siguiente();
      else if (TECLAS_ANTERIOR.has(e.key) || (e.key === " " && e.shiftKey && !enBoton)) anterior();
      else if (e.key === "Home") mostrar(0, { enfocar: true });
      else if (e.key === "End") mostrar(total - 1, { enfocar: true });
      else return;
      e.preventDefault();
    }

    function alHacerClic(e) {
      if (e.target.closest(INTERACTIVOS)) return;
      if (Date.now() - ultimoDeslizar < TREGUA_CLIC_MS) return;
      if (window.getSelection()?.toString()) return;
      siguiente();
    }

    /* Deslizar en pantallas táctiles: un gesto horizontal de al menos 50 px pasa de diapositiva. */
    function iniciarDeslizar() {
      let origen = null;
      mazo.addEventListener("touchstart", (e) => {
        origen = e.touches.length === 1 && !e.target.closest(INTERACTIVOS)
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : null;
      }, { passive: true });
      mazo.addEventListener("touchend", (e) => {
        if (!origen) return;
        const { clientX: x, clientY: y } = e.changedTouches[0];
        const dx = x - origen.x;
        const dy = y - origen.y;
        origen = null;
        if (Math.abs(dx) < DESLIZE_MIN_PX || Math.abs(dx) < Math.abs(dy) * DESLIZE_RELACION) return;
        ultimoDeslizar = Date.now();
        if (dx < 0) siguiente();
        else anterior();
      }, { passive: true });
      mazo.addEventListener("touchcancel", () => { origen = null; }, { passive: true });
    }

    function iniciar() {
      document.addEventListener("keydown", alPulsarTecla);
      mazo.addEventListener("click", alHacerClic);
      iniciarDeslizar();
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
