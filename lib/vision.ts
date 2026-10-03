import OpenAI from "openai";
import { AnalysisResultData, AnalysisResultSchema } from "./schemas";

const SYSTEM_PROMPT = `You are AstraVue, a visual analysis assistant for NASA and publicly available Earth/space imagery.

Analyze the supplied image strictly from what is visibly present. Do not invent geographic locations, events, weather conditions, causes, dates, or scientific measurements that cannot be established from the image alone.

Task:
1. Identify 3 to 6 important visible features in the image.
2. Prioritize meaningful Earth/space features such as clouds, storm structures, ocean, forest/vegetation, wildfire/fire scar, ice/snow, desert terrain, urban area, coastline, crater, mountain/landform, or spacecraft/astronomical objects.
3. Every feature must be directly visible in the image.
4. For every feature, return a descriptive label, a short factual description, a bounding box, and evidence.
5. Bounding boxes must use [ymin, xmin, ymax, xmax] with integer coordinates normalized to 0–1000.
6. Perform a separate visual localization pass before writing the JSON. Each box must enclose the complete visible feature while excluding surrounding background.
7. For a spacecraft or other small object, trace the outermost visible silhouette and include all visible appendages, but do not include nearby terrain, empty space, or its shadow just to make the box larger.
8. For a crater, cloud, or other localized feature, box the actual visible feature or cluster rather than the entire surrounding surface or region.
9. Use broad boxes only when the label itself describes a genuinely broad visible region, such as an ocean or the Earth's surface.
10. Avoid duplicate features and avoid generic labels such as "image" or "object".
11. Write a simple-language explanation of the entire image using only the detected evidence.
12. Keep the explanation understandable to a general audience, not a scientific paper.
13. If the image is ambiguous, say so in the image_summary rather than guessing.

Minimum requirement: return at least 3 features when three or more visible features can reasonably be identified.

You MUST respond ONLY with a valid JSON object. No markdown, no code fences. Exactly this shape:
{
  "image_summary": "string",
  "features": [
    {
      "label": "string",
      "description": "string",
      "box_2d": [ymin, xmin, ymax, xmax],
      "evidence": "string"
    }
  ],
  "explanation": "string"
}`;

const RETRY_PROMPT = `Re-inspect the same image and return exactly 3 to 6 clearly visible, non-duplicate features.
First perform a careful visual localization pass. Every bounding box must tightly enclose the complete visible feature and exclude surrounding background.
For spacecraft and other small objects, include the whole visible silhouette and appendages, not nearby terrain, empty space, or shadow.
For craters and localized features, do not box the entire surrounding surface.
Do not invent details. Include bounding boxes in [ymin, xmin, ymax, xmax] normalized to 0–1000.
Return only valid JSON matching the required schema.`;

const BOX_REVIEW_PROMPT = `Review the supplied image and the proposed feature list below.
Return the same features in the same order, preserving every label, description, evidence, and explanation exactly.
Only correct the box_2d values.

For each feature, draw one tight box around the complete visible feature itself.
For spacecraft, include the entire visible spacecraft and every attached solar panel or appendage, while excluding surrounding Earth, clouds, empty space, and shadow.
For localized craters or cloud formations, exclude the surrounding region.
Coordinates must be [ymin, xmin, ymax, xmax], integers normalized to 0–1000.
Return only valid JSON matching the original schema.

Proposed analysis:
`;

/** Single source of truth for which vision model performs the analysis. */
export const VISION_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export async function analyzeImage(
  imageBytes: Uint8Array,
  mimeType: string,
  isRetry: boolean = false
): Promise<AnalysisResultData> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const client = new OpenAI({ apiKey });
  const model = VISION_MODEL;
  const base64 = Buffer.from(imageBytes).toString("base64");
  const imageUrl = `data:${mimeType};base64,${base64}`;
  const userPrompt = isRetry ? RETRY_PROMPT : "Analyze this space/Earth image and return the JSON.";

  // Retry up to 3 times for transient errors
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
              { type: "text", text: userPrompt },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error("No content in OpenAI response");

      const result = JSON.parse(text) as AnalysisResultData;
      return await verifyFeatureBoxes(client, imageUrl, result);
    } catch (err: unknown) {
      lastError = err as Error;
      const msg = (err as Error).message || "";
      const isTransient =
        msg.includes("503") ||
        msg.includes("529") ||
        msg.includes("overloaded") ||
        msg.includes("rate_limit") ||
        msg.includes("timeout");
      if (isTransient && attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 2000));
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("Analysis failed after retries");
}

async function verifyFeatureBoxes(
  client: OpenAI,
  imageUrl: string,
  result: AnalysisResultData
): Promise<AnalysisResultData> {
  try {
    const response = await client.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "system",
          content: "You are AstraVue's precise visual bounding-box verification assistant.",
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            { type: "text", text: `${BOX_REVIEW_PROMPT}${JSON.stringify(result)}` },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) return result;

    const reviewed = AnalysisResultSchema.parse(JSON.parse(text));
    if (reviewed.features.length !== result.features.length) return result;

    return {
      ...result,
      features: result.features.map((feature, index) => ({
        ...feature,
        box_2d: reviewed.features[index].box_2d,
      })),
    };
  } catch {
    // Box verification is an enhancement; retain the original valid analysis if it fails.
    return result;
  }
}
