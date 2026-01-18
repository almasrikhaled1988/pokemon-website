# Deploying to Google Cloud Run (Cheapest & Easiest Way)

## 1. Prerequisites
Ensure you have the Google Cloud SDK installed and you are logged in:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```
*(Replace `YOUR_PROJECT_ID` with your actual GCP Project ID)*

## 2. Deploy Command
Run this command in your terminal. It will build your container remotely and deploy it.

**Important:** We are checking two environments variables in `.env` (your Gemini API Key and Cloudflare Worker credentials) and passing them securely during deployment.

Replace the placeholders `YOUR_GEMINI_KEY`, `YOUR_WORKER_URL`, and `YOUR_WORKER_TOKEN` below with your actual values from your `.env` file.

```powershell
gcloud run deploy pokemon-fusion-lab `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3001 `
  --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_KEY",CF_WORKER_URL="YOUR_WORKER_URL",CF_WORKER_TOKEN="YOUR_WORKER_TOKEN"
```

## 3. What Happens Next?
1.  Google Cloud will upload your source code.
2.  It will build the Docker container (running `npm install` and `npm run build`).
3.  It will create a "Service" URL (e.g., `https://pokemon-fusion-lab-xyz123-uc.a.run.app`).
4.  **Cost**: Since you will have low traffic, this will likely be **FREE** or cost pennies per month (you pay only when the server is processing a request).

## Troubleshooting
If the build fails, ensure:
1.  Cloud Build API is enabled in your GCP console.
2.  Cloud Run API is enabled.
