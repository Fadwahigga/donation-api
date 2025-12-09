# Railway Troubleshooting Guide

Quick reference for fixing common Railway deployment issues.

## 🔴 Service Crashed - Quick Fix

### Step 1: Check Logs
1. Go to Railway dashboard
2. Click your `donation-api` service
3. Click **Deployments** tab
4. Click on the **crashed deployment**
5. Click **"View Logs"** or check the logs section
6. Look for error messages (usually red)

### Step 2: Verify Environment Variables

Go to **Variables** tab and ensure these are set:

#### Required Variables:
```env
DATABASE_URL=mysql://root:pVXwnLttaypJeJGdSToPy0YyjStpriwB@centerbeam.proxy.rlwy.net:18655/railway
PORT=3000
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
```

#### MoMo API Variables (can be placeholder for now):
```env
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=your-key
MOMO_API_USER_ID=your-user-id
MOMO_API_KEY=your-api-key
MOMO_TARGET_ENVIRONMENT=sandbox
MOMO_COLLECTION_CALLBACK_URL=
MOMO_DISBURSEMENT_CALLBACK_URL=
```

### Step 3: Run Database Migrations

**Using Railway Web Interface:**

1. Go to **Deployments** tab
2. Click on any deployment
3. Click **"..."** menu → **"Run Command"**
4. Enter: `npm run prisma:migrate:prod`
5. Click **"Run"**
6. Check output - should see migration success messages

### Step 4: Restart Service

After fixing issues:
- Click **"Restart"** button on the deployment, OR
- Push a new commit to trigger redeployment

---

## Common Errors & Solutions

### Error: "Cannot connect to database"
**Solution:**
- Verify `DATABASE_URL` is correct in Variables
- Make sure MySQL service is running (status: "Online")
- Check DATABASE_URL format: `mysql://user:password@host:port/database`

### Error: "Missing required environment variable"
**Solution:**
- Go to Variables tab
- Add all required variables listed above
- Make sure no typos in variable names

### Error: "Unknown authentication plugin 'sha256_password'"
**Solution:**
- Use the proxy connection string format
- Should be: `centerbeam.proxy.rlwy.net:18655`
- NOT: `mysql-production-xxx.up.railway.app:3306`

### Error: "Prisma schema validation failed"
**Solution:**
- Run migrations: `npm run prisma:migrate:prod`
- Make sure Prisma client is generated (happens during build)

### Error: "Module not found" or build fails
**Solution:**
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Make sure `package.json` has correct build script: `"build": "prisma generate && tsc"`

---

## Quick Checklist

Before deploying, make sure:

- [ ] All environment variables are set in Railway Variables tab
- [ ] `DATABASE_URL` points to correct MySQL service
- [ ] MySQL service status is "Online"
- [ ] Build completes successfully
- [ ] Migrations have been run
- [ ] No errors in deployment logs

---

## Getting Help

If still having issues:

1. **Check Logs**: Always check deployment logs first
2. **Verify Variables**: Double-check all environment variables
3. **Test Locally**: Make sure app runs locally with same env vars
4. **Railway Docs**: https://docs.railway.app
5. **Railway Discord**: Join Railway Discord for community help

