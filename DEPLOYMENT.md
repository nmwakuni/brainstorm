# 🚀 Deployment Guide - Salary Advance Platform

Complete guide for deploying the Salary Advance platform to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [API Deployment](#api-deployment)
4. [Web Dashboard Deployment](#web-dashboard-deployment)
5. [Mobile App Deployment](#mobile-app-deployment)
6. [M-Pesa Configuration](#m-pesa-configuration)
7. [Production Checklist](#production-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Services
- **PostgreSQL Database** (Neon, Supabase, or self-hosted)
- **Node.js Hosting** (Railway, Fly.io, Render, or VPS)
- **Static Hosting** (Vercel, Netlify for Next.js)
- **M-Pesa Daraja Account** (Safaricom Developer Portal)
- **Domain Name** with SSL (for webhooks)

### Tools Needed
- Git
- pnpm (v8+)
- Node.js (v18+)
- Expo CLI (for mobile builds)

---

## Database Setup

### Option 1: Neon (Recommended)

```bash
# 1. Create account at neon.tech
# 2. Create new project
# 3. Copy connection string

# 4. Set up database
cd apps/api
pnpm db:migrate
pnpm db:seed  # Optional: seed with test data
```

### Option 2: Supabase

```bash
# 1. Create project at supabase.com
# 2. Get connection string from Settings > Database
# 3. Run migrations
```

### Connection String Format
```
postgresql://user:password@host:5432/database?sslmode=require
```

---

## API Deployment

### Option 1: Railway (Easiest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret-key"
railway variables set MPESA_ENABLED="true"
railway variables set MPESA_CONSUMER_KEY="..."
railway variables set MPESA_CONSUMER_SECRET="..."
railway variables set MPESA_SHORTCODE="..."
railway variables set MPESA_INITIATOR_NAME="..."
railway variables set MPESA_SECURITY_CREDENTIAL="..."
railway variables set MPESA_CALLBACK_URL="https://yourapi.railway.app/mpesa"
railway variables set MPESA_ENVIRONMENT="production"

# 4. Deploy
railway up
```

### Option 2: Fly.io

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login and create app
fly auth login
fly launch --name salary-advance-api

# 3. Set secrets
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="your-secret-key"
fly secrets set MPESA_ENABLED="true"
fly secrets set MPESA_CONSUMER_KEY="..."
# ... (all M-Pesa variables)

# 4. Deploy
fly deploy
```

### Option 3: VPS (Ubuntu/Debian)

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql
npm install -g pnpm pm2

# 3. Clone repo
git clone https://github.com/your-org/salary-advance.git
cd salary-advance

# 4. Install dependencies
pnpm install

# 5. Build API
cd apps/api
pnpm build

# 6. Set environment variables
cp .env.example .env
nano .env  # Fill in production values

# 7. Start with PM2
pm2 start dist/index.js --name salary-advance-api
pm2 save
pm2 startup

# 8. Set up Nginx reverse proxy
sudo apt install nginx
# Configure nginx (see nginx.conf example below)
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Web Dashboard Deployment

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd apps/web
vercel

# 3. Set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter your API URL: https://api.yourdomain.com

# 4. Deploy to production
vercel --prod
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login and deploy
cd apps/web
netlify login
netlify init

# 3. Set environment variable
netlify env:set NEXT_PUBLIC_API_URL https://api.yourdomain.com

# 4. Deploy
netlify deploy --prod
```

### Manual Build (for any hosting)

```bash
cd apps/web
pnpm build

# Upload 'out' or '.next' directory to your hosting provider
```

---

## Mobile App Deployment

### iOS App Store

```bash
# 1. Configure app.json
cd apps/mobile
nano app.json  # Set bundle identifier, version, etc.

# 2. Build for iOS
eas build --platform ios

# 3. Submit to App Store
eas submit --platform ios
```

### Google Play Store

```bash
# 1. Configure app.json
cd apps/mobile
nano app.json  # Set package name, version code, etc.

# 2. Build for Android
eas build --platform android

# 3. Submit to Play Store
eas submit --platform android
```

### Over-the-Air Updates (OTA)

```bash
# Deploy updates without app store review
eas update --branch production --message "Bug fixes"
```

---

## M-Pesa Configuration

### 1. Get Credentials

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Create an account and new app
3. Get Consumer Key and Consumer Secret
4. Request B2C (Business to Customer) API access
5. Receive shortcode and initiator credentials

### 2. Test in Sandbox

```bash
# Set environment to sandbox
MPESA_ENVIRONMENT=sandbox
MPESA_ENABLED=true
MPESA_CONSUMER_KEY=your_sandbox_key
MPESA_CONSUMER_SECRET=your_sandbox_secret
MPESA_SHORTCODE=600000  # Example sandbox shortcode
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=Safaricom000!  # Sandbox test credential
MPESA_CALLBACK_URL=https://your-api.com/mpesa
```

### 3. Go Live Checklist

- [ ] Complete Safaricom KYC verification
- [ ] Get production credentials
- [ ] Set up SSL certificate on callback URL
- [ ] Test all flows in sandbox
- [ ] Encrypt initiator password with production certificate
- [ ] Update environment variables to production
- [ ] Monitor first few transactions closely

### 4. Callback URL Requirements

- **Must be HTTPS** (SSL required)
- **Publicly accessible** (no localhost)
- **Fast response** (< 30 seconds)
- **Return JSON** with ResultCode and ResultDesc

Example: `https://api.yourdomain.com/mpesa/result`

---

## Production Checklist

### Security

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable CORS only for your domains
- [ ] Set up rate limiting
- [ ] Enable HTTPS everywhere
- [ ] Implement request logging
- [ ] Set up error monitoring (Sentry)
- [ ] Regular security audits

### Database

- [ ] Enable connection pooling
- [ ] Set up automated backups
- [ ] Configure SSL connections
- [ ] Set up read replicas (if needed)
- [ ] Monitor query performance

### API

- [ ] Set NODE_ENV=production
- [ ] Configure proper logging
- [ ] Set up health check endpoints
- [ ] Enable API rate limiting
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Configure auto-scaling

### M-Pesa

- [ ] Verify sandbox integration works
- [ ] Complete Safaricom production onboarding
- [ ] Set up M-Pesa account reconciliation
- [ ] Monitor transaction success rates
- [ ] Set up alerts for failed transactions
- [ ] Implement retry logic for failures

### Mobile App

- [ ] Update API URLs to production
- [ ] Enable crash reporting (Sentry)
- [ ] Configure analytics (Firebase, Mixpanel)
- [ ] Set up deep linking
- [ ] Test on multiple devices
- [ ] Submit for app store review

### Web Dashboard

- [ ] Update API URL to production
- [ ] Enable analytics (Google Analytics, Plausible)
- [ ] Set up error tracking
- [ ] Configure SEO meta tags
- [ ] Test on multiple browsers
- [ ] Optimize images and assets

---

## Monitoring & Maintenance

### Application Monitoring

```bash
# Set up Sentry for error tracking
npm install @sentry/node

# Add to API
import * as Sentry from '@sentry/node'
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### Database Monitoring

- Monitor connection pool usage
- Track slow queries
- Set up automated backups
- Alert on high CPU/memory usage

### M-Pesa Monitoring

- Track success vs failure rates
- Monitor callback response times
- Set up alerts for:
  - Failed disbursements
  - Timeout errors
  - Authentication failures
  - Webhook failures

### Performance Metrics

Track these KPIs:
- API response time (target: < 200ms)
- Database query time (target: < 50ms)
- M-Pesa success rate (target: > 95%)
- Mobile app crash rate (target: < 1%)
- Uptime (target: > 99.9%)

### Backups

```bash
# Automated database backups
# Set up daily backups with 30-day retention
# Store in S3 or similar

# Example PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Updates

```bash
# For API/Web updates
git pull origin main
pnpm install
pnpm build
pm2 restart all

# For mobile OTA updates
eas update --branch production
```

---

## Troubleshooting

### M-Pesa Issues

**Problem**: Authentication fails
- Verify Consumer Key and Secret
- Check environment (sandbox vs production)
- Ensure credentials haven't expired

**Problem**: Disbursement fails
- Verify phone number format (254XXXXXXXXX)
- Check shortcode balance
- Verify security credential is correct
- Check callback URL is accessible

**Problem**: Webhook not receiving callbacks
- Verify URL is HTTPS and publicly accessible
- Check firewall/security groups
- Ensure server responds within 30 seconds
- Check M-Pesa developer portal logs

### Database Issues

**Problem**: Connection timeouts
- Increase connection pool size
- Check network connectivity
- Verify SSL settings
- Scale database resources

### API Issues

**Problem**: High memory usage
- Check for memory leaks
- Implement pagination
- Optimize database queries
- Scale horizontally

---

## Support

For production issues:
- **Email**: support@yourdomain.com
- **Slack**: #prod-alerts
- **On-call**: PagerDuty rotation

---

**Built with ❤️ in Kenya 🇰🇪**
