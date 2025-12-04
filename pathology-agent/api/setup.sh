#!/bin/bash

# Breast Cancer Detection API Setup Script
# This script automates the entire setup process

set -e  # Exit on error

echo "=========================================="
echo "Breast Cancer Detection API Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python $python_version"
echo ""

# Create virtual environment (optional but recommended)
read -p "Create virtual environment? (y/n): " create_venv
if [ "$create_venv" = "y" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✓ Virtual environment created and activated"
    echo ""
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Install PyTorch for model creation
echo "Installing PyTorch..."
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
echo "✓ PyTorch installed"
echo ""

# Download/create model
echo "Setting up model..."
python download_model.py
echo ""

# Check if model exists
if [ -f "models/breast_cancer_model.onnx" ]; then
    echo "=========================================="
    echo "✓ Setup Complete!"
    echo "=========================================="
    echo ""
    echo "Model location: models/breast_cancer_model.onnx"
    echo "Model size: $(du -h models/breast_cancer_model.onnx | cut -f1)"
    echo ""
    echo "Next steps:"
    echo "1. Start the API:"
    echo "   uvicorn main:app --reload"
    echo ""
    echo "2. Test the API:"
    echo "   python test_api.py"
    echo ""
    echo "3. View API docs:"
    echo "   http://localhost:8000/docs"
    echo ""
    echo "4. Update frontend API URL in pathology-agent.html:"
    echo "   const API_URL = 'http://localhost:8000';"
    echo ""
else
    echo "=========================================="
    echo "✗ Setup Failed"
    echo "=========================================="
    echo ""
    echo "Model file not found. Please run:"
    echo "  python download_model.py"
    echo ""
    exit 1
fi
