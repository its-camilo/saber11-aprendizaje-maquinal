"""Verificación de conteos y brechas de Saber 11 2025 contra los microdatos.

Lee los dos .txt de DataIcfes (20251 y 20252) y el anexo IPM del DANE, y
recalcula, sin ejecutar el pipeline del repo, los números que el informe
cita sin artefacto de respaldo: conteo post-dedup, brechas por grupo,
medias por IPM y celdas estrato x NSE. Guarda results/2025/brechas.csv.

Uso: python3 code/2025/verificar_brechas.py   (desde la raíz del repo)
"""

from pathlib import Path

import numpy as np
import pandas as pd

REPO = Path(__file__).resolve().parents[2]
DATA_2025 = REPO / "data" / "2025"
IPM_XLSX = REPO / "data" / "externos" / "ipm_municipal_2018.xlsx"
SALIDA = REPO / "results" / "2025" / "brechas.csv"

ARCHIVOS = ["Examen_Saber_11_20251-04e513b9.txt", "Examen_Saber_11_20252-7e5d0882.txt"]
COLUMNAS = ["periodo", "estu_consecutivo", "estu_estudiante",
            "cole_cod_dane_establecimiento", "cole_cod_mcpio_ubicacion",
            "cole_naturaleza", "cole_area_ubicacion", "estu_genero",
            "fami_tienecomputador", "fami_estratovivienda",
            "estu_nse_establecimiento", "estu_horassemanatrabaja",
            "fami_numlibros", "estu_dedicacionlecturadiaria",
            "punt_matematicas", "punt_lectura_critica",
            "punt_sociales_ciudadanas", "punt_c_naturales",
            "punt_ingles", "punt_global"]
PUNTAJES = ["punt_matematicas", "punt_lectura_critica",
            "punt_sociales_ciudadanas", "punt_c_naturales",
            "punt_ingles", "punt_global"]
MEDIANA_2025 = 254


def cargar_microdatos() -> pd.DataFrame:
    """Concatena los dos periodos leyendo solo las columnas necesarias."""
    return pd.concat(
        [pd.read_csv(DATA_2025 / f, sep=";", dtype=str, usecols=COLUMNAS)
         for f in ARCHIVOS],
        ignore_index=True,
    )


def poblacion_analizada(df: pd.DataFrame) -> pd.DataFrame:
    """Aplica los filtros de población del pipeline: dedup, estudiantes de
    colegio y los seis puntajes completos. Devuelve una copia limpia."""
    df = df.drop_duplicates("estu_consecutivo")
    df = df[df["estu_estudiante"] == "ESTUDIANTE"].copy()
    for col in PUNTAJES:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df.dropna(subset=PUNTAJES)


def normalizar_area(df: pd.DataFrame) -> pd.DataFrame:
    """El pipeline unifica URBANO en URBANA; se replica aquí."""
    df["cole_area_ubicacion"] = df["cole_area_ubicacion"].replace({"URBANO": "URBANA"})
    return df


def brecha(df: pd.DataFrame, columna: str, grupo_a: str, grupo_b: str) -> tuple:
    """Media de punt_global en dos grupos y su diferencia (a - b).

    La diferencia se calcula sobre las medias ya redondeadas a un decimal,
    como en la tabla del informe, para que brecha == media_a - media_b.
    """
    medias = df.groupby(columna)["punt_global"].mean()
    media_a, media_b = round(medias[grupo_a], 1), round(medias[grupo_b], 1)
    return media_a, media_b, round(media_a - media_b, 1)


def medias_por_categoria(df: pd.DataFrame, columna: str) -> dict:
    """Media de punt_global y conteo por cada valor de una columna."""
    g = df.groupby(columna, observed=True)["punt_global"]
    return {str(k): (round(v, 1), int(n)) for (k, v), n in
            zip(g.mean().items(), g.size())}


def cruzar_ipm(df: pd.DataFrame) -> pd.DataFrame:
    """Añade el IPM municipal del DANE por código de municipio del colegio."""
    ipm = pd.read_excel(pd.ExcelFile(IPM_XLSX), "4_IPM Mpio dominios",
                        dtype={"ID": str})
    ipm.columns = ["mpio", "mpio_nombre", "ipm_mpio", "ipm_cabecera", "ipm_rural"]
    ipm = ipm[ipm["mpio"].str.fullmatch(r"\d{5}", na=False)].copy()
    ipm["ipm_mpio"] = pd.to_numeric(ipm["ipm_mpio"], errors="coerce")
    df["mpio"] = df["cole_cod_mcpio_ubicacion"].str.zfill(5)
    return df.merge(ipm[["mpio", "ipm_mpio"]], on="mpio", how="left")


def base_colegios(df: pd.DataFrame) -> tuple:
    """Colegios con >=10 evaluados y con IPM, y suma de sus estudiantes."""
    g = df.groupby("cole_cod_dane_establecimiento")
    cole = pd.DataFrame({"n": g.size(), "ipm": g["ipm_mpio"].first()})
    con_ipm = cole[(cole["n"] >= 10)].dropna(subset=["ipm"])
    return len(con_ipm), int(con_ipm["n"].sum())


def fila_brecha(variable: str, grupo_a: str, media_a: float,
               grupo_b: str = "", media_b: float | str = "",
               n_total: int = 0) -> dict:
    brecha_val = round(media_a - media_b, 1) if isinstance(media_b, float) else ""
    return {"variable": variable, "grupo_a": grupo_a, "media_a": media_a,
            "grupo_b": grupo_b, "media_b": media_b, "brecha": brecha_val,
            "n_total": n_total}


def construir_brechas(df: pd.DataFrame) -> pd.DataFrame:
    """Tabla de brechas y medias por categoría para results/2025/brechas.csv."""
    filas = []
    for columna, a, b in [("fami_tienecomputador", "Si", "No"),
                          ("cole_naturaleza", "NO OFICIAL", "OFICIAL"),
                          ("cole_area_ubicacion", "URBANA", "RURAL"),
                          ("estu_genero", "M", "F")]:
        ma, mb, _ = brecha(df, columna, a, b)
        filas.append(fila_brecha(columna, a, ma, b, mb, len(df)))
    df["ipm_nivel"] = pd.cut(df["ipm_mpio"], [-1, 20, 35, 50, 101],
                             labels=["IPM<20", "IPM20-35", "IPM35-50", "IPM>50"])
    for nivel, (media, n) in medias_por_categoria(df, "ipm_nivel").items():
        filas.append(fila_brecha("ipm_municipio", nivel, media, n_total=n))
    for columna in ["fami_numlibros", "estu_horassemanatrabaja",
                    "estu_dedicacionlecturadiaria"]:
        for valor, (media, n) in medias_por_categoria(df, columna).items():
            filas.append(fila_brecha(columna, valor, media, n_total=n))
    return pd.DataFrame(filas)


def main() -> None:
    crudo = cargar_microdatos()
    print("TOTAL_FILAS", len(crudo), crudo["periodo"].value_counts().to_dict())
    print("POST_DEDUP", crudo["estu_consecutivo"].nunique(),
          "DUPLICADOS", len(crudo) - crudo["estu_consecutivo"].nunique())
    df = normalizar_area(poblacion_analizada(crudo))
    print("ANALIZADOS", len(df), "MEDIANA", df["punt_global"].median())
    print("MEDIA_20251", round(df.loc[df["periodo"] == "20251", "punt_global"].mean(), 1))
    for columna, a, b in [("fami_tienecomputador", "Si", "No"),
                          ("cole_naturaleza", "NO OFICIAL", "OFICIAL"),
                          ("cole_area_ubicacion", "URBANA", "RURAL"),
                          ("estu_genero", "M", "F")]:
        print("BRECHA", columna, brecha(df, columna, a, b))
    df = cruzar_ipm(df)
    print("IPM_COBERTURA", round(df["ipm_mpio"].notna().mean() * 100, 2))
    n_cole, suma = base_colegios(df)
    print("COLEGIOS_GE10_CON_IPM", n_cole, "SUMA_ESTUDIANTES", suma)
    df["estrato"] = df["fami_estratovivienda"].str.replace("Estrato ", "E")
    df["nse"] = "NSE" + df["estu_nse_establecimiento"].astype(str)
    celdas = df.groupby(["nse", "estrato"]).size()
    print("CELDA_E5_NSE1", int(celdas.get(("NSE1", "E5"), 0)),
          "CELDA_E6_NSE1", int(celdas.get(("NSE1", "E6"), 0)))
    brechas = construir_brechas(df)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    brechas.to_csv(SALIDA, index=False)
    print("BRECHAS_CSV", SALIDA, len(brechas), "filas")


if __name__ == "__main__":
    main()
