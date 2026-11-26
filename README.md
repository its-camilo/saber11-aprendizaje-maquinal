# Saber 11 con aprendizaje maquinal: K-means, J48 y bandit contextual

Proyecto 3 de **Introducción a los Sistemas Inteligentes** (UNAL Bogotá, 2026-2, prof. Jonatan Gómez Perdomo).
Tres técnicas de aprendizaje maquinal sobre los resultados del examen Saber 11:

| Técnica | Paradigma | Herramienta |
|---|---|---|
| K-means (`SimpleKMeans`) sobre estudiantes y sobre colegios | No supervisado | Weka 3.8.6 |
| Árbol de decisión J48 (C4.5), clase Alto/Bajo (mediana) | Supervisado | Weka 3.8.6 |
| Bandit contextual (ε-greedy y LinUCB): qué área reforzar | Refuerzo | Python / NumPy |

## Versión vigente: Saber 11 2025 completo + cruces
- **561.049 estudiantes de colegio** (periodos 20251 y 20252, microdatos DataIcfes), 48 atributos.
- **Cruce 1:** IPM municipal censal 2018 del DANE (`data/externos/ipm_municipal_2018.xlsx`) por código DANE del municipio del colegio (99,98 % de cobertura).
- **Cruce 2:** indicadores agregados por colegio (código DANE del establecimiento), calculados sin puntajes; base de 9.692 colegios.
- Informe IEEE: [`informe/informe.pdf`](informe/informe.pdf) (5 páginas).

Resultados principales (2025):
- J48 (validación cruzada 10): **70,71 %** con 48 atributos (AUC 0,769) vs. 68,74 % con los 18 atributos de 2022 y 50,15 % de ZeroR.
- La raíz del árbol es el **nivel socioeconómico del colegio**; un estudiante de estrato 1 obtiene 237 puntos en un colegio NSE1 y 328 en uno NSE4.
- K-means de colegios (k=4): de 225,0 (rural pobre, IPM 51,6) a 310,4 puntos (privado acomodado). Los grupos de estudiantes son inestables entre semillas (ARI 0,02–0,17).
- LinUCB reduce el arrepentimiento **14,6 %** frente al azar (2022: 12,3 %) y prioriza inglés en colegios oficiales, rurales y de municipios pobres.

## Cómo reproducir (2025)
Desde la raíz del repositorio.

**Entorno necesario:** Python 3.12 con pandas, numpy, scikit-learn, matplotlib y openpyxl; Java 11+ (con Java 21 el script ya incluye `--add-opens`); Weka 3.8.6; TeX Live con `pdflatex` para recompilar el informe (el archivo `informe/IEEEtran.cls` ya viene en el repo).

**Datos (no se suben a GitHub):**
- Microdatos 2025 de DataIcfes (acceso con registro): `Examen_Saber_11_20251-04e513b9.txt` (85.678 filas, 85 columnas) y `Examen_Saber_11_20252-7e5d0882.txt` (576.213 filas, 92 columnas) en `data/2025/`, junto con el diccionario en `data/2025/diccionario_saber11.pdf`. Verificar con SHA-256: `d4f902d9a47233a7549ff8d411618bebea2626b820476c31bfa8e18efb2ee484` (20251) y `f0084bf19b9c980d90f350be5567eb83fea34118ad1db924dd9c3d9adc06b039` (20252). El `.gitignore` ya excluye `data/2025/`, `data/*.csv`, `data/*.txt` y `*.arff`: **nunca** hacer commit de los microdatos.
- Datos abiertos 2022 (Socrata, `kgxf-xxbe`, periodo 20224) en `data/p_0.csv`, `data/p_400000.csv` y `data/p_800000.csv` (1.065.888 filas en total).
- El IPM municipal del DANE 2018 ya está en `data/externos/ipm_municipal_2018.xlsx` (público).

**Orden del pipeline** (no correr 02 y 03 a la vez; 02 pide `-Xmx6g`, así que se necesitan ~6 GB libres, si no, bajar a `-Xmx4g` en `code/2025/02_weka.sh`):
```bash
python3 code/2025/01_preprocesar.py     # limpieza + cruces -> data/2025/*.arff, colegios.csv  (~1 min)
bash    code/2025/02_weka.sh            # InfoGain, ZeroR, J48, K-means (necesita ~6 GB; JAVA=/ruta/java opcional)
python3 code/2025/05_perfil_grupos.py   # perfiles de grupos, estabilidad (ARI), regresión de colegios
python3 code/2025/03_bandit.py          # bandit contextual (~9 min). No correr a la vez que Weka.
python3 code/2025/04_figuras.py         # figuras del informe
python3 code/2025/verificar_brechas.py  # verifica conteos y brechas contra los microdatos -> results/2025/brechas.csv
```

**Recompilar el informe** (IEEE, 5 páginas):
```bash
cd informe && pdflatex informe.tex && pdflatex informe.tex   # dos pasadas para las referencias
```

Requisitos: Python 3 con pandas, numpy, scikit-learn, matplotlib, openpyxl; Java 11+ (con Java 21 se usa `--add-opens`, ya incluido).

## Versión anterior: Saber 11 2022 (calendario A)
`code/*.py`, `code/02_weka.sh`, `results/` e `informe_2022/`: 530.815 estudiantes de datos abiertos (datos.gov.co `kgxf-xxbe`), 18 atributos. Ver `code/LEEME.md`.

## Estructura
```
code/            pipeline 2022        code/2025/       pipeline 2025
results/         salidas 2022         results/2025/    salidas 2025 (Weka .txt, perfiles .csv, bandit.json)
informe/         informe 2025 (LaTeX IEEEtran + PDF)   informe_2022/  informe 2022
data/externos/   IPM municipal DANE 2018 (público)
```

## Uso responsable
Son asociaciones, no causas. Variables como estrato, etnia o género se usan solo para describir brechas, no para etiquetar personas. El bandit es una simulación sobre datos fijos: reforzar un área no cambia el puntaje registrado.

Fuentes: ICFES (DataIcfes y datos.gov.co), DANE.
