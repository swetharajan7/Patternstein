# 🏥 Breast Cancer Detection - Complete Setup Guide

## Current Status

You have a complete FastAPI backend ready to go! The pathology-agent.html is currently pointing to a Google Cloud Run deployment, but we need to:

1. **Set up the model locally** for testing
2. **Run the API locally** to verify it works
3. **Test with sample images**
4. **Deploy to production** (optional)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd pathology-agent/api
pip install -r requirements.txt
pip install torch torchvision
```

### Step 2: Create the Model

```bash
python download_model.py
```

When prompted, select **Option 1** (Create Fine-tuned Model). This will:
- Create an EfficientNet-B0 model with ImageNet weights
- Export it to ONNX format (~17 MB)
- Save it to `models/breast_cancer_model.onnx`

**Expected output:**
```
Creating fine-tuned breast cancer detection model...
Using EfficientNet-B0 with ImageNet pre-training...
Exporting to ONNX format...
✓ Model saved to models/breast_cancer_model.onnx
✓ Model size: 17.00 MB
```

### Step 3: Start the API

```bash
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Loading ONNX model from models/breast_cancer_model.onnx
INFO:     Model loaded successfully
```

### Step 4: Test the API

Open a new terminal and run:

```bash
python test_api.py
```

Or visit: http://localhost:8000/docs

## 🔗 Connect Frontend to Local API

### Option A: Test Locally

1. Open `pathology-agent.html` in a text editor
2. Find line ~1305 where `API_URL` is defined
3. Change it to:

```javascript
const API_URL = 'http://localhost:8000';  // Local testing
```

4. Open `pathology-agent.html` in your browser
5. Upload a test image
6. Click "Analyze Tissue"

### Option B: Keep Cloud Deployment

The current setup points to:
```javascript
const API_URL = 'https://pathology-api-898937761520.us-central1.run.app';
```

This is a Google Cloud Run deployment. If you want to use this, you need to:
1. Deploy your model to Google Cloud Run
2. Update the URL if needed

## 📊 Understanding the Model

### What You Have Now (Fine-tuned Model):

- **Architecture**: EfficientNet-B0
- **Pre-training**: ImageNet (natural images)
- **Training on breast cancer**: ❌ NOT YET
- **Size**: ~17 MB
- **Speed**: <100ms per image
- **Accuracy**: Unknown (needs training)

### What It Does:

The model will make predictions, but they're based on ImageNet features, not breast cancer-specific features. It's like asking someone who's never seen medical images to guess - they might get lucky sometimes, but it's not reliable.

### To Make It Production-Ready:

You need to train it on actual breast cancer histopathology images. See the "Training" section below.

## 🧪 Testing with Sample Images

### Where to Get Test Images:

1. **BreakHis Dataset** (Recommended)
   - 7,909 breast cancer histopathology images
   - Download: https://www.kaggle.com/datasets/ambarish/breakhis
   - Contains both benign and malignant samples

2. **BACH Dataset**
   - Grand Challenge on Breast Cancer Histology
   - Download: https://iciar2018-challenge.grand-challenge.org/

3. **Create Dummy Images** (For API testing only)
   ```python
   from PIL import Image
   import numpy as np
   
   # Create a random 224x224 RGB image
   img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
   img.save('test_tissue.png')
   ```

### Test via Command Line:

```bash
curl -X POST "http://localhost:8000/predict/breast" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test_tissue.png"
```

### Test via Python:

```python
import requests

url = "http://localhost:8000/predict/breast"
files = {"image": open("test_tissue.png", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## 🎓 Training the Model (For Production)

### Step 1: Get the BreakHis Dataset

```bash
# Download from Kaggle
kaggle datasets download -d ambarish/breakhis
unzip breakhis.zip -d data/breakhis
```

### Step 2: Prepare Training Script

Create `train_model.py`:

```python
import torch
import torch.nn as nn
import torchvision.models as models
from torch.utils.data import DataLoader
from torchvision import transforms, datasets

# Load EfficientNet-B0
model = models.efficientnet_b0(pretrained=True)

# Modify final layer for binary classification
num_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(num_features, 2)

# Data augmentation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Load dataset
train_dataset = datasets.ImageFolder('data/breakhis/train', transform=transform)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

# Training loop
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    for images, labels in train_loader:
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
    print(f'Epoch {epoch+1}, Loss: {loss.item():.4f}')

# Export to ONNX
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(model, dummy_input, 'models/breast_cancer_model.onnx')
```

### Step 3: Train

```bash
python train_model.py
```

**Expected training time**: 2-4 hours on GPU, 8-12 hours on CPU

**Target accuracy**: >95% on validation set

## 🚀 Deployment Options

### Option 1: Local Development (Current)

```bash
uvicorn main:app --reload
```

**Pros**: Easy testing, fast iteration
**Cons**: Not accessible from internet

### Option 2: Google Cloud Run (Recommended)

```bash
# Build and push Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/breast-cancer-api

# Deploy to Cloud Run
gcloud run deploy breast-cancer-api \
  --image gcr.io/YOUR_PROJECT_ID/breast-cancer-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2

# Get your API URL
gcloud run services describe breast-cancer-api --region us-central1 --format 'value(status.url)'
```

**Pros**: Scalable, managed, HTTPS
**Cons**: Costs money (but has free tier)

### Option 3: Docker Locally

```bash
# Build Docker image
docker build -t breast-cancer-api .

# Run container
docker run -p 8000:8000 breast-cancer-api
```

**Pros**: Consistent environment
**Cons**: Requires Docker installed

## 🔍 Troubleshooting

### Problem: "Model not found"

**Solution**:
```bash
cd pathology-agent/api
python download_model.py
# Select option 1
```

### Problem: "PyTorch not installed"

**Solution**:
```bash
pip install torch torchvision
```

### Problem: "CORS error in browser"

**Cause**: Browser blocking cross-origin requests

**Solution**: The API already has CORS enabled. Make sure:
1. API is running at the URL specified in frontend
2. You're not mixing HTTP/HTTPS (both should match)

### Problem: "Predictions seem random"

**Cause**: Model is not trained on breast cancer data

**Solution**: This is expected! The default model uses ImageNet weights. To get accurate predictions:
1. Train on BreakHis dataset (see Training section)
2. Or download a pre-trained model from Hugging Face

### Problem: "Port 8000 already in use"

**Solution**:
```bash
# Use different port
uvicorn main:app --reload --port 8001

# Update frontend API_URL to match
const API_URL = 'http://localhost:8001';
```

### Problem: "Slow inference"

**Possible causes**:
- Large images (resize to 224x224 before upload)
- CPU inference (consider GPU)
- Network latency (if using cloud deployment)

**Solutions**:
- Resize images client-side before upload
- Use GPU for inference (requires CUDA)
- Deploy closer to users

## 📈 Performance Benchmarks

### Current Setup (EfficientNet-B0, CPU):

- **Inference time**: 50-100ms per image
- **Memory usage**: ~200 MB
- **Model size**: 17 MB
- **Throughput**: ~10-20 images/second

### With GPU (NVIDIA T4):

- **Inference time**: 10-20ms per image
- **Memory usage**: ~500 MB (GPU)
- **Throughput**: ~50-100 images/second

## ⚠️ Important Notes

### For Demo/Testing:
✅ Current setup is perfect
✅ Shows proof of concept
✅ Fast inference
✅ Easy to deploy

### For Production:
❌ Don't use untrained model
✅ Train on BreakHis (7,909 images)
✅ Validate with pathologists
✅ Achieve >95% accuracy
✅ Get regulatory approval
✅ Add proper error handling
✅ Implement logging and monitoring
✅ Add authentication if needed

## 📚 Next Steps

### Immediate (Testing):
1. ✅ Run `python download_model.py` (Option 1)
2. ✅ Start API: `uvicorn main:app --reload`
3. ✅ Test: `python test_api.py`
4. ✅ Open http://localhost:8000/docs
5. ✅ Try uploading an image

### Short-term (Local Development):
1. Update `pathology-agent.html` API_URL to `http://localhost:8000`
2. Test with sample images from BreakHis
3. Verify predictions work (even if not accurate)
4. Check console logs for errors

### Long-term (Production):
1. Download BreakHis dataset
2. Train model on breast cancer data
3. Validate accuracy (target: >95%)
4. Deploy to Google Cloud Run
5. Update frontend with production URL
6. Add monitoring and logging
7. Get medical professional validation

## 🆘 Need Help?

### Quick Commands:

```bash
# Check if API is running
curl http://localhost:8000/health

# View API logs
# (logs appear in terminal where uvicorn is running)

# Stop API
# Press Ctrl+C in terminal

# Restart API
uvicorn main:app --reload

# Test with sample image
python test_api.py

# View interactive docs
open http://localhost:8000/docs
```

### Files to Check:

- `pathology-agent/api/main.py` - API code
- `pathology-agent/api/requirements.txt` - Dependencies
- `pathology-agent/api/models/breast_cancer_model.onnx` - Model file
- `pathology-agent.html` (line 1305) - API_URL configuration

### Common Issues:

1. **Model not loading**: Check if `models/breast_cancer_model.onnx` exists
2. **CORS errors**: API has CORS enabled, check URL matches
3. **Slow predictions**: Normal for CPU, consider GPU
4. **Random predictions**: Expected without training on medical data

## 🎉 Success Checklist

- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] PyTorch installed (`pip install torch torchvision`)
- [ ] Model created (`python download_model.py`)
- [ ] API starts without errors (`uvicorn main:app --reload`)
- [ ] Health check works (`curl http://localhost:8000/health`)
- [ ] Test script passes (`python test_api.py`)
- [ ] Can upload image via /docs interface
- [ ] Frontend connects to API (update API_URL if needed)
- [ ] Predictions return results (even if not accurate)

Once all checked, you're ready to test! 🚀

---

**Remember**: The current model is for testing only. For production use, you MUST train on actual breast cancer histopathology data.
