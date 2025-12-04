# Deploy Breast Cancer API to Live Site

## Quick Deploy (Automated)

```bash
cd pathology-agent/api
./deploy.sh
```

This will:
1. Build Docker container with your trained model
2. Deploy to Google Cloud Run
3. Give you the live URL

---

## Manual Deploy (Step by Step)

### Step 1: Check gcloud is installed

```bash
gcloud --version
```

If not installed: https://cloud.google.com/sdk/docs/install

### Step 2: Set your project

```bash
# List your projects
gcloud projects list

# Set the project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Build the container

```bash
cd pathology-agent/api

# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/breast-cancer-api
```

This will take 2-5 minutes.

### Step 4: Deploy to Cloud Run

```bash
gcloud run deploy pathology-api \
  --image gcr.io/YOUR_PROJECT_ID/breast-cancer-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

### Step 5: Get your API URL

```bash
gcloud run services describe pathology-api \
  --region us-central1 \
  --format 'value(status.url)'
```

This will output something like:
```
https://pathology-api-898937761520.us-central1.run.app
```

### Step 6: Update your frontend

Your frontend already points to:
```
https://pathology-api-898937761520.us-central1.run.app
```

If the URL is different, update `pathology-agent.html` line 1305.

---

## Test Your Deployment

```bash
# Health check
curl https://YOUR-API-URL/health

# Should return:
# {"status":"healthy","model_loaded":true,"message":"AI Models Online and Ready"}
```

---

## Troubleshooting

### "gcloud: command not found"
Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install

### "No project configured"
```bash
gcloud config set project YOUR_PROJECT_ID
```

### "Permission denied"
```bash
gcloud auth login
```

### "Build failed"
Check that you're in the `pathology-agent/api` directory and all files exist:
- `Dockerfile`
- `main.py`
- `requirements.txt`
- `models/breast_cancer_model.onnx`

---

## What Gets Deployed

✅ FastAPI backend (`main.py`)
✅ Trained ONNX model (42.63 MB)
✅ All dependencies
✅ CORS enabled for patternstein.com
✅ Health check endpoint
✅ Breast cancer prediction endpoint

---

## Cost Estimate

Google Cloud Run pricing:
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.40 per million requests
- **Your usage**: Likely stays in free tier for hackathon demo

---

## After Deployment

Your live site at **patternstein.com** will be able to:
1. Upload breast cancer histopathology images
2. Get real-time predictions (benign vs malignant)
3. See confidence scores
4. Get medical interpretations

**The model is trained and ready to classify!**

