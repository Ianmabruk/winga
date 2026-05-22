# WINGA FOREX BUREAU Frontend

Frontend stack:

- React + Vite
- Tailwind CSS with custom sky-blue luxury design tokens
- Framer Motion animations
- React Query for data synchronization
- Zustand for local forex state and favorites
- React ApexCharts for analytics rendering

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Netlify Deployment

- Base directory: `burea`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`
- Required environment variables:
	- `VITE_WINGA_API_BASE=https://forex.wingaforex.co.tz`
	- `VITE_WINGA_API_TOKEN=...`
	- `VITE_API_URL=https://your-api-host` only if user/admin analytics are enabled on a separate backend

Netlify SPA routing and cache headers are configured in `netlify.toml` and `public/_headers`.

If changes do not appear after deploy:

- Verify Netlify is connected to the `main` branch of the GitHub repo.
- Verify the base directory is `burea` and not the repository root.
- Trigger a clear-cache deploy in Netlify.
- Confirm the latest build uses the newest commit SHA shown in Netlify deploy logs.

## Environment

- `VITE_API_URL` backend URL, default `http://localhost:4000`

## UI Capabilities

- Premium hero with branding and animated FX ticker
- Live exchange board with searchable currencies and movement indicators
- Precision calculator with spread, fee, and commission
- User and admin dashboard cards
- Mobile bottom navigation and desktop sticky glass navigation
- Responsive behavior from small phones to large displays using fluid sizing and adaptive layouts
