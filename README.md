# 💰 Salary Advance Platform

A modern salary advance platform for Kenyan employers and employees. Built with Next.js, React Native, and Hono.

## 🏗️ Architecture

This is a **monorepo** powered by **Turborepo** containing:

```
salary-advance/
├── apps/
│   ├── web/          # Next.js (Employer Dashboard) ✅
│   ├── mobile/       # React Native (Employee App) ✅
│   └── api/          # Hono Backend API ✅
│
├── packages/
│   ├── database/     # Drizzle ORM + Postgres schema ✅
│   ├── types/        # Shared TypeScript types ✅
│   ├── lib/          # Shared utilities ✅
│   └── config/       # Shared configs ✅
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
- **Expo Local Authentication** - Biometric auth (Face ID/Fingerprint) ✅
- **Expo Notifications** - Push notifications ✅

### Web Dashboard
- **[Next.js 14](https://nextjs.org/)** - Employer dashboard ✅
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling ✅
- **[TanStack Query](https://tanstack.com/query)** - Data fetching ✅
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management ✅

### Payments
- **M-Pesa Daraja API** - Real-time B2C disbursements ✅
- **Webhook Integration** - Transaction status callbacks ✅

### Infrastructure
- **[Turborepo](https://turbo.build/)** - Monorepo build system
- **pnpm** - Fast, disk-efficient package manager

## 📦 What's Built

✅ **Complete Backend API** with:
- User authentication (JWT + PIN-based)
- Employer registration & management
- Employee onboarding
- Advance request & approval system
- Payroll period tracking
- Role-based access control
- M-Pesa B2C integration
- Webhook handling for transaction callbacks
- Comprehensive error handling

✅ **Mobile App (Employee)** with:
- Login/Authentication with PIN
- Biometric authentication (Face ID/Fingerprint)
- Dashboard (earned wages, available balance)
- Request advance flow with fee breakdown
- Advance history with status tracking
- Profile & settings
- Push notifications for approvals & disbursements
- Pull-to-refresh, loading states, error handling
- Offline-friendly architecture

✅ **Web Dashboard (Employer)** with:
- Login & registration
- Dashboard overview with real-time stats
- Employee management (add, view, manage)
- Advance request review & approval
- Payroll processing & deduction tracking
- Reports & analytics
- Responsive design for all screens

✅ **M-Pesa Integration** with:
- B2C payment disbursement
- Real-time transaction processing
- Webhook callbacks for status updates
- Automatic retry logic
- Transaction reconciliation
- Sandbox & production environments

✅ **Database Schema** with:
- Users, Employers, Employees
- Payroll Periods & Entries
- Advances & Transactions
- M-Pesa transaction tracking
- Full type safety with Drizzle ORM

✅ **Shared Packages**:
- Type-safe API contracts
- Utility functions (auth, calculations, formatting)
- Reusable business logic

## 🎯 How It Works

### For Employees
1. Download mobile app ✅
2. Login with phone number + PIN or biometric ✅
3. See earned wages in real-time ✅
4. Request advance (up to 50% of earned wages) ✅
5. Receive instant M-Pesa disbursement ✅
6. Get push notification when approved ✅
7. View advance history with M-Pesa transaction IDs ✅
8. Deducted automatically from next paycheck ✅

### For Employers
1. Sign up on web dashboard ✅
2. Add employees with salary info ✅
3. Platform calculates earned wages automatically ✅
4. Review & approve advance requests ✅
5. M-Pesa disbursements happen automatically ✅
6. Process payroll at month-end ✅
7. View reports & analytics ✅

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

## 🎉 Complete Features

✅ **Phase 1: Backend & Database** - DONE!
- Complete API with authentication
- Full database schema
- Business logic implementation
- Type-safe architecture

✅ **Phase 2: Mobile App** - DONE!
- React Native app for employees
- Biometric authentication
- Push notifications
- Full advance flow

✅ **Phase 3: Web Dashboard** - DONE!
- Next.js employer portal
- Employee management
- Advance approval workflow
- Payroll processing
- Analytics & reports

✅ **Phase 4: M-Pesa Integration** - DONE!
- B2C payment disbursement
- Webhook integration
- Real-time transaction tracking
- Error handling & retries

## 🚀 Ready for Production!

This platform is **production-ready** and includes:
- Complete end-to-end salary advance flow
- Real M-Pesa payment integration
- Mobile & web apps
- Comprehensive error handling
- Security best practices
- Deployment documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide.
See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for go-live checklist.

## 🔮 Future Enhancements

### Phase 5: Additional Features (Future)
- [ ] SMS notifications (Africa's Talking)
- [ ] Email notifications (SendGrid)
- [ ] Admin super-dashboard
- [ ] CSV import/export for bulk operations
- [ ] Automated payroll file generation
- [ ] Cash flow forecasting (AI/ML)
- [ ] Multi-currency support
- [ ] Multi-country expansion
- [ ] White-label solution

### Phase 6: Second Product (Future)
- [ ] Invoice Factoring platform
- [ ] SME lending marketplace
- [ ] Group savings (chamas) digitization

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
