"""Saber 11 2025. T3 Aprendizaje por refuerzo: bandit contextual (epsilon-greedy y LinUCB).
Escenario: un tutor virtual recibe estudiantes uno a uno y elige UNA de 5 áreas para reforzar.
Contexto: perfil socioeconómico y del colegio (one-hot). Recompensa: brecha estandarizada del
estudiante en el área elegida = (media nacional - puntaje) / desviación. Solo se observa la
recompensa del área elegida (retroalimentación tipo bandit). Óptimo: el área más débil.
"""
import pandas as pd, numpy as np, json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/../..")
SEEDS = [1, 2, 3]
AREAS = ["punt_matematicas", "punt_lectura_critica", "punt_sociales_ciudadanas", "punt_c_naturales", "punt_ingles"]
NOMBRES = ["Matemáticas", "Lectura", "Sociales", "Naturales", "Inglés"]
CTX = ["estu_genero", "edad", "fami_estratovivienda", "fami_educacionmadre", "fami_educacionpadre",
       "fami_tieneinternet", "fami_tienecomputador", "fami_tieneautomovil", "fami_tienelavadora",
       "fami_personashogar", "fami_cuartoshogar", "cole_naturaleza", "cole_area_ubicacion",
       "cole_jornada", "cole_bilingue", "cole_caracter", "cole_genero",
       # nuevas en 2025 / cruces
       "fami_numlibros", "estu_horassemanatrabaja", "estu_dedicacionlecturadiaria", "nse_colegio", "ipm_mpio_nivel"]

full = pd.read_csv("data/2025/saber11_2025_limpio.csv", low_memory=False)
mu = full[AREAS].mean(); sd = full[AREAS].std()
df = full.reset_index(drop=True)   # todos los estudiantes de colegio 2025 (561.049)
R = ((mu.values - df[AREAS].values) / sd.values)          # n x 5 recompensas
X = pd.get_dummies(df[CTX].fillna("NA"), dtype=float).values
X = np.hstack([np.ones((len(X), 1)), X]).astype(np.float64)                   # sesgo
n, d = X.shape; K = len(AREAS)
print("n", n, "d", d)

def correr(politica, seed, eps=0.05, alpha=0.5):
    rng = np.random.default_rng(seed); orden = rng.permutation(n)
    Ainv = np.stack([np.eye(d) for _ in range(K)]); b = np.zeros((K, d))
    cuenta = np.zeros(K); suma = np.zeros(K)
    recomp = np.empty(n); arrep = np.empty(n); acierto = np.empty(n)
    for t, i in enumerate(orden):
        x = X[i]; r = R[i]
        if politica == "aleatoria": a = rng.integers(K)
        elif politica == "siempre_mat": a = 0
        elif politica == "egreedy_sin_ctx":
            a = rng.integers(K) if (rng.random() < eps or t < K) else int(np.argmax(suma / np.maximum(cuenta, 1)))
        else:
            theta = np.einsum("kij,kj->ki", Ainv, b)
            est = theta @ x
            if politica == "linucb":
                a = int(np.argmax(est + alpha * np.sqrt(np.einsum("i,kij,j->k", x, Ainv, x))))
            else:  # egreedy contextual
                a = rng.integers(K) if rng.random() < eps else int(np.argmax(est))
        recomp[t] = r[a]; arrep[t] = r.max() - r[a]; acierto[t] = (a == r.argmax())
        cuenta[a] += 1; suma[a] += r[a]
        if politica in ("linucb", "egreedy_ctx"):
            Ai = Ainv[a]; Ax = Ai @ x
            Ainv[a] = Ai - np.outer(Ax, Ax) / (1.0 + x @ Ax)    # Sherman-Morrison
            b[a] += r[a] * x
    theta = np.einsum("kij,kj->ki", Ainv, b) if politica in ("linucb", "egreedy_ctx") else None
    return recomp, arrep, acierto, theta

res = {}; curvas = {}; thetas = {}
for p in ["aleatoria", "siempre_mat", "egreedy_sin_ctx", "egreedy_ctx", "linucb"]:
    rs = []
    for s in SEEDS:
        rc, ar, ac, th = correr(p, s)
        rs.append((rc.mean(), ar.sum(), ac.mean())); curvas.setdefault(p, []).append(np.cumsum(ar))
        if th is not None and s == SEEDS[0]: thetas[p] = th
    rs = np.array(rs)
    res[p] = {"recompensa_media": float(rs[:, 0].mean()), "arrepentimiento_total": float(rs[:, 1].mean()),
              "arrep_std": float(rs[:, 1].std()), "acierto_area_optima": float(rs[:, 2].mean())}
    print(p, res[p])
res["oraculo"] = {"recompensa_media": float(R.max(1).mean()), "arrepentimiento_total": 0.0, "acierto_area_optima": 1.0}

# Conocimiento: qué área elige la política LinUCB aprendida (greedy) por perfil, vs. el área realmente más débil
th = thetas["linucb"]
df["elegida"] = np.array(NOMBRES)[np.argmax(X @ th.T, axis=1)]
df["optima"] = np.array(NOMBRES)[R.argmax(1)]
perfiles = {}
for g in ["fami_estratovivienda", "cole_naturaleza", "cole_area_ubicacion", "fami_tieneinternet", "cole_bilingue", "cole_jornada", "estu_genero", "ipm_mpio_nivel", "fami_numlibros", "nse_colegio"]:
    t = df.groupby(g).agg(elegida=("elegida", lambda s: s.value_counts(normalize=True).round(3).to_dict()),
                          optima=("optima", lambda s: s.value_counts(normalize=True).round(3).to_dict()), n=("elegida", "size"))
    perfiles[g] = t.to_dict(orient="index")
res["perfiles"] = perfiles
res["dist_optima_global"] = df["optima"].value_counts(normalize=True).round(3).to_dict()
res["dist_elegida_global"] = df["elegida"].value_counts(normalize=True).round(3).to_dict()
json.dump(res, open("results/2025/bandit.json", "w"), ensure_ascii=False, indent=1, default=str)
np.savez("results/2025/bandit_curvas.npz", **{k: np.mean(v, axis=0)[::2000] for k, v in curvas.items()})
print("listo")
