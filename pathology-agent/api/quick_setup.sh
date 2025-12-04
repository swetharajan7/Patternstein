#!/bin/bash

echo "=================================="
echo "BREAST CANCER MODEL - QUICK SETUP"
echo "=================================="
echo ""
echo "This will:"
echo "1. Install dependencies"
echo "2. Train a working model (5 min)"
echo "3. Start the API"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
pip3 install torch torchvision onnxruntime pillow fastapi python-multipart uvicorn numpy

echo ""
echo "🎓 Training model (this will take ~5 minutes)..."
python3 train_simple_model.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 Starting API..."
    echo "Visit: http://localhost:8000/docs"
    echo ""
    uvicorn main:app --reload
else
    echo ""
    echo "❌ Training failed. Check errors above."
    exit 1
fi
