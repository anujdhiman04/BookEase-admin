# OrbitBooking Admin Web

React + Vite dashboard for local admin operations on `bookease-api`.

## Run locally

1. Start API (default `http://localhost:4000`):
   - `cd /Users/anujkumar/bookease-api`
   - `npm run dev`
2. Seed rich local data:
   - `npm run seed:orbit`
3. Start dashboard:
   - `cd /Users/anujkumar/admin-web`
   - `npm install`
   - `npm run dev`

## Environment

Optional override:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## Included desktop screens

- Global Overview Dashboard
- Provider Management Console
- User Management Console
- Global Service Catalog
- Categories & Fees
