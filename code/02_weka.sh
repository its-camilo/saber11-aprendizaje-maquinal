#!/bin/bash
# Técnicas 1 y 2 en Weka 3.8.6 por línea de comandos (equivalente al Explorer), sobre TODOS
# los estudiantes únicos de Saber 11 2022 calendario A (530.815 con puntajes completos).
cd "$(dirname "$0")/.."
W="java --add-opens java.base/java.lang=ALL-UNNAMED -Xmx6g -Dfile.encoding=UTF-8 -cp weka-3-8-6/weka.jar"
C=data/saber11_clasif_full.arff     # 18 atributos de perfil + clase desempeno
A=data/saber11_cluster_full.arff    # 17 atributos (sin departamento) + clase (ignorada al agrupar)
mkdir -p results/weka

# Relevancia de atributos: ganancia de información respecto a la clase
$W weka.attributeSelection.InfoGainAttributeEval -s "weka.attributeSelection.Ranker -N -1" -i $C > results/weka/infogain.txt

# T2 Clasificación: línea base ZeroR y J48 (validación cruzada 10 particiones, semilla 42)
$W weka.classifiers.rules.ZeroR -t $C -x 10 -s 42 > results/weka/zeror.txt
$W weka.classifiers.trees.J48 -t $C -x 10 -s 42 -C 0.25 -M 2    > results/weka/j48_M2.txt
$W weka.classifiers.trees.J48 -t $C -x 10 -s 42 -C 0.25 -M 1000 > results/weka/j48_M1000.txt

# T1 Agrupación: SimpleKMeans k=2..8 (método del codo); classes-to-clusters con la clase (atributo 18)
for k in 2 3 4 5 6 7 8; do
  $W weka.clusterers.SimpleKMeans -N $k -S 42 -I 500 -t $A -c 18 > results/weka/kmeans_k$k.txt
done
# Asignación de cada estudiante a su grupo (k=3) para perfilar los grupos en 05_perfil_grupos.py
$W weka.filters.unsupervised.attribute.AddCluster -W "weka.clusterers.SimpleKMeans -N 3 -S 42 -I 500" -I 18 -i $A -o results/weka/cluster_k3.arff
echo listo
