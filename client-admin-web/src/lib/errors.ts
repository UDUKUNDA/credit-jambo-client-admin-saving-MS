/**
 * errors.ts
 * Small helpers for consistent error handling across pages.
 * Keeps UI logic unchanged while improving code reuse and readability.
 */

/**
 * getErrorMessage
 * Extracts a human-friendly message from API or generic errors.
 */
export function getErrorMessage(err: any): string {
  return err?.response?.data?.error || err?.message || 'Unexpected error';
}