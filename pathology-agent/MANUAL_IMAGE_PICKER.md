# 🖼️ Manual Image Picker for Sample Images

When the automatic download picks wrong images, use this code in Colab to manually browse and select the correct samples.

---

## 📋 Add This to Your Colab Notebook

**Add this cell AFTER training completes (after Step 11):**

```python
# ========================================
# MANUAL IMAGE PICKER
# Browse validation images and pick samples
# ========================================

import os
import shutil
from IPython.display import display, Image as IPImage, HTML
import ipywidgets as widgets

print(f"🖼️ Manual Image Selection for {CANCER_TYPE} Cancer")
print("=" * 60)

# Get all validation images
normal_dir = "organized_data/validation/normal"
cancer_dir = "organized_data/validation/cancer"

normal_images = [f for f in os.listdir(normal_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
cancer_images = [f for f in os.listdir(cancer_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

print(f"\n📊 Available images:")
print(f"   Normal: {len(normal_images)} images")
print(f"   Cancer: {len(cancer_images)} images")

# ========================================
# DISPLAY NORMAL IMAGES
# ========================================
print("\n" + "="*60)
print("🟢 NORMAL IMAGES - Pick one you like")
print("="*60)

for i, img_name in enumerate(normal_images[:10]):  # Show first 10
    img_path = os.path.join(normal_dir, img_name)
    print(f"\n[{i}] {img_name}")
    display(IPImage(filename=img_path, width=300))
    if i >= 9:  # Limit to 10 images
        break

# Let user pick
print("\n" + "="*60)
selected_normal_idx = int(input("Enter the number of the NORMAL image you want [0-9]: "))
selected_normal = normal_images[selected_normal_idx]
print(f"✅ Selected: {selected_normal}")

# ========================================
# DISPLAY CANCER IMAGES
# ========================================
print("\n" + "="*60)
print("🔴 CANCER IMAGES - Pick one you like")
print("="*60)

for i, img_name in enumerate(cancer_images[:10]):  # Show first 10
    img_path = os.path.join(cancer_dir, img_name)
    print(f"\n[{i}] {img_name}")
    display(IPImage(filename=img_path, width=300))
    if i >= 9:  # Limit to 10 images
        break

# Let user pick
print("\n" + "="*60)
selected_cancer_idx = int(input("Enter the number of the CANCER image you want [0-9]: "))
selected_cancer = cancer_images[selected_cancer_idx]
print(f"✅ Selected: {selected_cancer}")

# ========================================
# SAVE SELECTED IMAGES
# ========================================
sample_dir = f"samples_{CANCER_TYPE}"
os.makedirs(sample_dir, exist_ok=True)

# Copy selected images with standard names
shutil.copy2(
    os.path.join(normal_dir, selected_normal),
    f"{sample_dir}/{CANCER_TYPE}_normal.jpg"
)
shutil.copy2(
    os.path.join(cancer_dir, selected_cancer),
    f"{sample_dir}/{CANCER_TYPE}_cancer.jpg"
)

print(f"\n✅ Sample images saved:")
print(f"   {sample_dir}/{CANCER_TYPE}_normal.jpg")
print(f"   {sample_dir}/{CANCER_TYPE}_cancer.jpg")

# Zip and download
!zip -q {sample_dir}.zip {sample_dir}/*
from google.colab import files
files.download(f"{sample_dir}.zip")
print(f"\n⬇️ Downloading {sample_dir}.zip...")
```

---

## 🎯 How to Use

### Step 1: Train Your Model
Run the normal training code with `CANCER_TYPE = "cervical"` or `"kidney"`

### Step 2: Replace Automatic Download
**Delete or comment out** the automatic image picker (Step 13 in original code)

### Step 3: Add Manual Picker
Paste the code above into a new cell

### Step 4: Run and Select
1. Cell will display 10 normal images
2. Pick the one you like (enter 0-9)
3. Cell will display 10 cancer images  
4. Pick the one you like (enter 0-9)
5. Downloads `samples_{cancer_type}.zip` with your selections

---

## 🔍 Alternative: Browse in Colab File Browser

### Quick Method:
1. After training, click the **📁 Files** icon in left sidebar
2. Navigate to: `organized_data/validation/normal/`
3. Click on images to preview
4. Right-click → Download the ones you want
5. Rename to: `cervical_normal.jpg`, `cervical_cancer.jpg`, etc.

---

## 📥 Direct Dataset Access

If you want to browse the full Kaggle dataset:

### Cervical Cancer:
```python
# In Colab, after downloading dataset
!ls -R data/ | head -50  # See folder structure
```

Then navigate to the actual image folders and browse manually.

### Kidney Cancer:
```python
# In Colab, after downloading dataset
!ls -R data/ | head -50  # See folder structure
```

---

## 🎨 Image Quality Tips

**Pick images that:**
- ✅ Are clear and well-lit
- ✅ Show typical features of the condition
- ✅ Are representative of the dataset
- ✅ Will look good on your website
- ❌ Avoid blurry or corrupted images
- ❌ Avoid extreme close-ups that are hard to interpret

---

## 🚀 Quick Fix for Current Issue

**For Cervical & Kidney - Use this NOW:**

1. In your Colab notebook, add a new cell at the end
2. Paste the manual picker code above
3. Run it
4. Browse and select good images
5. Download the zip file
6. Extract to `pathology-agent/samples/`

This gives you full control over which images to use! 🎯
