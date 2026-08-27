# Chennai Slot Lab

A local-first evidence dashboard for tracking first-time B1/B2 appointment
attempts at Chennai VAC. It separates each attempt into observable stages:

1. VAC calendar loaded
2. A VAC time row appeared
3. VAC Submit was clicked
4. The VAC slot was accepted and the consular page was reached
5. Consular calendar loaded
6. A consular time row appeared
7. Consular Submit was clicked
8. The booking was completed

VAC and consular slot counts are recorded separately because clearing the VAC
stage does not guarantee interview inventory is available.

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

## Git-backed data flow

- The versioned source of truth is `public/data/attempts.json`.
- The dashboard fetches the latest copy from GitHub at runtime and falls back to
  its bundled snapshot if GitHub is temporarily unavailable.
- **Log attempt** opens a prefilled GitHub issue for the repository owner to
  confirm. The `record-attempt.yml` workflow validates the structured payload,
  commits it to the JSON dataset, comments on the intake issue, and closes it.
- The GitHub token remains inside GitHub Actions and is never exposed to the
  browser.
- **Export JSON** downloads the currently loaded dataset.
- No claim of a guaranteed release time is made; rankings are observational.

## Deployment

The public dashboard is deployed by `.github/workflows/deploy-pages.yml` to:

https://balamm27.github.io/b1b2-slotbooking/

The Pages build uses Next.js static export with the repository base path. The
Git-backed attempt workflow does not need to rebuild the site after every new
record because the dashboard fetches the versioned dataset at runtime.
