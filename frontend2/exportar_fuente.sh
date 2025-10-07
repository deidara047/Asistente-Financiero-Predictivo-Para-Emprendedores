#!/bin/bash

# Archivo de salida
OUTPUT="codigo_fuente.txt"

# Limpiar archivo si existe
> "$OUTPUT"

# Recorrer todos los archivos excepto los que queremos ignorar
find . \
  -type f \
  ! -path "./node_modules/*" \
  ! -name "package-lock.json" \
  ! -name "$OUTPUT" \
  \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) \
  | sort \
  | while read -r file; do
    echo "$file:" >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
    echo -e "\n\n" >> "$OUTPUT"
done
