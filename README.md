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

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Motion
- Lucide React
- Vercel
- GitHub Pages

## Repository Structure

```text
.
├── .github/                # Deployment workflows
├── ai-logs/                # Primary AI prompts used for core components
├── docs/                   # Architecture and submission-supporting notes
├── public/                 # Public static assets copied as-is on build
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

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

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

### GitHub Pages

GitHub Pages deployment is handled by [deploy.yml](/Users/zhuchenyu/Documents/Playground/cpt208-src/.github/workflows/deploy.yml), which injects the required base path for the repository site during build.

## Responsive Design

The interface is designed as a mobile-first experience because the heritage visit scenario is intended for phone use at or near the site. Layout, touch targets, floating panels, and content hierarchy are optimized for small screens while remaining usable on desktop browsers for demonstration and assessment.

## Interaction State and Data Handling

The system currently manages interaction states on the client side through React state. Key examples include:

- current screen and journey stage
- selected story point
- collected heritage fragments
- AR placement progress
- guide dialogue state
- completion and leaderboard flow

This provides clear evidence of how the system processes user interaction without requiring a backend database at the current prototype stage.

For the architecture summary, see [system-architecture.md](/Users/zhuchenyu/Documents/Playground/cpt208-src/docs/system-architecture.md).

## AI Usage

This project used AI-assisted coding for core front-end development. The required primary prompt record is stored in:

- [primary-prompts.md](/Users/zhuchenyu/Documents/Playground/cpt208-src/ai-logs/primary-prompts.md)

## Notes for Submission

- The live URL is public and intended to stay active during marking.
- The repository contains the functional system code rather than portfolio-only materials.
- The current codebase aligns with the portfolio requirement to show how user input and interaction states are handled in the web app.
