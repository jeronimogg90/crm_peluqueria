#!/bin/bash
# Script para crear íconos PNG desde SVG
# Necesitas tener ImageMagick instalado: brew install imagemagick

if command -v convert &> /dev/null; then
    echo "Generando íconos..."
    convert -background none icon.svg -resize 192x192 icon-192.png
    convert -background none icon.svg -resize 512x512 icon-512.png
    echo "✅ Íconos generados: icon-192.png y icon-512.png"
else
    echo "⚠️  ImageMagick no está instalado."
    echo "Instálalo con: brew install imagemagick"
    echo "O crea los íconos manualmente con cualquier editor de imágenes"
fi
