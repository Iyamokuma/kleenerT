import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from '../../components/Icon';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((input) => {
    const t = { id: nextId++, tone: 'success', duration: 4500, ...(typeof input === 'string' ? { title: input } : input) };
    setToasts((list) => [...list.slice(-3), t]);
    timers.current[t.id] = setTimeout(() => dismiss(t.id), t.duration);
    return t.id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tone}`}>
            <span className="toast-icon"><Icon name={t.tone === 'error' ? 'close' : t.tone === 'info' ? 'inbox' : 'check'} /></span>
            <div className="toast-body">
              <strong>{t.title}</strong>
              {t.body && <span>{t.body}</span>}
            </div>
            {t.action && (
              <button type="button" className="toast-action" onClick={() => { t.action.onClick(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss"><Icon name="close" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
