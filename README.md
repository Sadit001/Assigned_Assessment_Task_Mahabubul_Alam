# DOOMSDAY READY

> **YOUR MCU JOURNEY STARTS HERE.**

A premium full-stack web application that helps Marvel Cinematic Universe fans prepare for *Avengers: Doomsday* by managing MCU movies, generating dependency-based rewatch plans, tracking watched progress, and calculating cinema group booking bundles.

Built as the **Blinto Talent Accelerator 2027 — Full Stack Developer Internship Assessment** submission.

---

## Features

### Movie Manager
- Add, edit, and delete MCU movies with full metadata (title, release year, runtime)
- Define prerequisite (dependency) relationships between movies
- Toggle watched/unwatched status with persistent storage
- Real-time search and filtering

### Rewatch Plan
- Select any target MCU movie
- Receive a dependency-ordered watch sequence (DFS-based topological sort)
- Track per-movie watched status directly from the plan
- Animated progress bar, remaining runtime calculation, and completion state
- Circular dependency detection with clear error reporting

### Cinema Booking
- Create cinemas with custom ticket bundle sizes (1–10 unique sizes, 1–500 seats each)
- Enter your group size and get the **minimum number of bundles** needed to cover exactly
- Uses bottom-up Dynamic Programming — mathematically optimal result guaranteed
- Supports impossible-to-cover group sizes (e.g., no valid bundle combination)
- Full CRUD for cinemas and their bundle configurations

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS 3, Framer Motion 10 |
| **State & Data** | TanStack Query v5, React Hook Form v7, Zod |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express.js, TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL (native) |
| **Validation** | Zod |
| **Testing** | Vitest, Supertest |
| **Process Manager** | Concurrently (dev) |

---

## Architecture Overview

```
doomsday-ready/
├── backend/              # Express + TypeScript REST API
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Initial MCU movie + cinema data
│   └── src/
│       ├── algorithms/   # Custom graph + DP algorithms (NO external libs)
│       │   ├── graph.ts     # DFS cycle detection + Kahn's topological sort
│       │   └── booking.ts   # Bottom-up DP minimum-bundle solver
│       ├── config/       # DB connection (Prisma + JSON fallback)
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Error handling, validation
│       ├── routes/       # API route definitions
│       ├── services/     # Business logic layer
│       └── validators/   # Zod request validators
├── frontend/             # React + Vite SPA
│   └── src/
│       ├── api/          # Axios client + typed API functions
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── types/        # Shared TypeScript types
│       └── context/      # React context (Toast notifications)
└── package.json          # Root workspace with concurrently dev script
```

---

##  Data Model Diagram & Database Schema

The application schema models two core domains: **MCU Movie Dependency Graph** and **Cinema Ticket Bundling System**.

### Entity-Relationship Diagram

```mermaid
erDiagram
    Movie {
        String id PK "UUID primary key"
        String title UK "Unique movie title"
        Int releaseYear "Release year (1900-2100)"
        Int runtime "Runtime in minutes (1-300)"
        Boolean watched "Watched status (default false)"
        DateTime createdAt "Creation timestamp"
        DateTime updatedAt "Last update timestamp"
    }

    MovieDependency {
        String movieId PK,FK "Dependent movie ID (requires prerequisite)"
        String prerequisiteMovieId PK,FK "Prerequisite movie ID (watch first)"
    }

    Cinema {
        String id PK "UUID primary key"
        String name UK "Unique cinema name"
        DateTime createdAt "Creation timestamp"
        DateTime updatedAt "Last update timestamp"
    }

    CinemaBundle {
        String id PK "UUID primary key"
        String cinemaId FK "Foreign key to Cinema"
        Int bundleSize "Seats per bundle (1-500)"
    }

    %% Relationships
    Movie ||--o{ MovieDependency : "requires prerequisite (movieId)"
    Movie ||--o{ MovieDependency : "is required by (prerequisiteMovieId)"
    Cinema ||--|{ CinemaBundle : "offers bundle sizes (1-10 bundles)"
```

### Data Structure Details

#### 1. Movies & Prerequisites (Self-Referential Directed Graph)
- **`Movie`**: Stores canonical metadata for each MCU title.
  - `title` is enforced as unique (`@unique`) at both database and application levels.
  - `runtime` is strictly constrained between `1` and `300` minutes.
  - `watched` tracks whether the user has seen the movie (defaults to `false`).
- **`MovieDependency`**: Join table modeling the directed acyclic graph (DAG) of prerequisite requirements.
  - `movieId` references the movie that requires earlier viewing.
  - `prerequisiteMovieId` references the prerequisite movie that must be watched beforehand.
  - **Composite Primary Key**: `@@id([movieId, prerequisiteMovieId])` guarantees no duplicate dependency links can exist.
  - **Cascade Delete**: Deleting a movie automatically cleans up incoming and outgoing dependencies (`onDelete: Cascade`).
  - **Cycle Invariant**: Before saving any new or updated relationship, the custom 3-color DFS algorithm verifies that no directed cycles are formed (`409 CIRCULAR_DEPENDENCY`).

#### 2. Cinemas & Seat Bundles (One-to-Many Composition)
- **`Cinema`**: Represents a theatrical venue selling opening-night tickets.
  - `name` is enforced as unique (`@unique`).
- **`CinemaBundle`**: Individual seat bundle configurations offered by a cinema.
  - Each cinema has between **1 and 10** bundle sizes.
  - Each `bundleSize` represents an exact seat package between **1 and 500** seats.
  - **Composite Unique Constraint**: `@@unique([cinemaId, bundleSize])` guarantees that bundle sizes within a cinema cannot have duplicates.
  - **Cascade Delete**: Removing a cinema deletes all of its associated bundle configurations.

---

##  Prerequisites

- **Node.js** v18 or higher (v20+ recommended)
- **npm** v9 or higher
- **PostgreSQL** v14 or higher *(optional — app auto-falls back to file-backed JSON store if unavailable)*

---

##  PostgreSQL Installation and Database Creation

> Skip this section if you want to use the automatic JSON fallback (no database setup needed).

### macOS (Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
psql postgres
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

### Create the database
```sql
CREATE DATABASE doomsday_ready;
CREATE USER dr_user WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE doomsday_ready TO dr_user;
\q
```

---

##  Environment Configuration

### Backend
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# PostgreSQL connection (leave blank or use the JSON fallback)
DATABASE_URL="postgresql://dr_user:yourpassword@localhost:5432/doomsday_ready"

# Server
PORT=5000
NODE_ENV=development

# CORS origin
CORS_ORIGIN=http://localhost:5173

# Storage mode: "prisma" | "memory" (auto-detected when omitted)
# STORAGE_MODE=memory
```

### Frontend
```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env` is optional — the Vite dev proxy handles API routing automatically.

---

##  Dependency Installation

Install all dependencies at once:
```bash
npm run install:all
```

Or separately:
```bash
npm install --prefix backend
npm install --prefix frontend
```

Install root-level `concurrently`:
```bash
npm install
```

---

## Prisma Setup (PostgreSQL mode only)

### Generate Prisma client
```bash
npx prisma generate --schema=backend/prisma/schema.prisma
```

Or from the backend directory:
```bash
cd backend
npx prisma generate
```

### Run database migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### Seed the database (8 MCU movies + 4 cinemas)
```bash
npm run prisma:seed --prefix backend
```

---

##  Starting the Application

### Start both frontend and backend simultaneously
```bash
npm run dev
```
*(Requires `npm install` at root to install `concurrently`)*

### Start backend only
```bash
npm run dev --prefix backend
# Backend runs on: http://localhost:5000
```

### Start frontend only
```bash
npm run dev --prefix frontend
# Frontend runs on: http://localhost:5173
```

> **Note:** Without PostgreSQL configured, the backend automatically uses a file-backed JSON database stored at `backend/data/db.json`. All features work identically.

---

##  Running Tests

### Run all tests (Backend + Frontend)
```bash
npm test
```

### Backend tests (44 test cases)
```bash
npm run test:backend
# or: npm run test --prefix backend
```
Tests cover:
- Graph algorithm correctness (DFS cycle detection, topological sort)
- Booking algorithm correctness (all 8 assessment test cases)
- Full REST API integration tests (movies CRUD, cinema CRUD, booking calculation)

### Frontend tests (8 test cases)
```bash
npm run test:frontend
# or: npm run test --prefix frontend
```
Tests cover:
- `MovieCard.test.tsx` — Rendering metadata, runtime formatting, watched button toggle
- `RewatchProgress.test.tsx` — Progress percentage `(watched / total) * 100`, remaining runtime, completion state
- `BundleBreakdown.test.tsx` — Impossible state rendering, optimal bundle breakdown cards

---

##  Production Build

```bash
# Build both
npm run build

# Or individually
npm run build:backend
npm run build:frontend
```

Frontend output: `frontend/dist/`
Backend output: `backend/dist/`

Start production backend:
```bash
node backend/dist/server.js
```

---

##  API Reference

### Movies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/movies` | List all movies |
| `POST` | `/api/movies` | Create a movie |
| `GET` | `/api/movies/:id` | Get a movie by ID |
| `PATCH` | `/api/movies/:id` | Update a movie (partial) |
| `DELETE` | `/api/movies/:id` | Delete a movie |
| `GET` | `/api/movies/:id/rewatch-order` | Get ordered prerequisite list |

#### POST /api/movies — Request body
```json
{
  "title": "Iron Man",
  "releaseYear": 2008,
  "runtime": 126,
  "watched": false,
  "prerequisiteIds": []
}
```

#### GET /api/movies/:id/rewatch-order — Response
```json
{
  "targetMovie": { "id": "...", "title": "Avengers: Endgame", ... },
  "rewatchOrder": [
    { "id": "...", "title": "Iron Man", "runtime": 126, "watched": true, "order": 1 },
    { "id": "...", "title": "The Avengers", "runtime": 143, "watched": false, "order": 2 }
  ]
}
```

**Error codes:**
- `409 CIRCULAR_DEPENDENCY` — Detected circular dependency in the prerequisite graph
- `404` — Movie not found

---

### Cinemas

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cinemas` | List all cinemas |
| `POST` | `/api/cinemas` | Create a cinema |
| `GET` | `/api/cinemas/:id` | Get a cinema by ID |
| `DELETE` | `/api/cinemas/:id` | Delete a cinema |
| `GET` | `/api/cinemas/:id/booking?groupSize=6` | Booking quote (Feature 2) |

#### POST /api/cinemas — Request body
```json
{
  "name": "Odeon IMAX",
  "bundleSizes": [2, 5, 10, 25]
}
```

#### GET /api/cinemas/:id/booking?groupSize=11 — Query parameter
- `groupSize`: integer between 1 and 10,000 (e.g. `?groupSize=11`)

#### Response (Success — Optimal Bundles Found)
```json
{
  "possible": true,
  "cinema": {
    "id": "c1",
    "name": "Wakanda Grand Cinema"
  },
  "groupSize": 11,
  "totalBundles": 4,
  "totalSeats": 11,
  "breakdown": [
    { "bundleSize": 5, "count": 1, "subtotalSeats": 5 },
    { "bundleSize": 2, "count": 3, "subtotalSeats": 6 }
  ],
  "summary": "4 bundles: 5 × 1, 2 × 3"
}
```

#### Response (Impossible Combination)
```json
{
  "possible": false,
  "cinema": {
    "id": "c4",
    "name": "Quantum Realm Odeon"
  },
  "groupSize": 7,
  "message": "NOT POSSIBLE",
  "summary": "Not possible"
}
```

---

##  Algorithm Explanations

### Feature 1 — Rewatch Order (Graph Traversal)

**File:** `backend/src/algorithms/graph.ts`

#### Circular Dependency Detection (DFS)

Uses depth-first search with a **three-color visited state**:
- `WHITE` (0) — unvisited
- `GRAY` (1) — currently on the DFS recursion stack (cycle detector)
- `BLACK` (2) — fully explored

A back-edge to a `GRAY` node means a cycle exists. When detected, the algorithm traces back through the recursion path to identify the exact cycle path and returns it in the error.

**Complexity:** O(V + E) where V = number of movies, E = number of dependency edges.

#### Topological Sort (Kahn's Algorithm — BFS)

Implements Kahn's algorithm using **in-degree counting**:
1. Build an adjacency list and compute in-degree for every node.
2. Enqueue all nodes with in-degree 0 (no prerequisites).
3. Process each node: add to result, decrement neighbors' in-degrees, enqueue newly zero-in-degree nodes.
4. The resulting order is a valid topological ordering of prerequisites.

For the rewatch plan, only the **transitive prerequisites** of the target movie are included (via a reachability DFS from the target), not the entire graph.

**Complexity:** O(V + E).

---

### Feature 2 — Cinema Bundle Booking (Dynamic Programming)

**File:** `backend/src/algorithms/booking.ts`

Solves the **minimum-count exact coin change** problem using **bottom-up DP**.

```
dp[i] = minimum number of bundles to cover exactly i seats
dp[0] = 0
dp[i] = min(dp[i - bundle] + 1) for each bundle size where i >= bundle
```

If `dp[groupSize]` remains `Infinity`, the group size cannot be covered exactly with the given bundles.

After computing the minimum count, the algorithm **backtracks** through the DP table to reconstruct which bundle sizes were used and how many times each was used.

**Complexity:** O(n × k) where n = group size and k = number of bundle sizes.

**Assessment test cases verified:**
| Group Size | Bundles | Expected Bundles | Expected Result |
|-----------|---------|-----------------|----------------|
| 7 | [3, 5] | 3 (5+1+1 impossible; actual: 5+? → impossible) | IMPOSSIBLE |
| 10 | [3, 5] | 2 | 5+5 |
| 11 | [3, 5] | 3 | 5+3+3 |
| 6 | [4] | IMPOSSIBLE | IMPOSSIBLE |
| 8 | [4] | 2 | 4+4 |
| 15 | [3, 5] | 3 | 5+5+5 |
| 11 | [4, 6] | IMPOSSIBLE | IMPOSSIBLE |
| 12 | [4, 6] | 2 | 6+6 |

---

##  Dual Database Mode

The backend supports **two storage modes**:

| Mode | Trigger | Description |
|------|---------|-------------|
| **Prisma (PostgreSQL)** | `DATABASE_URL` set and DB reachable | Full relational database with Prisma ORM |
| **JSON Fallback** | No `DATABASE_URL` or DB unreachable | File-backed JSON store at `backend/data/db.json` |

The mode is auto-detected at startup. You can force a mode with:
```env
STORAGE_MODE=memory   # Always use JSON fallback
STORAGE_MODE=prisma   # Always use PostgreSQL (fails if unavailable)
```

This design decision ensures the application is fully functional for development and assessment without requiring a PostgreSQL installation.

---

##  Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dual storage mode | Enables full functionality without mandatory PostgreSQL setup |
| Kahn's BFS for topological sort | More intuitive cycle-safe alternative to DFS post-ordering; produces clean level-order |
| DFS + three-color for cycle detection | Industry-standard approach; cleanly separates detection from sorting |
| Bottom-up DP for booking | O(n×k) optimal; bottom-up avoids call-stack issues with large inputs |
| framer-motion v10 | v11 has broken package.json exports incompatible with Vite 6's CommonJS resolver |
| No authentication | Not required by the assessment; would add complexity without assessment value |
| Zod on both frontend and backend | Single source of truth for validation rules; eliminates mismatches |

---

##  AI Usage Disclosure

This project was developed with AI assistance (Antigravity / Google DeepMind Gemini) for:
- Code scaffolding and boilerplate generation
- TypeScript type definitions
- Tailwind CSS styling and layout
- README documentation

**All core algorithm logic** (graph traversal, cycle detection, topological sort, dynamic programming) was implemented directly and verified against the assessment test cases. No external libraries were used to solve these algorithmic problems.

---

##  Known Limitations

- **Prisma migrations** require PostgreSQL to be running. Without it, the JSON fallback is used automatically.
- **Frontend tests** are limited to component smoke tests. Full E2E testing would require a running backend.
- The JSON fallback does not support concurrent writes (single-process, single-user development only).

---

*Built with for the Blinto Talent Accelerator 2027 Assessment.*
