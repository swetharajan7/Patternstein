# Fix Sample Images Guide

## Images That Need Replacement

### 1. Brain Normal (`brain_normal.jpg`)
**Current**: X-ray/MRI scan
**Need**: Microscopy of normal brain cortex tissue
**Search terms**: 
- "normal brain cortex histology"
- "normal cerebral cortex microscopy H&E"
- "healthy brain tissue pathology"

**Recommended sources**:
- https://commons.wikimedia.org/wiki/Category:Normal_histology_of_brain
- Search: "normal brain histology 400x"

### 2. Brain Cancer (`brain_cancer.jpg`)
**Current**: X-ray/MRI scan  
**Need**: Microscopy of glioblastoma tissue
**Search terms**:
- "glioblastoma histopathology"
- "glioblastoma multiforme microscopy"
- "brain tumor pathology slide"

**Recommended sources**:
- https://commons.wikimedia.org/wiki/Category:Glioblastoma
- Search: "glioblastoma H&E stain"

### 3. Kidney Normal (`kidney_normal.jpg`)
**Current**: X-ray/CT scan
**Need**: Microscopy of normal kidney glomerulus
**Search terms**:
- "normal kidney glomerulus histology"
- "normal renal cortex microscopy"
- "healthy kidney tissue H&E"

**Recommended sources**:
- https://commons.wikimedia.org/wiki/Category:Normal_histology_of_kidney
- Search: "normal glomerulus microscopy"

### 4. Prostate Normal (`prostate_normal.jpg`)
**Current**: Wrong tissue type
**Need**: Microscopy of normal prostate gland
**Search terms**:
- "normal prostate gland histology"
- "benign prostatic tissue microscopy"
- "normal prostate acini H&E"

**Recommended sources**:
- https://commons.wikimedia.org/wiki/Category:Normal_histology_of_prostate
- Search: "normal prostate histology"

## Quick Fix Steps

1. **Download correct images** from the sources above
2. **Rename them** to match the current filenames:
   - `brain_normal.jpg`
   - `brain_cancer.jpg`
   - `kidney_normal.jpg`
   - `prostate_normal.jpg`

3. **Replace files** in `pathology-agent/samples/` directory

4. **Commit and push**:
```bash
git add pathology-agent/samples/
git commit -m "Replace incorrect sample images with proper histopathology"
git push origin main
```

## Image Requirements

- **Format**: JPG or PNG
- **Size**: 400x300 to 800x600 pixels (will be resized automatically)
- **Type**: Histopathology/microscopy images (H&E stain preferred)
- **Quality**: Clear, well-focused microscopy images
- **License**: Public domain or Creative Commons (for educational use)

## Alternative: Use Placeholder Text

If you can't find suitable images quickly, you can temporarily hide these samples by commenting them out in the SAMPLE_DATA object in `pathology-agent.html`.
