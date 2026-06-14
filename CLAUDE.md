# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

From the **root directory** (manages both frontend and backend):
```bash
npm install       # Install root dependencies (server packages)
npm run dev:all   # Run frontend (port 3000) + backend (port 3001) concurrently
npm run dev       # Run frontend only (delegates to inner package)
npm run server    # Run backend only (tsx watch)
```

From **`claude_code_treasure_game-initial/`** (frontend):
```bash
npm install       # Install frontend dependencies
npm run dev       # Vite dev server at http://localhost:3000
npm run build     # Build to build/ directory
```

No tests or linting scripts are configured.

## Project Structure

Two co-located packages sharing one repo. The frontend lives in a subdirectory that shares the same name as the repo root — navigate carefully.

```
/ (root)
├── package.json                          # Server scripts + concurrently runner
├── game.db                               # SQLite file created on first server start (CWD-relative)
├── server/                               # Express backend (port 3001)
│   ├── index.ts                          # App entry, mounts /api/auth and /api/scores
│   ├── db.ts                             # better-sqlite3 init, WAL mode, FK enforcement
│   ├── middleware.ts                     # JWT requireAuth middleware + JWT_SECRET constant
│   ├── auth.ts                           # POST /signup, POST /signin (bcrypt + JWT)
│   └── scores.ts                         # POST / (save score), GET /me (last 10)
└── claude_code_treasure_game-initial/    # React frontend (port 3000)
    ├── vite.config.ts                    # port 3000, proxies /api → :3001, @ alias → src/
    └── src/
        ├── App.tsx                       # All game state, auth state, and game logic
        ├── components/AuthScreen.tsx     # Sign-up / sign-in / guest UI gate
        ├── lib/api.ts                    # Typed fetch helpers; stores JWT in localStorage
        ├── types/auth.ts                 # User, AuthResponse, GameResult, ScoreEntry types
        ├── components/ui/                # ~40 shadcn/ui Radix wrappers (mostly unused)
        ├── assets/                       # Chest state PNGs, key cursor icon
        └── audios/                       # MP3 sound effects
```

## Backend (`server/`)

Express on port 3001, better-sqlite3. Database file `game.db` is created in the root directory on first run (path is `process.cwd()`-relative, so always run the server from the repo root).

**API routes:**
- `POST /api/auth/signup` — `{ username, email, password }` → `{ token, user }`
- `POST /api/auth/signin` — `{ email, password }` → `{ token, user }`
- `POST /api/scores` — `{ score, result: 'win'|'tie'|'loss' }` (Bearer token required) → `{ id }`
- `GET /api/scores/me` — last 10 scores for authenticated user (Bearer token required)

**Auth:** Passwords hashed with bcrypt (10 rounds). JWT tokens expire in **24h**, signed with secret defaulting to `treasure-game-secret-key`; override with `JWT_SECRET` env var. The JWT payload carries only `{ userId }` — the full user object is stored separately in `treasure_user` localStorage.

**DB schema:** `users (id, username, email, password_hash, created_at)` and `scores (id, user_id, score, result, played_at)` with FK from scores → users. Unique constraints on `email` and `username` — duplicate signup returns HTTP 409.

## Frontend (`claude_code_treasure_game-initial/`)

React 18 + Vite + SWC SPA. Entry: `index.html` → `src/main.tsx` → `src/App.tsx`. Use the `@` alias for imports from `src/` (e.g. `@/lib/api`).

**Vite config note:** `vite.config.ts` maps versioned package names (e.g. `'lucide-react@0.487.0'`) to their bare names. This strips version suffixes from Figma-generated imports — don't remove these aliases.

### App flow

`App.tsx` gates on auth state: if neither `user` nor `isGuest` is set, it renders `<AuthScreen>` (sign-up / sign-in / continue as guest). Once authenticated or in guest mode, `initializeGame()` runs and the game board renders.

On mount, the app restores a session by reading `treasure_token` from localStorage and decoding the JWT payload locally to check expiry — no server request is made. The server enforces token validity on every actual API call.

When the game ends (`gameEnded` becomes true), if a user is signed in the score is auto-saved via `api.saveScore()` (fire-and-forget, errors are silently discarded).

### Game logic (`src/App.tsx`)

State:
- `boxes` — `{ id, isOpen, hasTreasure }[]` (3 boxes, one randomly has treasure)
- `score` — `+100` for treasure, `-50` for skeleton
- `gameEnded` — true when treasure found or all boxes opened
- `user` / `isGuest` / `authChecked` — auth state

`openBox(boxId)` plays the corresponding sound (`chest_open.mp3` for treasure, `chest_open_with_evil_laugh.mp3` for skeleton) via `new Audio(...).play()`. The key cursor (`key.png`) is applied via inline `cursor: url(...) 8 8, pointer` on each closed chest.

Score is computed inside the `setBoxes` updater using the `score` value captured from the outer closure. This is safe because `gameEnded` prevents re-entry, but be aware of the stale-closure pattern if adding multi-box interactions.

### `src/lib/api.ts`

Thin typed wrapper around `fetch`. Reads/writes JWT from localStorage key `treasure_token`. All calls go to relative `/api/...` paths (Vite proxies them to port 3001 in dev). `api.getMyScores()` is implemented but **not yet wired into the UI** — score history display is a pending feature.

### Styling

Tailwind CSS. OkLCH color variables and light/dark mode (`.dark` class) defined in `src/styles/globals.css`. Animations via the `motion` library (chest open: `rotateY: 180`, result badge: scale-in).
