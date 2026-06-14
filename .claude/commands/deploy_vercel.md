# Deploy to Vercel

Deploy the frontend (React/Vite) to Vercel. The backend uses SQLite which is not compatible with Vercel's serverless environment, so only the frontend is deployed. Guest mode will be fully functional; auth features require a separate backend deployment.

## Steps

1. **Ensure Vercel CLI is installed and logged in**
   ```bash
   vercel --version
   vercel whoami
   ```
   If not logged in: `vercel login`

2. **Build the frontend to verify it compiles cleanly**
   ```bash
   cd claude_code_treasure_game-initial && npm run build
   ```
   Fix any build errors before continuing.

3. **Confirm `vercel.json` exists** in `claude_code_treasure_game-initial/` with SPA rewrite rules.
   If missing, create it with:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

4. **Deploy to Vercel**
   From inside `claude_code_treasure_game-initial/`:
   ```bash
   vercel --yes --prod
   ```

5. **Report the deployment URL** shown in the CLI output (e.g. `https://your-project.vercel.app`).

## Notes
- The `--yes` flag skips interactive prompts using the existing project config.
- On first deploy, Vercel will detect Vite automatically and configure build settings.
- The `/api` proxy defined in `vite.config.ts` is dev-only; on Vercel, API calls will 404 unless the backend is also deployed elsewhere.
- To re-deploy after code changes, repeat step 4.
