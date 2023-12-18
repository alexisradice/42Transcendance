# Transcendence

First make sure you have your .env files set up correctly.

## Frontend

React app written in TypeScript, built with [Vite](https://vitejs.dev/guide/features.html).

It uses [Mantine](https://mantine.dev/overview/) for UI components and styling.

### Launch the project

```bash
./dev-start.sh front
```

then visit [http://localhost:5173/](http://localhost:5173/)

### Recommended VSCode extensions

-   **Prettier** (esbenp.prettier-vscode) formats code automatically on file save, so we have consistent code across the project (like the norm but less restrictive and automatic).
-   **CSS Variable Autocomplete** provides autocompletion for CSS variables.
-   **PostCSS Intellisense and Highlighting** enables syntax highlighting and suppress variables `($variable)` errors for Mantine.

## Backend

### Initial setup

```bash
npm install -g prisma
```

```
cd srcs/backend/api
```

```
prisma migrate dev
```

### Launch the database

```bash
docker compose up postgres -d
```

### Launch

```bash
./dev-start.sh back
```

Your endpoints are testable at [http://localhost:3000/](http://localhost:3000/)

### Recommended VSCode extensions

-   **Prettier** (esbenp.prettier-vscode) formats code automatically on file save, so we have consistent code across the project (like the norm but less restrictive and automatic).

# Production

This is pretty much only used for correction. Launch project with:

```bash
docker-compose up --build
```
