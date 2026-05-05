import { useEffect, useState } from 'react';
import { useStore } from '../store';

interface Props { title: string; subtitle: string }

export function Topbar({ title, subtitle }: Props) {
  const { state } = useStore();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const online = state.controllers.filter(c => c.status === 'online').length;

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <div className="crumb">{subtitle}</div>
      </div>

      <div className="topbar-meta">
        <div className="network-pill">
          <span className="live-dot" />
          <span>LAN broadcast :8000</span>
        </div>
        <div className="network-pill">
          <span className="led online" />
          <span>{online} controller online</span>
        </div>
        <div className="network-pill mono" style={{ minWidth: 100, justifyContent: 'center' }}>
          {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </header>
  );
}
