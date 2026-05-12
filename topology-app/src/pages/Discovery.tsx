import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { candidateControllers, lockersFor } from '../data/mock';
import { IconRadar, IconCheck, IconRefresh, IconWifi } from '../components/Icons';
import type { Controller } from '../types';

interface Blip { id: string; x: number; y: number; }

export function Discovery({ onDone }: { onDone?: () => void }) {
  const { state, dispatch, log } = useStore();
  const [blips, setBlips] = useState<Blip[]>([]);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);

  const known = useMemo(() => new Set(state.controllers.map(c => c.id)), [state.controllers]);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  const startScan = () => {
    setFoundIds([]);
    setBlips([]);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    dispatch({ type: 'scan/start' });
    log('discover', 'UDP broadcast 255.255.255.255:8000 — scanning LAN…');

    const total = candidateControllers.length;
    candidateControllers.forEach((cand, i) => {
      const delay = 600 + i * 750 + Math.random() * 300;
      const tt = window.setTimeout(() => {
        const angle = (i / total) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 70 + Math.random() * 60;
        const x = 50 + Math.cos(angle) * radius * 0.45;
        const y = 50 + Math.sin(angle) * radius * 0.45;
        setBlips(b => [...b, { id: cand.id, x, y }]);
        setFoundIds(f => [...f, cand.id]);

        const ctrl: Controller = {
          ...cand,
          status: known.has(cand.id) ? 'online' : 'unprovisioned',
          classId: state.controllers.find(c => c.id === cand.id)?.classId ?? null,
          lastSeen: Date.now(),
        };
        const lockers = state.lockers.some(l => l.controllerId === cand.id)
          ? undefined
          : lockersFor(cand.id, cand.lockerSlots);
        dispatch({ type: 'controllers/upsert', controller: ctrl, lockers });
        log('discover',
          `Controller ditemukan: ${cand.hostname} @ ${cand.ip}:${cand.port}`,
          { controllerId: cand.id });

        dispatch({ type: 'scan/progress', value: Math.round(((i + 1) / total) * 100) });
      }, delay);
      timersRef.current.push(tt);
    });

    const finalT = window.setTimeout(() => {
      dispatch({ type: 'scan/done' });
      log('system', `Scan selesai — ${candidateControllers.length} controller terdeteksi di LAN`);
    }, 600 + total * 750 + 600);
    timersRef.current.push(finalT);
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="grid cols-3">
        <Stat label="Status Scan" value={
          state.scan === 'idle' ? 'Idle' :
          state.scan === 'scanning' ? 'Scanning…' : 'Selesai'
        } foot="Broadcast UDP / port 8000" />
        <Stat label="Controller Ditemukan" value={`${state.controllers.length}`} foot="LAN host yang merespons" />
        <Stat label="Subnet" value="192.168.1.0/24" foot="Gateway · 192.168.1.1" />
      </div>

      <div className="card">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div>
            <h2>Network Discovery</h2>
            <div className="muted">App akan mengirim broadcast UDP ke <span className="mono">255.255.255.255:8000</span>. Controller wajib terhubung via LAN.</div>
          </div>
          <div className="row">
            <button className="btn" onClick={() => { setBlips([]); setFoundIds([]); }}>
              <IconRefresh /> Reset
            </button>
            <button className="btn primary" onClick={startScan} disabled={state.scan === 'scanning'}>
              <IconRadar /> {state.scan === 'scanning' ? 'Scanning…' : 'Mulai Scan'}
            </button>
          </div>
        </div>

        <div className="scan-stage" aria-hidden>
          <div className="grid-bg" />
          <div className="radar" />
          {state.scan === 'scanning' && <div className="sweep" />}
          <div className="center-dot" />
          {blips.map(b => (
            <span key={b.id} className="blip" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
          ))}
        </div>

        <div className="progress" style={{ marginTop: 14 }}>
          <div className="bar" style={{ width: `${state.scanProgress}%` }} />
        </div>
        <div className="row" style={{ marginTop: 10, color: 'var(--text-mute)', fontSize: 12 }}>
          <IconWifi style={{ width: 14, height: 14 }} /> {state.scan === 'scanning'
            ? `Probe paket dikirim · menunggu ACK (${state.scanProgress}%)`
            : state.scan === 'done'
              ? `Selesai · ${state.scanProgress}% completed`
              : `Tekan "Mulai Scan" untuk memindai LAN`}
        </div>
      </div>

      <div className="card">
        <h2>Hosts</h2>
        <div className="muted" style={{ marginBottom: 14 }}>Daftar controller yang menjawab broadcast probe.</div>
        <div className="discovery-list">
          {candidateControllers.length === 0 && <div className="empty">Belum ada candidate.</div>}
          {candidateControllers.map(c => {
            const found = foundIds.includes(c.id) || known.has(c.id);
            return (
              <div key={c.id} className={`discovery-row ${found ? 'found' : ''}`}>
                <span className={`led ${found ? 'online' : 'offline'}`} />
                <div>
                  <div style={{ fontWeight: 600 }}>{c.hostname}</div>
                  <div className="kv mono">{c.mac}</div>
                </div>
                <div className="kv mono">{c.ip}:{c.port}</div>
                <div className="kv">{c.lockerSlots} slot</div>
                <div className="kv">{c.firmware}</div>
                <div>
                  {found ? (
                    <span className="tag online"><IconCheck /> Found</span>
                  ) : (
                    <span className="tag idle">…</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {state.scan === 'done' && onDone && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button className="btn primary" onClick={onDone}>
              Lanjut ke Topology →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, foot }: { label: string; value: string; foot: string }) {
  return (
    <div className="card stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </div>
  );
}
