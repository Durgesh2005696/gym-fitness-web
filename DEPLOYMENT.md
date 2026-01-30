# 🚀 FIT WITH DY - Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION SETUP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐         ┌──────────────┐                     │
│   │   FRONTEND   │         │   BACKEND    │                     │
│   │  Cloudflare  │ ──API──▶│    Render    │                     │
│   │    Pages     │         │  Web Service │                     │
│   └──────────────┘         └──────┬───────┘                     │
│          │                        │                              │
│          │                        ▼                              │
│          │                 ┌──────────────┐                     │
│          │                 │   DATABASE   │                     │
│          │                 │   Render     │                     │
│          │                 │  PostgreSQL  │                     │
│          │                 └──────────────┘                     │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │    GitHub    │◀── Source Code Repository                    │
│   │  Repository  │                                              │
│   └──────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### ✅ Code Preparation
- [x] Code pushed to GitHub
- [x] Environment variables documented
- [x] .gitignore configured properly
- [ ] Production build tested locally

### ✅ Accounts Needed
- [ ] GitHub account (you have this)
- [ ] Render account (free tier available)
- [ ] Cloudflare account (free tier available)

---

## PHASE 1: Database Setup (Render PostgreSQL)

### Step 1.1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub for easy integration

### Step 1.2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   ```
   Name: fitwithdy-db
   Database: fitwithdy
   User: fitwithdy_user
   Region: Singapore (or closest to you)
   Plan: Free (90 days) or Starter ($7/month)
   ```
3. Click **"Create Database"**
4. Wait for provisioning (1-2 minutes)
5. Copy the **Internal Database URL** (for backend)

### Step 1.3: Save Database Credentials
```env
DATABASE_URL=postgresql://fitwithdy_user:PASSWORD@HOST:5432/fitwithdy
```

---

## PHASE 2: Backend Deployment (Render Web Service)

### Step 2.1: Prepare Backend for Production

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: fitwithdy-api
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npx prisma generate && npx prisma db push
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: fitwithdy-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
```

### Step 2.2: Update package.json (backend)
Ensure these scripts exist in `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npx prisma generate"
  }
}
```

### Step 2.3: Add Health Check Endpoint
Add to `backend/src/server.js`:
```javascript
// Health check for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Step 2.4: Create Render Web Service
1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   ```
   Name: fitwithdy-api
   Root Directory: backend
   Environment: Node
   Region: Singapore
   Branch: main
   Build Command: npm install && npx prisma generate && npx prisma db push
   Start Command: npm start
   Plan: Free
   ```

### Step 2.5: Set Environment Variables
In Render dashboard, add these env vars:
```
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL Internal URL]
JWT_SECRET=[Generate a strong random string]
FRONTEND_URL=https://fitwithdy.pages.dev
PORT=10000
```

### Step 2.6: Deploy
1. Click **"Create Web Service"**
2. Wait for build and deployment (5-10 minutes)
3. Note your backend URL: `https://fitwithdy-api.onrender.com`

---

## PHASE 3: Frontend Deployment (Cloudflare Pages)

### Step 3.1: Update Frontend for Production

Create `frontend/.env.production`:
```env
VITE_API_URL=https://fitwithdy-api.onrender.com
```

### Step 3.2: Update vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### Step 3.3: Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for free account
3. Go to **Pages** section

### Step 3.4: Connect to GitHub
1. Click **"Create a project"**
2. Click **"Connect to Git"**
3. Authorize Cloudflare to access GitHub
4. Select `gym-fitness-web` repository

### Step 3.5: Configure Build Settings
```
Project name: fitwithdy
Production branch: main
Framework preset: Vite
Root directory: frontend
Build command: npm run build
Build output directory: dist
```

### Step 3.6: Set Environment Variables
Click **"Environment variables"** and add:
```
VITE_API_URL = https://fitwithdy-api.onrender.com
```

### Step 3.7: Deploy
1. Click **"Save and Deploy"**
2. Wait for build (2-5 minutes)
3. Your site will be live at: `https://fitwithdy.pages.dev`

---

## PHASE 4: Post-Deployment Configuration

### Step 4.1: Update Backend CORS
Update `backend/src/server.js` to allow Cloudflare domain:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fitwithdy.pages.dev',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

### Step 4.2: Update Render Environment
Add to Render env vars:
```
FRONTEND_URL=https://fitwithdy.pages.dev
```

### Step 4.3: Seed Production Database
Run in Render Shell (Dashboard → Shell):
```bash
npx prisma db seed
node prisma/seedFoods.js
node prisma/seedExercises.js
node prisma/seedSupplements.js
```

---

## PHASE 5: Custom Domain (Optional)

### For Cloudflare Pages:
1. Go to your project → **Custom domains**
2. Add domain: `app.fitwithdy.com`
3. Update DNS records as instructed

### For Render:
1. Go to your web service → **Settings** → **Custom Domains**
2. Add domain: `api.fitwithdy.com`
3. Update DNS records

---

## 📊 Environment Variables Summary

### Backend (Render)
| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection |
| `JWT_SECRET` | `[random-string]` | JWT signing key |
| `FRONTEND_URL` | `https://fitwithdy.pages.dev` | CORS allowed origin |
| `PORT` | `10000` | Server port |

### Frontend (Cloudflare)
| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://fitwithdy-api.onrender.com` | Backend API URL |

---

## 🔄 CI/CD Pipeline

Both platforms auto-deploy on push to `main` branch:

```
┌──────────┐     ┌──────────┐     ┌──────────────────┐
│  Local   │────▶│  GitHub  │────▶│  Auto-Deploy     │
│  Code    │push │   main   │     │  • Render        │
│          │     │  branch  │     │  • Cloudflare    │
└──────────┘     └──────────┘     └──────────────────┘
```

---

## 🧪 Post-Deployment Testing

### Test Checklist:
- [ ] Frontend loads at Cloudflare URL
- [ ] API health check: `https://fitwithdy-api.onrender.com/api/health`
- [ ] User registration works
- [ ] Login works for Admin/Trainer/Client
- [ ] Image uploads work
- [ ] Payment flow works
- [ ] All CRUD operations work

### Test Commands:
```bash
# Test backend health
curl https://fitwithdy-api.onrender.com/api/health

# Test login
curl -X POST https://fitwithdy-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitwithdy.com","password":"admin123"}'
```

---

## 💰 Pricing Summary

### Free Tier:
| Service | Plan | Limitations |
|---------|------|-------------|
| Render PostgreSQL | Free | 90 days, 1GB storage |
| Render Web Service | Free | Sleeps after 15min inactivity |
| Cloudflare Pages | Free | Unlimited sites, 500 builds/month |

### Recommended Production:
| Service | Plan | Cost |
|---------|------|------|
| Render PostgreSQL | Starter | $7/month |
| Render Web Service | Starter | $7/month |
| Cloudflare Pages | Free | $0/month |
| **Total** | | **~$14/month** |

---

## 🚨 Troubleshooting

### Backend not starting:
1. Check Render logs for errors
2. Verify DATABASE_URL is correct
3. Ensure Prisma migrations ran

### Frontend API errors:
1. Check VITE_API_URL is set correctly
2. Verify CORS is configured for Cloudflare domain
3. Check browser console for errors

### Database connection issues:
1. Use Internal URL (not External) for Render services
2. Check PostgreSQL status in Render dashboard

### Images not uploading:
1. Configure cloud storage (Cloudinary/S3) for production
2. Local uploads won't persist on Render free tier

---

## 📁 File Changes Required

The following files should be updated before deployment:

1. `backend/src/server.js` - Add health check, update CORS
2. `frontend/.env.production` - Add production API URL
3. `backend/package.json` - Ensure start script exists

---

## 🎯 Quick Start Commands

```bash
# Test production build locally
cd frontend && npm run build && npm run preview

# Push to deploy
git add -A
git commit -m "chore: production deployment config"
git push origin main
```

---

**Created:** January 30, 2026  
**Repository:** https://github.com/Durgesh2005696/gym-fitness-web
