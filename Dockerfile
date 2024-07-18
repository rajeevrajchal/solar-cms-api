FROM node:20
WORKDIR /app
COPY package*.json ./

RUN npm cache clean --force
RUN npm install

COPY . .

RUN npx prisma migrate deploy
RUN npx prisma db:seed
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV production
CMD ["npm", "run", "start:dev", "start:migrate:prod" ]