# 📱 Salary Advance - Employee Mobile App

React Native mobile app for employees to access their earned wages instantly.

## 🎯 Features

- **Login with Phone + PIN** - Secure authentication
- **Dashboard** - View earned wages, available balance, recent advances
- **Request Advance** - Request up to 50% of earned wages
- **Advance History** - Track all past advances and their status
- **Profile** - View account details and settings

## 🛠️ Tech Stack

- **React Native** via **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **TanStack Query** (React Query) for data fetching
- **Zustand** for state management
- **Expo Secure Store** for secure token storage
- **Axios** for API calls

## 📂 Project Structure

```
src/
├── screens/          # Screen components
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── RequestAdvanceScreen.tsx
│   ├── AdvanceHistoryScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/       # Navigation setup
├── services/         # API services
│   └── api.ts
├── store/            # Zustand stores
│   └── authStore.ts
├── components/       # Reusable components (TODO)
├── utils/            # Utility functions
└── types/            # TypeScript types
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# From the monorepo root
pnpm install

# Start the development server
cd apps/mobile
pnpm start
```

### Running on Different Platforms

```bash
# iOS (requires Mac)
pnpm ios

# Android
pnpm android

# Web (for testing)
pnpm web
```

### Using Expo Go

1. Install **Expo Go** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Run `pnpm start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

## 🔧 Configuration

Edit `app.json` to configure:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_API_URL:3001"
    }
  }
}
```

For local development:
- **iOS Simulator**: `http://localhost:3001`
- **Android Emulator**: `http://10.0.2.2:3001`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3001`

## 📱 Screen Flow

```
Login
  ↓
Dashboard (Main Screen)
  ├─→ Request Advance → Success → Back to Dashboard
  ├─→ Advance History
  └─→ Profile → Logout → Login
```

## 🧪 Testing

To test the app:

1. Make sure the API is running (`cd apps/api && pnpm dev`)
2. Create a test employee account via the API or web dashboard
3. Login with employee phone number and PIN (default: 0000)
4. Test advance request flow

## 🐛 Common Issues

### "Network request failed"

- Check API URL in `app.json`
- Make sure API is running
- For Android Emulator, use `http://10.0.2.2:3001` instead of `localhost`

### "Cannot connect to Metro bundler"

```bash
# Clear cache and restart
pnpm start --clear
```

## 📄 License

Private - All Rights Reserved

---

**Built with ❤️ in Kenya 🇰🇪**
