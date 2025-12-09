# Deployment Guide

This guide covers free deployment options for the Donation API.

## 🚀 Recommended: Railway

**Best for**: Quick deployment with minimal configuration

### Why Railway?
- ✅ $5/month free credit (usually enough for small apps)
- ✅ Built-in MySQL database
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ✅ Easy environment variable management
- ✅ Automatic deployments on git push

### Setup Steps

1. **Sign up at [Railway.app](https://railway.app)** (use GitHub to sign in)

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `donation-api` repository

3. **Add MySQL Database**:
   - In your project, click "+ New"
   - Select "Database" → "Add MySQL"
   - Railway will automatically create a MySQL instance
   - Copy the `DATABASE_URL` from the database service

4. **Configure Environment Variables**:
   - Go to your service → "Variables" tab
   - Add all required environment variables:
     ```
     PORT=3000
     NODE_ENV=production
     DATABASE_URL=<from MySQL service>
     MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
     MOMO_SUBSCRIPTION_KEY=<your-key>
     MOMO_API_USER_ID=<your-user-id>
     MOMO_API_KEY=<your-api-key>
     MOMO_TARGET_ENVIRONMENT=sandbox
     MOMO_COLLECTION_CALLBACK_URL=https://your-app.railway.app/webhooks/momo/collection
     MOMO_DISBURSEMENT_CALLBACK_URL=https://your-app.railway.app/webhooks/momo/disbursement
     ALLOWED_ORIGINS=https://your-frontend-domain.com
     ```

5. **Configure Build Settings**:
   - Go to service → "Settings" → "Build"
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `/` (default)

6. **Run Database Migrations**:
   - Go to service → "Deployments" → Click on the latest deployment
   - Open "Logs" tab
   - Click "Run Command" or use Railway CLI:
     ```bash
     railway run npm run prisma:migrate:prod
     ```

7. **Your API will be live!** Railway provides a URL like `https://donation-api-production.up.railway.app`

### Railway CLI (Optional)
```bash
npm install -g @railway/cli
railway login
railway link
railway run npm run prisma:migrate:prod
```

---

## 🎨 Alternative: Render

**Best for**: Free tier with PostgreSQL option

### Why Render?
- ✅ Free tier available (may sleep after inactivity)
- ✅ Free PostgreSQL/MySQL databases
- ✅ Automatic HTTPS
- ✅ GitHub integration

### Setup Steps

1. **Sign up at [Render.com](https://render.com)** (use GitHub)

2. **Create a Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `donation-api`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Create a PostgreSQL Database** (or use MySQL):
   - Click "New +" → "PostgreSQL"
   - Name: `donation-db`
   - Plan: Free
   - Copy the "Internal Database URL"

4. **Update Prisma Schema** (if using PostgreSQL):
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from mysql
     url      = env("DATABASE_URL")
   }
   ```

5. **Add Environment Variables** in Web Service:
   ```
   PORT=3000
   NODE_ENV=production
   DATABASE_URL=<from database service>
   MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
   MOMO_SUBSCRIPTION_KEY=<your-key>
   MOMO_API_USER_ID=<your-user-id>
   MOMO_API_KEY=<your-api-key>
   MOMO_TARGET_ENVIRONMENT=sandbox
   MOMO_COLLECTION_CALLBACK_URL=https://your-app.onrender.com/webhooks/momo/collection
   MOMO_DISBURSEMENT_CALLBACK_URL=https://your-app.onrender.com/webhooks/momo/disbursement
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

6. **Run Migrations**:
   - Use Render Shell or add a one-time script:
   ```bash
   npm run prisma:migrate:prod
   ```

**Note**: Free services on Render may sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds.

---

## 🪶 Alternative: Fly.io

**Best for**: Global edge deployment

### Why Fly.io?
- ✅ Generous free tier
- ✅ Global edge deployment
- ✅ Good performance

### Setup Steps

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and login**:
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Initialize Fly.io in your project**:
   ```bash
   fly launch
   ```
   - Follow prompts to create app
   - Don't deploy yet (we'll configure first)

4. **Create `fly.toml`** (or edit the generated one):
   ```toml
   app = "donation-api"
   primary_region = "iad"  # Choose closest region

   [build]
     builder = "paketobuildpacks/builder:base"

   [http_service]
     internal_port = 3000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[services]]
     http_checks = []
     internal_port = 3000
     processes = ["app"]
     protocol = "tcp"
     script_checks = []

     [services.concurrency]
       hard_limit = 25
       soft_limit = 20
       type = "connections"

     [[services.ports]]
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443

     [[services.tcp_checks]]
       grace_period = "1s"
       interval = "15s"
       restart_limit = 0
       timeout = "2s"
   ```

5. **Create a MySQL database** (or use external like PlanetScale):
   ```bash
   fly postgres create --name donation-db
   fly postgres attach donation-db
   ```

6. **Set secrets**:
   ```bash
   fly secrets set DATABASE_URL="<from postgres>"
   fly secrets set NODE_ENV=production
   fly secrets set MOMO_BASE_URL="https://sandbox.momodeveloper.mtn.com"
   fly secrets set MOMO_SUBSCRIPTION_KEY="<your-key>"
   fly secrets set MOMO_API_USER_ID="<your-user-id>"
   fly secrets set MOMO_API_KEY="<your-api-key>"
   fly secrets set MOMO_TARGET_ENVIRONMENT=sandbox
   fly secrets set MOMO_COLLECTION_CALLBACK_URL="https://donation-api.fly.dev/webhooks/momo/collection"
   fly secrets set MOMO_DISBURSEMENT_CALLBACK_URL="https://donation-api.fly.dev/webhooks/momo/disbursement"
   ```

7. **Deploy**:
   ```bash
   fly deploy
   ```

8. **Run migrations**:
   ```bash
   fly ssh console
   npm run prisma:migrate:prod
   ```

---

## 🗄️ Database Options

### Option 1: Railway MySQL (Easiest)
- Included with Railway deployment
- No separate setup needed

### Option 2: PlanetScale (Recommended for MySQL)
- **Free tier**: 1 database, 1GB storage, 1 billion reads/month
- **Setup**:
  1. Sign up at [PlanetScale.com](https://planetscale.com)
  2. Create a database
  3. Copy connection string
  4. Use in `DATABASE_URL`

### Option 3: Supabase PostgreSQL (Free)
- **Free tier**: 500MB database, 2GB bandwidth
- **Setup**:
  1. Sign up at [Supabase.com](https://supabase.com)
  2. Create a project
  3. Get connection string from Settings → Database
  4. Update Prisma schema to use `postgresql`

### Option 4: Neon PostgreSQL (Free)
- **Free tier**: 0.5GB storage, serverless
- **Setup**: Similar to Supabase

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are documented
- [ ] `.env` file is in `.gitignore` (never commit secrets!)
- [ ] `package.json` has correct `build` and `start` scripts
- [ ] Database migrations are tested locally
- [ ] MoMo callback URLs are updated to production domain
- [ ] CORS is configured for production (set `ALLOWED_ORIGINS`)
- [ ] Error handling is production-ready
- [ ] Logging is configured appropriately

---

## 🔧 Required Environment Variables

Make sure to set these in your hosting platform:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=mysql://user:password@host:port/database

# MoMo API
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=your-subscription-key
MOMO_API_USER_ID=your-api-user-id
MOMO_API_KEY=your-api-key
MOMO_TARGET_ENVIRONMENT=sandbox

# Callbacks (update with your deployed URL)
MOMO_COLLECTION_CALLBACK_URL=https://your-app.railway.app/webhooks/momo/collection
MOMO_DISBURSEMENT_CALLBACK_URL=https://your-app.railway.app/webhooks/momo/disbursement

# CORS (optional but recommended)
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

---

## 🚨 Common Issues & Solutions

### Issue: Database connection fails
**Solution**: 
- Verify `DATABASE_URL` is correct
- Check if database allows connections from your hosting IP
- For Railway/Render, use internal database URL

### Issue: Migrations fail
**Solution**:
- Run migrations manually via CLI or shell
- Ensure Prisma client is generated: `npm run prisma:generate`

### Issue: App crashes on startup
**Solution**:
- Check logs for missing environment variables
- Verify all required env vars are set
- Check Node.js version compatibility

### Issue: MoMo callbacks not working
**Solution**:
- Update callback URLs to your production domain
- Ensure your app is publicly accessible (not behind firewall)
- Check MoMo developer portal callback configuration

---

## 📊 Comparison Table

| Platform | Free Tier | Database | Sleep Mode | Ease of Use | Best For |
|----------|-----------|----------|------------|-------------|----------|
| **Railway** | $5 credit/month | ✅ MySQL included | ❌ No | ⭐⭐⭐⭐⭐ | Quick deployment |
| **Render** | Free | ✅ PostgreSQL/MySQL | ⚠️ Yes (15min) | ⭐⭐⭐⭐ | Free tier users |
| **Fly.io** | Generous free | ✅ PostgreSQL | ❌ No | ⭐⭐⭐ | Global deployment |
| **Vercel** | Free | ❌ External only | ❌ No | ⭐⭐⭐ | Serverless (needs refactor) |

---

## 🎯 My Recommendation

**Start with Railway** because:
1. Easiest setup (5 minutes)
2. Built-in MySQL (no separate database setup)
3. No sleep mode (always available)
4. Great developer experience
5. $5/month credit is usually enough for small apps

If you need a completely free option, use **Render** (but expect cold starts) or **Fly.io** for better performance.

For production with high traffic, consider upgrading to paid plans or using **PlanetScale** (database) + **Railway** (API).

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

