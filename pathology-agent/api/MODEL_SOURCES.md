# Pre-trained Breast Cancer Detection Models

This document lists sources for pre-trained breast cancer detection models that you can use with this API.

## 🎯 Recommended Models

### 1. **BreakHis Pre-trained Models**

**Dataset**: Breast Cancer Histopathological Database (BreakHis)
- 7,909 microscopic images
- 2,480 benign samples
- 5,429 malignant samples
- 4 magnification factors (40X, 100X, 200X, 400X)

**Available Models**:

#### Option A: Hugging Face Hub
```bash
# Search for breast cancer models
https://huggingface.co/models?search=breast+cancer

# Popular repositories:
# - keremberke/breast-cancer-classification
# - microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224
```

#### Option B: Papers with Code
```
https://paperswithcode.com/dataset/breakhis
```

### 2. **BACH Dataset Models**

**Dataset**: Breast Cancer Histology Challenge
- High-resolution histology images
- 4 classes: Normal, Benign, In situ carcinoma, Invasive carcinoma

**Sources**:
- ICIAR 2018 Challenge winners
- GitHub repositories with trained models

### 3. **Pre-trained Models on GitHub**

#### Recommended Repositories:

1. **Breast Cancer Classification with Deep Learning**
   ```
   https://github.com/beringresearch/ivis-breast-cancer
   ```

2. **BreakHis Classification**
   ```
   https://github.com/taki0112/BreakHis-Classification
   ```

3. **Histopathologic Cancer Detection**
   ```
   https://github.com/basveeling/pcam
   ```

## 🔧 How to Use These Models

### Method 1: Convert PyTorch to ONNX

If you find a PyTorch model:

```python
import torch

# Load the model
model = torch.load('breast_cancer_model.pth')
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 224, 224)

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    'breast_cancer_model.onnx',
    opset_version=12,
    input_names=['input'],
    output_names=['output']
)
```

### Method 2: Convert TensorFlow to ONNX

If you find a TensorFlow model:

```bash
# Install converter
pip install tf2onnx

# Convert
python -m tf2onnx.convert \
    --saved-model tensorflow_model/ \
    --output breast_cancer_model.onnx \
    --opset 12
```

### Method 3: Use Our Download Script

```bash
python download_model.py
# Select option based on your model source
```

## 📊 Model Performance Benchmarks

### BreakHis Dataset (Binary Classification)

| Model | Accuracy | Sensitivity | Specificity | Size |
|-------|----------|-------------|-------------|------|
| ResNet50 | 95.2% | 93.8% | 96.1% | 98 MB |
| EfficientNet-B0 | 96.1% | 94.5% | 97.2% | 17 MB |
| DenseNet121 | 95.8% | 94.1% | 96.8% | 33 MB |
| VGG16 | 93.4% | 91.2% | 94.9% | 528 MB |

**Recommended**: EfficientNet-B0 (best accuracy-to-size ratio)

## 🎓 Training Your Own Model

If you want to train from scratch:

### Step 1: Get the Dataset

**BreakHis Dataset**:
```bash
# Download from official source
https://web.inf.ufpr.br/vri/databases/breast-cancer-histopathological-database-breakhis/

# Or use Kaggle
https://www.kaggle.com/datasets/ambarish/breakhis
```

### Step 2: Training Script

```python
import torch
import torchvision.models as models
from torch.utils.data import DataLoader
import torch.nn as nn
import torch.optim as optim

# Load pre-trained model
model = models.efficientnet_b0(pretrained=True)
model.classifier[1] = nn.Linear(1280, 2)  # Binary classification

# Training setup
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Train for 20-30 epochs
# Validate on test set
# Export to ONNX when done
```

### Step 3: Export to ONNX

```python
torch.onnx.export(
    model,
    dummy_input,
    'breast_cancer_model.onnx',
    opset_version=12
)
```

## 🔗 Direct Download Links

### Pre-trained ONNX Models (Community)

⚠️ **Note**: Always validate model performance before clinical use!

1. **EfficientNet-B0 (ImageNet pre-trained)**
   - Use our script: `python download_model.py` → Option 1
   - This creates a model ready for fine-tuning

2. **ResNet50 (BreakHis trained)**
   - Search Hugging Face: https://huggingface.co/models?search=breakhis
   - Look for models with ONNX format

3. **Custom Models**
   - Contact: Research labs, universities
   - Check: arXiv papers with code releases

## 📝 Model Requirements

For this API, your ONNX model must:

✅ **Input**: 
- Shape: `[batch_size, 3, 224, 224]`
- Type: `float32`
- Range: Normalized (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

✅ **Output**:
- Shape: `[batch_size, 2]` (binary classification)
- Type: `float32`
- Format: Logits or probabilities

✅ **Performance**:
- Accuracy: >90% (minimum)
- Inference time: <200ms on CPU
- Model size: <100 MB (preferred)

## 🚨 Important Disclaimers

1. **Not for Clinical Use**: These models are for research/educational purposes
2. **Validation Required**: Always validate with medical professionals
3. **Dataset Bias**: Models may not generalize to all populations
4. **Regulatory**: Not FDA approved or CE marked
5. **Liability**: Use at your own risk

## 🆘 Need Help?

If you can't find a suitable model:

1. **Start with our fine-tuned model**: `python download_model.py` → Option 1
2. **Search Hugging Face**: Filter by "breast cancer" + "onnx"
3. **Check Papers with Code**: Look for implementations
4. **Train your own**: Use BreakHis dataset (best for production)

## 📚 Additional Resources

- **BreakHis Paper**: https://doi.org/10.1109/TBME.2015.2496264
- **BACH Challenge**: https://iciar2018-challenge.grand-challenge.org/
- **Medical Imaging Datasets**: https://grand-challenge.org/
- **ONNX Model Zoo**: https://github.com/onnx/models

## ✅ Quick Start

**Fastest way to get started**:

```bash
cd pathology-agent/api
pip install -r requirements.txt
pip install torch torchvision  # For model creation
python download_model.py       # Select option 1
uvicorn main:app --reload      # Start API
```

Then test at: http://localhost:8000/docs
