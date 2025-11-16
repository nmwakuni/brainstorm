# 🚀 Quick Start Guide

Get the Salary Advance API running in **5 minutes**.

## Step 1: Install Dependencies

```bash
# Make sure you have pnpm installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

## Step 2: Set Up Database

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb salary_advance

# Set up environment
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env

# Edit both .env files:
# DATABASE_URL="postgresql://localhost:5432/salary_advance"
```

### Option B: Railway/Supabase (Cloud)

```bash
# Create a Postgres database on Railway or Supabase
# Copy the connection string

# Set up environment
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env

# Edit .env files with your connection string
# DATABASE_URL="postgresql://user:pass@host:5432/database"
```

## Step 3: Run Migrations

```bash
# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate
```

## Step 4: Start the API

```bash
cd apps/api
pnpm dev
```

✅ API is now running at **http://localhost:3001**

## Step 5: Test It!

### Create an Employer Account

```bash
curl -X POST http://localhost:3001/auth/register/employer \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0712345678",
    "email": "test@company.com",
    "pin": "1234",
    "companyName": "Test Company",
    "companyEmail": "info@testcompany.com",
    "companyPhone": "0711223344"
  }'
```

You'll get back a token like:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

### Create an Employee

```bash
curl -X POST http://localhost:3001/employers/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "employeeNumber": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "0798765432",
    "mpesaNumber": "0798765432",
    "monthlySalary": 50000,
    "hireDate": "2024-01-01"
  }'
```

### Login as Employee

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0798765432",
    "pin": "0000"
  }'
```

(Note: Default PIN is "0000" - employee should change on first login)

### Check Employee Dashboard

```bash
curl http://localhost:3001/employees/dashboard \
  -H "Authorization: Bearer EMPLOYEE_TOKEN_HERE"
```

You'll see:

- Earned wages to date
- Available to withdraw
- Recent advances

### Request an Advance

```bash
curl -X POST http://localhost:3001/advances/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer EMPLOYEE_TOKEN_HERE" \
  -d '{
    "amount": 5000
  }'
```

🎉 **Success!** You've just processed your first advance.

## Next Steps

- [ ] Explore the API endpoints (see README.md)
- [ ] Build the web dashboard (Next.js)
- [ ] Build the mobile app (React Native)
- [ ] Integrate M-Pesa for real disbursements
- [ ] Add SMS notifications

## Troubleshooting

### "Connection refused" error

- Make sure PostgreSQL is running
- Check your DATABASE_URL is correct

### "pnpm: command not found"

```bash
npm install -g pnpm
```

### Database migration errors

```bash
# Reset database and try again
dropdb salary_advance
createdb salary_advance
pnpm db:migrate
```

### Port 3001 already in use

```bash
# Change PORT in apps/api/.env
PORT=3002
```

## Development Tools

### Drizzle Studio (Database GUI)

```bash
pnpm db:studio
# Opens at https://local.drizzle.studio
```

### View Logs

```bash
cd apps/api
pnpm dev
# Logs all HTTP requests
```

---

**Need help?** Check the main README.md or ask the team!
