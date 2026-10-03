# SpaceSnap AI

> **Turn a NASA space image into an understandable visual story with AI-detected features, on-image labels, and a plain-language explanation.**

Submission hashtag: `#evn-sp-ai` · Interest Group: Space · Challenge: **SpaceSnap AI — What's Happening in This Space Image?**

SpaceSnap AI is a multimodal computer-vision web application built for the NASA Space Apps Challenge pre-selection task. It analyzes NASA and publicly available Earth/space imagery, identifies visible features, places visual labels over the image, and generates a simple-language explanation grounded in the detected visual evidence.

---

## Approach (100–150 words)

SpaceSnap AI is a multimodal computer-vision tool that turns a NASA or Earth-observation image into a visual story. The user picks an image from the NASA Image and Video Library or uploads their own.

The server sends the image bytes to a vision-capable model with a strict system prompt forbidding any inference not directly visible. The model returns 3–6 features, each with a label, description, normalized bounding box, and the visible evidence behind it. A Zod schema validates the response and coordinates are clamped to the 0–1000 model space; if fewer than three features come back, the request is retried once with a corrective prompt.

The interface draws each feature as a corner-bracket annotation with a colour-coded label, and pairs it with a detection list and plain-language explanation. The annotated result exports as a PNG drawn on canvas. No database, no authentication, no image storage.

---

## Dataset / Image Source

**Primary source: NASA's official public API — the [NASA Image and Video Library](https://images.nasa.gov/)** (`images-api.nasa.gov`).

- Images are **searched live at runtime** via `GET /api/nasa/search`; nothing is bundled or stored.
- Only imagery that is already public and NASA-published is used.
- Image bytes reach the browser through `/api/proxy-image`, restricted to NASA hosts.
- User uploads are processed in memory and never persisted.

No training dataset is used — the model performs **zero-shot** visual detection, which is why bounding-box tightness can vary between runs.

### Sample images used

| NASA ID | Title | Features detected |
|---|---|---|
| `sl4-143-4707` | View of Skylab space station cluster in Earth orbit from CSM | SPACECRAFT · CLOUD FORMATIONS · EARTH'S CURVATURE |
| `S39-23-020` | Aurora Australis, Sinuous Loop | AURORA · EARTH'S SURFACE · CLOUD FORMATIONS |
| `GSFC_20171208_Archive_e000713` | NASA-NOAA's Suomi NPP Satellite Gets Colorful Look at Hurricane Blanca | CYCLONE EYE · DENSE CLOUD BANDS · CLOUD CLUSTER |

---

## Features

- **NASA Image and Video Library Integration:** Search and select directly from NASA's official image gallery.
- **Multimodal AI Analysis:** Powered by OpenAI's `gpt-4o` vision model to detect 3–6 distinct, meaningful visible features (clouds, ocean, land, storms, etc.).
- **Guaranteed 3+ Features:** If the first pass returns fewer than three, the request is retried once with a corrective prompt; if it still falls short the user gets a clear error rather than a misleading result.
- **Visual Annotations:** Feature regions are outlined with corner brackets and labeled in place. Annotation geometry is locked to the image's intrinsic aspect ratio, so boxes stay aligned on non-square images, and label type keeps a fixed readable size at every viewport.
- **Explainable AI:** Every feature carries a short description plus the visible evidence it was drawn from, alongside a plain-language explanation of the whole scene.
- **Annotated PNG Export:** The result renders to canvas and downloads with boxes, labels, and an attribution footer.
- **Mission-control UI:** Dark space-inspired design system built from CSS custom properties (no hard-coded colors), with a cinematic staged analysis loader and a calm error surface.
- **Responsive & accessible:** Stacks to a single column on mobile with no horizontal overflow, keyboard-operable detection list, visible focus states, and full `prefers-reduced-motion` support.

## Architecture & Tech Stack

- **Framework:** Next.js 16.3 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 (CSS custom properties in `app/globals.css`)
- **AI / Machine Learning:** OpenAI Node SDK (`openai`) with a vision-capable model
- **Validation:** Zod schemas
- **No Database / Authentication:** Fully stateless. Images are processed in memory and not intentionally persisted.

### Project structure

```
app/
  page.tsx                  UI state machine (home → input → loading → result)
  globals.css               Design tokens, ambient backdrop, motion
  api/analyze/route.ts      POST — validates image, returns 3–6 validated features
  api/nasa/search/route.ts  GET — NASA Image and Video Library proxy
  api/proxy-image/route.ts  GET — NASA-host-restricted image relay
components/
  navbar, hero              Landing
  upload-zone, nasa-gallery Input
  analysis-workspace        Result layout
  image-viewer              Canvas + annotation + label overlay
  detection-list            Feature list ↔ image sync
  analysis-panels           Explanation + NASA attribution
  status-states             Loading / error / empty
lib/
  vision.ts                 System prompt, vision call, retry
  schemas.ts                Zod contracts
  feature-theme.ts          Feature colours, numbering, image URL helper
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanjay-sanju-03/SpaceSnap-AI.git
   cd SpaceSnap-AI
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

   > `--legacy-peer-deps` is required: `openai` declares an optional peer dependency on
   > `zod@^3`, while this project uses `zod@4`. The project does not use zod through
   > the `openai` client, so the conflict is safe to bypass.

3. **Configure Environment Variables**
   Copy `.env.example` to `.env.local` and add your OpenAI API key:
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

## How It Works

```
Search NASA imagery or upload an image
        ↓
Server fetches the bytes and sends them to the vision model
        ↓
Model returns 3–6 features with bounding boxes + evidence
        ↓
Zod validation · coordinates clamped to 0–1000 · retried once if <3 features
        ↓
Corner-bracket annotations + colour-coded labels drawn on the image
        ↓
Detection list, visible evidence, plain-language explanation, NASA attribution
        ↓
Export annotated PNG
```

## Responsible Language

The UI deliberately avoids implying more certainty than the model provides. It
says **Detected**, **Visible**, and **AI Visual Explanation**, and is footed with
*"Based on visible image evidence · AI interpretation"* — never *confirmed*,
*verified*, or *scientifically proven*. No confidence percentages are shown,
because the pipeline does not return a meaningful confidence value and none are
fabricated.

## Limitations

- Only uses 2D visible bounding boxes, not polygonal segmentation.
- Relies on zero-shot visual detection; bounding box tightness may vary between runs.
- Does not persist state across browser refreshes.
- Images are relayed through `/api/proxy-image` (restricted to NASA hosts) because the NASA CDN is not directly reachable from every network. Uploaded images are never sent to that route.

## Future Improvements

- Multi-image temporal comparison (e.g., watching a hurricane evolve).
- Polygonal or masked segmentation.
- Per-feature confidence once the model can return a calibrated value.

---

## Built for NASA Space Apps Challenge 2026 Pre-Selection

**Challenge:** SpaceSnap AI — What's Happening in This Space Image?
**Interest Group:** Space · **Hashtag:** `#evn-sp-ai`
**Author:** Sanjay KP
