/* Consultas al entorno del navegador que usan varios módulos. */
(function (Saber) {
  "use strict";

  const consultaMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

  function prefiereMenosMovimiento() {
    return consultaMovimiento.matches;
  }

  function soportaWebGL() {
    if (!window.THREE) return false;
    try {
      const lienzo = document.createElement("canvas");
      return Boolean(lienzo.getContext("webgl2") || lienzo.getContext("webgl"));
    } catch (_) {
      return false;
    }
  }

  function leerToken(nombre) {
    return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  }

  Saber.entorno = { prefiereMenosMovimiento, soportaWebGL, leerToken };
})((window.Saber = window.Saber || {}));
