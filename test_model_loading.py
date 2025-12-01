import tensorflow as tf
import sys

print(f"TensorFlow version: {tf.__version__}")

try:
    print("\nTesting lung cancer model...")
    model = tf.keras.models.load_model('pathology-agent/models/lung_cancer_agent_v2.h5')
    print("✅ Lung model loaded successfully!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
except Exception as e:
    print(f"❌ Error loading lung model: {e}")
    import traceback
    traceback.print_exc()

try:
    print("\nTesting skin cancer model...")
    model = tf.keras.models.load_model('pathology-agent/models/skin_cancer_agent.keras')
    print("✅ Skin model loaded successfully!")
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
except Exception as e:
    print(f"❌ Error loading skin model: {e}")
    import traceback
    traceback.print_exc()
