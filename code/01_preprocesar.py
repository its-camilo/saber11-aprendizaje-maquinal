"""Preprocesamiento Saber 11, periodo 20224 (calendario A 2022).
Fuente: datos.gov.co, conjunto kgxf-xxbe (ICFES), licencia CC BY-SA 4.0.
Salidas: data/saber11_2022_limpio.csv (todos los únicos con puntajes completos: 530.815),
         data/saber11_clasif_full.arff y data/saber11_cluster_full.arff (TODOS, usados en el informe),
         data/muestra150k.csv y sus ARFF (versión preliminar, solo para comparar)
"""
import pandas as pd, numpy as np, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")
SEED = 42

df = pd.concat([pd.read_csv(f"data/p_{o}.csv", dtype=str) for o in (0, 400000, 800000)])
n0 = len(df)
df = df.drop_duplicates()            # el periodo 20224 viene duplicado en la fuente
print(f"filas descargadas {n0}, únicas {len(df)}")

punt = ["punt_matematicas", "punt_lectura_critica", "punt_sociales_ciudadanas",
        "punt_c_naturales", "punt_ingles", "punt_global"]
for c in punt:
    df[c] = pd.to_numeric(df[c], errors="coerce")
df = df.dropna(subset=punt)

# edad al examen (agosto 2022)
fn = pd.to_datetime(df["estu_fechanacimiento"], format="%d/%m/%Y", errors="coerce")
edad = ((pd.Timestamp("2022-08-01") - fn).dt.days / 365.25)
df["edad"] = pd.cut(edad, [0, 17, 18, 19, 21, 200], labels=["<=16", "17", "18", "19-20", ">20"], right=False).astype(str)
df.loc[edad.isna() | (edad < 12) | (edad > 80), "edad"] = np.nan
# corrección: intervalos [a,b)
df["edad"] = df["edad"].replace({"nan": np.nan})

def simplificar_edu(x):
    if pd.isna(x) or x in ("No sabe", "No Aplica"): return np.nan
    m = {"Ninguno": "Ninguna", "Primaria incompleta": "Primaria", "Primaria completa": "Primaria",
         "Secundaria (Bachillerato) incompleta": "SecundariaInc", "Secundaria (Bachillerato) completa": "Secundaria",
         "Técnica o tecnológica incompleta": "Tecnica", "Técnica o tecnológica completa": "Tecnica",
         "Educación profesional incompleta": "ProfesionalInc", "Educación profesional completa": "Profesional",
         "Postgrado": "Posgrado"}
    return m.get(x, np.nan)
for c in ["fami_educacionmadre", "fami_educacionpadre"]:
    df[c] = df[c].map(simplificar_edu)

df["fami_estratovivienda"] = df["fami_estratovivienda"].replace({"Sin Estrato": "SinEstrato"}).str.replace("Estrato ", "E")
df["cole_caracter"] = df["cole_caracter"].replace({"NO APLICA": np.nan})
mediana = df["punt_global"].median()
df["desempeno"] = np.where(df["punt_global"] > mediana, "Alto", "Bajo")
print("mediana punt_global", mediana, df["desempeno"].value_counts().to_dict())

atributos = ["estu_genero", "edad", "fami_estratovivienda", "fami_educacionmadre", "fami_educacionpadre",
             "fami_tieneinternet", "fami_tienecomputador", "fami_tieneautomovil", "fami_tienelavadora",
             "fami_personashogar", "fami_cuartoshogar", "cole_naturaleza", "cole_area_ubicacion",
             "cole_jornada", "cole_bilingue", "cole_caracter", "cole_genero", "cole_depto_ubicacion"]
df = df[atributos + punt + ["desempeno"]]
df.to_csv("data/saber11_2022_limpio.csv", index=False)

m = df.sample(n=150_000, random_state=SEED)
m.to_csv("data/muestra150k.csv", index=False)

def a_arff(d, cols, nombre, ruta):
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(f"@relation {nombre}\n\n")
        for c in cols:
            if pd.api.types.is_numeric_dtype(d[c]):
                f.write(f"@attribute {c} numeric\n")
            else:
                vals = sorted(d[c].dropna().unique())
                vals = ",".join("'" + str(v).replace("'", "") + "'" for v in vals)
                f.write(f"@attribute {c} {{{vals}}}\n")
        f.write("\n@data\n")
        for row in d[cols].itertuples(index=False):
            out = []
            for v in row:
                if pd.isna(v): out.append("?")
                elif isinstance(v, (int, float, np.integer, np.floating)): out.append(str(int(v)) if float(v).is_integer() else str(v))
                else: out.append("'" + str(v).replace("'", "") + "'")
            f.write(",".join(out) + "\n")

a_arff(m, atributos + ["desempeno"], "saber11_2022_clasificacion", "data/saber11_clasif.arff")
# para agrupación: solo perfil (sin departamento para que los grupos sean de perfil), clase al final para classes-to-clusters
cl = [a for a in atributos if a != "cole_depto_ubicacion"]
a_arff(m, cl + ["desempeno"], "saber11_2022_agrupacion", "data/saber11_cluster.arff")
# Versión final: todos los estudiantes
a_arff(df, atributos + ["desempeno"], "saber11_2022_clasificacion", "data/saber11_clasif_full.arff")
a_arff(df, cl + ["desempeno"], "saber11_2022_agrupacion", "data/saber11_cluster_full.arff")
print("listo", df.shape, m.shape)
