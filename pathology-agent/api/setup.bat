@echo off
REM Breast Cancer Detection API Setup Script for Windows

echo ==========================================
echo Breast Cancer Detection API Setup
echo ==========================================
echo.

REM Check Python
echo Checking Python version...
python --version
if errorlevel 1 (
    echo Error: Python not found!
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed
echo.

REM Install PyTorch
echo Installing PyTorch...
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
if errorlevel 1 (
    echo Error: Failed to install PyTorch
    pause
    exit /b 1
)
echo PyTorch installed
echo.

REM Download/create model
echo Setting up model...
python download_model.py
echo.

REM Check if model exists
if exist "models\breast_cancer_model.onnx" (
    echo ==========================================
    echo Setup Complete!
    echo ==========================================
    echo.
    echo Model location: models\breast_cancer_model.onnx
    echo.
    echo Next steps:
    echo 1. Start the API:
    echo    uvicorn main:app --reload
    echo.
    echo 2. Test the API:
    echo    python test_api.py
    echo.
    echo 3. View API docs:
    echo    http://localhost:8000/docs
    echo.
) else (
    echo ==========================================
    echo Setup Failed
    echo ==========================================
    echo.
    echo Model file not found. Please run:
    echo   python download_model.py
    echo.
)

pause
