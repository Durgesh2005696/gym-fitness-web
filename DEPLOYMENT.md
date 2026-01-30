# 🚀 FIT WITH DY - Deployment Guide
## Using GitHub + Supabase + Render + Cloudflare

---

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
│          │                 │   Supabase   │                     │
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

### ✅ Accounts Needed (All Free Tier Available)
- [ ] GitHub account ✓ (you have this)
- [ ] Supabase account (free tier: 500MB database)
- [ ] Render account (free tier: web service)
- [ ] Cloudflare account (free tier: unlimited pages)

---

## PHASE 1: Database Setup (Supabase PostgreSQL)

### Step 1.1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub for easy integration

### Step 1.2: Create New Project
1. Click **"New Project"**
2. Configure:
   ```
   Organization: [Your organization or create new]
   Project name: fitwithdy
   Database Password: [Generate strong password - SAVE THIS!]
   Region: South Asia (Mumbai) or closest to you
   Plan: Free
   ```
3. Click **"Create new project"**
4. Wait for provisioning (1-2 minutes)

### Step 1.3: Get Database Connection String
1. Go to **Project Settings** (gear icon)
2. Click **"Database"** in sidebar
3. Scroll to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 1.4: Configure for Prisma
For Prisma, use the **Transaction pooler** URL (port 6543) with `?pgbouncer=true`:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For migrations, use Direct connection (port 5432):
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

### Step 1.5: Save Credentials Safely
Create a secure note with:
- Project URL
- Database Password
- Connection String (pooler)
- Direct Connection String

---

## PHASE 2: Update Prisma for Supabase

### Step 2.1: Update Prisma Schema
Update `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ... rest of your models
```

### Step 2.2: Update Local .env
Create/update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Step 2.3: Push Schema to Supabase
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Step 2.4: Seed the Database
```bash
npm run seed
node prisma/seedFoods.js
node prisma/seedExercises.js
node prisma/seedSupplements.js
```

### Step 2.5: Verify in Supabase Dashboard
1. Go to Supabase Dashboard
2. Click **"Table Editor"**
3. You should see all your tables: User, Food, Exercise, Supplement, etc.

---

## PHASE 3: Backend Deployment (Render)

### Step 3.1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3.2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `gym-fitness-web`
3. Configure:
   ```
   Name: fitwithdy-api
   Root Directory: backend
   Environment: Node
   Region: Singapore (or closest to your Supabase region)
   Branch: main
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   Plan: Free
   ```

### Step 3.3: Set Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `[generate-random-64-char-string]` |
| `FRONTEND_URL` | `https://fitwithdy.pages.dev` |
| `PORT` | `10000` |

### Step 3.4: Deploy
1. Click **"Create Web Service"**
2. Wait for build and deployment (5-10 minutes)
3. Your backend URL: `https://fitwithdy-api.onrender.com`

### Step 3.5: Test Health Check
```bash
curl https://fitwithdy-api.onrender.com/api/health
```

---

## PHASE 4: Frontend Deployment (Cloudflare Pages)

### Step 4.1: Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for free account
3. Navigate to **Workers & Pages** → **Pages**

### Step 4.2: Connect to GitHub
1. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
2. Authorize Cloudflare to access GitHub
3. Select `gym-fitness-web` repository

### Step 4.3: Configure Build Settings
```
Project name: fitwithdy
Production branch: main
Framework preset: Vite
Root directory: frontend
Build command: npm run build
Build output directory: dist
```

### Step 4.4: Set Environment Variables
Click **"Environment variables"** → **"Add variable"**:
```
Variable name: VITE_API_URL
Value: https://fitwithdy-api.onrender.com
```

### Step 4.5: Deploy
1. Click **"Save and Deploy"**
2. Wait for build (2-5 minutes)
3. Your site: `https://fitwithdy.pages.dev`

---

## PHASE 5: Image Storage (Supabase Storage)

For production, use Supabase Storage instead of local uploads.

### Step 5.1: Enable Storage in Supabase
1. Go to Supabase Dashboard → **Storage**
2. Click **"Create a new bucket"**
3. Configure:
   ```
   Name: uploads
   Public: Yes (for profile pictures)
   ```

### Step 5.2: Get Storage URL
Your storage URL will be:
```
https://[PROJECT-REF].supabase.co/storage/v1/object/public/uploads/
```

### Step 5.3: Install Supabase Client (Optional Enhancement)
```bash
cd backend
npm install @supabase/supabase-js
```

> Note: For MVP, you can continue using local uploads. Files will reset on Render free tier restarts.

---

## 📊 Environment Variables Summary

### Backend (Render)
| Variable | Example Value |
|----------|---------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pwd]@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[pwd]@...pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `your-super-secret-key-minimum-32-chars` |
| `FRONTEND_URL` | `https://fitwithdy.pages.dev` |
| `PORT` | `10000` |

### Frontend (Cloudflare)
| Variable | Example Value |
|----------|---------------|
| `VITE_API_URL` | `https://fitwithdy-api.onrender.com` |

---

## 💰 Pricing Summary (All Free Tier)

| Service | Free Tier Includes |
|---------|-------------------|
| **Supabase** | 500MB database, 1GB file storage, 50,000 monthly active users |
| **Render** | 750 hours/month, auto-sleeps after 15min inactivity |
| **Cloudflare Pages** | Unlimited sites, 500 builds/month, unlimited bandwidth |
| **GitHub** | Unlimited public repos |

### Total Cost: **$0/month** 🎉

### Recommended Production Upgrade:
| Service | Plan | Cost |
|---------|------|------|
| Supabase | Pro | $25/month |
| Render | Starter | $7/month |
| Cloudflare | Free | $0/month |
| **Total** | | **~$32/month** |

---

## 🔄 CI/CD Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────────────┐
│  Local   │────▶│  GitHub  │────▶│  Auto-Deploy     │
│  Code    │push │   main   │     │  • Render        │
│          │     │  branch  │     │  • Cloudflare    │
└──────────┘     └──────────┘     └──────────────────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │   Supabase   │
                                   │  (Database)  │
                                   └──────────────┘
```

---

## 🧪 Post-Deployment Testing

### Quick Tests:
```bash
# 1. Test API health
curl https://fitwithdy-api.onrender.com/api/health

# 2. Test frontend loads
# Open: https://fitwithdy.pages.dev

# 3. Test login (after seeding)
curl -X POST https://fitwithdy-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitwithdy.com","password":"admin123"}'
```

### Checklist:
- [ ] Frontend loads correctly
- [ ] API health check responds
- [ ] Admin login works
- [ ] Trainer login works
- [ ] Client login works
- [ ] Food Library loads
- [ ] Workout Library loads
- [ ] Supplement Library loads
- [ ] Image uploads work

---

## 🚨 Troubleshooting

### "Database connection failed"
1. Check DATABASE_URL format includes `?pgbouncer=true`
2. Verify password doesn't have special chars that need encoding
3. Ensure Supabase project is active (not paused)

### "CORS error"
1. Verify FRONTEND_URL in Render matches your Cloudflare URL
2. Check for trailing slashes

### "Prisma generate failed"
1. Ensure both DATABASE_URL and DIRECT_URL are set
2. Run `npx prisma generate` before `prisma db push`

### "Tables not found in Supabase"
1. Run `npx prisma db push` from local with correct .env
2. Don't use Supabase's SQL editor to create tables (use Prisma)

### "Render service sleeping"
- Free tier sleeps after 15min. First request takes ~30s to wake up.
- Upgrade to Starter plan ($7/mo) to prevent sleeping.

---

## 📁 Quick Reference

### URLs (After Deployment)
| Service | URL |
|---------|-----|
| Frontend | `https://fitwithdy.pages.dev` |
| Backend API | `https://fitwithdy-api.onrender.com` |
| Supabase Dashboard | `https://supabase.com/dashboard` |
| GitHub Repo | `https://github.com/Durgesh2005696/gym-fitness-web` |

### Default Credentials (After Seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fitwithdy.com` | `admin123` |
| Trainer | `trainer@fitwithdy.com` | `trainer123` |
| Client | `client@fitwithdy.com` | `client123` |

---

## 🎯 Quick Start Commands

```bash
# Update Prisma for Supabase
cd backend
npx prisma generate
npx prisma db push

# Seed database
npm run seed
node prisma/seedFoods.js
node prisma/seedExercises.js
node prisma/seedSupplements.js

# Test production build
cd ../frontend
npm run build
npm run preview

# Push and deploy
cd ..
git add -A
git commit -m "chore: production deployment"
git push origin main
```

---

**Created:** January 30, 2026  
**Stack:** Supabase + Render + Cloudflare Pages  
**Repository:** https://github.com/Durgesh2005696/gym-fitness-web
