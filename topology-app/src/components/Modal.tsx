import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { IconClose } from './Icons';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ title, subtitle, children, onClose, footer }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: 12 }}>
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="muted">{subtitle}</div>}
          </div>
          <button className="btn ghost" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        {children}
        {footer && <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}
