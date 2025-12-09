# Step-by-Step Railway Deployment Guide

This guide will walk you through deploying your Donation API to Railway step by step.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your code pushed to a GitHub repository
- ✅ A Railway account (we'll create one)
- ✅ Your MoMo API credentials ready
- ✅ About 10-15 minutes

---

## Step 1: Push Your Code to GitHub

If your code isn't on GitHub yet:

1. **Initialize git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository**:
   - Go to [github.com](https://github.com) and create a new repository
   - Don't initialize with README (you already have one)

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/donation-api.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Sign Up for Railway

1. **Go to Railway**: Visit [railway.app](https://railway.app)

2. **Sign up**:
   - Click "Start a New Project"
   - Choose "Login with GitHub"
   - Authorize Railway to access your GitHub account

3. **You'll see the Railway dashboard** - this is where you'll manage your deployments

---

## Step 3: Create a New Project

1. **Click "New Project"** (big button in the center or top right)

2. **Select "Deploy from GitHub repo"**

3. **Authorize Railway** (if prompted) to access your GitHub repositories

4. **Select your repository**:
   - Find `donation-api` in the list
   - Click on it

5. **Railway will start deploying** - but wait! We need to configure it first.

---

## Step 4: Add MySQL Database

1. **In your Railway project**, you'll see your service (probably named `donation-api`)

2. **Click the "+ New" button** (top right or in the project view)

3. **Select "Database"** → **"Add MySQL"**

4. **Wait for MySQL to provision** (takes ~30 seconds)

5. **Click on the MySQL service** to open it

6. **Copy the connection string**:
   - Go to the "Variables" tab
   - Find `MYSQL_URL` or `DATABASE_URL`
   - Click the "Copy" button next to it
   - **Save this somewhere** - you'll need it in the next step!

   The URL will look like:
   ```
   mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
   ```

---

## Step 5: Configure Your API Service

1. **Go back to your main service** (the `donation-api` one, not MySQL)

2. **Click on the service** to open its settings

3. **Go to the "Variables" tab**

4. **Add environment variables** one by one:

   Click "New Variable" for each:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `PORT` | `3000` | Railway will override this, but set it anyway |
   | `NODE_ENV` | `production` | |
   | `DATABASE_URL` | `[paste the MySQL URL from Step 4]` | **Important!** |
   | `MOMO_BASE_URL` | `https://sandbox.momodeveloper.mtn.com` | Or production URL |
   | `MOMO_SUBSCRIPTION_KEY` | `[your subscription key]` | From MoMo portal |
   | `MOMO_API_USER_ID` | `[your API user ID]` | From MoMo portal |
   | `MOMO_API_KEY` | `[your API key]` | From MoMo portal |
   | `MOMO_TARGET_ENVIRONMENT` | `sandbox` | Or your production env |
   | `MOMO_COLLECTION_CALLBACK_URL` | `[leave empty for now]` | We'll update this later |
   | `MOMO_DISBURSEMENT_CALLBACK_URL` | `[leave empty for now]` | We'll update this later |

5. **For the callback URLs**, we'll update them after we get the Railway URL

---

## Step 6: Configure Build Settings

1. **Still in your service**, go to the **"Settings" tab**

2. **Scroll down to "Build" section**

3. **Verify these settings**:
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Start Command**: `npm start` (should be auto-detected)
   - **Root Directory**: `/` (default)

4. **If anything is wrong**, update it and click "Save"

---

## Step 7: Get Your Railway URL

1. **Go to the "Settings" tab** of your service

2. **Scroll to "Domains" section**

3. **You'll see a default domain** like:
   ```
   donation-api-production.up.railway.app
   ```

4. **Copy this URL** - this is your API's public URL!

5. **Update the callback URLs**:
   - Go back to "Variables" tab
   - Update `MOMO_COLLECTION_CALLBACK_URL` to:
     ```
     https://donation-api-production.up.railway.app/webhooks/momo/collection
     ```
   - Update `MOMO_DISBURSEMENT_CALLBACK_URL` to:
     ```
     https://donation-api-production.up.railway.app/webhooks/momo/disbursement
     ```
   - **Note**: Replace `donation-api-production.up.railway.app` with your actual domain

---

## Step 8: Run Database Migrations

1. **Go to your service** → **"Deployments" tab**

2. **Wait for the deployment to complete** (green checkmark)

3. **Click on the deployment** to open it

4. **Click "View Logs"** to see the build output

5. **Run migrations using Railway CLI** (recommended):

   **Option A: Using Railway CLI** (Easiest)
   
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Link to your project (run this in your project directory)
   cd /path/to/donation-api
   railway link
   
   # Run migrations
   railway run npm run prisma:migrate:prod
   ```

   **Option B: Using Railway Web Interface**
   
   - Go to your service → "Deployments"
   - Click on the latest deployment
   - Click "..." menu → "Run Command"
   - Enter: `npm run prisma:migrate:prod`
   - Click "Run"

6. **Verify migrations ran successfully** - you should see:
   ```
   ✅ Database migrations completed
   ```

---

## Step 9: Test Your Deployment

1. **Get your Railway URL** from Step 7

2. **Test the health endpoint**:
   ```bash
   curl https://your-app.railway.app/api/v1/health
   ```

   Or open in browser:
   ```
   https://your-app.railway.app/
   ```

3. **You should see**:
   ```json
   {
     "success": true,
     "message": "Welcome to Donation API",
     "version": "1.0.0"
   }
   ```

4. **Test creating a cause**:
   ```bash
   curl -X POST https://your-app.railway.app/api/v1/causes \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Cause",
       "description": "Testing deployment",
       "ownerPhone": "+237670000001"
     }'
   ```

---

## Step 10: Set Up Custom Domain (Optional)

If you want a custom domain:

1. **Go to service** → **"Settings"** → **"Domains"**

2. **Click "Custom Domain"**

3. **Enter your domain** (e.g., `api.yourdomain.com`)

4. **Add DNS records** as instructed:
   - Add a CNAME record pointing to Railway's domain

5. **Wait for SSL certificate** (automatic, takes a few minutes)

---

## 🎉 You're Done!

Your API is now live on Railway! 

### Quick Reference

- **API URL**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/api/v1/health`
- **API Base**: `https://your-app.railway.app/api/v1`

### Next Steps

1. **Update MoMo callbacks** in the MoMo Developer Portal to use your Railway URL
2. **Test all endpoints** to ensure everything works
3. **Set up monitoring** (Railway provides basic logs)
4. **Configure CORS** if you have a frontend (update `ALLOWED_ORIGINS`)

---

## 🔧 Troubleshooting

### Issue: Build fails

**Check logs**:
- Go to service → Deployments → Click deployment → View Logs
- Look for error messages

**Common fixes**:
- Ensure `package.json` has correct build script
- Check that all dependencies are in `dependencies` (not `devDependencies`)

### Issue: Database connection fails

**Check**:
1. `DATABASE_URL` is set correctly in Variables
2. You're using the MySQL service's `DATABASE_URL` (not external)
3. Migrations have been run

**Fix**:
- Copy the `DATABASE_URL` from MySQL service again
- Re-run migrations

### Issue: App crashes on startup

**Check logs** for:
- Missing environment variables
- Database connection errors
- Port conflicts

**Fix**:
- Verify all required env vars are set
- Check that `PORT` is set (Railway will provide it automatically)

### Issue: 404 errors

**Check**:
- You're using the correct base URL: `/api/v1/...`
- Routes are properly configured

### Issue: Migrations fail

**Fix**:
```bash
# Try running migrations again
railway run npm run prisma:migrate:prod

# Or generate Prisma client first
railway run npm run prisma:generate
railway run npm run prisma:migrate:prod
```

---

## 📊 Monitoring Your App

1. **View Logs**:
   - Service → Deployments → Click deployment → View Logs
   - Or use Railway CLI: `railway logs`

2. **View Metrics**:
   - Service → Metrics tab
   - See CPU, Memory, Network usage

3. **View Database**:
   - MySQL service → Data tab
   - Or use Prisma Studio: `railway run npm run prisma:studio`

---

## 💰 Railway Pricing

- **Free tier**: $5/month credit
- **Hobby plan**: $5/month (if you exceed free credit)
- **Pro plan**: $20/month (for production apps)

For small apps, the free $5 credit is usually enough!

---

## 🔄 Updating Your Deployment

Every time you push to GitHub:

1. **Railway automatically detects the push**
2. **Starts a new deployment**
3. **Builds and deploys your app**
4. **Your app updates automatically!**

No manual steps needed - just `git push`!

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) (for help)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

## ✅ Deployment Checklist

Before considering deployment complete:

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] MySQL database added
- [ ] All environment variables set
- [ ] Database migrations run successfully
- [ ] Health endpoint responds
- [ ] Can create a cause via API
- [ ] MoMo callback URLs updated
- [ ] Custom domain configured (if needed)
- [ ] CORS configured for frontend (if needed)

---

**Need help?** Check Railway's logs or join their Discord community!

