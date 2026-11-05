"""Perfil de los grupos de K-means 2025 (estudiantes k=3, estabilidad con semillas 1 y 7,
y colegios k=4 cruzados con IPM municipal) a partir de las asignaciones de Weka (AddCluster)."""
import pandas as pd, numpy as np, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/../..")
O = "results/2025"

def leer_cluster(ruta):
    out = []
    with open(ruta, encoding="utf-8") as f:
        data = False
        for l in f:
            if data:
                l = l.rstrip("\n")
                if l: out.append(l.rsplit(",", 1)[1].strip("'"))
            elif l.strip().lower() == "@data": data = True
    return out

df = pd.read_csv("data/2025/saber11_2025_limpio.csv", low_memory=False)
df["c3"] = leer_cluster(f"{O}/weka/cluster_k3.arff")
def perfil(g):
    return pd.Series({
        "n": len(g), "pct": len(g) / len(df) * 100, "punt_global": g["punt_global"].mean(),
        "pct_alto": (g["desempeno"] == "Alto").mean() * 100,
        "internet": (g["fami_tieneinternet"] == "Si").sum() / g["fami_tieneinternet"].notna().sum() * 100,
        "compu": (g["fami_tienecomputador"] == "Si").sum() / g["fami_tienecomputador"].notna().sum() * 100,
        "nooficial": (g["cole_naturaleza"] == "NO OFICIAL").mean() * 100,
        "rural": (g["cole_area_ubicacion"] == "RURAL").mean() * 100,
        "E1": (g["fami_estratovivienda"] == "E1").sum() / g["fami_estratovivienda"].notna().sum() * 100,
        "madre_prof": g["fami_educacionmadre"].isin(["Profesional", "Posgrado"]).sum() / g["fami_educacionmadre"].notna().sum() * 100,
        "libros_0_10": (g["fami_numlibros"] == "0 A 10 LIBROS").sum() / g["fami_numlibros"].notna().sum() * 100,
        "trabaja": ((g["estu_horassemanatrabaja"].notna()) & (g["estu_horassemanatrabaja"] != "0")).sum() / g["estu_horassemanatrabaja"].notna().sum() * 100,
        "sin_encuesta": g["fami_tienecomputador"].isna().mean() * 100,
        "mujer": (g["estu_genero"] == "F").mean() * 100,
        "ipm_mpio": g["ipm_mpio"].mean(), "nse4": (g["nse_colegio"] == "NSE4").mean() * 100,
        "nse1_2": g["nse_colegio"].isin(["NSE1", "NSE2"]).mean() * 100,
        "mat": g["punt_matematicas"].mean(), "ing": g["punt_ingles"].mean()}).round(1)
p3 = df.groupby("c3").apply(perfil)
p3.to_csv(f"{O}/perfil_clusters_k3.csv"); print(p3.T.to_string())

# Estabilidad: índice de Rand ajustado entre semillas
from sklearn.metrics import adjusted_rand_score
est = {}
for s in (1, 7):
    c = leer_cluster(f"{O}/weka/cluster_k3_s{s}.arff")
    est[f"ARI_semilla42_vs_{s}"] = round(adjusted_rand_score(df["c3"], c), 3)
print("estabilidad", est)
pd.Series(est).to_csv(f"{O}/estabilidad_kmeans.csv")

# Colegios k=4
co = pd.read_csv("data/2025/colegios.csv")
co["c4"] = leer_cluster(f"{O}/weka/colegios_cluster_k4.arff")
pc = co.groupby("c4").agg(n=("n", "size"), estudiantes=("n", "sum"), punt_global=("punt_global", "mean"),
                         ipm=("ipm_mpio", "mean"), compu=("pct_computador", "mean"), madre_prof=("pct_madre_prof", "mean"),
                         trabaja=("pct_trabaja", "mean"), libros=("pct_menos10libros", "mean"),
                         nooficial=("naturaleza", lambda s: (s == "NO OFICIAL").mean() * 100),
                         rural=("area", lambda s: (s == "RURAL").mean() * 100),
                         p_sd=("punt_global", "std")).round(1)
pc.to_csv(f"{O}/perfil_colegios_k4.csv"); print(pc.to_string())
# Colegios que superan lo esperado: residuo de regresión lineal del puntaje sobre los 7 indicadores
from sklearn.linear_model import LinearRegression
X = co[["pct_computador", "pct_internet", "pct_e1", "pct_madre_prof", "pct_trabaja", "pct_menos10libros", "ipm_mpio"]]
lr = LinearRegression().fit(X, co["punt_global"]); co["residuo"] = co["punt_global"] - lr.predict(X)
r2 = lr.score(X, co["punt_global"])
res = {"r2_colegios": round(r2, 3), "coef": dict(zip(X.columns, lr.coef_.round(3))),
       "pct_oficiales_en_top10_residuo": round((co.nlargest(len(co) // 10, "residuo")["naturaleza"] == "OFICIAL").mean() * 100, 1),
       "pct_oficiales_total": round((co["naturaleza"] == "OFICIAL").mean() * 100, 1)}
print(res)
pd.Series(res).to_json(f"{O}/colegios_regresion.json", force_ascii=False)

# IPM municipal vs puntaje (estudiantes)
t = df.groupby("ipm_mpio_nivel").agg(n=("punt_global", "size"), punt=("punt_global", "mean"),
                                     alto=("desempeno", lambda s: (s == "Alto").mean() * 100)).round(1)
print(t); t.to_csv(f"{O}/ipm_vs_puntaje.csv")
# Brecha por NSE del colegio dentro de cada estrato (contexto del colegio vs hogar)
b = df.pivot_table(index="fami_estratovivienda", columns="nse_colegio", values="punt_global", aggfunc="mean").round(1)
print(b); b.to_csv(f"{O}/estrato_vs_nse_colegio.csv")
