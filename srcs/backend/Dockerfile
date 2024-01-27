FROM node

WORKDIR /app

COPY api/ .

RUN npm install --silent

EXPOSE 3000

CMD [ "npm", "run", "start:docker" ]