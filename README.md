# 🚀 AstraVue

> AI-powered visual intelligence for understanding space and Earth-observation imagery.

[🌐 Live Demo](https://astra-vue.vercel.app/) · [💻 GitHub](https://github.com/sanjay-sanju-03/AstraVue)

---

## 🌌 About

**AstraVue** is an AI-powered visual intelligence platform that analyzes NASA and publicly available Earth/space imagery, identifies visible features, highlights them directly on the image, and explains the scene in simple language.

### Core Workflow

```text
NASA / Public Image
        ↓
     Vision AI
        ↓
 Feature Detection
        ↓
Visual Annotation
        ↓
AI Explanation
```

---

## ✨ Features

- 🛰️ NASA Image & Video Library integration
- 🤖 AI-powered image analysis
- 🔍 Detection of 3–6 visible features
- 🎯 Interactive bounding-box annotations
- 🏷️ Color-coded feature labels
- 🧠 Plain-language AI explanation
- 📥 Download annotated image as PNG
- 🔗 NASA source attribution
- 📱 Responsive interface

---

## 🛰️ NASA Space Apps Challenge

**Challenge:** AI & Machine Learning — *What's Happening in This Space Image?*

**Submission Hashtag:** `#evn-sp-ai`

### Challenge Mapping

| Requirement | AstraVue |
|---|---|
| NASA / public image | ✅ |
| AI/ML analysis | ✅ |
| 3+ visible features | ✅ |
| Feature highlighting | ✅ |
| Feature labels | ✅ |
| Simple explanation | ✅ |
| Working interface | ✅ |
| Source code | ✅ |
| Image export | ✅ |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **AI:** OpenAI Vision API
- **Data:** NASA Image and Video Library API
- **Validation:** Zod
- **Development:** Node.js, npm, Git, GitHub

---

## 🔬 How It Works

Users can either select an image from the NASA Image and Video Library or upload their own compatible image.

AstraVue then:

1. Sends the image for multimodal AI analysis.
2. Identifies clearly visible features.
3. Generates feature descriptions and spatial coordinates.
4. Renders the detected regions as interactive annotations.
5. Produces a simple-language explanation.
6. Preserves NASA source information when applicable.
7. Allows the annotated result to be downloaded as a PNG.

---

## ⚙️ Run Locally

### Prerequisites

- Node.js
- npm
- OpenAI API key

### Installation

```bash
git clone https://github.com/sanjay-sanju-03/AstraVue.git
cd AstraVue
npm install --legacy-peer-deps
```

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
NASA_API_BASE=https://images-api.nasa.gov
```

Run the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🧪 Testing

```bash
npm run lint
npm run build
```

Manual workflow:

```text
Select NASA Image / Upload Image
        ↓
      Analyze
        ↓
 Feature Detection
        ↓
Bounding Boxes + Labels
        ↓
AI Explanation
        ↓
NASA Attribution
        ↓
Download Annotated PNG
```

---

## 🌍 Data Source

AstraVue uses the **NASA Image and Video Library**:

https://images.nasa.gov/

NASA image titles, IDs, dates, and source information are preserved when available.

---

## 🛡️ Responsible AI

AstraVue provides **AI-assisted visual interpretation**, not scientific measurement. AI results may contain errors, and bounding boxes represent approximate visual regions.

The system is designed to focus on visible evidence and avoid unsupported scientific claims. Important information should be verified against authoritative scientific sources.

---

## 🔐 Privacy

Uploaded images are processed in memory and are not intentionally stored by the application.

---

## 🙏 Acknowledgements

- NASA Image and Video Library
- OpenAI
- NASA Space Apps Challenge
- µLearn Foundation

---

<p align="center">

### 🚀 AstraVue
**See more in every image.**

</p>
```
