FROM node:18-alpine AS dependencies
WORKDIR /app
COPY src/package*.json ./
RUN npm install

FROM dependencies AS prisma-gen
COPY src/prisma ./prisma

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=prisma-gen /app/node_modules ./node_modules
COPY src/ .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start"]