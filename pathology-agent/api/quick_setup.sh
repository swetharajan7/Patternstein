#!/bin/bash

echo "=================================="
echo "BREAST CANCER MODEL - QUICK SETUP"
echo "=================================="
echo ""
echo "This will:"
echo "1. Install dependencies"
echo "2. Create a working model (< 1 min)"
echo "3. Start the API"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo "📦 Step 1/3: Installing dependencies..."
echo "This may take a few minutes..."
pip3 install torch torchvision onnxruntime pillow fastapi python-multipart uvicorn numpy onnx

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to install dependencies."
    echo "Try running manually: pip3 install torch torchvision onnxruntime pillow fastapi python-multipart uvicorn numpy onnx"
    exit 1
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🎓 Step 2/3: Creating model (fast method, < 1 minute)..."
python3 create_quick_model.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Model creation failed."
    echo "Try running manually: python3 create_quick_model.py"
    exit 1
fi

echo ""
echo "✅ Model created successfully!"
echo ""
echo "🚀 Step 3/3: Starting API..."
echo "Visit: http://localhost:8000/docs"
echo "Press Ctrl+C to stop"
echo ""
python3 -m uvicorn main:app --reload
