# WOHANA News Agent — Frontend

React + Vite single-page app for the WOHANA world news platform. Public dashboard
and articles browser, plus an admin area (keywords, settings) gated behind login.

## Stack

- React 18 + Vite 6
- MUI (Material UI) + Emotion
- React Router
- Recharts (charts) + React-Leaflet (world map)
- Axios

## Setup

```bash
npm install
npm run dev      # dev server on http://localhost:5173 (proxies /api -> :8001)
```

The dev server proxies `/api` to the backend at `http://localhost:8001` (see
`vite.config.js`). Adjust the target if your backend runs elsewhere.

## Build & deploy

```bash
npm run build    # outputs static assets to dist/
```

`dist/` is generated at build time and is **not** committed. A sample
`nginx.conf` is provided for serving the built assets and proxying `/api` to the
backend container/host.
