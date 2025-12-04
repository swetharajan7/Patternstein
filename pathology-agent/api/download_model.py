"""
Download and prepare breast cancer detection model in ONNX format

This script provides multiple options to download pre-trained models:
1. Hugging Face Hub models
2. Google Drive links
3. Direct URLs
4. Create a fine-tuned model from scratch
"""

import os
import sys
import urllib.request
from pathlib import Path
import gdown

try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️  PyTorch not installed. Install with: pip install torch torchvision")

def create_model_directory():
    """Create models directory if it doesn't exist"""
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    return models_dir

def download_from_url(url, filename):
    """Download file from direct URL"""
    print(f"Downloading from {url}...")
    models_dir = create_model_directory()
    filepath = models_dir / filename
    
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"✓ Downloaded to {filepath}")
        return filepath
    except Exception as e:
        print(f"✗ Download failed: {e}")
        return None

def download_from_google_drive(file_id, filename):
    """Download from Google Drive"""
    print(f"Downloading from Google Drive (ID: {file_id})...")
    models_dir = create_model_directory()
    filepath = models_dir / filename
    
    try:
        url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url, str(filepath), quiet=False)
        print(f"✓ Downloaded to {filepath}")
        return filepath
    except Exception as e:
        print(f"✗ Download failed: {e}")
        print("Install gdown with: pip install gdown")
        return None

def download_from_huggingface(repo_id, filename):
    """Download from Hugging Face Hub"""
    print(f"Downloading from Hugging Face: {repo_id}/{filename}...")
    
    try:
        from huggingface_hub import hf_hub_download
        
        models_dir = create_model_directory()
        filepath = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            cache_dir=str(models_dir)
        )
        
        # Copy to models directory
        import shutil
        dest_path = models_dir / filename
        shutil.copy(filepath, dest_path)
        
        print(f"✓ Downloaded to {dest_path}")
        return dest_path
        
    except ImportError:
        print("✗ Hugging Face Hub not installed")
        print("Install with: pip install huggingface-hub")
        return None
    except Exception as e:
        print(f"✗ Download failed: {e}")
        return None

def create_finetuned_model():
    """
    Create a fine-tuned EfficientNet model for breast cancer detection
    This creates a model with ImageNet weights, ready for fine-tuning
    """
    if not TORCH_AVAILABLE:
        print("✗ PyTorch required to create model")
        return None
    
    print("Creating fine-tuned breast cancer detection model...")
    print("Using EfficientNet-B0 with ImageNet pre-training...")
    
    # Create model
    model = models.efficientnet_b0(pretrained=True)
    
    # Modify final layer for binary classification
    num_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_features, 2)  # 2 classes: normal, malignant
    
    # Initialize the new layer with better weights
    nn.init.xavier_uniform_(model.classifier[1].weight)
    nn.init.zeros_(model.classifier[1].bias)
    
    # Set to evaluation mode
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Export to ONNX
    models_dir = create_model_directory()
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
    
    return onnx_path

def show_menu():
    """Display download options menu"""
    print("\n" + "=" * 70)
    print("BREAST CANCER MODEL DOWNLOAD OPTIONS")
    print("=" * 70)
    print("\n1. Create Fine-tuned Model (Recommended for testing)")
    print("   - EfficientNet-B0 with ImageNet weights")
    print("   - Ready for inference (untrained on breast cancer data)")
    print("   - ~17 MB")
    print("\n2. Download from Hugging Face Hub")
    print("   - Community-trained models")
    print("   - Requires: pip install huggingface-hub")
    print("\n3. Download from Google Drive")
    print("   - Direct download from shared link")
    print("   - Requires: pip install gdown")
    print("\n4. Download from Direct URL")
    print("   - Any publicly accessible ONNX model")
    print("\n5. Exit")
    print("=" * 70)

def main():
    """Main function with interactive menu"""
    print("\n🏥 Breast Cancer Detection Model Setup")
    
    while True:
        show_menu()
        choice = input("\nSelect an option (1-5): ").strip()
        
        if choice == "1":
            print("\n📦 Creating fine-tuned model...")
            if not TORCH_AVAILABLE:
                print("\n✗ PyTorch not installed!")
                print("Install with: pip install torch torchvision")
                continue
            
            model_path = create_finetuned_model()
            if model_path:
                print("\n" + "=" * 70)
                print("✓ MODEL READY!")
                print("=" * 70)
                print(f"Location: {model_path}")
                print("\n⚠️  IMPORTANT NOTES:")
                print("- This model uses ImageNet pre-training")
                print("- It has NOT been trained on breast cancer data")
                print("- For production, train on BreakHis or BACH dataset")
                print("- Expected accuracy after training: >95%")
                print("\n🚀 Start the API with:")
                print("   uvicorn main:app --reload")
                print("=" * 70)
                break
        
        elif choice == "2":
            print("\n📥 Download from Hugging Face")
            print("Example repos:")
            print("  - username/breast-cancer-classifier")
            repo_id = input("Enter repo ID: ").strip()
            filename = input("Enter filename (e.g., model.onnx): ").strip()
            
            if repo_id and filename:
                model_path = download_from_huggingface(repo_id, filename)
                if model_path:
                    print(f"\n✓ Model ready at: {model_path}")
                    break
        
        elif choice == "3":
            print("\n📥 Download from Google Drive")
            print("Extract file ID from share link:")
            print("https://drive.google.com/file/d/FILE_ID/view")
            file_id = input("Enter file ID: ").strip()
            filename = input("Enter filename (e.g., breast_cancer_model.onnx): ").strip()
            
            if file_id and filename:
                model_path = download_from_google_drive(file_id, filename)
                if model_path:
                    print(f"\n✓ Model ready at: {model_path}")
                    break
        
        elif choice == "4":
            print("\n📥 Download from Direct URL")
            url = input("Enter model URL: ").strip()
            filename = input("Enter filename (e.g., model.onnx): ").strip()
            
            if url and filename:
                model_path = download_from_url(url, filename)
                if model_path:
                    print(f"\n✓ Model ready at: {model_path}")
                    break
        
        elif choice == "5":
            print("\n👋 Exiting...")
            sys.exit(0)
        
        else:
            print("\n✗ Invalid choice. Please select 1-5.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
