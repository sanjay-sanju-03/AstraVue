# SpaceSnap AI

> **Turn a NASA space image into an understandable visual story with AI-detected features, on-image labels, and a plain-language explanation.**

Submission hashtag: `#evn-sp-ai`

SpaceSnap AI is a multimodal computer-vision web application built for the NASA Space Apps Challenge pre-selection task. It analyzes NASA and publicly available Earth/space imagery, identifies visible features, places visual labels over the image, and generates a simple-language explanation grounded in the detected visual evidence.

## Features
- **NASA Image and Video Library Integration:** Search and select directly from NASA's official image gallery.
- **Multimodal AI Analysis:** Powered by OpenAI's `gpt-4o` vision model to intelligently detect 3–6 distinct, meaningful visual features (clouds, ocean, land, etc.).
- **Visual Annotations:** Feature regions are outlined with corner brackets and labeled in place. Annotation geometry is locked to the image's intrinsic aspect ratio, and label type stays a fixed readable size at every viewport.
- **Explainable AI:** Every feature carries a short description plus the visible evidence it was drawn from, alongside a plain-language explanation of the whole scene.
- **Mission-control UI:** Dark space-inspired design system built from CSS custom properties (no hard-coded colors), with a cinematic staged analysis loader, calm error surface, and NASA attribution panel.
- **Responsive & accessible:** Stacks to a single column on mobile with no horizontal overflow, keyboard-operable detection list, visible focus states, and full `prefers-reduced-motion` support.

## Architecture & Tech Stack
- **Framework:** Next.js 16.3 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS v4
- **AI / Machine Learning:** OpenAI Node SDK (`openai`) with a vision-capable model 
- **Validation:** Zod schemas
- **No Database / Authentication:** Fully stateless API design. Images are processed and not intentionally persisted.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd spacesnap-ai
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

   > `--legacy-peer-deps` is required: `openai` declares an optional peer dependency on
   > `zod@^3`, while this project uses `zod@4`. The project does not use zod through
   > the `openai` client, so the conflict is safe to bypass.

3. **Configure Environment Variables**
   Rename `.env.example` to `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o
   NASA_API_BASE=https://images-api.nasa.gov
   MAX_IMAGE_MB=8
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`.

## Limitations
- Only uses 2D visible bounding boxes, not polygonal segmentation.
- Relies on zero-shot visual detection; bounding box tightness may vary between runs.
- Does not persist state across browser refreshes.
- Images are relayed through `/api/proxy-image` (restricted to NASA hosts) because the NASA CDN is not directly reachable from every network. Uploaded images are never sent to that route.

## Future Improvements
- Multi-image temporal comparison (e.g., watching a hurricane evolve).
- Download annotated PNG generation feature.
- Polygonal or masked segmentation.

## Built for NASA Space Apps Challenge 2026 Pre-Selection
Challenge: SpaceSnap AI — What’s Happening in This Space Image?
Team / Author: (Participant)
