# 🎯 Multi-Cancer Model Training Guide
## Train 5 Cancer Types: Brain, Cervical, Kidney, Prostate, Blood

**Goal**: Train models for the remaining 5 cancer types to complete your 8-cancer pathology agent.

---

## 📋 Overview

You already have:
- ✅ Lung Cancer (trained)
- ✅ Skin Cancer (trained)
- ✅ Breast Cancer (trained)

Need to train:
- ⏳ Brain Cancer (Glioma)
- ⏳ Cervical Cancer
- ⏳ Kidney Cancer (Renal Cell Carcinoma)
- ⏳ Prostate Cancer
- ⏳ Blood Cancer (Leukemia)

---

## 🚀 STEP 1: Find Kaggle Datasets

### Recommended Datasets:

1. **Brain Cancer**
   - Dataset: "Brain Tumor MRI Dataset"
   - URL: https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset
   - Classes: Glioma, Meningioma, No Tumor, Pituitary
   - Size: ~7,000 images

2. **Cervical Cancer**
   - Dataset: "Cervical Cancer Screening"
   - URL: https://www.kaggle.com/datasets/paultimothymooney/cervical-cancer-screening
   - Classes: Type 1, Type 2, Type 3
   - Size: ~4,000 images

3. **Kidney Cancer**
   - Dataset: "CT Kidney Dataset: Normal-Cyst-Tumor and Stone"
   - URL: https://www.kaggle.com/datasets/nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone
   - Classes: Normal, Cyst, Tumor, Stone
   - Size: ~12,000 images

4. **Prostate Cancer**
   - Dataset: "Prostate Cancer Grade Assessment"
   - URL: https://www.kaggle.com/competitions/prostate-cancer-grade-assessment/data
   - Classes: Grade 0-5 (Gleason scores)
   - Size: ~10,000 images

5. **Blood Cancer (Leukemia)**
   - Dataset: "Leukemia Classification"
   - URL: https://www.kaggle.com/datasets/andrewmvd/leukemia-classification
   - Classes: ALL (Acute Lymphoblastic Leukemia), Normal
   - Size: ~15,000 images

---

## 🔧 STEP 2: Google Colab Training Notebook

### Open Google Colab
Go to: https://colab.research.google.com/

### Create New Notebook: `train_multi_cancer.ipynb`

Copy this code:

```python
# ========================================
# MULTI-CANCER PATHOLOGY TRAINING
# Train Brain, Cervical, Kidney, Prostate, Blood
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

# STEP 3: Import Libraries
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0
import numpy as np
import matplotlib.pyplot as plt
import os
from pathlib import Path

print(f"TensorFlow version: {tf.__version__}")
print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")

# ========================================
# CHOOSE CANCER TYPE TO TRAIN
# ========================================
CANCER_TYPE = "brain"  # Change to: brain, cervical, kidney, prostate, blood

DATASETS = {
    "brain": {
        "kaggle_id": "masoudnickparvar/brain-tumor-mri-dataset",
        "classes": ["glioma", "meningioma", "notumor", "pituitary"],
        "binary_map": {"notumor": "normal", "glioma": "cancer", "meningioma": "cancer", "pituitary": "cancer"}
    },
    "cervical": {
        "kaggle_id": "paultimothymooney/cervical-cancer-screening",
        "classes": ["Type_1", "Type_2", "Type_3"],
        "binary_map": {"Type_1": "normal", "Type_2": "cancer", "Type_3": "cancer"}
    },
    "kidney": {
        "kaggle_id": "nazmul0087/ct-kidney-dataset-normal-cyst-tumor-and-stone",
        "classes": ["Normal", "Cyst", "Tumor", "Stone"],
        "binary_map": {"Normal": "normal", "Cyst": "cancer", "Tumor": "cancer", "Stone": "cancer"}
    },
    "prostate": {
        "kaggle_id": "competitions/prostate-cancer-grade-assessment",
        "classes": ["0", "1", "2", "3", "4", "5"],
        "binary_map": {"0": "normal", "1": "normal", "2": "cancer", "3": "cancer", "4": "cancer", "5": "cancer"}
    },
    "blood": {
        "kaggle_id": "andrewmvd/leukemia-classification",
        "classes": ["all", "hem"],
        "binary_map": {"hem": "normal", "all": "cancer"}
    }
}

config = DATASETS[CANCER_TYPE]
print(f"\n🎯 Training {CANCER_TYPE.upper()} Cancer Model")
print(f"📦 Dataset: {config['kaggle_id']}")

# STEP 4: Download Dataset
!kaggle datasets download -d {config['kaggle_id']}
!unzip -q *.zip -d data/
print("✅ Dataset downloaded and extracted")

# STEP 5: Organize Data into Binary Classification
import shutil

def organize_binary_data(source_dir, output_dir, binary_map):
    """Organize multi-class data into binary (normal vs cancer)"""
    os.makedirs(f"{output_dir}/train/normal", exist_ok=True)
    os.makedirs(f"{output_dir}/train/cancer", exist_ok=True)
    os.makedirs(f"{output_dir}/validation/normal", exist_ok=True)
    os.makedirs(f"{output_dir}/validation/cancer", exist_ok=True)
    
    # Find all images
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                # Determine class from path
                for orig_class, binary_class in binary_map.items():
                    if orig_class.lower() in root.lower():
                        # 80/20 train/val split
                        dest_split = "train" if np.random.random() < 0.8 else "validation"
                        dest_path = f"{output_dir}/{dest_split}/{binary_class}/{file}"
                        shutil.copy2(os.path.join(root, file), dest_path)
                        break
    
    print(f"✅ Data organized:")
    for split in ["train", "validation"]:
        for cls in ["normal", "cancer"]:
            count = len(os.listdir(f"{output_dir}/{split}/{cls}"))
            print(f"  {split}/{cls}: {count} images")

organize_binary_data("data", "organized_data", config['binary_map'])

# STEP 6: Create Data Generators
IMG_SIZE = 224
BATCH_SIZE = 32

train_datagen = keras.preprocessing.image.ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    fill_mode='nearest'
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

# STEP 7: Build Model
def create_cancer_model():
    base_model = EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    # Freeze base model
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
    
    return model

model = create_cancer_model()
model.summary()

# STEP 8: Train Model
print(f"\n🚀 Training {CANCER_TYPE} cancer model...")

history = model.fit(
    train_generator,
    epochs=15,
    validation_data=validation_generator,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2)
    ]
)

# STEP 9: Evaluate
val_loss, val_acc, val_auc = model.evaluate(validation_generator)
print(f"\n✅ Final Results:")
print(f"   Accuracy: {val_acc*100:.2f}%")
print(f"   AUC: {val_auc:.4f}")

# STEP 10: Plot Training History
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Val Accuracy')
plt.title(f'{CANCER_TYPE.capitalize()} Cancer - Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title(f'{CANCER_TYPE.capitalize()} Cancer - Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.show()

# STEP 11: Save Model
model_filename = f'{CANCER_TYPE}_cancer_model.h5'
model.save(model_filename)
print(f"\n💾 Model saved: {model_filename}")

# STEP 12: Download Model
from google.colab import files
files.download(model_filename)
print(f"⬇️ Downloading {model_filename} to your computer...")

# STEP 13: Save Sample Images for Testing
print("\n📸 Saving sample images...")
sample_dir = f"samples_{CANCER_TYPE}"
os.makedirs(sample_dir, exist_ok=True)

# Copy 1 normal and 1 cancer sample
import shutil
normal_files = os.listdir("organized_data/validation/normal")[:1]
cancer_files = os.listdir("organized_data/validation/cancer")[:1]

for f in normal_files:
    shutil.copy2(f"organized_data/validation/normal/{f}", 
                 f"{sample_dir}/{CANCER_TYPE}_normal.jpg")

for f in cancer_files:
    shutil.copy2(f"organized_data/validation/cancer/{f}", 
                 f"{sample_dir}/{CANCER_TYPE}_cancer.jpg")

# Zip and download samples
!zip -q {sample_dir}.zip {sample_dir}/*
files.download(f"{sample_dir}.zip")
print(f"✅ Sample images downloaded: {sample_dir}.zip")

print("\n🎉 TRAINING COMPLETE!")
print(f"\nNext steps:")
print(f"1. Move {model_filename} to: pathology-agent/models/")
print(f"2. Extract samples to: pathology-agent/samples/")
print(f"3. Update API to support {CANCER_TYPE} cancer predictions")
```

---

## 📥 STEP 3: After Training (For Each Cancer Type)

### 3.1 Download Files from Colab
After each training run, you'll download:
- `{cancer_type}_cancer_model.h5` (the trained model)
- `samples_{cancer_type}.zip` (sample images)

### 3.2 Organize in Patternstein Folder

```bash
# Move models
mv ~/Downloads/brain_cancer_model.h5 pathology-agent/models/
mv ~/Downloads/cervical_cancer_model.h5 pathology-agent/models/
mv ~/Downloads/kidney_cancer_model.h5 pathology-agent/models/
mv ~/Downloads/prostate_cancer_model.h5 pathology-agent/models/
mv ~/Downloads/blood_cancer_model.h5 pathology-agent/models/

# Extract and organize samples
cd pathology-agent/samples/
unzip ~/Downloads/samples_brain.zip
unzip ~/Downloads/samples_cervical.zip
unzip ~/Downloads/samples_kidney.zip
unzip ~/Downloads/samples_prostate.zip
unzip ~/Downloads/samples_blood.zip

# Rename to standard format
mv samples_brain/brain_normal.jpg ./
mv samples_brain/brain_cancer.jpg ./
# Repeat for other cancer types...
```

---

## 🔄 STEP 4: Training Order (Recommended)

Train in this order (easiest to hardest):

1. **Blood Cancer** (15-20 min) - Simplest, clear cell differences
2. **Brain Cancer** (20-25 min) - Good quality MRI images
3. **Kidney Cancer** (25-30 min) - CT scans, clear boundaries
4. **Cervical Cancer** (20-25 min) - Smaller dataset
5. **Prostate Cancer** (30-40 min) - Most complex, requires careful grading

---

## ☁️ STEP 5: Deploy to Google Cloud (After All Training)

### 5.1 Update API Server

Edit `pathology-agent/app.py` to load all 8 models:

```python
# Load all cancer models
MODELS = {
    'lung': load_model('models/lung_cancer_model.h5'),
    'skin': load_model('models/skin_cancer_model.h5'),
    'breast': load_model('models/breast_cancer_model.h5'),
    'brain': load_model('models/brain_cancer_model.h5'),
    'cervical': load_model('models/cervical_cancer_model.h5'),
    'kidney': load_model('models/kidney_cancer_model.h5'),
    'prostate': load_model('models/prostate_cancer_model.h5'),
    'blood': load_model('models/blood_cancer_model.h5')
}

@app.route('/predict/<cancer_type>', methods=['POST'])
def predict(cancer_type):
    if cancer_type not in MODELS:
        return jsonify({'error': 'Invalid cancer type'}), 400
    
    model = MODELS[cancer_type]
    # ... rest of prediction code
```

### 5.2 Deploy to Cloud Run

```bash
cd pathology-agent

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pathology-api
gcloud run deploy pathology-api \
  --image gcr.io/YOUR_PROJECT_ID/pathology-api \
  --platform managed \
  --region us-central1 \
  --memory 4Gi \
  --allow-unauthenticated
```

---

## 📊 Expected Results

| Cancer Type | Expected Accuracy | Training Time | Dataset Size |
|-------------|------------------|---------------|--------------|
| Blood       | 95-98%          | 15-20 min     | ~15K images  |
| Brain       | 92-96%          | 20-25 min     | ~7K images   |
| Kidney      | 93-97%          | 25-30 min     | ~12K images  |
| Cervical    | 88-93%          | 20-25 min     | ~4K images   |
| Prostate    | 85-92%          | 30-40 min     | ~10K images  |

---

## 🎯 Quick Start Checklist

- [ ] Open Google Colab
- [ ] Upload kaggle.json
- [ ] Set `CANCER_TYPE = "brain"`
- [ ] Run all cells
- [ ] Download model + samples
- [ ] Move files to Patternstein folder
- [ ] Repeat for remaining 4 cancer types
- [ ] Update API server
- [ ] Deploy to Cloud Run
- [ ] Test on website

---

## 🆘 Troubleshooting

**Issue**: Dataset not found on Kaggle
- Solution: Search Kaggle for alternative datasets with similar cancer types

**Issue**: Out of memory in Colab
- Solution: Reduce `BATCH_SIZE` to 16 or use Colab Pro

**Issue**: Low accuracy (<80%)
- Solution: Train for more epochs (20-25) or use data augmentation

**Issue**: Model file too large
- Solution: Use model quantization or save as TFLite

---

## 🚀 Ready to Start?

1. Open: https://colab.research.google.com/
2. Create new notebook
3. Copy the training code above
4. Start with Blood Cancer (easiest)
5. Let's GO! 🎉
