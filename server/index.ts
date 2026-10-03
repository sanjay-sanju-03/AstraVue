import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import { analyzeImage, VISION_MODEL } from "../lib/vision";
import { AnalysisResultSchema } from "../lib/schemas";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 10000);
const maxImageMb = Number.parseInt(process.env.MAX_IMAGE_MB || "8", 10);
const maxBytes = maxImageMb * 1024 * 1024;
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes },
});

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedNasaHosts = ["nasa.gov", "images-assets.nasa.gov", "images-api.nasa.gov"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed."));
    },
  })
);

function isAllowedNasaUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  return (
    (parsed.protocol === "https:" || parsed.protocol === "http:") &&
    allowedNasaHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    )
  );
}

function jsonError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "astravue-api" });
});

app.get("/api/nasa/search", async (req, res) => {
  const query = String(req.query.q || "earth from space");
  const baseUrl = process.env.NASA_API_BASE || "https://images-api.nasa.gov";
  const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&media_type=image&page=1&page_size=8`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from NASA API" });
    }
    return res.json(await response.json());
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = String(req.query.url || "");
  if (!imageUrl || !isAllowedNasaUrl(imageUrl)) {
    return res.status(403).json({ error: "NASA host not allowed" });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: { Accept: "image/*" },
      redirect: "follow",
    });
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch image" });
    }

    const contentType = (response.headers.get("content-type") || "image/jpeg")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!allowedContentTypes.includes(contentType)) {
      return res.status(415).json({ error: "Unsupported content type" });
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 25 * 1024 * 1024) {
      return res.status(413).json({ error: "Image too large" });
    }

    return res
      .set("Content-Type", contentType)
      .set("Cache-Control", "public, max-age=3600")
      .send(Buffer.from(buffer));
  } catch {
    return res.status(500).json({ error: "Proxy error" });
  }
});

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const imgUrl = typeof req.body.imgUrl === "string" ? req.body.imgUrl : null;
    const sourceType = req.body.sourceType === "nasa" ? "nasa" : "upload";
    const sourceTitle = typeof req.body.sourceTitle === "string" ? req.body.sourceTitle : undefined;
    const sourceUrl = typeof req.body.sourceUrl === "string" ? req.body.sourceUrl : undefined;
    const nasaId = typeof req.body.nasaId === "string" ? req.body.nasaId : undefined;

    let bytes: Uint8Array;
    let mimeType: string;

    if (file) {
      if (!allowedContentTypes.slice(0, 3).includes(file.mimetype)) {
        return jsonError(res, 400, "INVALID_IMAGE", "Please upload a JPG, PNG, or WebP image.");
      }
      bytes = new Uint8Array(file.buffer);
      mimeType = file.mimetype;
    } else if (imgUrl && sourceType === "nasa") {
      if (!isAllowedNasaUrl(imgUrl)) {
        return jsonError(res, 403, "NASA_HOST_NOT_ALLOWED", "Only NASA image URLs are supported.");
      }
      const response = await fetch(imgUrl);
      if (!response.ok) throw new Error("Failed to fetch image from NASA API");
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > maxBytes) {
        return jsonError(res, 400, "FILE_TOO_LARGE", `File exceeds ${maxImageMb} MB limit`);
      }
      bytes = new Uint8Array(buffer);
      mimeType = response.headers.get("content-type") || "image/jpeg";
    } else {
      return jsonError(res, 400, "MISSING_FILE", "No file or image URL provided");
    }

    let result = await analyzeImage(bytes, mimeType, false);
    if (!result.features || result.features.length < 3) {
      result = await analyzeImage(bytes, mimeType, true);
    }
    if (!result.features || result.features.length < 3) {
      return jsonError(
        res,
        400,
        "INSUFFICIENT_FEATURES",
        "The image did not contain enough visible features. Try a clearer Earth or space image."
      );
    }

    result.features = result.features.slice(0, 6).map((feature) => ({
      ...feature,
      box_2d: feature.box_2d.map((value) => Math.max(0, Math.min(1000, value))) as [
        number,
        number,
        number,
        number
      ],
    }));

    const analysis = AnalysisResultSchema.parse(result);
    return res.json({
      ok: true,
      analysis,
      source: {
        type: sourceType,
        title: sourceTitle,
        url: sourceUrl,
        nasaId,
      },
      model: VISION_MODEL,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return jsonError(res, 500, "ANALYSIS_FAILED", "The AI analysis could not be completed. Please retry.");
  }
});

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    jsonError(res, 400, "FILE_TOO_LARGE", `File exceeds ${maxImageMb} MB limit`);
    return;
  }
  jsonError(res, 500, "SERVER_ERROR", "The AstraVue API could not complete the request.");
});

app.listen(port, () => {
  console.log(`AstraVue API listening on port ${port}`);
});
