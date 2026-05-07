# Echoes of Maplebridge

Echoes of Maplebridge is a live, interactive web app created for the CPT208 Human-Centric Computing group project. The experience reimagines Maple Bridge heritage as a mobile-first playful journey that combines story exploration, AR-style guide interaction, and community participation.

## Live Demo

- Vercel: [https://cpt208-src.vercel.app](https://cpt208-src.vercel.app)
- GitHub Pages: [https://zcy123-rgf.github.io/CPT208_A2-3_Echoes-of-Maplebridge/](https://zcy123-rgf.github.io/CPT208_A2-3_Echoes-of-Maplebridge/)

## Source Code Repository

- GitHub repository: [https://github.com/zcy123-rgf/CPT208_A2-3_Echoes-of-Maplebridge](https://github.com/zcy123-rgf/CPT208_A2-3_Echoes-of-Maplebridge)

## Project Context

- Coursework track: `A2 Suzhou Grand Canal - Maple Bridge`
- System type: public web app prototype
- Device focus: mobile-first responsive interface for onsite heritage interaction

## Core Features

This repository currently implements at least three must-have playful features:

1. Story-based exploration across four Maple Bridge heritage points.
2. AR-style virtual guide placement and interaction for the Zhang Ji checkpoint.
3. Community participation through photo-wall contribution and leaderboard completion flow.
4. A Vercel-ready backend for progress persistence, account sessions, image uploads, likes, leaderboard aggregation, and AI guide proxying.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Motion
- Lucide React
- Node.js API routes
- PostgreSQL / MySQL-compatible persistence
- Vercel
- GitHub Pages

## Repository Structure

```text
.
├── .github/                # Deployment workflows
├── ai-logs/                # Primary AI prompts used for core components
├── api/                    # Vercel serverless API entry points
├── docs/                   # Architecture and submission-supporting notes
├── public/                 # Public static assets copied as-is on build
├── server/                 # Backend routes, database adapters, and seed data
├── src/                    # Main application source code
│   ├── assets/             # Images and optimized 3D model
│   ├── components/         # Screens and reusable UI components
│   ├── lib/                # Client-side helper logic
│   ├── styles/             # Theme, fonts, and global styles
│   ├── App.tsx             # Main screen controller and state container
│   └── main.tsx            # Vite entry point
├── .env.example            # Example environment variables
├── index.html              # App shell
├── package.json            # Scripts and dependencies
└── vite.config.ts          # Shared Vite config for Vercel and GitHub Pages
```

## Setup Instructions

### Prerequisites

- Node.js 20 or later
- npm 9 or later
- PostgreSQL connection string for cloud deployment, or MySQL 8.0 for local fallback

### Install dependencies

```bash
npm install
```

### Configure the backend

1. Copy `.env.example` to `.env`.
2. For the deployed cloud database, fill `DATABASE_URL` with the Aiven PostgreSQL connection string.
3. For a local MySQL fallback, fill `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE`.
4. The backend creates required tables automatically on startup.

Optional local MySQL schema setup:

```bash
mysql -u root -p < server/sql/schema.mysql.sql
```

Optional local MySQL demo seed:

```bash
mysql -u root -p < server/sql/seed.mysql.sql
```

### Run locally

```bash
npm run server
```

In a second terminal:

```bash
npm run dev
```

The front end runs on `http://127.0.0.1:5173` and proxies `/api` requests to the local backend on `http://127.0.0.1:3001`.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Deployment Notes

### Vercel

The default build configuration is already suitable for Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Runtime API: `api/index.mjs` and `api/[...path].mjs`

Set `DATABASE_URL` in Vercel project environment variables for Production and Preview. The current deployment uses Aiven PostgreSQL. Because Vercel functions run on a read-only file system, uploaded images are optimized and stored as data URLs in the database rather than written under `server/uploads`.

### GitHub Pages

GitHub Pages deployment is handled by [deploy.yml](/Users/zhuchenyu/Documents/Playground/cpt208-src/.github/workflows/deploy.yml), which injects the required base path for the repository site during build.

## Responsive Design

The interface is designed as a mobile-first experience because the heritage visit scenario is intended for phone use at or near the site. Layout, touch targets, floating panels, and content hierarchy are optimized for small screens while remaining usable on desktop browsers for demonstration and assessment.

## Backend Overview

The project now includes a lightweight Node backend in `server/index.mjs` with PostgreSQL support for Vercel/Aiven, MySQL compatibility for local fallback, legacy JSON migration support from `server/data/store.json`, and upload processing for community photos.

Key backend improvements now in place:

- automatic migration from the previous JSON store into the configured database
- session-based auth with expiry cleanup
- optimized image processing with WebP conversion
- generated square thumbnails for faster community wall and leaderboard loading
- health reporting with backend storage counters
- explicit MySQL schema and seed SQL files for local fallback setup

Available API capabilities:

- `POST /api/auth/register` to create a user account
- `POST /api/auth/login` to sign in
- `GET /api/auth/session` to restore an existing session
- `POST /api/auth/logout` to revoke the current session
- `GET /api/health` to inspect backend readiness and storage counters
- `GET /api/progress` to restore user progress
- `POST /api/progress/checkpoint` to persist fragment unlocks
- `GET /api/community/photos` to load the photo wall
- `POST /api/community/photos` to create community uploads from real image files
- `POST /api/community/photos/:id/like` to increment likes
- `GET /api/community/leaderboard` to return aggregated rankings
- `POST /api/guide/ask` to proxy Zhang Ji guide responses through the backend

Client UI state is still managed with React, but the important user-facing data now survives refreshes, is isolated per signed-in user through the backend session layer, and loads more efficiently because gallery views consume backend thumbnails instead of full-size uploads.

What gets inserted automatically:

- `story_points` are seeded by the backend on startup if the table is empty.
- Legacy sample photos and progress can be imported from `server/data/store.json` when the database is empty.
- New users, progress, likes, sessions, and uploads are created by normal app usage.

What you do not need to insert manually:

- regular user accounts
- progress records
- uploaded photos
- likes and leaderboard rows

For the architecture summary, see [system-architecture.md](/Users/zhuchenyu/Documents/Playground/cpt208-src/docs/system-architecture.md).

## AI Usage

This project used AI-assisted coding for core front-end development. The required primary prompt record is stored in:

- [primary-prompts.md](/Users/zhuchenyu/Documents/Playground/cpt208-src/ai-logs/primary-prompts.md)

## Notes for Submission

- The live URL is public and intended to stay active during marking.
- The repository contains the functional system code rather than portfolio-only materials.
- The current codebase aligns with the portfolio requirement to show how user input and interaction states are handled in the web app.
