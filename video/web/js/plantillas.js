/*
 * Plantillas: convierten los datos de contenido.js en HTML.
 * Cada función pinta un solo tipo de diapositiva o una sola pieza común.
 */
(function (Saber) {
  "use strict";

  const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ESCAPES[c]);
  }

  function lista(items, fn) {
    return items.map(fn).join("");
  }

  /* ---------- piezas comunes ---------- */

  function pista(indice, total) {
    const marcas = Array.from({ length: total }, (_, i) => {
      const estado = i === indice ? "actual" : i < indice ? "vista" : "pendiente";
      const actual = i === indice ? ' aria-current="step"' : "";
      return `<li><button type="button" class="marca marca--${estado}" data-ir="${i}"${actual}
        aria-label="Ir a la diapositiva ${i + 1}"></button></li>`;
    });
    return `<nav class="pista" aria-label="Diapositivas"><ol>${marcas.join("")}</ol></nav>`;
  }

  function pie(indice, total, meta) {
    return `<footer class="pie">
      <span>Diapositiva ${indice + 1} de ${total}</span>
      <span>${esc(meta.pie)}</span>
    </footer>`;
  }

  function casilla(c, clase = "") {
    const detalle = c.detalle ? `<span class="casilla__detalle">${esc(c.detalle)}</span>` : "";
    return `<div class="casilla ${clase}">
      <span class="casilla__cifra">${esc(c.cifra)}</span>
      <span class="casilla__etiqueta">${esc(c.etiqueta)}</span>${detalle}
    </div>`;
  }

  function figura(f, clase = "") {
    return `<figure class="figura ${clase}">
      <img src="${esc(f.src)}" alt="${esc(f.alt)}" loading="eager" decoding="async">
    </figure>`;
  }

  function item(pregunta, marcada) {
    const opciones = lista(pregunta.opciones, (o) => {
      const llena = o.letra === marcada;
      return `<li class="opcion${llena ? " opcion--marcada" : ""}">
        <span class="burbuja" aria-hidden="true">${esc(o.letra)}</span>
        <span>${esc(o.texto)}</span>${llena ? '<span class="sr">(marcada)</span>' : ""}
      </li>`;
    });
    return `<div class="item">
      <p class="item__pregunta">${esc(pregunta.texto)}</p>
      <ol class="item__opciones">${opciones}</ol>
    </div>`;
  }

  /* ---------- una plantilla por tipo de diapositiva ---------- */

  function portada(d, meta) {
    return `<div class="portada">
      <h1 class="titulo titulo--portada">${esc(d.titulo)}</h1>
      <p class="subtitulo">${esc(meta.subtitulo)}</p>
      ${item(d.pregunta, null)}
      <div class="portada__creditos">
        <ul class="autores">${lista(meta.autores, (a) => `<li>${esc(a)}</li>`)}</ul>
        <p>${esc(meta.curso)}<br>${esc(meta.universidad)}<br>${esc(meta.fecha)}</p>
        <ul class="tecnicas">${lista(d.tecnicas, (t) => `<li>${esc(t)}</li>`)}</ul>
      </div>
    </div>`;
  }

  function datos(d) {
    const max = d.embudo[0].valor;
    const embudo = lista(d.embudo, (p) => `<li class="embudo__paso">
        ${casilla(p)}
        <span class="embudo__barra" style="--fraccion:${(p.valor / max).toFixed(4)}" aria-hidden="true"></span>
      </li>`);
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--datos">
      <div class="columna">
        <p class="frase">${esc(d.frase)}</p>
        <div class="cruces">${lista(d.cruces, (c) => casilla(c, "casilla--fila"))}</div>
      </div>
      <ol class="embudo">${embudo}</ol>
    </div>`;
  }

  function filaGrupo(g) {
    return `<tr>
      <th scope="row"><span class="punto" style="--color:${g.color}" aria-hidden="true"></span>${esc(g.nombre)}</th>
      <td>${esc(g.colegiosTxt)}</td>
      <td class="num-fuerte">${esc(g.puntajeTxt)}</td>
      <td>${esc(g.ipm)}</td>
      <td>${esc(g.computador)} %</td>
    </tr>`;
  }

  function colegios3d(d) {
    const descripcion = d.grupos.map((g) => `${g.nombre}, ${g.colegiosTxt} colegios, ${g.puntajeTxt} puntos`).join("; ");
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--3d">
      <div class="escena" data-vista="3d">
        <div class="escena__lienzo" data-territorio role="img" aria-label="Columnas 3D por tipo de colegio: ${esc(descripcion)}.">
          <div class="escena__etiquetas" aria-hidden="true"></div>
        </div>
        ${figura(d.figura, "escena__figura")}
        <div class="escena__pie">
          <p class="nota">${esc(d.nota3d)}</p>
          <button type="button" class="boton boton--suave" data-alternar-figura aria-pressed="false">Ver figura del informe</button>
        </div>
      </div>
      <div class="lateral">
        <table class="tabla tabla--grupos">
          <thead><tr><th scope="col">Tipo</th><th scope="col">Colegios</th><th scope="col">Puntaje</th><th scope="col">IPM</th><th scope="col">Computador</th></tr></thead>
          <tbody>${lista(d.grupos, filaGrupo)}</tbody>
        </table>
        <div class="destacados">${lista(d.destacados, (c, i) => casilla(c, i === 0 ? "casilla--principal casilla--fila" : "casilla--fila"))}</div>
      </div>
    </div>`;
  }

  function estudiantes(d) {
    const franja = lista(d.grupos, (g, i) => `<li class="franja__parte franja__parte--${i}" style="flex-basis:${g.pct}%">
        <span class="franja__pct">${esc(g.pctTxt)}</span>
      </li>`);
    const leyenda = lista(d.grupos, (g, i) => `<li><span class="punto punto--franja-${i}" aria-hidden="true"></span>
        ${esc(g.nombre)}: <strong>${esc(g.puntajeTxt)}</strong> puntos, ${esc(g.pctTxt)}</li>`);
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--figura">
      <div class="columna">
        <p class="cuerpo">Tres grupos con ${esc(d.semilla)}:</p>
        <ol class="franja" aria-hidden="true">${franja}</ol>
        <ul class="leyenda">${leyenda}</ul>
        <div class="par">${lista(d.estabilidad, (c) => casilla(c, "casilla--alerta"))}</div>
        <p class="advertencia">${esc(d.advertencia)}</p>
      </div>
      ${figura(d.figura)}
    </div>`;
  }

  function barraExactitud(e) {
    return `<li class="exactitud__fila${e.principal ? " exactitud__fila--principal" : ""}">
      <span class="exactitud__etiqueta">${esc(e.etiqueta)}</span>
      <span class="exactitud__pista"><span class="exactitud__barra" style="--fraccion:${(e.valor / 100).toFixed(4)}"></span></span>
      <span class="exactitud__valor">${esc(e.txt)}</span>
    </li>`;
  }

  /* Árbol J48 en SVG: raíz arriba, tres ramas; arbolJ48.js recorre los pasos. */
  const ARBOL = { ancho: 640, alto: 330, raiz: { x: 320, y: 22, w: 230, h: 62 }, hojaY: 226, hojaW: 176, hojaH: 82 };

  function ramaArbol(r, i, total) {
    const { raiz, hojaY, hojaW, hojaH, ancho } = ARBOL;
    const cx = (ancho / total) * (i + 0.5);
    const y0 = raiz.y + raiz.h;
    const camino = `M${raiz.x} ${y0} C${raiz.x} ${y0 + 70}, ${cx} ${hojaY - 90}, ${cx} ${hojaY}`;
    const valor = r.acierto
      ? `<text class="arbolj48__hoja" x="${cx}" y="${hojaY + 38}">${esc(r.hoja)}</text>
         <text class="arbolj48__acierto" x="${cx}" y="${hojaY + 66}">${esc(r.acierto)} de acierto</text>`
      : `<text class="arbolj48__sigue" x="${cx}" y="${hojaY + 48}">${esc(r.hoja)}</text>`;
    return `<g class="arbolj48__rama arbolj48__rama--${r.tono}" data-rama>
      <path class="arbolj48__arista" d="${camino}" pathLength="1"/>
      <text class="arbolj48__condicion" x="${(raiz.x + cx) / 2}" y="${(y0 + hojaY) / 2 + 14}">${esc(r.rama)}</text>
      <g class="arbolj48__nodo">
        <rect x="${cx - hojaW / 2}" y="${hojaY}" width="${hojaW}" height="${hojaH}"/>
        ${valor}
      </g>
    </g>`;
  }

  function arbol(a) {
    const { ancho, alto, raiz } = ARBOL;
    const descripcion = `Raíz: ${a.raiz}. ` + a.ramas.map((r) => `${r.rama}: ${r.hoja}${r.acierto ? `, ${r.acierto} de acierto` : ""}`).join("; ");
    return `<figure class="arbolj48" data-arbol>
      <svg class="arbolj48__svg" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${esc(descripcion)}">
        <g class="arbolj48__raiz" data-raiz>
          <rect x="${raiz.x - raiz.w / 2}" y="${raiz.y}" width="${raiz.w}" height="${raiz.h}"/>
          <text x="${raiz.x}" y="${raiz.y + 40}">${esc(a.raiz)}</text>
        </g>
        ${lista(a.ramas, (r, i) => ramaArbol(r, i, a.ramas.length))}
        <circle class="arbolj48__ficha" r="11" cx="${raiz.x}" cy="${raiz.y + raiz.h}" data-ficha/>
      </svg>
      <figcaption class="arbolj48__pie">
        <span class="nota">Raíz del árbol J48</span>
        <button type="button" class="boton boton--suave" data-recorrer>${esc(a.boton)}</button>
      </figcaption>
    </figure>`;
  }

  function j48(d) {
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--j48">
      <div class="columna">
        <p class="nota">${esc(d.leyenda)}</p>
        <ul class="exactitud">${lista(d.exactitud, barraExactitud)}</ul>
        <p class="metricas">${esc(d.metricas)}</p>
        <p class="advertencia advertencia--dato">${esc(d.nota)}</p>
      </div>
      ${arbol(d.arbol)}
    </div>`;
  }

  function filaBrecha(f, i, dominio) {
    const rango = dominio.max - dominio.min;
    const cero = (-dominio.min / rango) * 100;
    const largo = (Math.abs(f.valor) / rango) * 100;
    const signo = f.valor < 0 ? "negativa" : "positiva";
    const inicio = f.valor < 0 ? cero - largo : cero;
    return `<li class="brecha brecha--${signo}" style="--i:${i}">
      <span class="brecha__etiqueta">${esc(f.etiqueta)}<small>${esc(f.detalle)}</small></span>
      <span class="brecha__pista" style="--cero:${cero.toFixed(2)}%">
        <span class="brecha__barra" style="left:${inicio.toFixed(2)}%;width:${largo.toFixed(2)}%"></span>
        <span class="brecha__valor" style="left:${(f.valor < 0 ? inicio : inicio + largo).toFixed(2)}%">${esc(f.txt)}</span>
      </span>
    </li>`;
  }

  function brechas(d) {
    let contador = 0;
    const grupos = lista(d.grupos, (g) => `<li class="brechas__grupo">
        <p class="brechas__titulo">${esc(g.titulo)}</p>
        <ol>${lista(g.filas, (f) => filaBrecha(f, contador++, d.dominio))}</ol>
      </li>`);
    const e = d.estrato;
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--brechas">
      <div class="columna">
        <p class="cuerpo">${esc(e.texto)} obtiene</p>
        <div class="par">${casilla(e.bajo, "casilla--compacta")}${casilla(e.alto, "casilla--principal")}</div>
        <p class="diferencia">${esc(e.diferencia)}</p>
        ${figura(d.figura, "figura--compacta")}
      </div>
      <div class="columna" data-brechas>
        <ol class="brechas">${grupos}</ol>
        <p class="nota">${esc(d.unidad)}</p>
      </div>
    </div>`;
  }

  /* Curva de ventaja acumulada en SVG; bandit.js la dibuja progresivamente. */
  const CURVA = { ancho: 640, alto: 380, izq: 58, der: 470, arriba: 24, abajo: 318 };

  function curvaBandit(c, descripcion) {
    const { ancho, alto, izq, der, arriba, abajo } = CURVA;
    const x = (v) => izq + (v / c.ejeX.max) * (der - izq);
    const y = (v) => abajo - (v / c.ejeY.max) * (abajo - arriba);
    const puntos = c.ventajaMiles.map((v, i) => `${x(i * c.pasoMiles).toFixed(1)} ${y(v).toFixed(1)}`);
    const fin = puntos[puntos.length - 1].split(" ");
    const marcasY = lista(c.ejeY.marcas, (m) => `<line class="curva__rejilla" x1="${izq}" x2="${der}" y1="${y(m)}" y2="${y(m)}"/>
      <text class="curva__marca curva__marca--y" x="${izq - 10}" y="${y(m) + 6}">${m}</text>`);
    const marcasX = lista(c.ejeX.marcas, (m) => `<text class="curva__marca" x="${x(m)}" y="${abajo + 26}">${m}</text>`);
    return `<figure class="curva" data-curva>
      <svg class="curva__svg" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${esc(descripcion)}">
        ${marcasY}${marcasX}
        <text class="curva__titulo-eje" x="${izq}" y="${alto - 8}">${esc(c.ejeX.titulo)}</text>
        <text class="curva__titulo-eje" x="${izq - 44}" y="${arriba - 8}" text-anchor="start">${esc(c.ejeY.titulo)}</text>
        <line class="curva__base" x1="${izq}" x2="${der}" y1="${y(0)}" y2="${y(0)}"/>
        <text class="curva__etiqueta curva__etiqueta--base" x="${der + 12}" y="${y(0) + 6}">${esc(c.base)}</text>
        <path class="curva__linea" d="M${puntos.join(" L")}" pathLength="1" data-linea/>
        <circle class="curva__cabeza" r="8" cx="${fin[0]}" cy="${fin[1]}" data-cabeza/>
        <g class="curva__final" data-final>
          <text class="curva__etiqueta" x="${Number(fin[0]) + 16}" y="${Number(fin[1]) + 6}">${esc(c.serie)}</text>
          <text class="curva__valor" x="${Number(fin[0]) + 16}" y="${Number(fin[1]) + 40}">${esc(c.final.cifra)}</text>
          <text class="curva__detalle" x="${Number(fin[0]) + 16}" y="${Number(fin[1]) + 62}">${esc(c.final.etiqueta)}</text>
        </g>
      </svg>
    </figure>`;
  }

  function bandit(d) {
    const politica = lista(d.politica, (p) => `<tr>
        <th scope="row" class="num-fuerte">${esc(p.area)}</th><td>${esc(p.contextos)}</td>
      </tr>`);
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--figura">
      <div class="columna">
        <div class="par">${lista(d.destacados, (c, i) => casilla(c, i === 0 ? "casilla--principal" : ""))}</div>
        <table class="tabla tabla--politica">
          <caption>Área que LinUCB elige con más frecuencia</caption>
          <tbody>${politica}</tbody>
        </table>
        <p class="advertencia">${esc(d.advertencia)}</p>
      </div>
      ${curvaBandit(d.curva, d.descripcion)}
    </div>`;
  }

  function comparacion(d) {
    const cabeza = lista(d.columnas, (c, i) => `<th scope="col"${i === 2 ? ' class="col-actual"' : ""}>${esc(c)}</th>`);
    const filas = lista(d.filas, (f, i) => `<tr><th scope="row">${esc(f.etiqueta)}</th><td>${esc(f.txt[0])}</td><td class="col-actual" data-valor="${i}">${esc(f.txt[1])}</td></tr>`);
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--comparacion">
      <div class="columna" data-comparacion>
        <table class="tabla tabla--comparacion">
          <thead><tr>${cabeza}</tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <button type="button" class="boton boton--suave boton--izq" data-repetir-comparacion>${esc(d.boton)}</button>
      </div>
      <div class="columna">
        <p class="subtitulo-seccion">${esc(d.coincidencias.titulo)}</p>
        <ul class="marcadas">${lista(d.coincidencias.items, (t) => `<li>${esc(t)}</li>`)}</ul>
      </div>
    </div>`;
  }

  function cierre(d, meta) {
    return `<h2 class="titulo">${esc(d.titulo)}</h2>
    <div class="rejilla rejilla--cierre">
      <div class="columna">
        <ul class="conclusiones">${lista(d.puntos, (p) => `<li>${esc(p)}</li>`)}</ul>
        <p class="futuro">${esc(d.futuro)}</p>
      </div>
      <div class="columna">
        ${item(d.pregunta, d.respuesta)}
        <p class="diferencia">${esc(d.respuestaNota)}</p>
        <p class="gracias">${esc(d.gracias)}</p>
        <p class="nota">Código y resultados: <a href="${esc(meta.repositorio)}">${esc(meta.repositorio.replace("https://", ""))}</a></p>
      </div>
    </div>`;
  }

  const PLANTILLAS = { portada, datos, colegios3d, estudiantes, j48, brechas, bandit, comparacion, cierre };

  function diapositiva(d, indice, total, meta) {
    const plantilla = PLANTILLAS[d.tipo];
    if (!plantilla) throw new Error(`No hay plantilla para el tipo "${d.tipo}"`);
    return `<section class="diapositiva diapositiva--${d.tipo}" id="d${indice + 1}" data-indice="${indice}"
        role="group" aria-roledescription="diapositiva" aria-label="${indice + 1} de ${total}: ${esc(d.titulo)}">
      ${pista(indice, total)}
      <div class="diapositiva__cuerpo">${plantilla(d, meta)}</div>
      ${pie(indice, total, meta)}
    </section>`;
  }

  Saber.plantillas = { diapositiva };
})((window.Saber = window.Saber || {}));
