# Fitness Management App

A full-stack fitness management application built with React, Node.js, and Prisma.

## Deployment

### Backend (Railway)
1.  Connect your GitHub repo to **Railway**.
2.  Add a **PostgreSQL** database service.
3.  Set environment variables:
    *   `DATABASE_URL`: (Auto-populated by Railway)
    *   `JWT_SECRET`: Your secret key
    *   `NODE_ENV`: `production`
    *   `FRONTEND_URL`: Your Netlify URL (e.g. `https://your-site.netlify.app`) without trailing slash.
4.  Railway will auto-deploy using `npm start` (`node src/server.js`).

### Frontend (Netlify)
1.  Connect your GitHub repo to **Netlify**.
2.  Set **Build command**: `npm run build`
3.  Set **Publish directory**: `dist`
4.  Set Environment Variable:
    *   `VITE_API_URL`: Your Railway Backend URL (e.g. `https://your-app.railway.app`) without trailing slash.
    *   **Note**: If running locally, this defaults to `localhost:5000` via proxy, but for production, this variable is required.

## Local Development
1.  `cd backend` -> `npm install` -> `npm run dev`
2.  `cd frontend` -> `npm install` -> `npm run dev`
