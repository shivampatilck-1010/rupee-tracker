/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Validate input length and content
 */
export function validateInput(input: string, maxLength: number = 500): boolean {
  if (!input || input.trim().length === 0) {
    return false;
  }
  if (input.length > maxLength) {
    return false;
  }
  return true;
}
