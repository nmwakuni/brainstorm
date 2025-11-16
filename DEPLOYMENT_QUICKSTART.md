# ⚡ Production Deployment Quick Start

**Goal**: Get from zero to production in 2 days

---

## ✅ Pre-Deployment Checklist

Before you deploy, make sure you have:

- [ ] Safaricom M-Pesa developer account ([developer.safaricom.co.ke](https://developer.safaricom.co.ke))
- [ ] M-Pesa sandbox credentials (for testing)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (Let's Encrypt is free)
- [ ] Railway/Render account (for API + DB)
- [ ] Vercel account (for Web)
- [ ] Google/Apple Developer account (for Mobile - can wait)

---

## 🚀 Day 1: Backend Deployment

### Option A: Railway (Recommended)

**Why Railway**: Easiest, built-in PostgreSQL, auto-deploys from GitHub

#### Step 1: Create Railway Account
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
```

#### Step 2: Create New Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select `nmwakuni/brainstorm` repo
6. Choose `claude/brainstorm-saas-ideas-kenya-01ELC4Mrwu7HXoCws3yfzfjX` branch

#### Step 3: Add PostgreSQL
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway auto-generates `DATABASE_URL`

#### Step 4: Configure Environment Variables

Click "Variables" in Railway, add these:

```env
# Database (auto-filled by Railway)
DATABASE_URL=postgresql://...

# JWT Secret (generate new one)
JWT_SECRET=<run: openssl rand -base64 64>

# M-Pesa (use sandbox first)
MPESA_ENABLED=true
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=<from developer.safaricom.co.ke>
MPESA_CONSUMER_SECRET=<from developer.safaricom.co.ke>
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=<from sandbox>
MPESA_INITIATOR_NAME=testapi
MPESA_INITIATOR_PASSWORD=Safaricom999!*!

# Callback URL (use Railway URL)
MPESA_CALLBACK_URL=https://your-app.up.railway.app/api/mpesa/callback

# Node environment
NODE_ENV=production
PORT=3000
```

#### Step 5: Deploy
1. Railway auto-deploys on every push
2. Or click "Deploy" manually
3. Wait 2-3 minutes
4. Your API is live at: `https://your-app.up.railway.app`

#### Step 6: Run Migrations
```bash
# Connect to Railway
railway link

# Run migrations
railway run pnpm db:migrate

# Verify database
railway run pnpm db:studio
```

#### Step 7: Test API
```bash
curl https://your-app.up.railway.app/health
# Should return: {"status":"ok"}
```

---

### Option B: Render

**Why Render**: Free tier available, simple deploys

#### Quick Deploy
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Name**: salary-advance-api
   - **Branch**: claude/brainstorm-saas-ideas-kenya-01ELC4Mrwu7HXoCws3yfzfjX
   - **Root Directory**: apps/api
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: Node
5. Add PostgreSQL database (New → PostgreSQL)
6. Add environment variables (same as Railway)
7. Deploy!

---

## 🌐 Day 1: Web Deployment

### Vercel (Recommended)

**Why Vercel**: Built for Next.js, auto-SSL, global CDN

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### Step 2: Deploy
```bash
cd apps/web

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name? salary-advance-web
# - Directory? ./
# - Override settings? No
```

#### Step 3: Set Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
```env
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
NODE_ENV=production
```

#### Step 4: Redeploy
```bash
vercel --prod
```

Your web app is live at: `https://salary-advance-web.vercel.app`

#### Step 5: Custom Domain (Optional)
1. In Vercel dashboard → Domains
2. Add your domain (e.g., `app.salaryadvance.co.ke`)
3. Update DNS records (Vercel gives you instructions)
4. SSL auto-configured

---

## 📱 Day 2: Mobile App (Beta)

### Expo Go (For Testing)

**No build needed!** Just test with Expo Go app:

```bash
cd apps/mobile

# Update API URL
# Edit .env or app.config.js
EXPO_PUBLIC_API_URL=https://your-api.up.railway.app

# Start
pnpm start

# Share QR code with beta testers
# They scan with Expo Go app
```

### Production Build (When Ready)

#### iOS (TestFlight)
```bash
# Requires Apple Developer account ($99/year)

# 1. Configure
eas build:configure

# 2. Build
eas build --platform ios

# 3. Submit to TestFlight
eas submit --platform ios
```

#### Android (Google Play)
```bash
# 1. Build APK
eas build --platform android

# 2. Download and test
eas build:list

# 3. Submit to Play Store
eas submit --platform android
```

---

## 🔒 Day 2: M-Pesa Production Setup

### Switch from Sandbox to Production

#### Step 1: Apply for Production API Access
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Navigate to "Production APIs"
3. Apply for:
   - M-Pesa B2C (Business to Customer)
   - Lipa Na M-Pesa Online (STK Push)
4. Provide:
   - Business registration documents
   - KRA PIN
   - ID copies
   - Business case

**Timeline**: 2-7 days approval

#### Step 2: Get Production Credentials
Once approved, you'll receive:
- Consumer Key
- Consumer Secret
- Passkey
- Business Short Code (your till number)

#### Step 3: Update Environment Variables
In Railway/Render:
```env
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=<production key>
MPESA_CONSUMER_SECRET=<production secret>
MPESA_BUSINESS_SHORT_CODE=<your shortcode>
MPESA_PASSKEY=<production passkey>
```

#### Step 4: Test with Small Transaction
```bash
# Request KES 10 advance
# Verify it hits your M-Pesa account
# Check webhook callback
```

---

## 🎯 Post-Deployment Checklist

### Verify Everything Works

#### API Health
```bash
curl https://your-api.up.railway.app/health
# Expected: {"status":"ok"}
```

#### Database Connection
```bash
railway run pnpm db:studio
# Opens Drizzle Studio, verify tables exist
```

#### M-Pesa Integration
1. Register a test employee
2. Request small advance (KES 10)
3. Verify M-Pesa STK Push received
4. Enter PIN on phone
5. Check money received
6. Verify webhook logged in database

#### Web Dashboard
1. Go to your Vercel URL
2. Register as employer
3. Upload test employees
4. Check dashboard loads
5. Test all pages

#### Mobile App
1. Download Expo Go
2. Scan QR code
3. Register as employee
4. Request advance
5. Verify flow works

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

```bash
# Install
pnpm add @sentry/node @sentry/nextjs

# Configure API (apps/api/src/index.ts)
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
})

# Configure Web (apps/web/sentry.client.config.js)
Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
})
```

### Uptime Monitoring

**Free options**:
- [UptimeRobot](https://uptimerobot.com) - Check every 5 minutes
- [Better Uptime](https://betteruptime.com) - Slack/email alerts

**Setup**:
1. Monitor `https://your-api.up.railway.app/health`
2. Alert if down for >5 minutes
3. Send SMS/email to you

### Database Backups

**Railway** (automatic):
- Daily backups included
- Restore from dashboard

**Manual backup**:
```bash
railway run pg_dump > backup-$(date +%Y%m%d).sql
```

---

## 🔐 Security Hardening

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET (64+ characters)
- ✅ Rotate secrets quarterly
- ✅ Different secrets for prod/staging

### Database
- ✅ SSL required for connections (Railway default)
- ✅ Regular backups (daily)
- ✅ Limited user permissions

### API
- ✅ Rate limiting (already configured in code)
- ✅ CORS properly configured
- ✅ Helmet.js for security headers
- ✅ Input validation with Zod

### M-Pesa
- ✅ Verify webhook signatures
- ✅ Whitelist callback IPs
- ✅ Log all transactions
- ✅ Monitor for fraud patterns

---

## 📈 Performance Optimization

### API
- ✅ Database connection pooling (default)
- ✅ Index on frequent queries (in schema)
- ✅ Gzip compression (Hono default)

### Web
- ✅ Next.js static optimization (automatic)
- ✅ Image optimization (next/image)
- ✅ Bundle splitting (automatic)

### Database
```sql
-- Add indexes if needed
CREATE INDEX idx_advances_employee ON advances(employee_id);
CREATE INDEX idx_advances_status ON advances(status);
CREATE INDEX idx_employees_employer ON employees(employer_id);
```

---

## 🐛 Troubleshooting

### API won't start
**Check**:
- Environment variables set correctly
- DATABASE_URL is valid
- Port 3000 not blocked
- Build logs in Railway/Render

**Fix**:
```bash
railway logs
# Look for error messages
```

### Database connection failed
**Check**:
- DATABASE_URL includes SSL mode
- PostgreSQL service running
- Network connectivity

**Fix**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### M-Pesa callbacks not received
**Check**:
- Callback URL is publicly accessible
- HTTPS enabled (required by Safaricom)
- Callback URL registered with Safaricom

**Debug**:
```bash
railway logs --filter mpesa
# Check webhook logs
```

### Web app shows API error
**Check**:
- NEXT_PUBLIC_API_URL is correct
- API is running
- CORS enabled for web domain

**Test**:
```bash
curl https://your-api.up.railway.app/health
```

---

## ✅ Launch Day Checklist

### T-1 Day (Before Launch)
- [ ] All services deployed and tested
- [ ] M-Pesa production credentials configured
- [ ] Test end-to-end flow with real money (small amount)
- [ ] Monitoring/alerts set up
- [ ] Support email/WhatsApp ready
- [ ] Documentation updated
- [ ] Team briefed on launch

### T-0 (Launch Day)
- [ ] Final smoke test
- [ ] Send onboarding emails to beta customers
- [ ] Post on LinkedIn/Twitter
- [ ] Monitor logs closely
- [ ] Respond to support requests within 30 min
- [ ] Celebrate! 🎉

### T+1 Day (Post-Launch)
- [ ] Review usage metrics
- [ ] Check for errors in Sentry
- [ ] Follow up with beta customers
- [ ] Fix any critical bugs
- [ ] Plan next iteration

---

## 🆘 Support During Launch

### Your Support Stack

**WhatsApp Business**: Primary support channel
- Set up auto-replies
- Use labels for organization
- Response time: <30 minutes

**Email**: support@salaryadvance.co.ke
- Use Gmail with filters
- Canned responses for FAQs

**Phone**: For critical employer issues
- Dedicated line during business hours

### Support Hours (Week 1)
- 7am-9pm, 7 days (you're on call!)
- After week 1: 8am-6pm, Mon-Fri

---

## 🎯 Success Metrics

### Day 1
- [ ] API uptime: 99%+
- [ ] Zero critical bugs
- [ ] First employer onboarded
- [ ] First advance processed

### Week 1
- [ ] 3-5 employers onboarded
- [ ] 100+ employees registered
- [ ] 50+ advances processed
- [ ] M-Pesa success rate: 98%+

### Month 1
- [ ] 10+ employers
- [ ] 1,000+ employees
- [ ] 1,500+ advances
- [ ] KES 500K+ volume
- [ ] First testimonials

---

## 🚀 You're Ready!

Everything is built. Everything is tested.

**Next steps**:
1. **Today**: Deploy API + Web (2 hours)
2. **Tomorrow**: Test M-Pesa production (1 hour)
3. **Day 3**: Onboard first beta customer

**In 72 hours, you can have your first advance processed!**

---

## 💪 Launch Mindset

- **Ship fast, iterate faster**
- **Done is better than perfect**
- **Bugs will happen, fix them quickly**
- **Listen to customers religiously**
- **Celebrate small wins**

**You've got this! Time to launch! 🚀🇰🇪**

---

**Questions? Issues? Need help?**
- Re-read this guide
- Check DEPLOYMENT.md for details
- Google the error
- Ask in developer communities
- **Just ship it!**
