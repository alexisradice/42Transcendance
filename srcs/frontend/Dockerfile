FROM node

WORKDIR /app

COPY app/ .
RUN npm install --silent && npm run build && chmod 775 ./src/docker/init.sh

EXPOSE 8080

CMD ["./src/docker/init.sh"]
