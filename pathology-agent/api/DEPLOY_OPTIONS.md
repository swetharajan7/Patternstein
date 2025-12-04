# Deployment Options for Breast Cancer API

Your trained model is ready! Here are your deployment options:

---

## Option 1: Google Cloud Run (Recommended for patternstein.com)

### Prerequisites
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run: `gcloud auth login`
3. Run: `gcloud config set project YOUR_PROJECT_ID`

### Deploy
```bash
cd pathology-agent/api
./deploy.sh
```

**Pros:**
- Scales automatically
- Pay only for usage (free tier available)
- HTTPS by default
- Your frontend already points to Cloud Run URL

**Cons:**
- Requires gcloud CLI installation

---

## Option 2: Deploy via Google Cloud Console (No CLI needed)

### Steps:
1. Go to: https://console.cloud.google.com/run
2. Click "Create Service"
3. Select "Deploy one revision from an existing container image"
4. Click "Set up Cloud Build" to build from source
5. Connect your GitHub repo: `swetharajan7/Patternstein`
6. Set source location: `/pathology-agent/api`
7. Set Dockerfile path: `/pathology-agent/api/Dockerfile`
8. Configure:
   - Region: `us-central1`
   - Memory: `2 GiB`
   - CPU: `2`
   - Allow unauthenticated invocations: ✅
9. Click "Create"

**Pros:**
- No CLI installation needed
- Visual interface
- Automatic builds from GitHub

**Cons:**
- More clicks than CLI

---

## Option 3: Run Locally and Use ngrok (Quick Test)

### Steps:
1. Start your API locally:
```bash
cd pathology-agent/api
python3 -m uvicorn main:app --reload
```

2. In another terminal, install and run ngrok:
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 8000
```

3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

4. Update `pathology-agent.html` line 1305:
```javascript
const API_URL = 'https://abc123.ngrok.io';
```

5. Commit and push to GitHub

**Pros:**
- Instant deployment
- No cloud setup needed
- Free

**Cons:**
- URL changes every time you restart ngrok
- Your computer must stay on
- Not suitable for production

---

## Option 4: Deploy to Heroku (Alternative Cloud)

### Steps:
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create `Procfile` in `pathology-agent/api`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

3. Deploy:
```bash
cd pathology-agent/api
heroku login
heroku create patternstein-api
git subtree push --prefix pathology-agent/api heroku main
```

**Pros:**
- Simple deployment
- Free tier available
- Good for demos

**Cons:**
- Slower cold starts than Cloud Run
- Different URL than your current setup

---

## Recommended: Option 1 or Option 2

Since your frontend already points to:
```
https://pathology-api-898937761520.us-central1.run.app
```

You should use **Google Cloud Run** (Option 1 or 2) to keep the same URL.

---

## Current Status

✅ Model trained (100% validation accuracy)
✅ API code ready
✅ Dockerfile ready
✅ All dependencies specified
✅ CORS configured for patternstein.com
✅ Code committed to GitHub

**Next step:** Choose a deployment option and follow the steps!

