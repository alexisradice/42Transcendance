# Transcendence

-   Make sure you have your .env files set up correctly.

-   Install [Volta](https://docs.volta.sh/guide/getting-started)

```bash
curl https://get.volta.sh | bash
```

Volta is a node version manager. When installing it, it will automatically install the correct node version for the project.

Note: If you already had `node_modules` installed in either `srcs/backend/api` or `srcs/frontend/app`, you might need to delete those folders and restart your terminal(s).

## Frontend

React app written in TypeScript, built with [Vite](https://vitejs.dev/guide/features.html).

It uses [Mantine](https://mantine.dev/overview/) for UI components and styling, [SWR](https://swr.vercel.app/) for basic data fetching, [Axios](https://axios-http.com/) for general API calls, and [React Router](https://reactrouter.com/en/main/start/tutorial) for routing.

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

### Launch the database

```bash
docker compose up postgres -d
```

### Initial setup

```
cd srcs/backend/api && npm install -g prisma && prisma generate && prisma migrate dev
```

### Launch

```bash
./dev-start.sh back
```

Your endpoints are testable at [http://localhost:3000/](http://localhost:3000/)

### Recommended VSCode extensions

-   **Prettier** (esbenp.prettier-vscode) formats code automatically on file save, so we have consistent code across the project (like the norm but less restrictive and automatic).
-   **Prisma** (Prisma.prisma) for syntax highlighting and autocompletion in Prisma files.

<!-- # Production

This is pretty much only used for correction. Launch project with:

```bash
docker-compose up --build
``` -->
