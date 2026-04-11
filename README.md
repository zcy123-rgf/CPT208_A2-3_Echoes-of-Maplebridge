# CPT208 A2-3 Echoes of Maplebridge

Echoes of Maplebridge is a mobile-first web prototype for the CPT208 Human-Centric Computing group project on the Maple Bridge heritage theme. The system turns an onsite heritage visit into a playful journey through story points, AR moments, community photo sharing, and a completion-based fragment collection flow.

## Repository Information

- GitHub repository: [CPT208_A2-3_Echoes-of-Maplebridge](https://github.com/zcy123-rgf/CPT208_A2-3_Echoes-of-Maplebridge)
- Planned live URL: [GitHub Pages deployment](https://zcy123-rgf.github.io/CPT208_A2-3_Echoes-of-Maplebridge/)
- Project type: Web app prototype for the `A2 Suzhou Grand Canal - Maple Bridge` track

## System Scope

This repository contains the system code for the coursework submission. The portfolio website and video deliverables are intentionally excluded from this repository at this stage.

## Core Playful Features

The current prototype demonstrates the system's must-have playful features:

1. Story-based exploration across four Maple Bridge heritage points.
2. AR-style guide interaction and placement flow for the final poetic checkpoint.
3. Community participation through photo wall uploads and a completion leaderboard.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Motion
- GitHub Pages for static hosting

## Project Structure

```text
.
├── ai-logs/                # Primary AI prompt records used during coding
├── app/                    # App screens, assets, and reusable UI components
├── docs/                   # Submission-supporting technical notes
├── styles/                 # Global theme, font, and Tailwind styles
├── index.html              # Vite entry document
├── main.tsx                # App bootstrap
├── package.json            # Scripts and dependencies
└── vite.config.ts          # Vite config for GitHub Pages deployment
```

## Getting Started

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

## Data Handling

This prototype currently handles interaction state on the client side with React state. The system records:

- the current screen in the heritage journey
- the current story point index
- collected story fragments unlocked by user interactions
- completion progress used to drive the summary and leaderboard views

This implementation matches the current front-end prototype stage. A future team backend can replace or extend these local states with database-backed storage for user progress, uploads, and leaderboard data.

## System Architecture

See [docs/system-architecture.md](/Users/zhuchenyu/Documents/Playground/cpt208-src/docs/system-architecture.md) for the repository's current architecture summary and a Mermaid diagram of the front-end data flow.

## Accessibility and Responsive Intent

- Designed as a mobile-first interface matching the Maple Bridge onsite use case.
- Uses clear visual hierarchy, progress feedback, and distinct action buttons.
- Structured as a single-page interactive flow that can be extended with accessibility refinements during later testing.

## AI Usage Record

This project used AI-assisted coding during front-end prototyping. The primary prompt log required by the coursework is stored in [ai-logs/primary-prompts.md](/Users/zhuchenyu/Documents/Playground/cpt208-src/ai-logs/primary-prompts.md).

## Notes for Teammates

- Front-end prototype code lives in `app/`, `styles/`, `main.tsx`, and `vite.config.ts`.
- Generated folders such as `node_modules/` and `dist/` are excluded from version control.
- If you are adding backend or database support later, keep the current UI flow intact and layer APIs behind the existing screen transitions where possible.
