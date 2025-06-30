# Dockerfile ichida:
FROM node:20-alpine AS build
WORKDIR /app

# `node_modules` va `package-lock.json` ni lokalda o'chirish
# Bu Dockerning lokal host keshini ham yangilaydi
RUN rm -rf node_modules package-lock.json || true

COPY package.json package-lock.json* ./

# Dependencylarni o'rnatish. --force ni qo'shamiz, garchi tavsiya etilmasa ham, hozirgi holatda muammoni hal qilish uchun.
RUN npm install --force

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]