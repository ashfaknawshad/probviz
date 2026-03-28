# ProbViz

A modern, responsive Progressive Web App (PWA) for solving and visualizing probability distributions.

Current modules:
- Poisson Distribution
- Normal Distribution

It is designed to be modular, so additional distributions can be added later (Binomial, Exponential, Uniform, etc.).

## Features

- Real-time probability calculations with at least 6-decimal precision
- Poisson modes:
  - P(X = x)
  - P(X <= x)
  - P(X >= x)
  - P(X < x)
  - P(X > x)
- Normal modes:
  - P(X <= x)
  - P(X >= x)
  - P(X < x)
  - P(X > x)
  - P(a <= X <= b)
- Dynamic visualizations:
  - Poisson discrete bar graph
  - Normal bell curve with highlighted regions
- Step-by-step explanation toggle
- Formula display toggle
- Input validation and clear error states
- Mobile-first responsive UI
- Dark mode support
- Offline after first load (service worker + caching)
- Installable on Android and iOS

## A) Local Setup

1. Install Node.js (LTS) from https://nodejs.org/.
2. Open terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

4. Run development server:

```bash
npm run dev
```

5. Open the local URL shown in terminal (usually `http://localhost:5173`).

## B) Build For Production

Generate an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The output folder is `dist/`.

## C) Deploy Options

### 1) Vercel

1. Push this project to GitHub.
2. Go to https://vercel.com and sign in.
3. Click **Add New Project** and import your GitHub repository.
4. Vercel usually auto-detects Vite. If needed, set:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.
6. After build completes, Vercel gives you a live URL.

### 2) Netlify

1. Push this project to GitHub.
2. Go to https://app.netlify.com and sign in.
3. Click **Add new site** -> **Import an existing project**.
4. Connect GitHub and select your repository.
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy site**.
7. Netlify will provide a live URL (you can later customize the domain).

### 3) GitHub Pages

#### Option A: Manual deploy with npm script

1. Push your project to GitHub.
2. Install dependencies locally:

```bash
npm install
```

3. If deploying under a repository path (for example `https://username.github.io/probviz`), set base path before build:

PowerShell:

```powershell
$env:VITE_BASE_PATH='/probviz/'
npm run deploy:gh
```

macOS/Linux:

```bash
VITE_BASE_PATH=/probviz/ npm run deploy:gh
```

4. This publishes `dist/` to the `gh-pages` branch.
5. In GitHub repository settings -> **Pages**, set source to `gh-pages` branch root.
6. Your live URL will be similar to `https://username.github.io/probviz`.

#### Option B: GitHub Actions (recommended for automation)

1. Add a workflow for Vite build + Pages publish.
2. Ensure the same `VITE_BASE_PATH` is used during build.
3. Push to `main` and GitHub will publish automatically.

## D) Mobile Installation Guide

### Android (Chrome)

1. Open the deployed or local HTTPS app in Chrome.
2. Tap menu (three dots).
3. Tap **Install app** or **Add to Home screen**.
4. Confirm installation.
5. Launch from home screen for full-screen app experience.

### iOS (Safari)

1. Open the app URL in Safari.
2. Tap the **Share** icon.
3. Select **Add to Home Screen**.
4. Confirm name and tap **Add**.
5. Launch from home screen.

## Project Structure

- `src/features/distributions/poisson` - Poisson logic + UI
- `src/features/distributions/normal` - Normal logic + UI
- `src/features/charts` - Recharts visual components
- `src/features/shared` - shared formatting and validation
- `src/pwa` - service worker registration
- `public/sw.js` - service worker caching strategy
- `public/manifest.webmanifest` - install metadata

## Notes

- For full PWA installability, deploy on HTTPS (all major hosts above do this automatically).
- First load must happen online so assets can cache; after that, the app works offline.

Created by Ashfak Nawshad
