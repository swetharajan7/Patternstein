# Breast Cancer Detection API

FastAPI backend for breast cancer detection using ONNX Runtime.

## Features

- ✅ Fast inference with ONNX Runtime
- ✅ RESTful API with FastAPI
- ✅ CORS enabled for frontend integration
- ✅ Efficient image preprocessing
- ✅ Binary classification (Normal vs Malignant)
- ✅ Confidence scores and interpretations

## Setup

### 1. Install Dependencies

```bash
cd pathology-agent/api
pip install -r requirements.txt
```

### 2. Download/Create Model

```bash
# Install PyTorch for model creation (one-time)
pip install torch torchvision

# Create dummy model for testing
python download_model.py
```

**⚠️ Important**: The dummy model is for testing only. For production:
- Train on BreakHis dataset (7,909 breast cancer histopathology images)
- Or use BACH dataset (Breast Cancer Histology Challenge)
- Achieve >95% accuracy before deployment

### 3. Run API Locally

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: `http://localhost:8000`

### 4. Test API

```bash
# Health check
curl http://localhost:8000/health

# Test prediction (replace with actual image path)
curl -X POST "http://localhost:8000/predict/breast" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test_image.jpg"
```

## API Endpoints

### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "message": "AI Models Online and Ready"
}
```

### POST `/predict/breast`
Predict breast cancer from histopathology image

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "prediction": "Normal (Benign)" | "Malignant (Cancerous)",
  "confidence": 0.95,
  "predicted_class": 0 | 1,
  "color": "#00ff88" | "#ff6b6b",
  "interpretation": "Detailed interpretation text..."
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t breast-cancer-api .

# Run container
docker run -p 8000:8000 breast-cancer-api
```

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/breast-cancer-api

# Deploy to Cloud Run
gcloud run deploy breast-cancer-api \
  --image gcr.io/YOUR_PROJECT_ID/breast-cancer-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Model Training (Production)

For production deployment, train a proper model:

```python
# Example training pipeline
import torch
import torchvision.models as models
from torch.utils.data import DataLoader

# 1. Load BreakHis dataset
# 2. Create data loaders
# 3. Fine-tune EfficientNet-B0
model = models.efficientnet_b0(pretrained=True)
model.classifier[1] = torch.nn.Linear(1280, 2)

# 4. Train with cross-entropy loss
# 5. Validate on test set (target: >95% accuracy)
# 6. Export to ONNX
torch.onnx.export(model, dummy_input, "breast_cancer_model.onnx")
```

## Performance

- **Inference Time**: <100ms per image (CPU)
- **Model Size**: ~17MB (EfficientNet-B0)
- **Input Size**: 224x224 RGB
- **Accuracy Target**: >95%

## Frontend Integration

Update your `pathology-agent.html`:

```javascript
const API_URL = 'http://localhost:8000';  // or your deployed URL

// The existing code will work with this API!
```

## Troubleshooting

**Model not loading:**
- Ensure `models/breast_cancer_model.onnx` exists
- Run `python download_model.py` to create it

**CORS errors:**
- API has CORS enabled for all origins
- In production, restrict to your domain

**Low accuracy:**
- Replace dummy model with properly trained model
- Use medical-grade dataset
- Validate with pathologist review

## License

Research/Educational use only. Not for clinical diagnosis.
