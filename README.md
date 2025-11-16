# 💰 Salary Advance Platform

A modern salary advance platform for Kenyan employers and employees. Built with Next.js, React Native, and Hono.

## 🏗️ Architecture

This is a **monorepo** powered by **Turborepo** containing:

```
salary-advance/
├── apps/
│   ├── web/          # Next.js (Employer Dashboard) - TODO
│   ├── mobile/       # React Native (Employee App) ✅
│   └── api/          # Hono Backend API ✅
│
├── packages/
│   ├── database/     # Drizzle ORM + Postgres schema ✅
│   ├── types/        # Shared TypeScript types ✅
│   ├── lib/          # Shared utilities ✅
│   ├── config/       # Shared configs ✅
│   └── ui/           # Shared UI components - TODO
```

## 🚀 Tech Stack

### Backend
- **[Hono](https://hono.dev/)** - Fast, lightweight web framework
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL toolkit
- **PostgreSQL** - Primary database
- **TypeScript** - Type safety

### Mobile App
- **[React Native](https://reactnative.dev/)** - Employee mobile app ✅
- **[Expo](https://expo.dev/)** - React Native tooling ✅
- **[React Navigation](https://reactnavigation.org/)** - Navigation ✅
- **[TanStack Query](https://tanstack.com/query)** - Data fetching ✅
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management ✅

### Web Dashboard (Coming Soon)
- **[Next.js 14](https://nextjs.org/)** - Employer dashboard

### Infrastructure
- **[Turborepo](https://turbo.build/)** - Monorepo build system
- **pnpm** - Fast, disk-efficient package manager

## 📦 What's Built

✅ **Complete Backend API** with:
- User authentication (JWT + PIN-based)
- Employer registration & management
- Employee onboarding
- Advance request system
- Payroll period tracking
- Role-based access control

✅ **Mobile App (Employee)** with:
- Login/Authentication
- Dashboard (earned wages, available balance)
- Request advance flow
- Advance history
- Profile & settings
- Pull-to-refresh, loading states, error handling

✅ **Database Schema** with:
- Users, Employers, Employees
- Payroll Periods & Entries
- Advances & Transactions
- Full type safety with Drizzle ORM

✅ **Shared Packages**:
- Type-safe API contracts
- Utility functions (auth, calculations, formatting)
- Reusable business logic

## 🎯 How It Works

### For Employees
1. Download mobile app ✅
2. Login with phone number + PIN ✅
3. See earned wages in real-time ✅
4. Request advance (up to 50% of earned wages) ✅
5. View advance history ✅
6. Receive M-Pesa (integration coming soon)
7. Deducted from next paycheck (via employer payroll)

### For Employers
1. Sign up on web dashboard (Coming Soon)
2. Upload employee roster
3. Upload payroll data
4. Platform handles advance requests
5. Download deduction file for payroll
6. Pay back on payday

## 🛠️ Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** database
- **Git**

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd salary-advance

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env

# Edit .env files with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/salary_advance"
```

### Database Setup

```bash
# Generate database migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Open Drizzle Studio to view database
pnpm db:studio
```

### Running the API

```bash
# Development mode (with hot reload)
cd apps/api
pnpm dev

# API will be available at http://localhost:3001
```

### Running the Mobile App

```bash
# Start Expo development server
cd apps/mobile
pnpm start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

See [apps/mobile/README.md](apps/mobile/README.md) for detailed mobile setup.

## 📖 API Documentation

### Authentication

#### Register Employer
```http
POST /auth/register/employer
Content-Type: application/json

{
  "phoneNumber": "0712345678",
  "email": "employer@company.com",
  "pin": "1234",
  "companyName": "Acme Corp",
  "companyEmail": "info@acme.com",
  "companyPhone": "0711223344"
}
```

#### Register Employee
```http
POST /auth/register/employee
Content-Type: application/json

{
  "phoneNumber": "0798765432",
  "pin": "5678",
  "employerCode": "ACME123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "phoneNumber": "0712345678",
  "pin": "1234"
}
```

### Employer Endpoints

All employer endpoints require authentication:
```http
Authorization: Bearer <token>
```

#### Get Dashboard Stats
```http
GET /employers/dashboard
```

#### Create Employee
```http
POST /employers/employees
Content-Type: application/json

{
  "employeeNumber": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "0798765432",
  "mpesaNumber": "0798765432",
  "monthlySalary": 50000,
  "hireDate": "2024-01-01"
}
```

#### Get All Employees
```http
GET /employers/employees
```

### Employee Endpoints

All employee endpoints require authentication:
```http
Authorization: Bearer <token>
```

#### Get Dashboard
```http
GET /employees/dashboard
```

Returns:
- Earned wages to date
- Available to withdraw
- Recent advances
- Account info

#### Get Advance History
```http
GET /employees/advances
```

### Advance Endpoints

#### Request Advance
```http
POST /advances/request
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "amount": 5000
}
```

#### Get Advance Details
```http
GET /advances/:id
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Key Tables

**users**
- Authentication and role management
- Supports: admin, employer, employee

**employers**
- Company information
- Settings (fees, limits, auto-approval)

**employees**
- Employee profiles
- Salary information
- M-Pesa details

**advances**
- Advance requests and status
- Amount, fee, total
- Status tracking (pending → approved → disbursed → repaid)

**payroll_periods**
- Monthly pay cycles
- Start, end, pay dates

**payroll_entries**
- Individual employee payroll records
- Days worked, earnings, deductions

**transactions**
- Financial transaction log
- Disbursements, repayments, fees

## 🔐 Security

- **PIN-based authentication** (4-digit, bcrypt hashed)
- **JWT tokens** (30-day expiry)
- **Role-based access control** (admin, employer, employee)
- **SQL injection protection** (parameterized queries via Drizzle)
- **CORS** configured for specific origins

## 🎨 Business Logic

### Advance Calculation

```typescript
// Employee can withdraw up to 50% of earned wages
earnedToDate = (monthlySalary / daysInMonth) * daysWorked
maxAdvance = earnedToDate * 50%
availableToWithdraw = maxAdvance - totalAlreadyAdvanced

// Fee calculation (default 4%)
fee = amount * 4%
totalCharged = amount + fee
```

### Limits & Rules

- Default: **50% of earned wages**
- Default: **4 advances per month max**
- Default: **4% fee** (configurable by employer)
- **Auto-approval** by default (configurable)

## 🚧 What's Next

### Phase 2: Web Dashboard (In Progress)
- [ ] Next.js employer dashboard
- [ ] Employee management UI
- [ ] Payroll upload interface
- [ ] Advances overview
- [ ] Analytics & reporting
- [ ] UI component library

### Phase 3: Integrations (Next)
- [ ] M-Pesa Daraja API (disbursements)
- [ ] SMS notifications (Africa's Talking)
- [ ] Email notifications
- [ ] Push notifications (mobile)
- [ ] Payroll system integrations

### Phase 4: Advanced Features (Future)
- [ ] Biometric auth (mobile)
- [ ] Cash flow forecasting (AI)
- [ ] Automated payroll reconciliation
- [ ] Multi-currency support
- [ ] Admin panel
- [ ] CSV import/export
- [ ] Invoice factoring (second product!)

## 📝 Development Scripts

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format

# Database commands
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio
```

## 🤝 Contributing

This is a private project. If you have access:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Create a Pull Request

## 📄 License

Private - All Rights Reserved

## 🆘 Support

For questions or issues, contact the development team.

---

**Built with ❤️ in Kenya 🇰🇪**
