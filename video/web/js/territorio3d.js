/*
 * Territorio 3D de la diapositiva 3 (Three.js r158, vendorizado).
 * Cada tipo de colegio es una columna: altura = puntaje medio (desde 0),
 * lado de la base proporcional a la raíz del número de colegios
 * (área de la base proporcional al número de colegios).
 */
(function (Saber) {
  "use strict";

  const ESCALA_ALTURA = 0.5;      // unidades 3D por punto del puntaje global
  const ESCALA_BASE = 0.85;       // unidades 3D por raíz de colegio
  const SEPARACION = 30;
  const REGLA = [100, 200, 300];  // líneas de referencia en puntos
  const DURACION_MS = 950;
  const RETARDO_MS = 260;
  const GIRO_MAX = 0.6;           // radianes

  /* ---------- construcción de la escena ---------- */

  function crearRenderizador(contenedor) {
    const renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderizador.setClearColor(0x000000, 0);
    renderizador.domElement.className = "escena__canvas";
    contenedor.prepend(renderizador.domElement);
    return renderizador;
  }

  function crearCamara() {
    const camara = new THREE.PerspectiveCamera(24, 16 / 9, 1, 4000);
    camara.position.set(150, 260, 640);
    camara.lookAt(0, 70, 0);
    return camara;
  }

  function agregarLuces(escena) {
    escena.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sol = new THREE.DirectionalLight(0xffffff, 1.5);
    sol.position.set(-160, 320, 220);
    escena.add(sol);
  }

  function agregarSuelo(grupo, colores) {
    const suelo = new THREE.Mesh(
      new THREE.PlaneGeometry(380, 160),
      new THREE.MeshBasicMaterial({ color: colores.tintaClara, transparent: true, opacity: 0.45 })
    );
    suelo.rotation.x = -Math.PI / 2;
    grupo.add(suelo);

    const rejilla = new THREE.GridHelper(380, 24, colores.tinta, colores.tinta);
    rejilla.scale.z = 160 / 380;
    rejilla.material.transparent = true;
    rejilla.material.opacity = 0.35;
    rejilla.position.y = 0.2;
    grupo.add(rejilla);
  }

  function agregarRegla(grupo, colores) {
    const material = new THREE.LineDashedMaterial({ color: colores.tinta, dashSize: 4, gapSize: 4, transparent: true, opacity: 0.7 });
    return REGLA.map((puntos) => {
      const y = puntos * ESCALA_ALTURA;
      const geometria = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-165, y, -70), new THREE.Vector3(165, y, -70),
      ]);
      const linea = new THREE.Line(geometria, material);
      linea.computeLineDistances();
      grupo.add(linea);
      return { puntos, ancla: new THREE.Vector3(-165, y, -70) };
    });
  }

  function posicionesX(lados) {
    const ancho = lados.reduce((s, l) => s + l, 0) + SEPARACION * (lados.length - 1);
    let x = -ancho / 2;
    return lados.map((l) => {
      const centro = x + l / 2;
      x += l + SEPARACION;
      return centro;
    });
  }

  function crearColumna(g, x, lado, colorBorde) {
    const geometria = new THREE.BoxGeometry(lado, 1, lado);
    geometria.translate(0, 0.5, 0);
    const malla = new THREE.Mesh(geometria, new THREE.MeshLambertMaterial({ color: g.color }));
    const bordes = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometria),
      new THREE.LineBasicMaterial({ color: colorBorde })
    );
    malla.add(bordes);
    malla.position.set(x, 0, 0);
    malla.scale.y = 0.001;
    return { malla, altura: g.puntaje * ESCALA_ALTURA, grupo: g };
  }

  /* ---------- etiquetas HTML proyectadas ---------- */

  /*
   * Cada columna lleva dos etiquetas separadas: la cifra flota sobre el tope
   * y el nombre queda al pie, delante de la base. Así nunca se solapan,
   * sea cual sea el tamaño del lienzo.
   */
  function crearEtiqueta(capa, clase, texto, visible) {
    const el = document.createElement("div");
    el.className = `etiqueta3d ${clase}${visible ? " es-visible" : ""}`;
    el.textContent = texto;
    capa.appendChild(el);
    return el;
  }

  function crearEtiquetas(capa, columnas, regla) {
    return {
      cifras: columnas.map((c) => crearEtiqueta(capa, "etiqueta3d--cifra", c.grupo.puntajeTxt, false)),
      nombres: columnas.map((c) => crearEtiqueta(capa, "etiqueta3d--nombre", c.grupo.nombre, true)),
      deRegla: regla.map((r) => crearEtiqueta(capa, "etiqueta3d--regla", r.puntos === 300 ? "300 puntos" : String(r.puntos), true)),
    };
  }

  function proyectarEn(el, punto, objeto, camara) {
    const v = punto.clone();
    if (objeto) objeto.localToWorld(v);
    v.project(camara);
    el.style.left = `${((v.x + 1) / 2) * 100}%`;
    el.style.top = `${((1 - v.y) / 2) * 100}%`;
  }

  /* ---------- fábrica pública ---------- */

  function crearTerritorio(contenedor, grupos) {
    const { leerToken } = Saber.entorno;
    const colores = {
      tinta: new THREE.Color(leerToken("--tinta")),
      tintaClara: new THREE.Color(leerToken("--tinta-clara")),
      grafito: new THREE.Color(leerToken("--grafito")),
    };

    const renderizador = crearRenderizador(contenedor);
    const camara = crearCamara();
    const escena = new THREE.Scene();
    const mundo = new THREE.Group();
    escena.add(mundo);
    agregarLuces(escena);
    agregarSuelo(mundo, colores);
    const regla = agregarRegla(mundo, colores);

    const lados = grupos.map((g) => Math.sqrt(g.colegios) * ESCALA_BASE);
    const xs = posicionesX(lados);
    const columnas = grupos.map((g, i) => crearColumna(g, xs[i], lados[i], colores.grafito));
    const pies = columnas.map((c, i) => new THREE.Vector3(xs[i], 0, lados[i] / 2));
    columnas.forEach((c) => mundo.add(c.malla));

    const etiquetas = crearEtiquetas(contenedor.querySelector(".escena__etiquetas"), columnas, regla);
    const coreografia = Saber.animacion.crearCoreografia();

    function actualizarEtiquetas() {
      columnas.forEach((c, i) => {
        proyectarEn(etiquetas.cifras[i], new THREE.Vector3(0, 1, 0), c.malla, camara);
        etiquetas.cifras[i].classList.toggle("es-visible", c.malla.scale.y >= c.altura * 0.98);
        proyectarEn(etiquetas.nombres[i], pies[i], mundo, camara);
      });
      regla.forEach((r, i) => proyectarEn(etiquetas.deRegla[i], r.ancla, mundo, camara));
    }

    function pintar() {
      mundo.updateMatrixWorld(true);
      renderizador.render(escena, camara);
      actualizarEtiquetas();
    }

    function ajustarTamano() {
      const { clientWidth: w, clientHeight: h } = contenedor;
      if (!w || !h) return;
      renderizador.setSize(w, h, false);
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      pintar();
    }

    function fijarAlturas(fraccionPorColumna) {
      columnas.forEach((c, i) => { c.malla.scale.y = Math.max(0.001, c.altura * fraccionPorColumna(i)); });
    }

    function mostrarFinal() {
      coreografia.cancelar();
      fijarAlturas(() => 1);
      pintar();
    }

    function revelar() {
      coreografia.cancelar();
      const { facilidad } = Saber.animacion;
      const total = DURACION_MS + RETARDO_MS * (columnas.length - 1);
      fijarAlturas(() => 0);
      pintar();
      coreografia.animar({
        duracion: total,
        alCuadro: (_, lineal) => {
          const t = lineal * total;
          fijarAlturas((i) => facilidad(Math.min(Math.max((t - i * RETARDO_MS) / DURACION_MS, 0), 1)));
          pintar();
        },
      });
    }

    function activarArrastre() {
      const lienzo = renderizador.domElement;
      let origen = null;
      let giroInicial = 0;
      lienzo.addEventListener("pointerdown", (e) => {
        origen = e.clientX;
        giroInicial = mundo.rotation.y;
        lienzo.setPointerCapture(e.pointerId);
      });
      lienzo.addEventListener("pointermove", (e) => {
        if (origen === null) return;
        const giro = giroInicial + (e.clientX - origen) * 0.006;
        mundo.rotation.y = Math.min(Math.max(giro, -GIRO_MAX), GIRO_MAX);
        pintar();
      });
      const soltar = () => { origen = null; };
      lienzo.addEventListener("pointerup", soltar);
      lienzo.addEventListener("pointercancel", soltar);
    }

    function instantanea() {
      mostrarFinal();
      return renderizador.domElement.toDataURL("image/png");
    }

    new ResizeObserver(ajustarTamano).observe(contenedor);
    activarArrastre();
    ajustarTamano();

    return { revelar, mostrarFinal, instantanea, ajustarTamano };
  }

  Saber.crearTerritorio = crearTerritorio;
})((window.Saber = window.Saber || {}));
