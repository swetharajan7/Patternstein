"""
Multi-Cancer Pathology API Server
Supports: Brain, Breast, Lung, Skin, Blood, Prostate, Cervical, Kidney
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import os
from google.cloud import storage

app = Flask(__name__)
CORS(app)

# Cloud Storage configuration
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'patternstein-models')
LOCAL_MODEL_DIR = '/tmp/models'

# Ensure local model directory exists
os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)

# Model mapping: cancer_type -> cloud storage filename
MODEL_CLOUD_FILES = {
    'brain': 'brain_cancer_model.h5',
    'breast': 'breast_cancer_model.h5',
    'lung': 'lung_cancer_agent_v2.h5',
    'skin': 'skin_cancer_model.keras',
    'cervical': 'cervical_cancer_model.h5',
    'prostate': 'prostate_cancer_model.h5',
    'kidney': 'kidney_cancer_model.h5'
}

def download_model_from_gcs(cancer_type, cloud_filename):
    """Download model from Google Cloud Storage"""
    try:
        local_path = os.path.join(LOCAL_MODEL_DIR, cloud_filename)
        
        # Skip if already downloaded
        if os.path.exists(local_path):
            print(f"✓ {cancer_type} model already cached")
            return local_path
        
        print(f"⬇️  Downloading {cancer_type} model from gs://{BUCKET_NAME}/{cloud_filename}")
        
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(cloud_filename)
        
        blob.download_to_filename(local_path)
        print(f"✅ Downloaded {cancer_type} model")
        return local_path
        
    except Exception as e:
        print(f"❌ Failed to download {cancer_type} model: {e}")
        return None

# Lazy-loaded models cache
MODELS = {}

def get_model(cancer_type):
    """Lazy load model on first request"""
    if cancer_type in MODELS:
        return MODELS[cancer_type]
    
    if cancer_type not in MODEL_CLOUD_FILES:
        return None
    
    try:
        cloud_filename = MODEL_CLOUD_FILES[cancer_type]
        local_path = download_model_from_gcs(cancer_type, cloud_filename)
        
        if local_path and os.path.exists(local_path):
            print(f"🔬 Loading {cancer_type} model into memory...")
            MODELS[cancer_type] = keras.models.load_model(local_path)
            print(f"✅ {cancer_type} model ready")
            return MODELS[cancer_type]
        else:
            print(f"⚠️  {cancer_type} model not available")
            return None
            
    except Exception as e:
        print(f"❌ Error loading {cancer_type}: {e}")
        return None

print("🚀 API starting with lazy model loading (models load on first request)")

def preprocess_image(image_bytes, target_size=(224, 224)):
    """Preprocess image for model prediction"""
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize
    img = img.resize(target_size)
    
    # Convert to array and normalize
    img_array = np.array(img) / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(MODELS.keys()),
        'total_models': len(MODELS)
    })

@app.route('/predict/<cancer_type>', methods=['POST'])
def predict(cancer_type):
    """Predict cancer for specific type"""
    
    # Validate cancer type
    if cancer_type not in MODEL_CLOUD_FILES:
        return jsonify({
            'error': f'Invalid cancer type: {cancer_type}',
            'available_types': list(MODEL_CLOUD_FILES.keys())
        }), 400
    
    # Check if image provided
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        # Lazy load model
        model = get_model(cancer_type)
        if model is None:
            return jsonify({
                'error': f'Model for {cancer_type} could not be loaded',
                'status': 'failed'
            }), 500
        
        # Get image
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        # Preprocess
        img_array = preprocess_image(image_bytes)
        
        # Predict
        prediction = model.predict(img_array, verbose=0)
        
        # Get probability
        cancer_probability = float(prediction[0][0])
        
        # Determine result
        is_cancer = cancer_probability > 0.5
        confidence = cancer_probability if is_cancer else (1 - cancer_probability)
        
        # Format response for website compatibility
        prediction_label = 'Cancer Detected' if is_cancer else 'Normal Tissue'
        color = '#ff6b6b' if is_cancer else '#00ff88'
        
        # Generate interpretation
        if is_cancer:
            interpretation = f'AI analysis indicates malignant {cancer_type} tissue with {confidence * 100:.1f}% confidence. Recommend immediate pathologist review and additional diagnostic testing.'
        else:
            interpretation = f'AI analysis indicates normal {cancer_type} tissue with {confidence * 100:.1f}% confidence. No immediate concerns detected, but clinical correlation recommended.'
        
        return jsonify({
            'cancer_type': cancer_type,
            'prediction': prediction_label,
            'confidence': confidence,  # Return as decimal for website
            'color': color,
            'interpretation': interpretation,
            'cancer_probability': cancer_probability,
            'normal_probability': 1 - cancer_probability,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List all available cancer detection models"""
    return jsonify({
        'available_models': list(MODEL_CLOUD_FILES.keys()),
        'loaded_models': list(MODELS.keys()),
        'total': len(MODEL_CLOUD_FILES),
        'cancer_types': {
            'brain': 'Brain Cancer (Glioma)',
            'breast': 'Breast Cancer',
            'lung': 'Lung Cancer',
            'skin': 'Skin Cancer (Melanoma)',
            'cervical': 'Cervical Cancer',
            'prostate': 'Prostate Cancer',
            'kidney': 'Kidney Cancer'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"\n🚀 Starting Multi-Cancer Pathology API on port {port}")
    print(f"📊 Available endpoints:")
    print(f"   GET  /health - Health check")
    print(f"   GET  /models - List available models")
    print(f"   POST /predict/<cancer_type> - Predict cancer")
    print(f"\n💡 Example: POST /predict/lung with image file")
    
    app.run(host='0.0.0.0', port=port, debug=False)
