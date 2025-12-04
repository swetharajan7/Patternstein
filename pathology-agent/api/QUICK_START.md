# 🚀 Quick Start Guide

Get your breast cancer detection API running in 5 minutes!

## Option 1: Automated Setup (Recommended)

### On Mac/Linux:
```bash
cd pathology-agent/api
chmod +x setup.sh
./setup.sh
```

### On Windows:
```cmd
cd pathology-agent\api
setup.bat
```

## Option 2: Manual Setup

### Step 1: Install Dependencies (2 min)

```bash
cd pathology-agent/api
pip install -r requirements.txt
pip install torch torchvision
```

### Step 2: Get a Model (2 min)

**Choose ONE of these options:**

#### A. Create Fine-tuned Model (Easiest)
```bash
python download_model.py
# Select option 1
```

This creates an EfficientNet-B0 model with ImageNet weights (~17 MB).

#### B. Download from Hugging Face
```bash
python download_model.py
# Select option 2
# Enter: keremberke/breast-cancer-classifier
# Enter: model.onnx
```

#### C. Use Your Own Model
Place your ONNX model at: `models/breast_cancer_model.onnx`

### Step 3: Start API (1 min)

```bash
uvicorn main:app --reload
```

API runs at: http://localhost:8000

## ✅ Verify It Works

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "message": "AI Models Online and Ready"
}
```

### Test 2: Run Test Script
```bash
python test_api.py
```

### Test 3: Interactive API Docs
Open in browser: http://localhost:8000/docs

Try the `/predict/breast` endpoint with a test image!

## 🌐 Connect to Frontend

Update `pathology-agent.html` (line ~300):

```javascript
const API_URL = 'http://localhost:8000';  // Change this line
```

Then open `pathology-agent.html` in your browser and upload an image!

## 📊 Model Information

### Default Model (Option 1):
- **Architecture**: EfficientNet-B0
- **Pre-training**: ImageNet
- **Size**: ~17 MB
- **Input**: 224x224 RGB images
- **Output**: Binary (Normal/Malignant)
- **Inference**: <100ms on CPU

⚠️ **Note**: This model is pre-trained on ImageNet, NOT breast cancer data. For production:
1. Fine-tune on BreakHis dataset
2. Validate with medical professionals
3. Achieve >95% accuracy

## 🔧 Troubleshooting

### Problem: "Model not found"
**Solution**:
```bash
python download_model.py
# Select option 1 to create model
```

### Problem: "PyTorch not installed"
**Solution**:
```bash
pip install torch torchvision
```

### Problem: "CORS error in browser"
**Solution**: API has CORS enabled. Make sure API is running at the URL specified in frontend.

### Problem: "Port 8000 already in use"
**Solution**:
```bash
# Use different port
uvicorn main:app --reload --port 8001

# Update frontend API_URL to match
```

### Problem: "Low accuracy predictions"
**Solution**: The default model needs training on breast cancer data. See MODEL_SOURCES.md for pre-trained models.

## 📚 Next Steps

### For Testing:
- ✅ You're ready! Upload images and test

### For Production:
1. **Get real model**: See MODEL_SOURCES.md
2. **Train on BreakHis**: 7,909 histopathology images
3. **Validate**: Achieve >95% accuracy
4. **Deploy**: Use Docker or Google Cloud Run
5. **Medical review**: Have pathologists validate

## 🚀 Deployment

### Deploy to Google Cloud Run:

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/breast-cancer-api
gcloud run deploy --image gcr.io/YOUR_PROJECT_ID/breast-cancer-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Get your API URL
gcloud run services describe breast-cancer-api --region us-central1
```

Update frontend with your deployed URL!

## 📞 Need Help?

- **API Docs**: http://localhost:8000/docs
- **Model Sources**: See MODEL_SOURCES.md
- **Full README**: See README.md
- **Test Script**: `python test_api.py`

## ⚡ Quick Commands Reference

```bash
# Start API
uvicorn main:app --reload

# Start API on different port
uvicorn main:app --reload --port 8001

# Test API
python test_api.py

# Create model
python download_model.py

# View logs
# (logs appear in terminal where uvicorn is running)

# Stop API
# Press Ctrl+C in terminal
```

## 🎯 Success Checklist

- [ ] Dependencies installed
- [ ] Model downloaded/created
- [ ] API starts without errors
- [ ] Health check returns "healthy"
- [ ] Test script runs successfully
- [ ] Can upload image via /docs interface
- [ ] Frontend connects to API
- [ ] Predictions return results

If all checked, you're ready to go! 🎉
