"""Figuras para el informe (salida en informe/fig/)."""
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt, numpy as np, pandas as pd, re, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")
os.makedirs("informe/fig", exist_ok=True)
plt.rcParams.update({"font.size": 8, "font.family": "serif", "figure.dpi": 200})
W = 3.4

# Fig 1: codo de K-means (SSE de Weka)
ks, sse = [], []
for k in range(2, 9):
    t = open(f"results/weka/kmeans_k{k}.txt").read()
    ks.append(k); sse.append(float(re.search(r"Within cluster sum of squared errors: ([\d.]+)", t).group(1)))
fig, ax = plt.subplots(figsize=(W, 1.9))
ax.plot(ks, np.array(sse) / 1000, "o-", color="#1f4e79")
ax.axvline(3, ls="--", color="gray", lw=0.8); ax.text(3.1, max(sse) / 1000 * 0.99, "k=3", color="gray")
ax.set_xlabel("Número de grupos k"); ax.set_ylabel("SSE intra-grupo (miles)")
ax.grid(alpha=0.3); fig.tight_layout(); fig.savefig("informe/fig/codo.pdf")

# Fig 2: perfil de los 3 grupos
p = pd.read_csv("results/perfil_clusters_k3.csv", index_col=0)
# Weka numera los grupos 0,1,2 (cluster1..3); los ordenamos por interpretación
nombres = {"cluster2": "G1 Rural/E1\nsin conexión", "cluster1": "G2 Urbano conectado\n(mayoría mujeres)", "cluster3": "G3 Urbano conectado\n(mayoría hombres)"}
vars_ = [("internet", "Internet"), ("compu", "Compu-\ntador"), ("nooficial", "Colegio\nprivado"), ("rural", "Rural"), ("mujer", "Mujeres"), ("pct_alto", "% Alto")]
fig, ax = plt.subplots(figsize=(W, 2.1))
x = np.arange(len(vars_)); w = 0.27; cols = ["#c0504d", "#1f4e79", "#9bbb59"]
for i, c in enumerate(["cluster2", "cluster1", "cluster3"]):
    ax.bar(x + (i - 1) * w, [p.loc[c, v] for v, _ in vars_], w, label=f"{nombres[c].replace(chr(10), ' ')} ({p.loc[c,'punt_global']:.0f} pts)", color=cols[i])
ax.set_xticks(x); ax.set_xticklabels([l for _, l in vars_], fontsize=6.5); ax.set_ylabel("% del grupo"); ax.set_ylim(0, 100)
ax.legend(fontsize=5.5, loc="upper center", frameon=False, ncol=1); ax.set_ylim(0,135); ax.set_yticks(range(0,101,20)); ax.grid(axis="y", alpha=0.3)
fig.tight_layout(); fig.savefig("informe/fig/grupos.pdf")

# Fig 3: ganancia de información (Weka)
t = open("results/weka/infogain.txt").read().split("Ranked attributes:")[1].split("Selected")[0]
rows = [l.split() for l in t.strip().split("\n")]
ig = [(float(r[0]), r[2]) for r in rows][:10][::-1]
etq = {"edad": "Edad", "fami_educacionmadre": "Educ. madre", "cole_jornada": "Jornada", "fami_tienecomputador": "Computador",
       "cole_depto_ubicacion": "Departamento", "fami_educacionpadre": "Educ. padre", "fami_tieneinternet": "Internet",
       "cole_naturaleza": "Oficial/privado", "fami_estratovivienda": "Estrato", "cole_area_ubicacion": "Urbano/rural"}
fig, ax = plt.subplots(figsize=(W, 2.0))
ax.barh([etq.get(n, n) for _, n in ig], [v for v, _ in ig], color="#1f4e79")
ax.set_xlabel("Ganancia de información (bits)"); ax.grid(axis="x", alpha=0.3)
fig.tight_layout(); fig.savefig("informe/fig/infogain.pdf")

# Fig 4: ventaja acumulada sobre la política aleatoria (arrepentimiento evitado)
c = np.load("results/bandit_curvas.npz")
lab = {"siempre_mat": "Siempre matemáticas", "egreedy_sin_ctx": "ε-greedy sin contexto",
       "egreedy_ctx": "ε-greedy contextual", "linucb": "LinUCB (α=0,5)"}
fig, ax = plt.subplots(figsize=(W, 2.0))
for k, l in lab.items():
    y = c["aleatoria"] - c[k]; ax.plot(np.arange(len(y)) * 2000 / 1000, y / 1000, label=l, lw=1.1)
ax.axhline(0, color="gray", lw=0.6)
ax.set_xlabel("Estudiantes atendidos (miles)"); ax.set_ylabel("Ventaja vs. azar (miles)")
ax.legend(fontsize=6, frameon=False); ax.grid(alpha=0.3)
fig.tight_layout(); fig.savefig("informe/fig/bandit.pdf")
for f in ["codo", "grupos", "infogain", "bandit"]:
    plt.figure(); pass
print(dict(zip(ks, sse)))
