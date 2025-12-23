#!/bin/bash

echo "🔨 Construyendo aplicación para producción..."

# 1. Build del frontend
echo "📦 Compilando frontend..."
cd frontend
npm install
npm run build

# 2. Copiar build al backend
echo "📋 Copiando archivos al backend..."
rm -rf ../backend/public/*
cp -r dist/* ../backend/public/

# 3. Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd ../backend
npm install --production

echo "✅ Build completado!"
echo ""
echo "Para probar en local:"
echo "  cd backend"
echo "  NODE_ENV=production npm start"
echo ""
echo "Luego abre: http://localhost:3000"
