# ========================================
# BLOOD CANCER (LEUKEMIA) TRAINING - STANDALONE
# ========================================

# STEP 1: Setup
!pip install -q kaggle tensorflow pillow matplotlib

# STEP 2: Upload Kaggle API Key
from google.colab import files
print("📤 Upload your kaggle.json file:")
uploaded = files.upload()

!mkdir -p ~/.kaggle
!cp kaggle.json ~/.kaggle/
!chmod 600 ~/.kaggle/kaggle.json

# STEP 3: CLEAN START - Remove any old data
!rm -rf data/ organized_data/ *.zip *.h5 samples_*
print("🧹 Cleaned old data")

# STEP 4: Import Libraries
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0
import numpy as np
import matplotlib.pyplot as plt
import os
import shutil

print(f"TensorFlow version: {tf.__version__}")
print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")

# STEP 5: Download BLOOD/LEUKEMIA Dataset
print("\n🎯 Training BLOOD CANCER (Leukemia) Model")
!kaggle datasets download -d andrewmvd/leukemia-classification
!unzip -q leukemia-classification.zip -d data/
print("✅ Leukemia dataset downloaded")

# STEP 6: Organize Data
def organize_blood_data():
    """Organize blood data: hem=normal, all=cancer (leukemia)"""
    os.makedirs("organized_data/train/normal", exist_ok=True)
    os.makedirs("organized_data/train/cancer", exist_ok=True)
    os.makedirs("organized_data/validation/normal", exist_ok=True)
    os.makedirs("organized_data/validation/cancer", exist_ok=True)
    
    # Map: hem (healthy) = normal, all (ALL leukemia) = cancer
    mapping = {
        'hem': 'normal',
        'all': 'cancer'
    }
    
    for root, dirs, files in os.walk("data"):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                # Determine class from path
                path_lower = root.lower()
                for orig_class, binary_class in mapping.items():
                    if orig_class in path_lower:
                        # 80/20 split
                        split = "train" if np.random.random() < 0.8 else "validation"
                        dest = f"organized_data/{split}/{binary_class}/{file}"
                        shutil.copy2(os.path.join(root, file), dest)
                        break
    
    # Print counts
    for split in ["train", "validation"]:
        for cls in ["normal", "cancer"]:
            count = len(os.listdir(f"organized_data/{split}/{cls}"))
            print(f"  {split}/{cls}: {count} images")

organize_blood_data()

# STEP 7: Create Data Generators
IMG_SIZE = 224
BATCH_SIZE = 32

train_datagen = keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2
)

val_datagen = keras.preprocessing.image.ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    'organized_data/train',
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

validation_generator = val_datagen.flow_from_directory(
    'organized_data/validation',
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

print(f"\n📊 Training samples: {train_generator.samples}")
print(f"📊 Validation samples: {validation_generator.samples}")

# STEP 8: Build Model
base_model = EfficientNetB0(
    include_top=False,
    weights='imagenet',
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base_model.trainable = False

model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.3),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='binary_crossentropy',
    metrics=['accuracy', keras.metrics.AUC(name='auc')]
)

model.summary()

# STEP 9: Train
print("\n🚀 Training blood cancer (leukemia) model...")

history = model.fit(
    train_generator,
    epochs=15,
    validation_data=validation_generator,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2)
    ]
)

# STEP 10: Evaluate
val_loss, val_acc, val_auc = model.evaluate(validation_generator)
print(f"\n✅ Blood Cancer (Leukemia) Model Results:")
print(f"   Accuracy: {val_acc*100:.2f}%")
print(f"   AUC: {val_auc:.4f}")

# STEP 11: Plot
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train')
plt.plot(history.history['val_accuracy'], label='Val')
plt.title('Blood Cancer - Accuracy')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train')
plt.plot(history.history['val_loss'], label='Val')
plt.title('Blood Cancer - Loss')
plt.legend()
plt.grid(True)
plt.show()

# STEP 12: Save Model
model.save('blood_cancer_model.h5')
print("\n💾 Model saved: blood_cancer_model.h5")

# STEP 13: Download Model
files.download('blood_cancer_model.h5')

# STEP 14: Manual Image Picker
print("\n🖼️ MANUAL IMAGE SELECTION")
print("="*60)

from IPython.display import display, Image as IPImage

normal_dir = "organized_data/validation/normal"
cancer_dir = "organized_data/validation/cancer"

normal_imgs = [f for f in os.listdir(normal_dir) if f.endswith(('.jpg', '.png', '.jpeg', '.bmp'))]
cancer_imgs = [f for f in os.listdir(cancer_dir) if f.endswith(('.jpg', '.png', '.jpeg', '.bmp'))]

# Show normal images
print("\n🟢 NORMAL BLOOD CELLS:")
for i in range(min(10, len(normal_imgs))):
    print(f"\n[{i}] {normal_imgs[i]}")
    display(IPImage(filename=f"{normal_dir}/{normal_imgs[i]}", width=300))

normal_idx = int(input("\nPick NORMAL image (0-9): "))

# Show cancer images
print("\n🔴 LEUKEMIA CELLS:")
for i in range(min(10, len(cancer_imgs))):
    print(f"\n[{i}] {cancer_imgs[i]}")
    display(IPImage(filename=f"{cancer_dir}/{cancer_imgs[i]}", width=300))

cancer_idx = int(input("\nPick CANCER image (0-9): "))

# Save selections
os.makedirs("samples_blood", exist_ok=True)
shutil.copy2(f"{normal_dir}/{normal_imgs[normal_idx]}", "samples_blood/blood_normal.jpg")
shutil.copy2(f"{cancer_dir}/{cancer_imgs[cancer_idx]}", "samples_blood/blood_cancer.jpg")

!zip -q samples_blood.zip samples_blood/*
files.download("samples_blood.zip")

print("\n🎉 BLOOD CANCER TRAINING COMPLETE!")
print("✅ Downloaded: blood_cancer_model.h5")
print("✅ Downloaded: samples_blood.zip")
