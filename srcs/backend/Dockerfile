FROM alpine

RUN apk add --update nodejs npm

WORKDIR /api

COPY ./api /api

RUN npm install && npm run build

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start:prod" ]
