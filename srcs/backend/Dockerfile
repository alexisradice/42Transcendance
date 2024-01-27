FROM node AS builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY api/package*.json ./
COPY api/prisma ./prisma/

# Install app dependencies
RUN npm ci

COPY api/ ./

RUN npm run build
RUN npx prisma migrate reset

FROM node

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]