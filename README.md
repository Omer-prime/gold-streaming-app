# Gold Streaming App (Gold Live)

A Poppo-style live streaming platform with a React Native (Expo) mobile app and a Next.js admin dashboard.  
It includes LiveKit-based live rooms, real-time chat, gifts, coins wallet/ledger, profiles, moments feed, and moderation/admin tools.

## Tech Stack

### Mobile
- React Native (Expo)
- TypeScript
- React Navigation
- LiveKit (LiveKit React Native / Expo plugin)

### Admin Dashboard
- Next.js (App Router)
- TypeScript

### Backend / Database
- Node.js
- Prisma
- PostgreSQL
- PM2 (process manager)

## Key Features

### Live Streaming
- Live rooms powered by LiveKit
- Host live sessions, explore live rooms
- Real-time viewer updates (depends on backend setup)

### Gifts (Poppo-style foundation)
- Gift catalog
- Gift transactions (sender → receiver in a live stream)
- Wallet balance updates + ledger history

### Wallet / Coins
- Wallet balance per user
- Wallet ledger for top-ups and spending history
- Coin packages (editable from admin)

### Social
- User profiles, follow system
- Moments feed (text/image/video)
- Comments, likes, saves
- Profile visits

### Chat
- 1:1 chat threads
- Message request / accept flow
- Moment share in chat

### Account & Security
- Email login / binding
- Google sign-in support (config required)
- Device management (basic)
- Face verification flow

### Admin
- Manage users, gifts, coin packages, content, and app settings
- Internal admin APIs under `admin-api`

## Monorepo Structure
├─ mobile/ # React Native (Expo) app
├─ admin-api/ # Next.js admin dashboard + admin APIs
├─ prisma/ # Prisma schema and migrations (if included)
└─ ...


## Getting Started

### 1) Requirements
- Node.js (LTS recommended)
- npm (or yarn/pnpm — use one)
- PostgreSQL database
- Android Studio / SDK (for Android builds)

### 2) Setup Environment Variables

#### Mobile (`mobile/.env`)
Set these based on your deployment:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_LIVEKIT_URL`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

#### Backend / Admin (`admin-api/.env`)
- `DATABASE_URL`
- Auth and service keys as required by your setup

> Note: Do not commit real keys. Use `.env.example` files if you share the repo publicly.

### 3) Install Dependencies

#### Mobile
```bash
cd mobile
npm install
Admin
cd admin-api
npm install
```
4) Run Mobile (Android)

If using Expo Dev Client:

cd mobile
npx expo run:android

If ADB device shows unauthorized, enable USB debugging and accept the device prompt.

5) Run Admin Dashboard
cd admin-api
npm run dev
6) Build Admin Dashboard
cd admin-api
npm run build
npm run start
Deployment Notes (VM / VPS)

Use PM2 to keep services alive:

pm2 list
pm2 restart all --update-env

If you manage PM2 under a different Linux user, run:

sudo -iu <user> pm2 restart all --update-env
Database (Prisma)

If you use migrations:

npx prisma migrate deploy
npx prisma generate
Roadmap / Pending (depends on your product decisions)

Real payment integrations for coin top-ups (provider-based)

Admin confirmation flows for manual top-ups / withdrawals

Full gift animations + richer live-room effects

More moderation tools and reporting workflows
