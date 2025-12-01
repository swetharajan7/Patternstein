# ⚡ Patternstein

<div align="center">

**A multi-modal medical AI that stitches together seven incompatible architectures into unified diagnostic intelligence.**

*Like Frankenstein's monster—powerful, stitched-together, and raising hard questions about what we build.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-patternstein.com-00ff88?style=for-the-badge)](https://patternstein.com)
[![Built with TensorFlow](https://img.shields.io/badge/TensorFlow-2.12+-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Deployed on GCP](https://img.shields.io/badge/GCP-Deployed-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com)

</div>

---

## 🧬 The Monster Awakens

Seven incompatible AI architectures—**EfficientNetB0 CNNs**, **1D CNN-LSTMs**, **Transformers**—fused through a custom attention-based fusion layer. What emerges isn't just combined intelligence, but something greater: **multi-modal reasoning** where cancer detection informs genomic analysis in real-time.

```
┌─────────────────────────────────────────────────────────────┐
│                    PATTERNSTEIN FUSION                      │
│                  (Weighted Attention Layer)                 │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    ┌──────────┴──────────┐      ┌───────────┴──────────┐
    │   PATHOLOGY AGENT   │      │    VITALS AGENT      │
    │  (EfficientNetB0)   │      │   (1D CNN-LSTM)      │
    │   Cancer Detection  │      │   ECG Analysis       │
    └─────────────────────┘      └──────────────────────┘
               │                              │
    ┌──────────┴──────────┐      ┌───────────┴──────────┐
    │   LANGUAGE AGENT    │      │   GENOMIC AGENT      │
    │   (Transformers)    │      │    (1D CNN)          │
    │  Symptom Analysis   │      │  DNA Sequences       │
    └─────────────────────┘      └──────────────────────┘
               │                              │
    ┌──────────┴──────────┐      ┌───────────┴──────────┐
    │   MOVEMENT AGENT    │      │  RADIOLOGY AGENT     │
    │   (3D CNN-LSTM)     │      │  (Image Analysis)    │
    │  Behavioral Patterns│      │   X-rays, CT, MRI    │
    └─────────────────────┘      └──────────────────────┘
               │
    ┌──────────┴──────────┐
    │ LAB RESULTS AGENT   │
    │  (Tabular Data)     │
    │  Blood Work, Panels │
    └─────────────────────┘
```

## 🎯 What Makes This Different

**The Problem:** Most ML systems stay within a single modality. Multi-modal fusion is hard—different architectures produce incompatible outputs.

**Our Solution:** A custom fusion layer that learns weighted attention across modalities, letting specialized agents communicate through a unified interface.

**The Result:** 
- ✅ **>95% accuracy** across individual agents
- ✅ **>0.98 AUC-ROC** scores
- ✅ **Real-time inference** via Flask APIs
- ✅ **Emergent intelligence** from architectural fusion

## 🏗️ Architecture

### The Seven Agents

| Agent | Architecture | Data Type | Purpose |
|-------|-------------|-----------|---------|
| 🔬 **Pathology** | EfficientNetB0 CNN | Histology Images | Cancer detection from tissue samples |
| 💓 **Vitals** | 1D CNN-LSTM | Time-series ECG | Heart rhythm analysis |
| 💬 **Language** | Transformer | Medical Text | Symptom processing |
| 🧬 **Genomic** | 1D CNN | DNA Sequences | Mutation detection |
| 🏃 **Movement** | 3D CNN-LSTM | Video/Motion | Behavioral pattern analysis |
| 🩻 **Radiology** | CNN | Medical Imaging | X-ray, CT, MRI analysis |
| 🧪 **Lab Results** | Dense NN | Tabular Data | Blood work interpretation |

### The Fusion Layer

```python
# Simplified fusion architecture
class PatternsteinFusion(tf.keras.Model):
    def __init__(self):
        super().__init__()
        self.attention = MultiHeadAttention(num_heads=8, key_dim=64)
        self.fusion_dense = Dense(256, activation='relu')
        self.output_layer = Dense(num_classes, activation='softmax')
    
    def call(self, agent_outputs):
        # Weighted attention across modalities
        attended = self.attention(agent_outputs, agent_outputs)
        fused = self.fusion_dense(attended)
        return self.output_layer(fused)
```

## 🚀 Quick Start

### Prerequisites
```bash
python 3.8+
tensorflow 2.12+
flask
numpy, pandas, scikit-learn
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/Patternstein.git
cd Patternstein

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Train Individual Agents
```bash
# Train pathology agent
cd pathology-agent
python pathology_agent.py

# Or train all agents sequentially
python train_all_agents.py
```

### Run the Fusion System
```bash
# Start the fusion API
python patternstein_fusion.py

# Access the web interface
open http://localhost:5000
```

## 🎨 Live Demo

Visit **[patternstein.com](https://patternstein.com)** to see the system in action:

- 🌩️ Gothic-themed interface with lightning effects
- 📤 Upload medical data (images, ECG, text, DNA)
- ⚡ Real-time multi-modal inference
- 📊 Visualized agent outputs and fusion results

## 📊 Performance

| Metric | Value |
|--------|-------|
| **Individual Agent Accuracy** | >95% |
| **Fusion Layer AUC-ROC** | >0.98 |
| **Inference Time** | <2s per sample |
| **Training Time** | 3-8 hours per agent |

## 🛠️ Tech Stack

**ML/AI:**
- TensorFlow 2.12+ / Keras
- NumPy, Pandas, scikit-learn
- OpenCV, Pillow (image processing)
- wfdb, neurokit2 (physiological signals)

**Backend:**
- Flask (REST APIs)
- Python 3.8+
- Gunicorn (WSGI server)

**Cloud & Infrastructure:**
- Google Cloud Platform (Vertex AI, Cloud Storage, Cloud Run)
- Google Colab (GPU training)
- Docker containerization

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Custom animations and gothic UI design

**Development:**
- Kiro IDE with custom MCP tools
- Git/GitHub
- TensorBoard for training visualization

## 🧪 Development with Kiro IDE

This project was built using **Kiro IDE** as our primary development environment—a game-changer for AI-assisted development:

```bash
# Custom MCP tools for project management
kiro mcp check-agent-status      # Monitor all 7 agents
kiro mcp validate-website         # Check deployment readiness
kiro mcp get-project-stats        # Comprehensive metrics
```

**What made Kiro special:**
- 🎯 **Vibe coding**: Conversational intent → working code
- 📋 **Context engineering**: Steering rules embedded architecture decisions
- 🔧 **Custom MCP server**: Project-specific tools for rapid iteration
- ⚡ **Rapid prototyping**: Weeks instead of months

## 📁 Project Structure

```
Patternstein/
├── pathology-agent/          # Cancer detection from histology
├── vitals-agent/             # ECG rhythm analysis
├── language-agent/           # Medical symptom processing
├── genomic-agent/            # DNA sequence analysis
├── movement-agent/           # Behavioral pattern detection
├── radiology-agent/          # Medical imaging analysis
├── lab-results-agent/        # Blood work interpretation
├── mcp-server/               # Custom Kiro MCP tools
├── patternstein_fusion.py    # Main fusion layer
├── train_all_agents.py       # Sequential training pipeline
├── index.html                # Landing page
├── patternstein.html         # Fusion interface
└── *.html                    # Individual agent pages
```

Each agent directory contains:
- `<agent>_agent.py` - Training script
- `download_<data>_data.py` - Data acquisition
- `api_server.py` - Flask API endpoint
- `models/` - Trained model files (.h5)
- `README.md` - Agent-specific documentation

## ⚠️ The Frankenstein Question

> *"What's our responsibility to what we create?"*

This isn't production medical AI—it's a **proof of concept** that demonstrates technical capability while asking hard questions about:

- 🤖 **AI Alignment**: Building systems we might not fully control
- 🔒 **Safety**: Multi-modal fusion introduces emergent behaviors
- ⚖️ **Ethics**: Medical AI requires transparency and human oversight
- 🎓 **Responsibility**: The gap between "can we build it" and "should we"

**Disclaimer:** Patternstein is a research prototype for educational and demonstration purposes only. Not intended for clinical use.

## 🏆 Built For

**Kiroween Hackathon 2025** - Exploring the intersection of multi-modal AI, medical diagnostics, and responsible development.

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 🤝 Contributing

This is a hackathon project, but we welcome:
- 🐛 Bug reports
- 💡 Feature suggestions
- 📖 Documentation improvements
- 🔬 Research collaborations

## 👥 Contributors

- **Swetha Rajan** - Lead Developer & AI Architect
- **Manas Nand Mohan** - Full Stack Developer & System Integration

## 🙏 Acknowledgments

- **Kiro IDE** for revolutionizing our development workflow
- **TensorFlow** team for the ML framework
- **Google Cloud** for compute resources
- **Kaggle** for medical datasets
- **Mary Shelley** for the inspiration

---

<div align="center">

**"For every gift that brings light, there is a price to pay in darkness"**

Built with ❤️ by the Patternstein team



</div>
