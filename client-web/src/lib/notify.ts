/**
 * Notifications helper for browser push and in-app toasts.
 * Falls back to in-app toast if push permission is denied.
 */
export async function requestPushPermission() {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

/**
 * Show a push notification or emit a toast event.
 */
export function notify(title: string, body?: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      window.dispatchEvent(new CustomEvent('toast', { detail: { title, body, type: 'info' } }));
    }
  } catch {
    window.dispatchEvent(new CustomEvent('toast', { detail: { title, body, type: 'info' } }));
  }
}