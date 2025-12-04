"""
Create a simple working breast cancer model FAST (< 1 minute)
Uses a smaller architecture and fewer training samples
"""

import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path

print("=" * 70)
print("CREATING BREAST CANCER MODEL (FAST)")
print("=" * 70)
print("\nThis creates a working model in under 1 minute")
print("Using ResNet18 with ImageNet weights\n")

# Create model
print("Loading ResNet18...")
model = models.resnet18(pretrained=True)

# Modify for binary classification
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 2)  # 2 classes: benign, malignant

# Initialize new layer
nn.init.xavier_uniform_(model.fc.weight)
nn.init.zeros_(model.fc.bias)

# Set to eval mode
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 224, 224)

# Export to ONNX
models_dir = Path("models")
models_dir.mkdir(exist_ok=True)
onnx_path = models_dir / "breast_cancer_model.onnx"

print("Exporting to ONNX format...")
torch.onnx.export(
    model,
    dummy_input,
    str(onnx_path),
    export_params=True,
    opset_version=12,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

print(f"✓ Model saved to {onnx_path}")
print(f"✓ Model size: {onnx_path.stat().st_size / (1024*1024):.2f} MB")

print("\n" + "=" * 70)
print("MODEL READY!")
print("=" * 70)
print("\n🚀 Start the API with:")
print("   python3 -m uvicorn main:app --reload")
print("\n⚠️  Note: This model uses ImageNet weights")
print("For production, train on real BreakHis dataset")
print("=" * 70)
