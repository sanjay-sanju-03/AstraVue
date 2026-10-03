# SpaceSnap AI — Submission Package

**Challenge:** SpaceSnap AI — What's Happening in This Space Image?
**Interest Group:** Space · **Hashtag:** `#evn-sp-ai` · **Karma:** 100 points

---

## 1. Approach (100–150 words)

> SpaceSnap AI is a multimodal computer-vision tool that turns a NASA or Earth-observation image into a visual story. The user picks an image from the NASA Image and Video Library or uploads their own.
>
> The server sends the image bytes to a vision-capable model with a strict system prompt forbidding any inference not directly visible. The model returns 3–6 features, each with a label, description, normalized bounding box, and the visible evidence behind it. A Zod schema validates the response and coordinates are clamped to the 0–1000 model space; if fewer than three features come back, the request is retried once with a corrective prompt.
>
> The interface draws each feature as a corner-bracket annotation with a colour-coded label, and pairs it with a detection list and plain-language explanation. The annotated result exports as a PNG drawn on canvas. No database, no authentication, no image storage.

---

## 2. Dataset / Image Source

**Primary source: NASA's official public API — the [NASA Image and Video Library](https://images.nasa.gov/)** (`images-api.nasa.gov`).

- Images are **searched live at runtime** through `GET /api/nasa/search`; nothing is bundled or stored.
- Only imagery that is already public and NASA-published is used.
- Image bytes are relayed to the browser through `/api/proxy-image`, restricted to NASA hosts.
- User-uploaded images are processed in memory and are never persisted.

No training dataset is used — the model performs **zero-shot** visual detection, which is why the README documents that bounding-box tightness can vary between runs.

---

## 3. Sample Images Used

All verified live against the running app:

| # | NASA ID | Title | Detected features |
|---|---------|-------|-------------------|
| 1 | `sl4-143-4707` | View of Skylab space station cluster in Earth orbit from CSM | SPACECRAFT · CLOUD FORMATIONS · EARTH'S CURVATURE |
| 2 | `S39-23-020` | Aurora Australis, Sinuous Loop | AURORA · EARTH'S SURFACE · CLOUD FORMATIONS |
| 3 | `GSFC_20171208_Archive_e000713` | NASA-NOAA's Suomi NPP Satellite Gets Colorful Look at Hurricane Blanca | CYCLONE EYE · DENSE CLOUD BANDS · CLOUD CLUSTER |

**Screenshot used for submission:** run #1 — it shows the spacecraft boxed precisely,
three colour-coded annotations, the detection list with evidence, the plain-language
explanation, and the NASA attribution (`sl4-143-4707`) together in one frame.

---

## 4. What's Required vs. What's Built

| Requirement | Status |
|---|---|
| Step 1 — Select NASA / public Earth-space images | ✅ NASA Image and Video Library search |
| Step 2 — Build an AI/ML system that analyzes the image | ✅ Vision model, server-side |
| Step 3 — Identify ≥3 visible features | ✅ Enforced: retries once, then errors if <3 |
| Step 4 — Highlight or label detected features | ✅ Corner brackets + colour-coded labels |
| Step 5 — Simple-language explanation | ✅ Per-feature evidence + scene explanation |
| Step 6 — Interface: Image → Detection → Explanation | ✅ Single result page |
| Working demo | ✅ `npm run dev` |
| Generated image explanation | ✅ Shown on the result page |
| Screenshot / video of feature detection | ✅ Verified live on `sl4-143-4707` |
| Sample images used | ✅ Listed above |
| Source code / GitHub repository | ⬜ **BLOCKED — see section 7** |
| 100–150 word explanation | ✅ 146 words, this document |

## 5. How to Run

```bash
git clone <repo-url>
cd spacesnap-ai
npm install --legacy-peer-deps
cp .env.example .env.local   # then add your OPENAI_API_KEY
npm run dev
```

Open `http://localhost:3000`.

> `--legacy-peer-deps` is required because `openai` declares an optional peer
> dependency on `zod@^3` while this project uses `zod@4`. The project does not use
> zod through the `openai` client, so bypassing is safe.

---

## 7. ⚠️ Outstanding Blocker: Source Code Submission

The challenge requires a **GitHub repository**, but this project currently has
**no git repository of its own**. `git rev-parse` reports the repo root as
`C:\` — meaning the project sits inside an unrelated repository that tracks the
entire drive. Initialising a repo is safe and quick:

```bash
cd spacesnap-ai
git init
git add .          # .env* is already gitignored — no API key will be committed
git commit -m "SpaceSnap AI: NASA image visual intelligence"
```

Then create an empty repo on GitHub and add it as a remote. `gh` CLI is not
installed on this machine, so the repo will need to be created on github.com and
connected manually.

**Security note:** `.gitignore` already excludes `.env*`, so the `OPENAI_API_KEY`
will not be committed. Verify with `git status` before the first push.

---

## 8. Responsible Language

The UI deliberately avoids implying more certainty than the model provides. It
says **"Detected"**, **"Visible"**, **"AI Visual Explanation"**, and
*"Based on visible image evidence · AI interpretation"* — never "confirmed",
"verified", or "scientifically proven". No confidence percentages are displayed,
because the pipeline does not return a meaningful confidence value and none are
fabricated.
