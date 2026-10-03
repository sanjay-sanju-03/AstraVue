# 🚀 AstraVue

> AI-powered visual intelligence for understanding space and Earth-observation imagery.

[Live Demo](https://astra-vue.vercel.app/) · [GitHub](https://github.com/sanjay-sanju-03/AstraVue)

## 🌌 What is AstraVue?

AstraVue is an AI-powered visual intelligence platform that analyzes NASA and publicly available Earth and space imagery, identifies important visible features, highlights them directly on the image, and explains the scene in simple language.

Instead of requiring users to understand complex scientific imagery, AstraVue transforms an image into an interactive visual report.

## 🎯 The Problem

Space and Earth-observation imagery contains valuable information, but understanding what is visible often requires specialized knowledge.

Users may struggle to identify:

- Cloud formations
- Oceans, forests, and urban regions
- Fires and atmospheric structures
- Spacecraft and astronomical objects
- Craters, ice, and landforms

AstraVue addresses this gap by combining computer vision and natural-language explanation into one simple visual workflow.

## 💡 Our Solution

```text
IMAGE
  ↓
AI VISUAL ANALYSIS
  ↓
FEATURE DETECTION
  ↓
VISUAL ANNOTATION
  ↓
SIMPLE-LANGUAGE EXPLANATION
```

Users can select an image from the NASA Image and Video Library or upload their own compatible image. AstraVue identifies visible features, maps them to regions in the image, and produces an easy-to-understand explanation.

## ✨ Key Features

### 🛰️ NASA Image Explorer

Search and select public imagery from the NASA Image and Video Library.

### 🤖 AI Visual Analysis

Analyze images with a multimodal OpenAI vision model.

### 🔍 Feature Detection

Identify 3–6 important visible features in an image, with descriptions and visual evidence.

### 🎯 Visual Bounding Boxes

Feature regions are highlighted directly on the source image and kept aligned across responsive layouts.

### 🏷️ Intelligent Labels

Every detected feature receives a numbered, colour-coded label that can be selected from the detection list.

### 🧠 Simple Explanation

Generate a plain-language explanation grounded only in visible image evidence.

### 📥 Annotated Image Export

Download the analyzed image with feature annotations and an attribution footer as PNG.

### 🔗 Source Attribution

Preserve NASA image titles, IDs, and original source links when imagery comes from NASA.

### 📱 Responsive Interface

Use the analysis workflow across desktop, tablet, and mobile layouts with keyboard-operable controls and reduced-motion support.

## 🛰️ NASA Space Apps Challenge

### Challenge

**AI & Machine Learning — "What's Happening in This Space Image?"**

### Submission Hashtag

`#evn-sp-ai`

### Challenge Mapping

| Challenge requirement | AstraVue implementation |
| --- | --- |
| NASA / public image source | NASA Image and Video Library search and attribution |
| AI/ML analysis | Multimodal vision model with structured JSON output |
| Identify at least 3 features | Validation and retry flow for 3–6 visible features |
| Highlight detected features | Responsive image annotations and bounding boxes |
| Label features | Numbered labels and synchronized detection list |
| Simple explanation | Evidence-grounded plain-language explanation |
| Working interface | Next.js application with NASA search and upload flows |
| Source code | TypeScript, React, and server routes in this repository |
| Image export | Annotated PNG download from the analysis workspace |

## 🔬 How AstraVue Works

```text
              NASA IMAGE LIBRARY
                     │
                     ▼
              IMAGE SELECTION
                     │
             ┌───────┴────────┐
             │                │
       NASA IMAGE        USER UPLOAD
             │                │
             └───────┬────────┘
                     ▼
              IMAGE ANALYSIS
                     │
                     ▼
              VISION AI MODEL
                     │
                     ▼
            FEATURE DETECTION
                     │
          ┌──────────┴──────────┐
          │                     │
     FEATURE DATA          BOUNDING BOX
          │                     │
          └──────────┬──────────┘
                     ▼
             VISUAL ANNOTATION
                     │
                     ▼
             AI EXPLANATION
                     │
                     ▼
            INTERACTIVE REPORT
```

## 🧠 AI Pipeline

For each image, AstraVue asks the vision model to identify clearly visible features. Each feature contains a label, description, normalized coordinates, and evidence:

```json
{
  "label": "Cloud Formation",
  "description": "A large cloud formation is visible over the ocean.",
  "box_2d": [120, 210, 490, 780],
  "evidence": "Bright clustered cloud structures are visible in the upper-right region."
}
```

The application validates the model response with Zod, clamps coordinates to the 0–1000 image space, and retries once when fewer than three usable features are returned.

### AI Design Principles

AstraVue is designed to:

- Focus on visible evidence
- Avoid inventing unseen objects or locations
- Provide simple explanations
- Avoid unsupported scientific claims
- Communicate uncertainty when appropriate
- Separate visual interpretation from scientific measurement

## 🖥️ Product Walkthrough

### 01 — Select an Image

Choose imagery from NASA or upload a JPG, PNG, or WEBP image.

### 02 — Analyze

Start the AI visual analysis and wait for the validated result.

### 03 — Detect Features

AstraVue identifies visible features and highlights them directly on the image.

### 04 — Understand the Image

Read the detection descriptions, visible evidence, source information, and simple-language explanation.

### 05 — Export the Result

Download the annotated image as a PNG.

```text
Open AstraVue
      ↓
Select NASA Image or Upload Image
      ↓
Analyze Image
      ↓
AI Detects Features
      ↓
Visual Annotations
      ↓
AI Explanation
      ↓
Download Annotated Image
```

## 🛠️ Technology Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4

### AI

- OpenAI Node SDK
- Vision-capable model
- Structured JSON response validation

### Data

- NASA Image and Video Library API
- NASA-host-restricted image proxy

### Validation

- Zod

### Development

- Node.js
- npm
- Git
- GitHub

## 🏗️ System Architecture

```text
┌───────────────────────────────────────────┐
│              AstraVue Frontend            │
│        Next.js + React + TypeScript       │
└───────────────────┬───────────────────────┘
                    │
                    ▼
          ┌───────────────────┐
          │  Analysis API     │
          │  /api/analyze     │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │   Vision AI       │
          │      Model        │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Structured JSON   │
          │ Features + Boxes  │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Image Annotations │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Visual AI Report  │
          └───────────────────┘

       ┌──────────────────────────┐
       │ NASA Image & Video API   │
       └────────────┬─────────────┘
                    │
                    ▼
              NASA Imagery
```

## 📂 Project Structure

```text
astravue/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── nasa/search/route.ts
│   │   └── proxy-image/route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── icon.svg
├── components/
│   ├── navbar.tsx
│   ├── hero.tsx
│   ├── upload-zone.tsx
│   ├── nasa-gallery.tsx
│   ├── analysis-workspace.tsx
│   ├── image-viewer.tsx
│   ├── detection-list.tsx
│   ├── analysis-panels.tsx
│   └── status-states.tsx
├── lib/
│   ├── feature-theme.ts
│   ├── schemas.ts
│   └── vision.ts
├── public/
├── types/analysis.ts
├── .env.example
├── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- An OpenAI API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sanjay-sanju-03/AstraVue.git
   cd AstraVue
   ```

2. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

   The legacy peer-dependency flag is required because this project uses Zod 4 while the OpenAI package declares an optional Zod 3 peer dependency.

3. Create `.env.local` from `.env.example` and add your key:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o
   NASA_API_BASE=https://images-api.nasa.gov
   MAX_IMAGE_MB=8
      NEXT_PUBLIC_API_URL=
      FRONTEND_URL=http://localhost:3000
      ```

   Never commit API keys to GitHub.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## 🔐 Environment Variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `OPENAI_API_KEY` | Vision model access | Yes |
| `OPENAI_MODEL` | Model name, defaulting to `gpt-4o` | No |
| `NASA_API_BASE` | NASA Image API base URL | No |
| `MAX_IMAGE_MB` | Maximum upload size in megabytes | No |
| `NEXT_PUBLIC_API_URL` | Public Render API URL used by the Vercel frontend | Production |
| `FRONTEND_URL` | Allowed Vercel origin for Render CORS | Production |

## 🚀 Vercel + Render Deployment

This repository includes `vercel.json` for the Next.js frontend and `render.yaml` for the Express API service.

### Render backend

1. Create a Render Blueprint from this repository, or create a Node web service manually.
2. Use `npm install --legacy-peer-deps && npm run backend:build` as the build command.
3. Use `npm run backend:start` as the start command.
4. Add `OPENAI_API_KEY` as a secret environment variable.
5. Set `FRONTEND_URL` to the deployed Vercel origin.
6. Confirm the service responds at `/health`.

The backend serves `/api/analyze`, `/api/nasa/search`, and `/api/proxy-image`.

### Vercel frontend

1. Import the repository into Vercel as a Next.js project.
2. Set `NEXT_PUBLIC_API_URL` to the Render service URL, without a trailing slash.
3. Deploy after the Render service is available.

For local development, leave `NEXT_PUBLIC_API_URL` empty to use the existing Next.js API routes. The separate Render service is started locally with `npm run backend:dev`.

## 🧪 Testing

Run linting:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

Manual verification should cover both paths:

```text
NASA image → Analyze → 3+ detections → Annotations → Explanation → Attribution → PNG export
Local image → Upload → Analyze → Successful result
```

## 📊 Example Output

### Detected Features

```text
01  SPACECRAFT
02  CLOUD FORMATION
03  EARTH'S HORIZON
```

### AI Explanation

> This image shows a spacecraft above Earth's atmosphere. Cloud formations are visible across the Earth's surface, while the curved horizon separates the planet from the surrounding darkness of space.

## 🌍 NASA Data Source

AstraVue uses the [NASA Image and Video Library](https://images.nasa.gov/). Images are searched live at runtime, and the application preserves available NASA titles, IDs, dates, and source links in the analysis view.

User uploads are processed in memory and are not intentionally persisted.

## 🛡️ Responsible AI

AstraVue is designed for visual interpretation, not scientific measurement. AI results may contain errors, and bounding boxes are approximate visual regions.

The system is specifically instructed not to infer exact geographic coordinates, temperatures, weather measurements, scientific measurements, or unsupported event classifications from pixels alone. Important information should be checked against authoritative scientific sources.

## ⚠️ Limitations

- Detection quality depends on image quality and composition.
- Visually ambiguous features may be incorrectly identified.
- Bounding boxes are approximate visual regions rather than segmentation masks.
- AI explanations are interpretations rather than scientific conclusions.
- State does not persist across a browser refresh.

## 🔮 Future Scope

- Temporal image comparison
- Satellite change detection
- Geospatial overlays
- Earth-observation time-series analysis
- Specialized Earth-science models
- Multi-image analysis
- Scientific metadata integration
- Interactive mission datasets

## 🙏 Acknowledgements

- NASA Image and Video Library
- OpenAI
- NASA Space Apps Challenge
- µLearn Foundation

## 📄 License

This project was created as part of the NASA Space Apps Challenge. Add the chosen license here before public release.

<p align="center">

### 🚀 See the image. Understand the story.

**AstraVue — AI-powered visual intelligence for space & Earth imagery.**

</p>
