
import { ThreatLevel } from './types';

export const THREAT_CONFIG = {
  [ThreatLevel.SAFE]: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-500/20',
    glow: 'neon-glow-emerald',
    icon: 'ShieldCheck'
  },
  [ThreatLevel.SUSPICIOUS]: {
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-500/20',
    glow: 'neon-glow-amber',
    icon: 'AlertTriangle'
  },
  [ThreatLevel.FRAUD]: {
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-500/20',
    glow: 'neon-glow-rose',
    icon: 'ShieldAlert'
  }
};

export const N8N_THRESHOLD = 60; // Trigger automation if risk > 60
