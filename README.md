# CivicReportApp (Full MVP)

This project is now a runnable **React Native + Node.js backend** MVP based on your architecture.

## What is implemented

- React Native client with:
  - Demo Google login
  - Feed screen
  - Trending screen
  - Create report screen
  - Profile screen
  - Upvote / remove upvote
- Backend API (`/api/v1`) with:
  - Auth endpoints: `google`, `phone/send-otp`, `phone/verify-otp`, `refresh`, `logout`
  - Posts endpoints: list, detail, create, delete, upvote
  - Trending endpoint
  - User/profile endpoints
- Database:
  - SQLite runtime schema + seed data in `backend/src/db.js`
  - PostgreSQL/PostGIS schema file in `backend/schema.postgres.sql` for production migration

## Project structure

- `App.tsx`: main mobile UI and flows
- `src/api/client.ts`: API service for mobile app
- `src/components/PostCard.tsx`: reusable feed card
- `src/types/interfaces.ts`: shared app interfaces
- `backend/src/server.js`: Express API server
- `backend/src/db.js`: schema bootstrap + seed data

## Run locally

### 1) Install dependencies

From project root:

```sh
npm install
```

From backend folder:

```sh
cd backend
npm install
copy .env.example .env
cd ..
```

### 2) Start backend

```sh
npm run backend
```

Backend runs at `http://localhost:4000`.

### 3) Start React Native app

In a separate terminal from project root:

```sh
npm start
```

Then launch Android:

```sh
npm run android
```

## Notes

- Android emulator uses `http://10.0.2.2:4000` (already configured in `src/api/client.ts`).
- The backend currently uses SQLite for easy local startup.
- For production, migrate to PostgreSQL/PostGIS using `backend/schema.postgres.sql`.
