# 💼 Salary Advance - Employer Web Dashboard

Next.js web dashboard for employers to manage employee salary advances.

## 🎯 Features

- **Authentication** - Secure login and registration for employers
- **Dashboard Overview** - Real-time stats and recent activity
- **Employee Management** - Add, edit, and manage employees
- **Advance Requests** - Review and approve/reject salary advances
- **Payroll Integration** - Process monthly payroll and deductions
- **Reports & Analytics** - Track usage and financial metrics

## 🛠️ Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **TanStack Query** (React Query) for data fetching
- **Zustand** for state management
- **Axios** for API calls
- **Recharts** for charts and analytics

## 📂 Project Structure

```
app/
├── dashboard/           # Dashboard pages
│   ├── layout.tsx      # Dashboard layout with sidebar
│   ├── page.tsx        # Dashboard overview
│   ├── employees/      # Employee management
│   ├── advances/       # Advance requests
│   ├── payroll/        # Payroll processing
│   └── reports/        # Reports and analytics
├── login/              # Login page
├── register/           # Registration page
├── layout.tsx          # Root layout
├── page.tsx            # Home page (redirects to dashboard)
├── globals.css         # Global styles
└── providers.tsx       # React Query provider

lib/
├── api.ts              # API utilities and endpoints
└── auth-store.ts       # Authentication state management
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- API server running

### Installation

```bash
# From the monorepo root
pnpm install

# Start the development server
cd apps/web
pnpm dev
```

The dashboard will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Page Flow

```
Login/Register
  ↓
Dashboard (Overview)
  ├─→ Employees → Add/Edit Employee
  ├─→ Advances → Approve/Reject Requests
  ├─→ Payroll → Process Monthly Payroll
  └─→ Reports → View Analytics
```

## 🧪 Testing

To test the dashboard:

1. Make sure the API is running (`cd apps/api && pnpm dev`)
2. Register a new employer account
3. Add test employees
4. Test advance approval workflow
5. Process test payroll

## 🐛 Common Issues

### "Failed to fetch"

- Check API URL in `.env.local`
- Make sure API is running on port 3001
- Verify CORS is configured in the API

### "Unauthorized"

- Clear browser storage and login again
- Check if token is being sent in Authorization header

## 📄 License

Private - All Rights Reserved

---

**Built with ❤️ in Kenya 🇰🇪**
