#!/bin/bash

# Nomi: restart.sh
# Maqsad: docker-compose orqali konteynerni to‘liq qayta ishga tushirish

echo "🔁 Docker konteyner qayta ishga tushirilmoqda..."

# Avval konteynerni to‘xtatish (agar ishlayotgan bo‘lsa)
docker compose down

# So‘ng yangitdan build qilib, ishga tushurishdocker ps
docker compose up --build -d

echo "✅ Docker konteyner ishga tushdi!"
