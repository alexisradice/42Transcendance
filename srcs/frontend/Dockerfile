FROM node

# inject all environment vars we'll need
ARG VITE_CLIENT_ID
ARG VITE_API_URL
ARG VITE_AUTH_URL

# expose the variable to the container
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL

# build
WORKDIR /usr/src/app

COPY app/package*.json ./
RUN npm ci

COPY app/ ./

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]
