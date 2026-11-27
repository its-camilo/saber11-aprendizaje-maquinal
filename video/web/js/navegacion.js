/*
 * Navegación: estado de la diapositiva actual, teclado, deslizar en táctil,
 * clic en el fondo y hash. No sabe nada del contenido; avisa a los demás
 * módulos con el evento "diapositiva:entrar" (detail: { indice, elemento }).
 * Las marcas del borde izquierdo son solo indicador visual; no reciben clics.
 *
 * Transición en dos fases: primero sale la saliente (ease-in, se desvanece y
 * sube un poco), y luego entra la nueva (ease-out, con retardo para que no se
 * vean a la vez). Las dos nunca se ven mezcladas: la entrante empieza con
 * opacidad 0 y la saliente termina en 0. En móvil, la altura del mazo pasa
 * de una diapositiva a otra en la misma transición, así que la página no salta.
 */
(function (Saber) {
  "use strict";

  const TECLAS_SIGUIENTE = new Set(["ArrowRight", "ArrowDown", "PageDown"]);
  const TECLAS_ANTERIOR = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);
  // Elementos que usan el clic o el gesto para sí mismos: no avanzan la diapositiva.
  const INTERACTIVOS = "a, button, input, select, textarea, [data-territorio]";
  // Valores iguales a los de --dur-salida, --retardo-entrada, --dur-entrada y las curvas (tokens.css).
  const DURACION_SALIDA_MS = 140;
  const RETARDO_ENTRADA_MS = 120;
  const DURACION_ENTRADA_MS = 340;
  const CURVA_SALIDA = "cubic-bezier(0.4, 0, 1, 1)";
  const CURVA_ENTRADA = "cubic-bezier(0.22, 1, 0.36, 1)";
  const TRASLADO_SALIDA = "translateY(-6px)";
  const TRASLADO_ENTRADA = "translateY(14px)";
  const DESLIZE_MIN_PX = 50;
  const DESLIZE_RELACION = 1.5;     // el movimiento horizontal debe dominar
  const TREGUA_CLIC_MS = 400;       // tras un deslizar, el clic siguiente no cuenta
  const MOVIL = window.matchMedia("(max-width: 900px)");

  function limitar(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
  }

  /* Devuelve el índice pedido en el hash (#1 a #9) o null si el hash no es un número. */
  function indiceDesdeHash(total) {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    return Number.isFinite(n) ? limitar(n - 1, 0, total - 1) : null;
  }

  /* Estado visible en este instante, aunque haya una transición a medio camino. */
  function estadoVisible(d) {
    if (d.hidden) return { opacity: 0, transform: TRASLADO_ENTRADA };
    const estilo = getComputedStyle(d);
    return { opacity: estilo.opacity, transform: estilo.transform };
  }

  function detener(d) {
    d.getAnimations().forEach((a) => a.cancel());
  }

  function crearNavegacion({ mazo, diapositivas, contador, anuncio }) {
    const total = diapositivas.length;
    let actual = -1;
    let ultimoDeslizar = 0;

    function pintarContador() {
      contador.textContent = `${actual + 1} de ${total}`;
    }

    function anunciar() {
      anuncio.textContent = diapositivas[actual].getAttribute("aria-label");
    }

    function sinMovimiento() {
      return Saber.entorno.prefiereMenosMovimiento();
    }

    /* Salida: se desvanece y sube 6 px con ease-in; al terminar se oculta. */
    function sacar(d) {
      const desde = estadoVisible(d);
      detener(d);
      d.classList.remove("es-actual");
      if (sinMovimiento()) {
        d.hidden = true;
        return;
      }
      d.classList.add("saliendo");
      const salida = d.animate([desde, { opacity: 0, transform: TRASLADO_SALIDA }], {
        duration: DURACION_SALIDA_MS,
        easing: CURVA_SALIDA,
        fill: "forwards",
      });
      salida.onfinish = () => {
        detener(d);
        d.hidden = true;
        d.classList.remove("saliendo");
      };
    }

    /* Entrada: sube 14 px y aparece con ease-out, tras el retardo de la salida. Devuelve la animación o null. */
    function entrar(d) {
      const desde = estadoVisible(d);
      detener(d);
      d.hidden = false;
      d.classList.remove("saliendo");
      d.classList.add("es-actual");
      if (sinMovimiento()) return null;
      return d.animate([desde, { opacity: 1, transform: "none" }], {
        duration: DURACION_ENTRADA_MS,
        delay: RETARDO_ENTRADA_MS,
        easing: CURVA_ENTRADA,
        fill: "backwards",
      });
    }

    function mostrar(indice, { enfocar = false } = {}) {
      const nuevo = limitar(indice, 0, total - 1);
      if (nuevo === actual) return;
      const previa = actual >= 0 ? diapositivas[actual] : null;
      const entrante = diapositivas[nuevo];

      // Un cambio rápido corta lo que no entra ni sale: se oculta ya.
      diapositivas.forEach((d) => {
        if (d !== entrante && d !== previa) {
          detener(d);
          d.hidden = true;
          d.classList.remove("saliendo", "es-actual");
        }
      });

      // En móvil el mazo cambia de altura con la diapositiva: la altura pasa de la
      // anterior a la nueva con la misma curva y retardo que la entrada, sin salto.
      mazo.getAnimations().forEach((a) => a.cancel());
      mazo.style.height = "";
      const enMovil = MOVIL.matches && previa !== null && !sinMovimiento();
      const altoAnterior = enMovil ? previa.offsetHeight : 0;
      const entrada = entrar(entrante);
      const altoNuevo = enMovil ? entrante.offsetHeight : 0;
      if (previa) sacar(previa);
      if (entrada && enMovil && altoAnterior !== altoNuevo) {
        const altura = mazo.animate(
          [{ height: `${altoAnterior}px` }, { height: `${altoNuevo}px` }],
          { duration: DURACION_ENTRADA_MS, delay: RETARDO_ENTRADA_MS, easing: CURVA_ENTRADA, fill: "backwards" },
        );
        altura.onfinish = () => { mazo.style.height = ""; };
      }
      actual = nuevo;

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
      // Todas empiezan ocultas, así la primera diapositiva también hace su entrada.
      diapositivas.forEach((d) => { d.hidden = true; });
      mostrar(indiceDesdeHash(total) ?? 0);
    }

    return { iniciar, mostrar, siguiente, anterior, get actual() { return actual; } };
  }

  Saber.crearNavegacion = crearNavegacion;
})((window.Saber = window.Saber || {}));
