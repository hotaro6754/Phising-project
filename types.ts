
export enum ThreatLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  FRAUD = 'FRAUD'
}

export interface Indicator {
  type: 'URL' | 'KEYWORD' | 'BEHAVIOR' | 'FINANCIAL';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  id: string;
  input: string;
  score: number; // 0-100
  label: ThreatLevel;
  explanation: string;
  indicators: Indicator[];
  groundingLinks?: GroundingLink[];
  timestamp: string;
}

export interface N8NWebhookPayload {
  analysisId: string;
  riskScore: number;
  threatLabel: ThreatLevel;
  inputSnippet: string;
  explanation: string;
  detectedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export type View = 'auth' | 'dashboard' | 'public-report';
