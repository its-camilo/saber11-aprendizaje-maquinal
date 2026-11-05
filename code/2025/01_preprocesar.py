"""Preprocesamiento Saber 11 2025 (periodos 20251 y 20252) + cruce con IPM municipal DANE 2018.

Fuentes:
  - Microdatos Saber 11 2025, DataIcfes (ICFES), acceso con registro:
      data/2025/Examen_Saber_11_20251*.txt y Examen_Saber_11_20252*.txt (separador ';')
  - Medida de pobreza multidimensional municipal de fuente censal 2018, DANE (anexo xlsx):
      data/externos/ipm_municipal_2018.xlsx
Población: estudiantes de colegio (estu_estudiante == ESTUDIANTE) con los cinco puntajes.
Cruces:
  1) Municipio del colegio (cole_cod_mcpio_ubicacion) -> IPM municipal y privaciones (DANE).
  2) Colegio (cole_cod_dane_establecimiento) -> contexto agregado del colegio (tamaño, % con
     computador, % estrato 1, educación de la madre), calculado SIN usar puntajes (no hay fuga).
Salidas: data/2025/saber11_2025_limpio.csv, data/2025/clasif.arff, data/2025/cluster.arff,
         data/2025/colegios.csv y data/2025/colegios.arff
"""
import pandas as pd, numpy as np, os, glob
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/../..")

df = pd.concat([pd.read_csv(f, sep=";", dtype=str) for f in sorted(glob.glob("data/2025/Examen_Saber_11_2025*.txt"))])
print("filas totales (inscritos 2025):", len(df), df["periodo"].value_counts().to_dict())
df = df.drop_duplicates("estu_consecutivo")
df = df[df["estu_estudiante"] == "ESTUDIANTE"]
print("estudiantes de colegio:", len(df))

AREAS = ["punt_matematicas", "punt_lectura_critica", "punt_sociales_ciudadanas", "punt_c_naturales", "punt_ingles"]
punt = AREAS + ["punt_global"]
for c in punt: df[c] = pd.to_numeric(df[c], errors="coerce")
n1 = len(df); df = df.dropna(subset=punt)
print("sin algún puntaje (descartados):", n1 - len(df), "-> quedan", len(df))

# ---- variables derivadas ----
fn = pd.to_datetime(df["estu_fechanacimiento"], format="%d/%m/%Y", errors="coerce")
ref = np.where(df["periodo"] == "20251", np.datetime64("2025-03-01"), np.datetime64("2025-08-01"))
edad = (pd.Series(ref, index=df.index) - fn).dt.days / 365.25
df["edad"] = pd.cut(edad, [0, 17, 18, 19, 21, 200], labels=["<=16", "17", "18", "19-20", ">20"], right=False).astype(str)
df.loc[edad.isna() | (edad < 12) | (edad > 80), "edad"] = np.nan
df["edad"] = df["edad"].replace({"nan": np.nan})

def edu(x):
    m = {"Ninguno": "Ninguna", "Primaria incompleta": "Primaria", "Primaria completa": "Primaria",
         "Secundaria (Bachillerato) incompleta": "SecundariaInc", "Secundaria (Bachillerato) completa": "Secundaria",
         "Técnica o tecnológica incompleta": "Tecnica", "Técnica o tecnológica completa": "Tecnica",
         "Educación profesional incompleta": "ProfesionalInc", "Educación profesional completa": "Profesional",
         "Postgrado": "Posgrado"}
    return m.get(x, np.nan)
for c in ["fami_educacionmadre", "fami_educacionpadre"]: df[c] = df[c].map(edu)

def trabajo(x):
    if pd.isna(x): return np.nan
    x = x.lower()
    for k, v in [("profesional", "Profesional"), ("dueño", "Negocio"), ("propia", "CuentaPropia"),
                 ("agricultor", "Agro"), ("hogar", "HogarNoTrabaja"), ("pensionado", "Pensionado"),
                 ("auxiliar", "Auxiliar"), ("vendedor", "Vendedor"), ("limpieza", "Operativo"),
                 ("operario", "Operativo"), ("directivo", "Directivo"), ("no sabe", np.nan), ("no aplica", np.nan)]:
        if k in x: return v
    return "Otro"
for c in ["fami_trabajolabormadre", "fami_trabajolaborpadre"]: df[c] = df[c].map(trabajo)

df["fami_estratovivienda"] = df["fami_estratovivienda"].replace({"Sin Estrato": "SinEstrato"}).str.replace("Estrato ", "E")
df["cole_area_ubicacion"] = df["cole_area_ubicacion"].replace({"URBANO": "URBANA"})
df["cole_depto_ubicacion"] = df["cole_depto_ubicacion"].replace({"NARIŃO": "NARIÑO"})
df["cole_caracter"] = df["cole_caracter"].replace({"NO APLICA": np.nan})
df["repite_examen"] = np.where(pd.to_numeric(df["estu_repite"], errors="coerce").fillna(0) > 0, "Si", "No")
df["nacionalidad"] = df["estu_nacionalidad"].map(lambda x: x if x in ("COLOMBIA", "VENEZUELA") else ("OTRA" if isinstance(x, str) else np.nan))
df["nse_colegio"] = "NSE" + df["estu_nse_establecimiento"].astype(str)
df.loc[df["estu_nse_establecimiento"].isna(), "nse_colegio"] = np.nan

# ---- cruce 1: IPM municipal DANE 2018 ----
x = pd.ExcelFile("data/externos/ipm_municipal_2018.xlsx")
ipm = pd.read_excel(x, "4_IPM Mpio dominios", dtype={"ID": str})
ipm.columns = ["mpio", "mpio_nombre", "ipm_mpio", "ipm_cabecera", "ipm_rural"]
pv = pd.read_excel(x, "6_Privaciones IPM Dpt-Mpio", header=1, dtype={"ID": str})
pv = pv.rename(columns={"ID": "mpio", "Bajo logro educativo": "priv_bajo_logro_educ",
                        "Trabajo informal": "priv_trabajo_informal", "Sin acceso a fuente de agua mejorada": "priv_sin_agua"})
pv = pv[["mpio", "priv_bajo_logro_educ", "priv_trabajo_informal", "priv_sin_agua"]]
ext = ipm.merge(pv, on="mpio", how="left")
ext = ext[ext["mpio"].str.fullmatch(r"\d{5}", na=False)]
for c in ext.columns[2:]: ext[c] = pd.to_numeric(ext[c], errors="coerce")
df["mpio"] = df["cole_cod_mcpio_ubicacion"].str.zfill(5)
df = df.merge(ext.drop(columns="mpio_nombre"), on="mpio", how="left")
print("cruce IPM: estudiantes con IPM del municipio:", round(df["ipm_mpio"].notna().mean() * 100, 2), "%")
df["ipm_mpio_nivel"] = pd.cut(df["ipm_mpio"], [-1, 20, 35, 50, 101], labels=["IPM<20", "IPM20-35", "IPM35-50", "IPM>50"]).astype(str).replace({"nan": np.nan})

# ---- cruce 2: contexto agregado del colegio (sin puntajes) ----
k = "cole_cod_dane_establecimiento"
g = df.groupby(k)
col = pd.DataFrame({
    "col_tamano": g.size(),
    "col_pct_computador": g["fami_tienecomputador"].apply(lambda s: (s == "Si").sum() / max(s.notna().sum(), 1) * 100),
    "col_pct_e1": g["fami_estratovivienda"].apply(lambda s: (s == "E1").sum() / max(s.notna().sum(), 1) * 100),
    "col_pct_madre_prof": g["fami_educacionmadre"].apply(lambda s: s.isin(["Profesional", "Posgrado"]).sum() / max(s.notna().sum(), 1) * 100),
}).round(1)
df = df.merge(col, left_on=k, right_index=True, how="left")
df["col_tamano_nivel"] = pd.cut(df["col_tamano"], [0, 30, 80, 200, 1e9], labels=["<=30", "31-80", "81-200", ">200"]).astype(str).replace({"nan": np.nan})
df["col_computador_nivel"] = pd.cut(df["col_pct_computador"], [-1, 40, 70, 90, 101], labels=["<40", "40-70", "70-90", ">90"]).astype(str).replace({"nan": np.nan})

mediana = df["punt_global"].median()
df["desempeno"] = np.where(df["punt_global"] > mediana, "Alto", "Bajo")
print("mediana punt_global 2025:", mediana, df["desempeno"].value_counts().to_dict())

ATR = ["estu_genero", "edad", "nacionalidad", "estu_grupoetnia", "estu_discapacidad", "estu_comunidadcampesina",
       "estu_numhijos", "repite_examen", "estu_horassemanatrabaja", "estu_horastrabnoremu", "estu_tiporemuneracion",
       "estu_dedicacionlecturadiaria", "estu_dedicacioninternet", "estu_tiempocasaacole", "estu_desplazacolegio",
       "fami_estratovivienda", "fami_educacionmadre", "fami_educacionpadre", "fami_trabajolabormadre", "fami_trabajolaborpadre",
       "fami_personashogar", "fami_cuartoshogar", "fami_numhermanos", "fami_numlibros", "fami_situacioneconomica",
       "fami_tieneinternet", "fami_tienecomputador", "fami_tieneautomovil", "fami_tienelavadora", "fami_tieneconsolavideojuegos",
       "fami_tienehornomicroogas", "fami_tienemotocicleta", "fami_tieneserviciotv",
       "fami_comecarnepescadohuevo", "fami_comecerealfrutoslegumbre", "fami_comelechederivados",
       "cole_naturaleza", "cole_area_ubicacion", "cole_jornada", "cole_bilingue", "cole_caracter", "cole_genero",
       "cole_calendario", "nse_colegio", "cole_depto_ubicacion",
       "ipm_mpio_nivel", "col_tamano_nivel", "col_computador_nivel"]
NUM = ["ipm_mpio", "ipm_rural", "priv_bajo_logro_educ", "priv_trabajo_informal", "col_pct_computador", "col_pct_e1", "col_pct_madre_prof", "col_tamano"]
keep = ATR + NUM + punt + ["desempeno", "periodo", k, "mpio", "estu_inse_individual"]
df[keep].to_csv("data/2025/saber11_2025_limpio.csv", index=False)

def a_arff(d, cols, nombre, ruta):
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(f"@relation {nombre}\n\n")
        for c in cols:
            if pd.api.types.is_numeric_dtype(d[c]): f.write(f"@attribute {c} numeric\n")
            else:
                vals = ",".join("'" + str(v).replace("'", "") + "'" for v in sorted(d[c].dropna().unique()))
                f.write(f"@attribute {c} {{{vals}}}\n")
        f.write("\n@data\n")
        for row in d[cols].itertuples(index=False):
            out = []
            for v in row:
                if pd.isna(v): out.append("?")
                elif isinstance(v, (int, float, np.integer, np.floating)): out.append(str(int(v)) if float(v).is_integer() else f"{v:.2f}")
                else: out.append("'" + str(v).replace("'", "") + "'")
            f.write(",".join(out) + "\n")

# Clasificación (J48): atributos nominales (incluye los niveles de los cruces) + clase
a_arff(df, ATR + ["desempeno"], "saber11_2025_clasificacion", "data/2025/clasif.arff")
# Agrupación de estudiantes (K-means): perfil del hogar, estudiante y colegio, sin departamento ni puntajes
CL = ["estu_genero", "edad", "fami_estratovivienda", "fami_educacionmadre", "fami_educacionpadre", "fami_numlibros",
      "fami_tieneinternet", "fami_tienecomputador", "fami_tieneautomovil", "fami_tienelavadora",
      "fami_personashogar", "fami_cuartoshogar", "estu_horassemanatrabaja", "fami_comecarnepescadohuevo",
      "cole_naturaleza", "cole_area_ubicacion", "cole_jornada", "cole_bilingue", "cole_caracter", "cole_genero",
      "nse_colegio", "ipm_mpio_nivel"]
a_arff(df, CL + ["desempeno"], "saber11_2025_agrupacion", "data/2025/cluster.arff")

# ---- base a nivel de colegio (agrupación de colegios, con cruce IPM) ----
gc = df.groupby(k)
cole = pd.DataFrame({
    "n": gc.size(),
    "punt_global": gc["punt_global"].mean().round(1),
    "pct_computador": gc["fami_tienecomputador"].apply(lambda s: (s == "Si").sum() / max(s.notna().sum(), 1) * 100).round(1),
    "pct_internet": gc["fami_tieneinternet"].apply(lambda s: (s == "Si").sum() / max(s.notna().sum(), 1) * 100).round(1),
    "pct_e1": gc["fami_estratovivienda"].apply(lambda s: (s == "E1").sum() / max(s.notna().sum(), 1) * 100).round(1),
    "pct_madre_prof": gc["fami_educacionmadre"].apply(lambda s: s.isin(["Profesional", "Posgrado"]).sum() / max(s.notna().sum(), 1) * 100).round(1),
    "pct_trabaja": gc["estu_horassemanatrabaja"].apply(lambda s: (s.notna() & (s != "0")).sum() / max(s.notna().sum(), 1) * 100).round(1),
    "pct_menos10libros": gc["fami_numlibros"].apply(lambda s: (s == "0 A 10 LIBROS").sum() / max(s.notna().sum(), 1) * 100).round(1),
    "ipm_mpio": gc["ipm_mpio"].first(),
    "naturaleza": gc["cole_naturaleza"].agg(lambda s: s.mode()[0] if s.notna().any() else np.nan),
    "area": gc["cole_area_ubicacion"].agg(lambda s: s.mode()[0] if s.notna().any() else np.nan),
    "depto": gc["cole_depto_ubicacion"].first(),
})
cole = cole[cole["n"] >= 10].dropna(subset=["ipm_mpio"])
cole.to_csv("data/2025/colegios.csv")
a_arff(cole.reset_index(drop=True), ["pct_computador", "pct_internet", "pct_e1", "pct_madre_prof", "pct_trabaja", "pct_menos10libros", "ipm_mpio", "punt_global"],
       "colegios_2025", "data/2025/colegios.arff")
print("colegios (>=10 evaluados, con IPM):", len(cole))
print("listo", df.shape)
