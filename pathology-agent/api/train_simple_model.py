"""
Train a simple but functional breast cancer classifier
Uses transfer learning with ResNet18 for faster training
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import numpy as np
from pathlib import Path

class SyntheticBreastCancerDataset(Dataset):
    """
    Creates synthetic training data that mimics breast cancer histopathology
    This is for demonstration - replace with real BreakHis data for production
    """
    def __init__(self, num_samples=1000, transform=None):
        self.num_samples = num_samples
        self.transform = transform
        
        # Generate balanced dataset
        self.labels = [0] * (num_samples // 2) + [1] * (num_samples // 2)
        np.random.shuffle(self.labels)
    
    def __len__(self):
        return self.num_samples
    
    def __getitem__(self, idx):
        label = self.labels[idx]
        
        # Create synthetic image with different patterns for each class
        if label == 0:  # Benign - more uniform, lighter
            img_array = np.random.randint(120, 200, (224, 224, 3), dtype=np.uint8)
            # Add some structure
            for i in range(0, 224, 20):
                img_array[i:i+2, :] = np.random.randint(100, 150, (2, 224, 3))
        else:  # Malignant - more irregular, darker
            img_array = np.random.randint(50, 150, (224, 224, 3), dtype=np.uint8)
            # Add irregular patterns
            for _ in range(50):
                x, y = np.random.randint(0, 200, 2)
                size = np.random.randint(10, 30)
                img_array[x:x+size, y:y+size] = np.random.randint(20, 80, (size, size, 3))
        
        img = Image.fromarray(img_array)
        
        if self.transform:
            img = self.transform(img)
        
        return img, label

def train_model(num_epochs=10, batch_size=32):
    """Train a breast cancer classifier"""
    
    print("=" * 70)
    print("TRAINING BREAST CANCER CLASSIFIER")
    print("=" * 70)
    print("\n⚠️  Using synthetic data for demonstration")
    print("For production, replace with real BreakHis dataset\n")
    
    # Data transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Create datasets
    print("Creating synthetic training data...")
    train_dataset = SyntheticBreastCancerDataset(num_samples=1000, transform=transform)
    val_dataset = SyntheticBreastCancerDataset(num_samples=200, transform=transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)
    
    # Create model
    print("Loading ResNet18 model...")
    model = models.resnet18(pretrained=True)
    
    # Modify final layer for binary classification
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 2)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Training loop
    print(f"\nTraining for {num_epochs} epochs...")
    print("-" * 70)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    best_acc = 0.0
    
    for epoch in range(num_epochs):
        # Training phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
        
        train_acc = 100 * train_correct / train_total
        
        # Validation phase
        model.eval()
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
        
        val_acc = 100 * val_correct / val_total
        
        print(f"Epoch [{epoch+1}/{num_epochs}] "
              f"Train Loss: {train_loss/len(train_loader):.4f} "
              f"Train Acc: {train_acc:.2f}% "
              f"Val Acc: {val_acc:.2f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
    
    print("-" * 70)
    print(f"\n✓ Training complete! Best validation accuracy: {best_acc:.2f}%")
    
    # Export to ONNX
    print("\nExporting model to ONNX format...")
    model.eval()
    model = model.cpu()
    
    dummy_input = torch.randn(1, 3, 224, 224)
    
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    onnx_path = models_dir / "breast_cancer_model.onnx"
    
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
    print("MODEL READY FOR DEPLOYMENT")
    print("=" * 70)
    print("\n🚀 Start the API with:")
    print("   uvicorn main:app --reload")
    print("\n⚠️  Note: This model is trained on synthetic data")
    print("For production, train on real BreakHis dataset")
    print("=" * 70)
    
    return onnx_path

if __name__ == "__main__":
    try:
        train_model(num_epochs=10, batch_size=32)
    except KeyboardInterrupt:
        print("\n\n👋 Training interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
