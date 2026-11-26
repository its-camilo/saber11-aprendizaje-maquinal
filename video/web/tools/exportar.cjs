#!/usr/bin/env node
/*
 * Exporta la presentación web a PDF (una diapositiva por página, 16:9) y,
 * opcionalmente, guarda capturas PNG de cada diapositiva para revisarlas.
 *
 * Uso (desde la raíz del repo):
 *   NODE_PATH=/ruta/a/node_modules node video/web/tools/exportar.cjs pdf
 *   NODE_PATH=/ruta/a/node_modules node video/web/tools/exportar.cjs capturas [carpeta]
 *
 * Requiere el paquete "playwright" con su Chromium instalado
 * (npx playwright install chromium), o la variable CHROMIUM_PATH apuntando
 * a un binario de Chromium/Chrome. Playwright no se agrega al repo.
 */
"use strict";

const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const RAIZ_WEB = path.resolve(__dirname, "..");
const URL_BASE = "file://" + path.join(RAIZ_WEB, "index.html");
const PDF_SALIDA = path.resolve(RAIZ_WEB, "..", "presentacion.pdf");
const ANCHO = 1280;
const ALTO = 720;
const TOTAL = 9;

const ARGS_WEBGL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

async function abrir(navegador, opciones = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: ANCHO, height: ALTO },
    deviceScaleFactor: 2,
    reducedMotion: opciones.reducedMotion || "reduce",
  });
  const pagina = await contexto.newPage();
  pagina.on("pageerror", (e) => console.error("Error en la página:", e.message));
  pagina.on("console", (m) => { if (m.type() === "error") console.error("Consola:", m.text()); });
  return pagina;
}

async function irA(pagina, n) {
  await pagina.goto(`${URL_BASE}#${n}`);
  await pagina.waitForSelector("html.listo");
  await pagina.evaluate(() => document.fonts.ready);
}

async function exportarPdf(navegador) {
  const pagina = await abrir(navegador);
  await irA(pagina, 3); // el 3D se crea al entrar a la diapositiva 3
  const largoFoto = await pagina.evaluate(() => {
    window.Saber.prepararImpresion();
    return document.querySelector(".escena__instantanea")?.src.length || 0;
  });
  if (largoFoto < 10000) throw new Error("La instantánea del 3D salió vacía; revise el soporte de WebGL.");
  await pagina.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))));
  await pagina.emulateMedia({ media: "print" });
  await pagina.pdf({ path: PDF_SALIDA, preferCSSPageSize: true, printBackground: true });
  console.log("PDF escrito en", PDF_SALIDA);
}

async function capturas(navegador, carpeta) {
  fs.mkdirSync(carpeta, { recursive: true });
  const pagina = await abrir(navegador);
  for (let n = 1; n <= TOTAL; n += 1) {
    await irA(pagina, n);
    await pagina.waitForTimeout(400);
    const archivo = path.join(carpeta, `diapositiva-${n}.png`);
    await pagina.screenshot({ path: archivo });
    console.log("Captura", archivo);
  }
}

async function principal() {
  const [modo = "pdf", carpeta = "/tmp/capturas-saber11"] = process.argv.slice(2);
  const navegador = await chromium.launch({
    args: ARGS_WEBGL,
    executablePath: process.env.CHROMIUM_PATH || undefined, // p. ej. ~/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome
  });
  try {
    if (modo === "pdf") await exportarPdf(navegador);
    else if (modo === "capturas") await capturas(navegador, path.resolve(carpeta));
    else throw new Error(`Modo desconocido "${modo}". Use "pdf" o "capturas".`);
  } finally {
    await navegador.close();
  }
}

principal().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
