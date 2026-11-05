# Proyecto 3 — Saber 11 2022 completo (530.815 estudiantes)

Orden de ejecución (desde la carpeta raíz del proyecto):
1. `python3 code/01_preprocesar.py`  → limpia los datos (datos.gov.co kgxf-xxbe, periodo 20224) y genera
   `data/saber11_clasif_full.arff` (clasificación) y `data/saber11_cluster_full.arff` (agrupación).
2. `bash code/02_weka.sh`  → Weka 3.8.6 (carpeta weka-3-8-6/): ganancia de información, ZeroR, J48 (M=2 y M=1000)
   con validación cruzada de 10 particiones, SimpleKMeans k=2..8 y asignación de grupos k=3. Necesita ~6 GB de RAM.
   Lo mismo se puede hacer en el Explorer de Weka abriendo los ARFF (para el video).
3. `python3 code/05_perfil_grupos.py`  → perfil de los 3 grupos (results/perfil_clusters_k3.csv).
4. `python3 code/03_bandit.py`  → Técnica 3: bandit contextual (aleatoria, siempre matemáticas, ε-greedy, LinUCB). ~5,5 min.
5. `python3 code/04_figuras.py`  → figuras del informe (informe/fig/).

Requisitos: Python 3 con pandas, numpy, matplotlib; Java 11+ (con Java 21 se usa --add-opens, ya incluido).
Las salidas usadas en el informe están en results/. results/muestra150k/ guarda la corrida preliminar con 150.000.
