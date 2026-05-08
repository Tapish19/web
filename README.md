# Project Manager Web App

This repository contains a full-stack **Project Manager** application with:

- **Backend**: Node.js + Express + MongoDB (`web-app-main/server`)
- **Frontend**: React + Vite (`web-app-main/frontend/client`)

## Repository Structure

- `web-app-main/` – main project root
  - `server/` – Express API, routes, middleware, and Mongoose models
  - `frontend/client/` – React client application

## Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB instance (local or hosted)

## Backend Setup

```bash
cd web-app-main
npm install
```

Create a `.env` file inside `web-app-main/` and configure required variables (for example, Mongo connection URI and JWT secret).

Run backend in development mode:

```bash
npm run dev
```

Run backend in production mode:

```bash
npm start
```

## Frontend Setup

```bash
cd web-app-main/frontend/client
npm install
npm run dev
```

The Vite dev server will print the local URL (commonly `http://localhost:5173`).

## Available Scripts

### Backend (`web-app-main`)

- `npm run dev` – start server with nodemon
- `npm start` – start server with node

### Frontend (`web-app-main/frontend/client`)

- `npm run dev` – start Vite dev server
- `npm run build` – build production assets
- `npm run preview` – preview production build
- `npm run lint` – run ESLint

## Notes

- Install dependencies separately in both backend and frontend directories.
- Ensure backend environment variables are configured before starting the API.
