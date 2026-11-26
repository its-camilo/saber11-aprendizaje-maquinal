/*
 * Barras de brechas de la diapositiva 6: crecen una vez desde cero al entrar.
 * El estado final está en el CSS; aquí solo se reinicia la animación.
 */
(function (Saber) {
  "use strict";

  function animarBrechas(elemento) {
    const zona = elemento.querySelector("[data-brechas]");
    if (zona) Saber.animacion.reiniciarClase(zona, "animar");
  }

  Saber.animarBrechas = animarBrechas;
})((window.Saber = window.Saber || {}));
