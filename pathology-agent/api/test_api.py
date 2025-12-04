"""
Test script for breast cancer detection API
"""

import requests
from PIL import Image
import io
import numpy as np

API_URL = "http://localhost:8000"

def create_test_image():
    """Create a dummy test image"""
    # Create a 224x224 RGB image with random noise
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes

def test_health_check():
    """Test health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{API_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_prediction():
    """Test breast cancer prediction"""
    print("Testing breast cancer prediction...")
    
    # Create test image
    test_image = create_test_image()
    
    # Send prediction request
    files = {'image': ('test.jpg', test_image, 'image/jpeg')}
    response = requests.post(f"{API_URL}/predict/breast", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Prediction: {result['prediction']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Interpretation: {result['interpretation']}")
    else:
        print(f"Error: {response.text}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("Breast Cancer Detection API Test")
    print("=" * 60)
    print()
    
    try:
        test_health_check()
        test_prediction()
        print("✓ All tests completed!")
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to API")
        print("Make sure the API is running:")
        print("  uvicorn main:app --reload")
    except Exception as e:
        print(f"✗ Test failed: {e}")
