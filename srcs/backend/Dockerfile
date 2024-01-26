FROM node

WORKDIR /app

COPY api/package*.json ./
COPY api/prisma ./prisma/

RUN npm ci

COPY api/ ./

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]