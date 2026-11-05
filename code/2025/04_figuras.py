"""Figuras del informe 2025 (salida en informe/fig/)."""
import matplotlib; matplotlib.use("Agg"); import matplotlib.ticker
import matplotlib.pyplot as plt, numpy as np, pandas as pd, re, os, json
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/../..")
os.makedirs("informe/fig", exist_ok=True)
plt.rcParams.update({"font.size": 8, "font.family": "serif", "figure.dpi": 200})
W = 3.4; O = "results/2025"

def sse(f): return float(re.search(r"Within cluster sum of squared errors: ([\d.]+)", open(f).read()).group(1))

# Fig 1: codo estudiantes y colegios
fig, ax = plt.subplots(1, 2, figsize=(W, 1.7))
ks = range(2, 9); ax[0].plot(ks, [sse(f"{O}/weka/kmeans_k{k}.txt") / 1e6 for k in ks], "o-", color="#1f4e79", ms=3)
ax[0].axvline(3, ls="--", color="gray", lw=0.8); ax[0].set_title("Estudiantes (561.049)", fontsize=7)
ax[0].set_xlabel("k"); ax[0].set_ylabel("SSE (millones)")
kc = range(2, 7); ax[1].plot(kc, [sse(f"{O}/weka/colegios_k{k}.txt") for k in kc], "o-", color="#c0504d", ms=3)
ax[1].axvline(4, ls="--", color="gray", lw=0.8); ax[1].set_title("Colegios (9.692)", fontsize=7)
ax[1].set_xlabel("k"); ax[1].set_ylabel("SSE")
for a in ax: a.grid(alpha=0.3); a.xaxis.set_major_locator(matplotlib.ticker.MaxNLocator(integer=True))
fig.tight_layout(); fig.savefig("informe/fig/codo.pdf")

# Fig 2: colegios k=4 (cruce IPM)
pc = pd.read_csv(f"{O}/perfil_colegios_k4.csv", index_col=0).sort_values("punt_global")
nom = {"cluster2": "C1 Rural pobre", "cluster3": "C2 Oficial intermedio", "cluster1": "C3 Urbano conectado", "cluster4": "C4 Privado acomodado"}
vars_ = [("compu", "Computador"), ("madre_prof", "Madre\nprofesional"), ("trabaja", "Estudiante\ntrabaja"), ("libros", "≤10 libros"), ("ipm", "IPM del\nmunicipio")]
fig, ax = plt.subplots(figsize=(W, 2.1)); x = np.arange(len(vars_)); w = 0.2
cols = ["#c0504d", "#f79646", "#4f81bd", "#1f4e79"]
for i, c in enumerate(pc.index):
    ax.bar(x + (i - 1.5) * w, [pc.loc[c, v] for v, _ in vars_], w, color=cols[i], label=f"{nom[c]}: {pc.loc[c,'punt_global']:.0f} pts")
ax.set_xticks(x); ax.set_xticklabels([l for _, l in vars_], fontsize=6.5); ax.set_ylabel("% medio del colegio")
ax.set_ylim(0, 150); ax.set_yticks(range(0, 101, 20)); ax.legend(fontsize=5.5, ncol=2, frameon=False, loc="upper center"); ax.grid(axis="y", alpha=0.3)
fig.tight_layout(); fig.savefig("informe/fig/colegios.pdf")

# Fig 3: ganancia de información (top 12)
t = open(f"{O}/weka/infogain.txt").read().split("Ranked attributes:")[1].split("Selected")[0]
rows = [l.split() for l in t.strip().split("\n")]
etq = {"col_computador_nivel": "% con computador en el colegio*", "nse_colegio": "NSE del colegio", "cole_jornada": "Jornada",
       "fami_educacionmadre": "Educación madre", "edad": "Edad", "ipm_mpio_nivel": "IPM del municipio*", "fami_educacionpadre": "Educación padre",
       "fami_tienecomputador": "Computador en casa", "cole_depto_ubicacion": "Departamento", "estu_comunidadcampesina": "Comunidad campesina",
       "fami_numlibros": "Libros en casa", "estu_dedicacioninternet": "Horas de internet"}
ig = [(float(r[0]), r[2]) for r in rows][:12][::-1]
fig, ax = plt.subplots(figsize=(W, 2.3))
ax.barh([etq.get(n, n) for _, n in ig], [v for v, _ in ig], color=["#c0504d" if n in ("col_computador_nivel", "ipm_mpio_nivel") else "#1f4e79" for _, n in ig])
ax.set_xlabel("Ganancia de información (bits)"); ax.grid(axis="x", alpha=0.3); ax.tick_params(axis="y", labelsize=6.5)
fig.tight_layout(); fig.savefig("informe/fig/infogain.pdf")

# Fig 4: estrato del hogar vs NSE del colegio
b = pd.read_csv(f"{O}/estrato_vs_nse_colegio.csv", index_col=0).loc[["E1", "E2", "E3", "E4", "E5", "E6"]]
fig, ax = plt.subplots(figsize=(W, 1.9))
im = ax.imshow(b.values, cmap="RdYlGn", aspect="auto", vmin=200, vmax=330)
ax.set_xticks(range(4)); ax.set_xticklabels(b.columns); ax.set_yticks(range(len(b))); ax.set_yticklabels(["Estrato " + i[1] for i in b.index])
for i in range(b.shape[0]):
    for j in range(b.shape[1]): ax.text(j, i, f"{b.values[i,j]:.0f}", ha="center", va="center", fontsize=6.5)
ax.set_xlabel("Nivel socioeconómico del colegio (ICFES)"); fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02).ax.tick_params(labelsize=6)
fig.tight_layout(); fig.savefig("informe/fig/estrato_nse.pdf")

# Fig 5: bandit
if os.path.exists(f"{O}/bandit_curvas.npz"):
    c = np.load(f"{O}/bandit_curvas.npz")
    lab = {"siempre_mat": "Siempre matemáticas", "egreedy_sin_ctx": "ε-greedy sin contexto", "egreedy_ctx": "ε-greedy contextual", "linucb": "LinUCB (α=0,5)"}
    fig, ax = plt.subplots(figsize=(W, 1.9))
    for k, l in lab.items():
        y = c["aleatoria"] - c[k]; ax.plot(np.arange(len(y)) * 2000 / 1000, y / 1000, label=l, lw=1.1)
    ax.axhline(0, color="gray", lw=0.6); ax.set_xlabel("Estudiantes atendidos (miles)"); ax.set_ylabel("Ventaja vs. azar (miles)")
    ax.legend(fontsize=6, frameon=False); ax.grid(alpha=0.3); fig.tight_layout(); fig.savefig("informe/fig/bandit.pdf")
print("figuras listas")
