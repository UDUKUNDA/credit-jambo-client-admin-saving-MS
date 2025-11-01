/**
 * confirm.ts
 * Minimal wrapper to centralize confirmation prompts.
 * Using this keeps behavior identical and enables future customization.
 */

/**
 * confirmAction
 * Shows a confirmation dialog. Returns true if user accepts.
 */
export function confirmAction(message: string): boolean {
  return window.confirm(message);
}