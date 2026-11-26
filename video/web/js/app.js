/*
 * Arranque: pinta las diapositivas, conecta la navegación con los momentos
 * animados (3D de la 3, árbol de la 5, barras de la 6, curva de la 7 y
 * comparación de la 8) vía "diapositiva:entrar", y prepara la impresión.
 */
(function (Saber) {
  "use strict";

  const { contenido, plantillas, entorno } = Saber;

  function pintarDiapositivas(mazo) {
    const total = contenido.diapositivas.length;
    mazo.innerHTML = contenido.diapositivas
      .map((d, i) => plantillas.diapositiva(d, i, total, contenido.meta))
      .join("");
    return Array.from(mazo.querySelectorAll(".diapositiva"));
  }

  function datosDe(tipo) {
    return contenido.diapositivas.find((d) => d.tipo === tipo);
  }

  /* ---------- diapositiva 3: territorio 3D ---------- */

  function crearControlTerritorio(diapositiva) {
    const escena = diapositiva.querySelector(".escena");
    const lienzo = diapositiva.querySelector("[data-territorio]");
    const grupos = datosDe("colegios3d").grupos;
    const boton = diapositiva.querySelector("[data-alternar-figura]");
    let territorio = null;

    function asegurar() {
      if (territorio || !entorno.soportaWebGL()) return territorio;
      territorio = Saber.crearTerritorio(lienzo, grupos);
      return territorio;
    }

    function alEntrar() {
      if (!entorno.soportaWebGL()) {
        escena.dataset.vista = "figura";
        boton.hidden = true;
        return;
      }
      const t = asegurar();
      if (escena.dataset.vista !== "3d") return;
      if (entorno.prefiereMenosMovimiento()) t.mostrarFinal();
      else t.revelar();
    }

    function alternar() {
      const verFigura = escena.dataset.vista === "3d";
      escena.dataset.vista = verFigura ? "figura" : "3d";
      boton.setAttribute("aria-pressed", String(verFigura));
      boton.textContent = verFigura ? "Ver columnas 3D" : "Ver figura del informe";
      if (!verFigura) {
        const t = asegurar();
        t.ajustarTamano();
        t.mostrarFinal();
      }
    }

    function congelarParaImprimir() {
      const t = asegurar();
      if (!t) return;
      let foto = lienzo.querySelector(".escena__instantanea");
      if (!foto) {
        foto = document.createElement("img");
        foto.className = "escena__instantanea";
        foto.alt = "";
        lienzo.appendChild(foto);
      }
      t.ajustarTamano(); // la clase .imprimiendo ya cambió el tamaño del lienzo
      foto.src = t.instantanea();
    }

    boton.addEventListener("click", alternar);
    return { alEntrar, congelarParaImprimir };
  }

  /* ---------- diapositivas 5, 7 y 8: animaciones SVG/DOM ---------- */

  function crearAnimaciones(mazo) {
    return {
      j48: Saber.crearArbolJ48(mazo.querySelector("[data-arbol]")),
      bandit: Saber.crearCurvaBandit(mazo.querySelector("[data-curva]")),
      comparacion: Saber.crearComparacion(mazo.querySelector("[data-comparacion]"), datosDe("comparacion").filas),
    };
  }

  /* ---------- impresión ---------- */

  function prepararImpresion(territorio, animaciones) {
    document.documentElement.classList.add("imprimiendo");
    Object.values(animaciones).forEach((a) => a.mostrarFinal());
    territorio.congelarParaImprimir();
  }

  function iniciar() {
    const mazo = document.querySelector("[data-mazo]");
    const diapositivas = pintarDiapositivas(mazo);
    const territorio = crearControlTerritorio(mazo.querySelector(".diapositiva--colegios3d"));
    const animaciones = crearAnimaciones(mazo);
    const alEntrar = {
      colegios3d: () => territorio.alEntrar(),
      j48: () => animaciones.j48.recorrer(),
      brechas: (elemento) => Saber.animarBrechas(elemento),
      bandit: () => animaciones.bandit.dibujar(),
      comparacion: () => animaciones.comparacion.animar(),
    };

    mazo.addEventListener("diapositiva:entrar", ({ detail }) => {
      const accion = alEntrar[contenido.diapositivas[detail.indice].tipo];
      if (accion) accion(detail.elemento);
    });

    const navegacion = Saber.crearNavegacion({
      mazo,
      diapositivas,
      botonAnterior: document.querySelector("[data-anterior]"),
      botonSiguiente: document.querySelector("[data-siguiente]"),
      contador: document.querySelector("[data-contador]"),
      anuncio: document.querySelector("[data-anuncio]"),
    });
    navegacion.iniciar();

    window.addEventListener("beforeprint", () => prepararImpresion(territorio, animaciones));
    window.addEventListener("afterprint", () => document.documentElement.classList.remove("imprimiendo"));
    Saber.prepararImpresion = () => prepararImpresion(territorio, animaciones);
    Saber.navegacion = navegacion;
    document.documentElement.classList.add("listo");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})((window.Saber = window.Saber || {}));
