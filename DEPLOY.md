# Deployment Guide

## 1. Backend Deployment (Railway)

1.  **Create a Railway Account:** Go to [railway.app](https://railway.app/) and sign up.
2.  **New Project:** Click "New Project" -> "Deploy from GitHub repo" -> Select this repository.
3.  **Add Database:**
    *   In your project view, click "New" -> "Database" -> "PostgreSQL".
    *   Railway will automatically populate `DATABASE_URL` variable.
4.  **Configure Environment Variables:**
    *   Go to the "Settings" or "Variables" tab of your Backend service.
    *   Add `JWT_SECRET`: (Generate a strong random string).
    *   `PORT`: Railway sets this automatically (usually 5000 or dynamic).
    *   `NODE_ENV`: Set to `production`.
5.  **Build Command:** Railway detects `package.json`. Ensure the start command is correct (`node src/server.js`).
    *   **Root Directory:** If your repo has backend in a subdirectory, set "Root Directory" to `backend`.
6.  **Deploy:** Railway will deploy automatically. Copy the provided URL (e.g., `https://fitness-backend-production.up.railway.app`).

## 2. Frontend Deployment (Netlify)

1.  **Create a Netlify Account:** Go to [netlify.com](https://netlify.com/).
2.  **New Site:** "Add new site" -> "Import an existing project" -> "GitHub".
3.  **Build Settings:**
    *   **Base directory:** `frontend`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
4.  **Environment Variables:**
    *   Go to "Site settings" -> "Environment variables".
    *   Add `VITE_API_URL`: Paste your Railway Backend URL (e.g., `https://fitness-backend-production.up.railway.app`).
        *   *Note: Do not add a trailing slash.*
5.  **Deploy:** Click "Deploy Site".

## 3. Important Checks
-   **Database Migration:** On the first deployment, the database will be empty.
    -   Railway allows you to run commands. You might need to run `npx prisma db push` via the Railway CLI or add it to your start script temporarily, OR enable a "Build Command" in Railway settings: `cd backend && npm install && npx prisma generate && npx prisma db push`.
-   **Seed Data:** Run the seed script manually if needed using Railway CLI: `railway run node prisma/seed.js` (locally connected to prod) or via a one-off command.

## Troubleshooting
-   **Backend Connection:** If frontend says "Network Error", check `VITE_API_URL` in Netlify and `CORS` in backend.
-   **White Screen:** Check browser console. If 404 on refresh, ensure `netlify.toml` is present.
