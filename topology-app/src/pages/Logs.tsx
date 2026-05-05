import { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { LogType } from '../types';

const TYPE_LABEL: Record<LogType, string> = {
  discover: 'discover',
  provision: 'provision',
  assign: 'assign',
  unassign: 'unassign',
  open: 'open',
  close: 'close',
  denied: 'denied',
  fault: 'fault',
  system: 'system',
};

const TYPE_TAG: Record<LogType, string> = {
  discover: 'unprov',
  provision: 'occupied',
  assign: 'occupied',
  unassign: 'idle',
  open: 'opening',
  close: 'idle',
  denied: 'fault',
  fault: 'fault',
  system: 'idle',
};

export function Logs() {
  const { state } = useStore();
  const [filter, setFilter] = useState<LogType | 'all'>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => state.logs.filter(l => {
    if (filter !== 'all' && l.type !== filter) return false;
    if (q && !l.message.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [state.logs, filter, q]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lockernet-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="spread">
          <div>
            <h2>Activity Log</h2>
            <div className="muted">{state.logs.length} kejadian · realtime feed dari semua controller</div>
          </div>
          <div className="row">
            <input
              className="input"
              placeholder="Cari pesan…"
              value={q} onChange={e => setQ(e.target.value)}
              style={{ width: 220 }}
            />
            <select className="select" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value as any)}>
              <option value="all">Semua tipe</option>
              {(Object.keys(TYPE_LABEL) as LogType[]).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
            <button className="btn" onClick={exportJson}>Export JSON</button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gap: 6 }}>
        {filtered.length === 0 ? (
          <div className="empty">Tidak ada log yang cocok.</div>
        ) : (
          filtered.map(l => (
            <div key={l.id} className="log-row">
              <span className="ts">{new Date(l.ts).toLocaleTimeString('id-ID')}</span>
              <span className={`tag ${TYPE_TAG[l.type]} type-tag`}>{TYPE_LABEL[l.type]}</span>
              <span className="msg">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
