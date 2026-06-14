# Deploy to GitHub Pages

Deploy the frontend (React/Vite) to GitHub Pages. The backend uses SQLite which is not compatible with GitHub Pages' static hosting, so only the frontend is deployed. Guest mode will be fully functional; auth features require a separate backend deployment.

## Prerequisites

- [GitHub CLI](https://cli.github.com/) installed (`winget install GitHub.cli` on Windows)
- Logged in: `gh auth login`
- Git configured: `git config --global user.name` / `git config --global user.email`

## Steps

1. **Confirm `gh` CLI is installed and authenticated**
   ```bash
   gh --version
   gh auth status
   ```
   If not logged in: `gh auth login`

2. **Choose a repo name** (default: `claude-code-treasure-game`)
   GitHub Pages will serve the site at:
   `https://<your-github-username>.github.io/<repo-name>/`

3. **Set Vite `base` to match the repo name**
   Edit `claude_code_treasure_game-initial/vite.config.ts` and add `base` inside `defineConfig`:
   ```ts
   export default defineConfig({
     base: '/<repo-name>/',
     // ... rest of config
   })
   ```

4. **Build the frontend**
   ```bash
   cd claude_code_treasure_game-initial && npm run build
   ```
   Fix any build errors before continuing.

5. **Initialise git and create the GitHub repo** (first time only)
   From the repo root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create <repo-name> --public --source=. --remote=origin --push
   ```
   If the repo already exists and has an `origin` remote, just push:
   ```bash
   git push -u origin main
   ```

6. **Deploy the `build/` folder to the `gh-pages` branch**
   From inside `claude_code_treasure_game-initial/`:
   ```bash
   npx gh-pages -d build
   ```

7. **Enable GitHub Pages** (only needed on first deploy)
   ```bash
   gh api repos/<owner>/<repo-name>/pages \
     --method POST \
     -f "source[branch]=gh-pages" \
     -f "source[path]=/"
   ```

8. **Report the URL**
   ```
   https://<your-github-username>.github.io/<repo-name>/
   ```
   GitHub Pages takes ~30–60 seconds to go live after the first deploy.

## Notes

- The `base` in `vite.config.ts` must exactly match the repo name (including leading/trailing `/`), otherwise assets will 404.
- The `/api` proxy defined in `vite.config.ts` is dev-only; on GitHub Pages, API calls will 404 unless the backend is deployed elsewhere.
- To re-deploy after code changes: rebuild (`npm run build`) then repeat step 6.
- The `gh-pages` branch is managed automatically — do not edit it manually.
