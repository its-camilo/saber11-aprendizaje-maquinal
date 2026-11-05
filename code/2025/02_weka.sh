#!/bin/bash
# Técnicas 1 y 2 en Weka 3.8.6 (CLI, equivalente al Explorer) sobre Saber 11 2025 completo
# (561.049 estudiantes de colegio con los cinco puntajes). No correr a la vez que 03_bandit.py (memoria).
cd "$(dirname "$0")/../.."
JAVA=${JAVA:-java}
W="$JAVA --add-opens java.base/java.lang=ALL-UNNAMED -Xmx6g -Dfile.encoding=UTF-8 -cp weka-3-8-6/weka.jar"
C=data/2025/clasif.arff     # 48 atributos nominales + clase (atributo 49)
A=data/2025/cluster.arff    # 22 atributos de perfil + clase (atributo 23, ignorada al agrupar)
S=data/2025/colegios.arff   # 9.692 colegios: 7 indicadores + puntaje medio (atributo 8, ignorado al agrupar)
O=results/2025/weka; mkdir -p $O
BASE="1,2,16-18,21,22,26-29,37-42,45,49"   # mismas 18 variables que el análisis de 2022
SINCRUCE="1-45,49"                         # todas las variables ICFES, sin los cruces (46-48)

$W weka.attributeSelection.InfoGainAttributeEval -s "weka.attributeSelection.Ranker -N -1" -i $C > $O/infogain.txt
$W weka.classifiers.rules.ZeroR -t $C -x 10 -s 42 > $O/zeror.txt
# J48 con todas las variables (incluye cruces), validación cruzada 10, semilla 42
$W weka.classifiers.trees.J48 -t $C -x 10 -s 42 -C 0.25 -M 1000 > $O/j48_full_M1000.txt   # árbol legible (248 hojas)
$W weka.classifiers.trees.J48 -t $C -x 10 -s 42 -C 0.25 -M 100  > $O/j48_full_M100.txt
# Aporte de las variables nuevas y de los cruces (mismo J48 M=100, distintos conjuntos de atributos)
$W weka.classifiers.meta.FilteredClassifier -t $C -x 10 -s 42 -F "weka.filters.unsupervised.attribute.Remove -V -R $BASE" -W weka.classifiers.trees.J48 -- -C 0.25 -M 100 > $O/j48_base18_M100.txt
$W weka.classifiers.meta.FilteredClassifier -t $C -x 10 -s 42 -F "weka.filters.unsupervised.attribute.Remove -V -R $SINCRUCE" -W weka.classifiers.trees.J48 -- -C 0.25 -M 100 > $O/j48_sincruce_M100.txt
# Agrupación de estudiantes: K-means k=2..8 (codo), classes-to-clusters con la clase
for k in 2 3 4 5 6 7 8; do
  $W weka.clusterers.SimpleKMeans -N $k -S 42 -I 500 -t $A -c 23 > $O/kmeans_k$k.txt
done
$W weka.filters.unsupervised.attribute.AddCluster -W "weka.clusterers.SimpleKMeans -N 3 -S 42 -I 500" -I 23 -i $A -o $O/cluster_k3.arff
# Estabilidad: k=3 con otras semillas (ARI en 05_perfil_grupos.py)
for s in 1 7; do $W weka.filters.unsupervised.attribute.AddCluster -W "weka.clusterers.SimpleKMeans -N 3 -S $s -I 500" -I 23 -i $A -o $O/cluster_k3_s$s.arff; done
# Agrupación de colegios (cruce con IPM): K-means estandarizado sobre 7 indicadores, puntaje ignorado
for k in 2 3 4 5 6; do
  $W weka.clusterers.FilteredClusterer -t $S -F "weka.filters.unsupervised.attribute.Remove -R 8" -W weka.clusterers.SimpleKMeans -- -N $k -S 42 -I 500 > $O/colegios_k$k.txt
done
$W weka.filters.unsupervised.attribute.AddCluster -W "weka.clusterers.SimpleKMeans -N 4 -S 42 -I 500" -I 8 -i $S -o $O/colegios_cluster_k4.arff
echo listo
