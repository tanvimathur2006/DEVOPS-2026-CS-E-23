# Student Management System frontend

The frontend is a React application built with Vite.

## Configuration

- `VITE_API_BASE_URL` sets the API base URL. It defaults to `/api`, which works with the included Docker Compose and Nginx reverse proxy configuration.
- For a separately hosted frontend, set `VITE_API_BASE_URL` to the deployed backend API base URL (for example, `https://api.example.com/api`) in the frontend build environment.
- `API_PROXY_TARGET` controls the Vite development proxy target and defaults to `http://localhost:5000`.

Copy `.env.example` to `.env.local` for local overrides. Vite variables are embedded in the browser bundle, so do not put secrets in `VITE_*` variables.

## Local development

From this directory, install dependencies and start the dev server:

```sh
npm ci
npm run dev
```

## Production build

```sh
npm ci
npm run build
```

The Docker image builds the static frontend and serves it with Nginx. When deploying with Docker Compose, run `docker compose up --build`; the frontend Nginx routes `/api/` requests to the `backend` service.
