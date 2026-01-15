
import { AnalysisResult, N8NWebhookPayload } from '../types';
import { N8N_THRESHOLD } from '../constants';

/**
 * PhishGuard n8n Automation Bridge
 * 
 * TRIGGERS: 
 * - Standard Alert: Risk Score > 60
 * - Critical Response (Email/Telegram): Risk Score > 80
 * 
 * SAMPLE PAYLOAD:
 * {
 *   "analysisId": "550e8400-e29b-41d4-a716-446655440000",
 *   "riskScore": 92,
 *   "threatLabel": "FRAUD",
 *   "inputSnippet": "URGENT: Your account has been compromised. Log in at...",
 *   "explanation": "Credential harvesting signature found in the redirect URL.",
 *   "detectedAt": "2024-03-15T10:30:00Z"
 * }
 */
export async function triggerN8NWebhook(result: AnalysisResult): Promise<void> {
  // Only trigger automation if risk exceeds the base threshold
  if (result.score < N8N_THRESHOLD) {
    console.debug(`[PhishGuard] Risk score (${result.score}) below automation threshold (${N8N_THRESHOLD}).`);
    return;
  }

  const payload: N8NWebhookPayload = {
    analysisId: result.id,
    riskScore: result.score,
    threatLabel: result.label,
    inputSnippet: result.input.substring(0, 150) + (result.input.length > 150 ? '...' : ''),
    explanation: result.explanation,
    detectedAt: result.timestamp
  };

  console.log('--- [PhishGuard Automation Engine] ---');
  console.log(`Event: Threat Analysis Completed`);
  console.log(`Severity: ${result.score > 80 ? 'CRITICAL' : 'WARNING'}`);
  console.log(`Action: Triggering n8n workflow for ID: ${result.id}`);

  // For Hackathon Demo: Log the specific payload that would be sent to n8n
  console.log('JSON Payload Sent to n8n Webhook:', JSON.stringify(payload, null, 2));

  // Actual production implementation (Commented out for demo safety)
  /*
  try {
    const response = await fetch('https://your-n8n-domain.com/webhook/phishguard-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PhishGuard-Source': 'Forensic-Engine-V3'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('[PhishGuard] n8n Automation Triggered Successfully.');
    } else {
      console.error('[PhishGuard] Automation Bridge returned error:', response.status);
    }
  } catch (error) {
    console.error('[PhishGuard] Network error during automation trigger:', error);
  }
  */

  if (result.score > 80) {
    console.log(`[ALERT] Critical threat detected (ID: ${result.id}, Label: ${result.label}). Dispatching email to security-ops@yourcompany.com via n8n.`);
  }
}
