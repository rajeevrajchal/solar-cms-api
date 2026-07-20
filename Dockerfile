FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force
RUN npm install

COPY . .

# Build phase — no DB access needed, purely compilation
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

# Runtime phase — DB migration + app start, happens on container boot
CMD npx prisma migrate deploy && node dist/main
