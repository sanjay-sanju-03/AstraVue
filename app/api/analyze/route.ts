import { NextResponse } from "next/server";
import { analyzeImage, VISION_MODEL } from "@/lib/vision";
import { AnalysisResultSchema } from "@/lib/schemas";
import { AnalysisResponse } from "@/types/analysis";

const MAX_IMAGE_MB = parseInt(process.env.MAX_IMAGE_MB || "8", 10);
const MAX_BYTES = MAX_IMAGE_MB * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imgUrl = formData.get("imgUrl") as string | null;
    const sourceType = formData.get("sourceType") as "nasa" | "upload";
    const sourceTitle = formData.get("sourceTitle") as string | null;
    const sourceUrl = formData.get("sourceUrl") as string | null;
    const nasaId = formData.get("nasaId") as string | null;

    let bytes: Uint8Array;
    let mimeType: string;

    if (file) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ ok: false, error: { code: "FILE_TOO_LARGE", message: `File exceeds ${MAX_IMAGE_MB} MB limit` } }, { status: 400 });
      }

      mimeType = file.type;
      if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
        return NextResponse.json({ ok: false, error: { code: "INVALID_IMAGE", message: "Please upload a JPG, PNG, or WebP image." } }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      bytes = new Uint8Array(buffer);
    } else if (imgUrl && sourceType === "nasa") {
      const res = await fetch(imgUrl);
      if (!res.ok) throw new Error("Failed to fetch image from NASA API");
      const buffer = await res.arrayBuffer();
      bytes = new Uint8Array(buffer);
      mimeType = res.headers.get("content-type") || "image/jpeg";
    } else {
      return NextResponse.json({ ok: false, error: { code: "MISSING_FILE", message: "No file or image URL provided" } }, { status: 400 });
    }

    let result = await analyzeImage(bytes, mimeType, false);
    
    // Validate length and numbers
    if (!result.features || result.features.length < 3) {
      result = await analyzeImage(bytes, mimeType, true);
    }
    
    if (!result.features || result.features.length < 3) {
      return NextResponse.json({
        ok: false,
        error: { code: "INSUFFICIENT_FEATURES", message: "The image did not contain enough confidently visible features for the challenge requirement. Try a clearer Earth/space image with multiple visible regions." }
      }, { status: 400 });
    }

    // Clamp coordinates
    result.features = result.features.map(f => ({
      ...f,
      box_2d: f.box_2d.map(val => Math.max(0, Math.min(1000, val))) as [number, number, number, number]
    }));

    // Ensure array is capped to 6
    if (result.features.length > 6) {
      result.features = result.features.slice(0, 6);
    }

    const parsedResult = AnalysisResultSchema.parse(result);

    const response: AnalysisResponse = {
      ok: true,
      analysis: parsedResult,
      source: {
        type: sourceType || "upload",
        title: sourceTitle || undefined,
        url: sourceUrl || undefined,
        nasaId: nasaId || undefined
      },
      model: VISION_MODEL
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ ok: false, error: { code: "ANALYSIS_FAILED", message: "The AI analysis could not be completed. Please retry." } }, { status: 500 });
  }
}
