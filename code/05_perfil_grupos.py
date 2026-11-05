"""Perfil de los grupos de K-means (k=3) a partir de la asignación de Weka (AddCluster)."""
import pandas as pd, numpy as np, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")
lines = open("results/weka/cluster_k3.arff", encoding="utf-8").read().split("@data")[1].strip().split("\n")
cl = [re.split(r",(?=(?:[^']*'[^']*')*[^']*$)", l)[-1].strip("'") for l in lines]
df = pd.read_csv("data/saber11_2022_limpio.csv")
assert len(df) == len(cl), (len(df), len(cl))
df["c3"] = cl
g = df.groupby("c3")
p = pd.DataFrame({
    "n": g.size(), "pct": (g.size() / len(df) * 100).round(1),
    "punt_global": g["punt_global"].mean().round(1),
    "pct_alto": g["desempeno"].apply(lambda s: (s == "Alto").mean() * 100).round(1),
    "internet": g["fami_tieneinternet"].apply(lambda s: (s == "Si").mean() * 100).round(0),
    "compu": g["fami_tienecomputador"].apply(lambda s: (s == "Si").mean() * 100).round(0),
    "nooficial": g["cole_naturaleza"].apply(lambda s: (s == "NO OFICIAL").mean() * 100).round(0),
    "rural": g["cole_area_ubicacion"].apply(lambda s: (s == "RURAL").mean() * 100).round(0),
    "estrato_moda": g["fami_estratovivienda"].agg(lambda s: s.mode()[0]),
    "E1": g["fami_estratovivienda"].apply(lambda s: (s == "E1").mean() * 100).round(0),
    "E4plus": g["fami_estratovivienda"].apply(lambda s: s.isin(["E4", "E5", "E6"]).mean() * 100).round(0),
    "madre_prof": g["fami_educacionmadre"].apply(lambda s: s.isin(["Profesional", "Posgrado"]).mean() * 100).round(0),
    "edad18plus": g["edad"].apply(lambda s: s.isin(["18", "19-20", ">20"]).mean() * 100).round(0),
    "mujer": g["estu_genero"].apply(lambda s: (s == "F").mean() * 100).round(0),
    "mat": g["punt_matematicas"].mean().round(1), "ing": g["punt_ingles"].mean().round(1)})
p.to_csv("results/perfil_clusters_k3.csv"); print(p.to_string())
