"""
FastAPI Backend for Breast Cancer Detection
Uses ONNX Runtime for efficient inference
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import onnxruntime as ort
import numpy as np
from PIL import Image
import io
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Pathology AI API",
    description="Breast cancer detection using ONNX models",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model session
ort_session = None
MODEL_PATH = "models/breast_cancer_model.onnx"
INPUT_SIZE = (224, 224)  # Standard for most medical imaging models

# Class labels
CLASS_LABELS = {
    0: "Normal (Benign)",
    1: "Malignant (Cancerous)"
}

def load_model():
    """Load ONNX model"""
    global ort_session
    try:
        logger.info(f"Loading ONNX model from {MODEL_PATH}")
        ort_session = ort.InferenceSession(
            MODEL_PATH,
            providers=['CPUExecutionProvider']  # Use CPU, can add GPU if available
        )
        logger.info("Model loaded successfully")
        logger.info(f"Model inputs: {ort_session.get_inputs()[0].name}")
        logger.info(f"Model outputs: {ort_session.get_outputs()[0].name}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

def preprocess_image(image: Image.Image) -> np.ndarray:
    """
    Preprocess histopathology image for model input
    
    Args:
        image: PIL Image object
        
    Returns:
        Preprocessed numpy array ready for inference
    """
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize to model input size
    image = image.resize(INPUT_SIZE, Image.LANCZOS)
    
    # Convert to numpy array
    img_array = np.array(image, dtype=np.float32)
    
    # Normalize to [0, 1]
    img_array = img_array / 255.0
    
    # Standardize using ImageNet stats (common for transfer learning)
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std
    
    # Transpose to NCHW format (batch, channels, height, width)
    img_array = np.transpose(img_array, (2, 0, 1))
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def postprocess_prediction(output: np.ndarray) -> Dict[str, Any]:
    """
    Convert model output to human-readable results
    
    Args:
        output: Raw model output
        
    Returns:
        Dictionary with prediction results
    """
    # Apply softmax if needed
    if output.shape[-1] == 2:
        # Binary classification with 2 outputs
        exp_output = np.exp(output - np.max(output))
        probabilities = exp_output / exp_output.sum()
        predicted_class = np.argmax(probabilities)
        confidence = float(probabilities[0, predicted_class])
    else:
        # Single output (sigmoid)
        confidence = float(output[0, 0])
        predicted_class = 1 if confidence > 0.5 else 0
    
    prediction_label = CLASS_LABELS[predicted_class]
    
    # Determine color based on prediction
    color = "#ff6b6b" if predicted_class == 1 else "#00ff88"
    
    # Generate interpretation
    if predicted_class == 1:
        if confidence > 0.9:
            interpretation = f"High confidence detection of malignant tissue. Confidence: {confidence*100:.1f}%. Recommend immediate consultation with oncologist."
        elif confidence > 0.7:
            interpretation = f"Moderate confidence detection of malignant tissue. Confidence: {confidence*100:.1f}%. Further testing recommended."
        else:
            interpretation = f"Possible malignant tissue detected. Confidence: {confidence*100:.1f}%. Additional screening advised."
    else:
        if confidence > 0.9:
            interpretation = f"High confidence normal tissue. Confidence: {confidence*100:.1f}%. No immediate concerns detected."
        elif confidence > 0.7:
            interpretation = f"Likely normal tissue. Confidence: {confidence*100:.1f}%. Routine monitoring recommended."
        else:
            interpretation = f"Appears normal but low confidence. Confidence: {confidence*100:.1f}%. Consider additional testing."
    
    return {
        "prediction": prediction_label,
        "confidence": confidence,
        "predicted_class": int(predicted_class),
        "color": color,
        "interpretation": interpretation
    }

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model()
    except Exception as e:
        logger.error(f"Failed to load model on startup: {e}")
        # Continue without model for health checks

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Pathology AI API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_loaded = ort_session is not None
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "message": "AI Models Online and Ready" if model_loaded else "Model not loaded"
    }

@app.post("/predict/breast")
async def predict_breast(image: UploadFile = File(...)):
    """
    Predict breast cancer from histopathology image
    
    Args:
        image: Uploaded image file
        
    Returns:
        Prediction results with confidence score
    """
    if ort_session is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please try again later."
        )
    
    try:
        # Read and validate image
        contents = await image.read()
        
        try:
            pil_image = Image.open(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
        
        logger.info(f"Processing image: {image.filename}, size: {pil_image.size}, mode: {pil_image.mode}")
        
        # Preprocess image
        input_data = preprocess_image(pil_image)
        
        # Get input name from model
        input_name = ort_session.get_inputs()[0].name
        
        # Run inference
        logger.info("Running inference...")
        outputs = ort_session.run(None, {input_name: input_data})
        
        # Postprocess results
        results = postprocess_prediction(outputs[0])
        
        logger.info(f"Prediction: {results['prediction']}, Confidence: {results['confidence']:.3f}")
        
        return JSONResponse(content=results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/predict/lung")
async def predict_lung(image: UploadFile = File(...)):
    """Placeholder for lung cancer prediction"""
    return {
        "prediction": "Feature coming soon",
        "confidence": 0.0,
        "color": "#ffc107",
        "interpretation": "Lung cancer detection will be available in the next update."
    }

@app.post("/predict/skin")
async def predict_skin(image: UploadFile = File(...)):
    """Placeholder for skin cancer prediction"""
    return {
        "prediction": "Feature coming soon",
        "confidence": 0.0,
        "color": "#ffc107",
        "interpretation": "Skin cancer detection will be available in the next update."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
