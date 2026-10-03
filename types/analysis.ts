export type Feature = {
  label: string;
  description: string;
  box_2d: [number, number, number, number];
  evidence: string;
};

export type AnalysisResult = {
  image_summary: string;
  features: Feature[];
  explanation: string;
};

export type AnalysisSource = {
  type: "nasa" | "upload";
  title?: string;
  nasaId?: string;
  url?: string;
};

export type AnalysisResponse = {
  ok: boolean;
  analysis?: AnalysisResult;
  source?: AnalysisSource;
  model?: string;
  error?: {
    code: string;
    message: string;
  };
};
