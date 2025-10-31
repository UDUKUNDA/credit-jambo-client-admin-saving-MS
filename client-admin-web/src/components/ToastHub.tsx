import { useEffect, useState } from 'react';

/**
 * ToastHub listens to global 'toast' events and renders transient messages.
 */
export default function ToastHub() {
  const [toasts, setToasts] = useState<Array<{ id: number; title: string; body?: string }>>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { title, body } = (e as CustomEvent).detail || {};
      const id = Date.now();
      setToasts((prev) => [...prev, { id, title, body }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    window.addEventListener('toast', handler as EventListener);
    return () => window.removeEventListener('toast', handler as EventListener);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="shadow-lg rounded-md bg-jamboBlack text-white px-4 py-2">
          <div className="font-semibold text-brand-600">{t.title}</div>
          {t.body && <div className="text-sm opacity-90">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}