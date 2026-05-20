#!/bin/bash
# audit-mocks.sh
# Detecta tests con un número de mocks potencialmente excesivo en proyectos Jest.
# Se ejecuta con cwd=raíz del proyecto (cd .. desde audit/), pero escribe el
# reporte en audit/reports/.

OUTPUT="audit/reports/mock-audit.txt"
mkdir -p audit/reports

echo "=== Auditoría de mocks en tests (Jest) ===" > $OUTPUT
echo "Fecha: $(date)" >> $OUTPUT
echo "" >> $OUTPUT
echo "jest.mock / jest.fn / jest.spyOn por fichero (top 20):" >> $OUTPUT
echo "" >> $OUTPUT

grep -r "jest\.mock\|jest\.fn\|jest\.spyOn" src/ --include="*.test.*" --include="*.spec.*" -l \
  | while read file; do
      count=$(grep -c "jest\.mock\|jest\.fn\|jest\.spyOn" "$file")
      echo "$count $file"
    done \
  | sort -rn \
  | head -20 >> $OUTPUT

echo "" >> $OUTPUT
echo "Ficheros con más de 5 mocks (candidatos a refactor):" >> $OUTPUT
grep -r "jest\.mock\|jest\.fn\|jest\.spyOn" src/ --include="*.test.*" --include="*.spec.*" -l \
  | while read file; do
      count=$(grep -c "jest\.mock\|jest\.fn\|jest\.spyOn" "$file")
      if [ "$count" -gt 5 ]; then
        echo "  $count mocks → $file"
      fi
    done \
  | sort -rn >> $OUTPUT

echo "" >> $OUTPUT
echo "Tests que mockean el store de Zustand directamente (anti-patrón):" >> $OUTPUT
grep -r "jest\.mock.*store\|jest\.mock.*Store" src/ --include="*.test.*" --include="*.spec.*" -l >> $OUTPUT

cat $OUTPUT
