# SkillSync Deployment Guide (Vercel & Cloud)

This guide covers deploying **SkillSync Career Intelligence** to **Vercel** and connected cloud services.

Repository: **[https://github.com/r19003/skillsync_analyser](https://github.com/r19003/skillsync_analyser)**

---

## Method 1: 1-Click Deployment via Vercel Dashboard (Recommended)

1. Navigate to **[vercel.com/new](https://vercel.com/new)**.
2. Under **Import Git Repository**, select **`r19003/skillsync_analyser`**.
3. Configure the project:
   - **Framework Preset**: `Vite` (or `Other`)
   - **Root Directory**: `./` (leave default, the included `vercel.json` automatically orchestrates the client build and serverless API rewrites).
   - If deploying the frontend independently: Set Root Directory to `client`.
4. Under **Environment Variables**, add:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0...mongodb.net/skillsync?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=production
   GEMINI_API_KEY=your_gemini_api_key (optional)
   GROK_API_KEY=your_grok_api_key (optional)
   ```
5. Click **Deploy**. Vercel will build the frontend assets, set up the serverless `/api/*` endpoints, and issue a live SSL URL (e.g. `https://skillsync-analyser.vercel.app`).

---

## Method 2: Deployment via Vercel CLI

1. Run the device authorization:
   ```bash
   npx vercel login
   ```
   Or visit the active authorization link:
   **[https://vercel.com/oauth/device?user_code=NZDZ-ZZRV](https://vercel.com/oauth/device?user_code=NZDZ-ZZRV)** (Code: `NZDZ-ZZRV`).

2. Deploy the project:
   ```bash
   npx vercel --prod
   ```

---

## Method 3: Deploying the Python Microservice (`personalization-service`)

The Python FastAPI microservice (`personalization-service`) provides the adaptive roadmap DAG scheduler and benchmark assessment analyzer:

1. **Option A: Render / Railway (Free & Fast)**
   - Connect the repo `r19003/skillsync_analyser`.
   - Root directory: `personalization-service`.
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Copy the deployed service URL (e.g. `https://personalization-service.onrender.com`).
   - In your Vercel project environment variables, add:
     ```env
     PERSONALIZATION_SERVICE_URL=https://personalization-service.onrender.com
     ```

2. **Option B: Standalone Node Fallback**
   - If the Python microservice is not hosted, the Node.js backend automatically falls back to its built-in deterministic scheduler and diagnostic benchmark question bank.
