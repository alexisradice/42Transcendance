FROM alpine as build

RUN apk add --update nodejs npm

WORKDIR /app

COPY ./app /app

RUN npm install && npm run build

FROM nginx

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN apt -y update \
  && apt install -y openssl \
  && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -out /etc/ssl/certs/pongo.crt \
  -keyout /etc/ssl/private/pongo.key \
  -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=pongopongo.fr/UID=lmurtin"

EXPOSE 443
