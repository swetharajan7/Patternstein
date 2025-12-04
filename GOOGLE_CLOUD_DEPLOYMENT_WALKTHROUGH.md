# 🚀 Google Cloud Console Deployment - Step-by-Step Walkthrough

## Prerequisites
- Google Cloud account (free tier works!)
- Your GitHub repo: `swetharajan7/Patternstein` (already set up ✅)

---

## Step 1: Open Google Cloud Console

1. Go to: **https://console.cloud.google.com**
2. Sign in with your Google account
3. If prompted, accept terms and conditions

---

## Step 2: Navigate to Cloud Run

**Option A: Direct Link**
- Go to: **https://console.cloud.google.com/run**

**Option B: From Menu**
1. Click the **☰ hamburger menu** (top left)
2. Scroll down to **"Serverless"** section
3. Click **"Cloud Run"**

---

## Step 3: Create New Service

You'll see the Cloud Run dashboard.

1. Click the blue **"CREATE SERVICE"** button at the top
   - If you see existing services, that's fine - just click "CREATE SERVICE"

---

## Step 4: Choose Deployment Method

You'll see two options:

1. ✅ Select: **"Continuously deploy from a repository (source or function)"**
   - This will auto-deploy from your GitHub repo
   
2. Click **"SET UP WITH CLOUD BUILD"** button

---

## Step 5: Connect to GitHub Repository

### 5.1 Select Repository Provider
1. You'll see: "Select a repository provider"
2. Click **"GitHub"**

### 5.2 Authenticate GitHub
1. Click **"Authenticate"** or **"Connect"**
2. A popup will open asking you to authorize Google Cloud Build
3. Click **"Authorize Google Cloud Build"**
4. You may need to enter your GitHub password

### 5.3 Select Repository
1. After authentication, you'll see a dropdown: "Select repository"
2. Find and select: **`swetharajan7/Patternstein`**
3. Click **"NEXT"**

---

## Step 6: Configure Build Settings

You'll see "Build configuration" settings:

### 6.1 Branch
- **Branch**: Select `^main$` (or type `main`)
  - This means it will deploy from your main branch

### 6.2 Build Type
- **Build Type**: Select **"Dockerfile"**
  - (NOT "Go", "Node.js", "Python", etc.)

### 6.3 Source Location
- **Source location**: Type `/pathology-agent/api`
  - This is where your Dockerfile is located
  - Make sure to include the leading `/`

### 6.4 Dockerfile Path (if shown)
- If you see "Dockerfile path", enter: `/pathology-agent/api/Dockerfile`

### 6.5 Save
- Click **"SAVE"** button at the bottom

---

## Step 7: Configure Service Settings

Now you'll configure the Cloud Run service:

### 7.1 Service Name
- **Service name**: `pathology-api`
  - (Use this exact name to match your existing URL)

### 7.2 Region
- **Region**: Select **`us-central1 (Iowa)`**
  - This matches your current deployment

### 7.3 CPU Allocation
- **CPU allocation and pricing**: 
  - Select **"CPU is always allocated"**
  - (This ensures faster response times)

### 7.4 Authentication
- **Authentication**: 
  - ✅ Check **"Allow unauthenticated invocations"**
  - This lets your website call the API without authentication

### 7.5 Container Settings (Click "CONTAINER, NETWORKING, SECURITY")

Click the dropdown to expand advanced settings:

#### Memory
- **Memory**: Select **`2 GiB`**
  - Your model is 42 MB, so 2 GB is plenty

#### CPU
- **CPU**: Select **`2`**
  - More CPU = faster inference

#### Request Timeout
- **Request timeout**: `300` seconds
  - Gives enough time for model loading and inference

#### Maximum Requests per Container
- Leave default (usually 80)

#### Minimum Instances
- **Minimum instances**: `0`
  - Saves money (free tier)

#### Maximum Instances
- **Maximum instances**: `10`
  - Prevents runaway costs

---

## Step 8: Create the Service

1. Review all settings
2. Click the blue **"CREATE"** button at the bottom

---

## Step 9: Wait for Deployment

You'll see a build progress screen:

1. **Building**: Cloud Build is creating your Docker container
   - This takes **3-5 minutes**
   - You'll see logs scrolling

2. **Deploying**: Pushing container to Cloud Run
   - Takes another **1-2 minutes**

3. **Done**: You'll see a green checkmark ✅

---

## Step 10: Get Your API URL

After deployment completes:

1. You'll see your service details page
2. At the top, you'll see the **URL**:
   ```
   https://pathology-api-XXXXXXXXXX.us-central1.run.app
   ```

3. **Copy this URL**

### Expected URL
Your URL should be:
```
https://pathology-api-898937761520.us-central1.run.app
```

If it's different, you'll need to update your frontend (see Step 12).

---

## Step 11: Test Your Deployment

### Test 1: Health Check
Open in browser or use curl:
```
https://pathology-api-898937761520.us-central1.run.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "message": "AI Models Online and Ready"
}
```

### Test 2: Interactive API Docs
Open in browser:
```
https://pathology-api-898937761520.us-central1.run.app/docs
```

You should see the FastAPI interactive documentation!

### Test 3: Upload an Image
1. Go to `/docs` URL above
2. Click on **POST /predict/breast**
3. Click **"Try it out"**
4. Click **"Choose File"** and upload a test image
5. Click **"Execute"**
6. You should see a prediction response!

---

## Step 12: Update Frontend (If URL Changed)

If your URL is different from the expected one:

1. Open `pathology-agent.html`
2. Find line 1305:
   ```javascript
   const API_URL = 'https://pathology-api-898937761520.us-central1.run.app';
   ```
3. Replace with your new URL
4. Commit and push to GitHub:
   ```bash
   git add pathology-agent.html
   git commit -m "Update API URL"
   git push origin main
   ```

---

## Step 13: Test on Live Site

1. Go to: **https://patternstein.com/pathology-agent.html**
2. Upload a breast cancer histopathology image
3. Click "Analyze"
4. You should see:
   - Prediction (Benign or Malignant)
   - Confidence score
   - Medical interpretation
   - Color-coded result

---

## 🎉 Success!

Your breast cancer detection API is now live!

---

## Troubleshooting

### Build Failed
**Error**: "Could not find Dockerfile"
- **Fix**: Make sure source location is `/pathology-agent/api` (with leading `/`)

**Error**: "requirements.txt not found"
- **Fix**: Check that all files are committed to GitHub

### Deployment Failed
**Error**: "Service account does not have permission"
- **Fix**: Enable Cloud Build API and Cloud Run API in your project

### Model Not Loading
**Error**: "Model file not found"
- **Fix**: Make sure `models/breast_cancer_model.onnx` is committed to GitHub
- Check file size: Should be 42.63 MB

### CORS Errors
**Error**: "Access-Control-Allow-Origin"
- **Fix**: Already configured in `main.py` - should work automatically

### 404 Not Found
**Error**: "Service not found"
- **Fix**: Make sure service name is `pathology-api` and region is `us-central1`

---

## Cost Monitoring

### Free Tier Includes:
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

### Your Usage:
- Hackathon demo: **Will stay in free tier**
- Each request: ~1-2 seconds
- Expected: <1000 requests for demo

### Check Costs:
1. Go to: https://console.cloud.google.com/billing
2. View current month charges
3. Should show $0.00 for demo usage

---

## Automatic Redeployment

Good news! Now that it's set up:

1. **Every time you push to GitHub main branch**
2. **Cloud Build automatically rebuilds**
3. **Cloud Run automatically redeploys**

So if you update your model or code:
```bash
git add -A
git commit -m "Update model"
git push origin main
```

Wait 3-5 minutes, and your live site will have the new version!

---

## Need Help?

If you get stuck at any step:

1. **Check Cloud Build logs**: 
   - Go to: https://console.cloud.google.com/cloud-build/builds
   - Click on the latest build
   - Check logs for errors

2. **Check Cloud Run logs**:
   - Go to your service page
   - Click "LOGS" tab
   - Look for errors

3. **Common issues**:
   - GitHub authentication: Re-authenticate
   - Permissions: Enable required APIs
   - File paths: Double-check `/pathology-agent/api`

---

## Summary Checklist

- [ ] Opened Google Cloud Console
- [ ] Navigated to Cloud Run
- [ ] Created new service
- [ ] Connected GitHub repo: `swetharajan7/Patternstein`
- [ ] Set branch: `main`
- [ ] Set build type: `Dockerfile`
- [ ] Set source location: `/pathology-agent/api`
- [ ] Configured service name: `pathology-api`
- [ ] Set region: `us-central1`
- [ ] Set memory: `2 GiB`
- [ ] Set CPU: `2`
- [ ] Allowed unauthenticated invocations
- [ ] Clicked CREATE
- [ ] Waited for build (3-5 min)
- [ ] Tested `/health` endpoint
- [ ] Tested on patternstein.com
- [ ] 🎉 Working!

---

**Your trained breast cancer detection model is ready to go live! Follow these steps and you'll be deployed in under 10 minutes.** 🚀

