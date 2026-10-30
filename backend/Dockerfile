FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["sh", "-c", "for i in 1 2 3 4 5 6; do npx prisma migrate deploy && break || sleep 10; done && node prisma/seed.js && node src/index.js"]
