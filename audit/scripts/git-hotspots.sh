#!/bin/bash
# git-hotspots.sh
# Identifica los ficheros que más han cambiado en los últimos N commits.
# Se ejecuta con cwd=raíz del proyecto (cd .. desde audit/), pero escribe
# el reporte en audit/reports/.
# Uso: bash audit/scripts/git-hotspots.sh [num_commits] [directorio]

COMMITS=${1:-200}
DIR=${2:-src/}
OUTPUT="audit/reports/git-hotspots.txt"

mkdir -p audit/reports

echo "=== Git Hotspots — últimos $COMMITS commits en $DIR ===" > $OUTPUT
echo "Fecha: $(date)" >> $OUTPUT
echo "" >> $OUTPUT
echo "Cambios  Fichero" >> $OUTPUT
echo "-------  -------" >> $OUTPUT

git log --oneline -n $COMMITS -- $DIR \
  | awk '{print $1}' \
  | xargs -I{} git diff-tree --no-commit-id -r --name-only {} \
  | grep -E '\.(ts|tsx)$' \
  | grep -v '\.test\.' \
  | grep -v '\.spec\.' \
  | sort \
  | uniq -c \
  | sort -rn \
  | head -30 >> $OUTPUT

echo "" >> $OUTPUT
echo "=== Ficheros con más de 5 autores distintos ===" >> $OUTPUT
git log --oneline -n $COMMITS -- $DIR \
  | awk '{print $1}' \
  | xargs -I{} git show --format="%H %ae" --name-only {} \
  | grep -E '\.(ts|tsx)$' \
  | awk '{print $2, $1}' \
  | sort -u \
  | awk '{print $1}' \
  | sort \
  | uniq -c \
  | awk '$1 > 5' \
  | sort -rn >> $OUTPUT

cat $OUTPUT
