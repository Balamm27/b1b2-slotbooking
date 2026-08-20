# Chennai Slot Lab

A local-first evidence dashboard for tracking first-time B1/B2 appointment
attempts at Chennai VAC. It separates each attempt into observable stages:

1. Chennai VAC selected and calendar shown
2. A bookable time row shown
3. Submit accepted
4. Consular scheduling reached

The dashboard preserves active, removed, and research-only windows so failed
experiments stay visible instead of disappearing from the record.

## Run locally

Requires Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm test
```

## Data behavior

- The evidence currently confirmed in this project is seeded in `app/page.tsx`.
- Attempts added with **Log attempt** are stored in that browser's local storage.
- **Export JSON** downloads the combined seed and local-attempt dataset.
- No claim of a guaranteed release time is made; rankings are observational.

## Deployment

The project is prepared for Sites hosting through `.openai/hosting.json`. Keep it
local while the experiment model and seed data are being reviewed; publish only
after the owner approves the dashboard.
