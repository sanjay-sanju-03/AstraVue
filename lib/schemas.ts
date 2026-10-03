import { z } from "zod";

export const FeatureSchema = z.object({
  label: z.string().min(1),
  description: z.string(),
  box_2d: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  evidence: z.string(),
});

export const AnalysisResultSchema = z.object({
  image_summary: z.string(),
  features: z.array(FeatureSchema),
  explanation: z.string(),
});

export type FeatureData = z.infer<typeof FeatureSchema>;
export type AnalysisResultData = z.infer<typeof AnalysisResultSchema>;
