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

## Environment

- `VITE_API_URL` backend URL, default `http://localhost:4000`

## UI Capabilities

- Premium hero with branding and animated FX ticker
- Live exchange board with searchable currencies and movement indicators
- Precision calculator with spread, fee, and commission
- User and admin dashboard cards
- Mobile bottom navigation and desktop sticky glass navigation
- Responsive behavior from small phones to large displays using fluid sizing and adaptive layouts
