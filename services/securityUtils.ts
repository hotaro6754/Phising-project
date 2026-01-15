
/**
 * PhishGuard Security Utilities
 * Implements robust input sanitization and validation for high-security environments.
 */

/**
 * Escapes HTML characters to prevent XSS
 */
export function escapeHTML(str: string): string {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

/**
 * Robust sanitization of user input.
 * - Removes control characters
 * - Limits length to prevent DoS/overflow
 * - Escapes potential HTML tags
 */
export function sanitizeAnalysisInput(input: string, maxLength: number = 2000): string {
  if (!input) return '';

  // 1. Trim whitespace
  let sanitized = input.trim();

  // 2. Enforce length limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // 3. Remove control characters (non-printable)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

  // 4. Basic HTML tag removal (heuristic)
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');

  return sanitized;
}

/**
 * Validates whether the input is safe to process.
 * Blocks obvious malicious injection patterns.
 */
export function isInputSafe(input: string): { safe: boolean; reason?: string } {
  const lowercase = input.toLowerCase();

  // Block suspicious protocol-less javascript links
  if (lowercase.includes('javascript:')) {
    return { safe: false, reason: "Script injection pattern detected." };
  }

  // Block data URIs that might contain payloads
  if (lowercase.includes('data:') && lowercase.includes('base64')) {
    return { safe: false, reason: "Embedded data payloads are restricted." };
  }

  // Block SQL-like injection characters sequences in very short inputs
  if (input.length < 50 && (lowercase.includes('select ') || lowercase.includes('drop table'))) {
    return { safe: false, reason: "Query injection pattern detected." };
  }

  return { safe: true };
}
