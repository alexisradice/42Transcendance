FROM node

WORKDIR /api

COPY ./api .

RUN npm install && npm run prisma:gen && npm run build

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start:prod" ]
