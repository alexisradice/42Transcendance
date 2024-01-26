FROM node

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY api/package*.json ./
RUN npm ci

COPY api/ ./

RUN npm run prisma:gen && npm run build

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]