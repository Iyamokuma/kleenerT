import { useEffect, useRef } from 'react';
import Icon from '../../components/Icon';
import { initials, statusLabel } from '../lib/format';

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}><span className="badge-dot" />{statusLabel(status)}</span>;
}

export function Avatar({ name, size = 36 }) {
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">{initials(name) || '?'}</span>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && (
        <header className="card-head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ icon = 'inbox', title, children }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} /></span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Skeleton({ rows = 5 }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => <span key={i} style={{ '--w': `${70 + ((i * 37) % 30)}%` }} />)}
    </div>
  );
}

export function ErrorNote({ error }) {
  if (!error) return null;
  return <p className="error-note" role="alert">{error.message || 'Something went wrong.'}</p>;
}

/** Small centred modal on a native <dialog>; used for confirmations and short forms. */
export function Dialog({ open, onClose, title, children, wide = false }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Esc closes the native dialog; keep React state in step with it.
  useEffect(() => {
    const d = ref.current;
    const handle = () => onCloseRef.current();
    d.addEventListener('close', handle);
    return () => d.removeEventListener('close', handle);
  }, []);

  return (
    <dialog
      ref={ref}
      className={`adm-dialog ${wide ? 'adm-dialog-wide' : ''}`.trim()}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
    >
      {open && (
        <div className="adm-dialog-inner">
          <header className="adm-dialog-head">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p className="confirm-body">{body}</p>
      <div className="dialog-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy && <span className="spinner" aria-hidden="true" />} {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
