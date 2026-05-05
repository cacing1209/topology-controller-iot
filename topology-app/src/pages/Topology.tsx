import { useMemo, useState, type ReactNode } from 'react';
import { useStore } from '../store';
import { IconUsers, IconWifi, IconChip, IconLocker } from '../components/Icons';

export function Topology() {
  const { state } = useStore();
  const [hover, setHover] = useState<{ kind: 'controller' | 'locker'; id: string } | null>(null);

  const controllers = state.controllers;
  const W = 1100;
  const H = 620;
  const cx = W / 2;
  const cy = H / 2;

  const layout = useMemo(() => {
    const n = controllers.length || 1;
    const ring = 230;
    return controllers.map((c, i) => {
      const angle = (-Math.PI / 2) + (i / n) * Math.PI * 2;
      const x = cx + Math.cos(angle) * ring;
      const y = cy + Math.sin(angle) * ring;
      return { c, x, y, angle };
    });
  }, [controllers, cx, cy]);

  const stats = useMemo(() => ({
    online: controllers.filter(c => c.status === 'online').length,
    offline: controllers.filter(c => c.status === 'offline').length,
    unprov: controllers.filter(c => c.status === 'unprovisioned').length,
    occupied: state.lockers.filter(l => l.studentId).length,
    totalLockers: state.lockers.length,
  }), [controllers, state.lockers]);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="grid cols-4">
        <Stat label="Controllers" value={`${controllers.length}`} foot={`${stats.online} online · ${stats.offline} offline · ${stats.unprov} pending`} />
        <Stat label="Lockers Aktif" value={`${stats.occupied}`} foot={`${stats.totalLockers} total slot`} />
        <Stat label="Classes" value={`${state.classes.length}`} foot="ruang kelas terdaftar" />
        <Stat label="Students" value={`${state.students.length}`} foot="UID kartu siswa" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="topology-canvas">
          <div className="grid-bg" />
          <div className="legend">
            <span className="item"><i className="led online" /> Online</span>
            <span className="item"><i className="led offline" /> Offline</span>
            <span className="item"><i className="led unprov" /> Unprovisioned</span>
            <span className="item"><span style={{ width: 18, height: 6, borderTop: '1.5px dashed rgba(74,222,128,0.7)' }} /> Active link</span>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="srv-grad">
                <stop offset="0%" stopColor="#0e9d92" />
                <stop offset="100%" stopColor="#0a3a5a" />
              </radialGradient>
              <radialGradient id="ctl-grad-online">
                <stop offset="0%" stopColor="rgba(74,222,128,0.45)" />
                <stop offset="100%" stopColor="rgba(74,222,128,0.05)" />
              </radialGradient>
              <radialGradient id="ctl-grad-offline">
                <stop offset="0%" stopColor="rgba(248,113,113,0.45)" />
                <stop offset="100%" stopColor="rgba(248,113,113,0.05)" />
              </radialGradient>
              <radialGradient id="ctl-grad-unprov">
                <stop offset="0%" stopColor="rgba(251,191,36,0.45)" />
                <stop offset="100%" stopColor="rgba(251,191,36,0.05)" />
              </radialGradient>
              <pattern id="ringDots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.6" fill="rgba(120,160,255,0.25)" />
              </pattern>
            </defs>

            {/* Outer concentric rings */}
            <circle cx={cx} cy={cy} r="290" fill="none" stroke="rgba(120,160,255,0.07)" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="230" fill="none" stroke="rgba(120,160,255,0.12)" strokeDasharray="2 5" />
            <circle cx={cx} cy={cy} r="120" fill="none" stroke="rgba(120,160,255,0.08)" strokeDasharray="3 4" />

            {/* Server / LAN core */}
            <g>
              <circle cx={cx} cy={cy} r="62" className="tnode-server" />
              <text x={cx} y={cy - 6} textAnchor="middle" className="tlabel" style={{ fontSize: 13 }}>LAN GATEWAY</text>
              <text x={cx} y={cy + 10} textAnchor="middle" className="tlabel-sub mono">192.168.1.1</text>
              <text x={cx} y={cy + 26} textAnchor="middle" className="tlabel-sub">UDP :8000</text>
            </g>

            {/* Links from server to controllers */}
            {layout.map(({ c, x, y }) => (
              <line
                key={`link-${c.id}`}
                x1={cx} y1={cy} x2={x} y2={y}
                className={`tlink ${c.status}`}
              />
            ))}

            {/* Controllers + their lockers */}
            {layout.map(({ c, x, y, angle }) => {
              const lockers = state.lockers.filter(l => l.controllerId === c.id);
              const klass = state.classes.find(cl => cl.id === c.classId);
              const grad =
                c.status === 'online' ? 'url(#ctl-grad-online)' :
                c.status === 'offline' ? 'url(#ctl-grad-offline)' : 'url(#ctl-grad-unprov)';

              // Position lockers in an arc facing outward
              const lockerCount = lockers.length;
              const arcSpan = Math.PI * 0.55;
              const arcStart = angle - arcSpan / 2;
              const lockerR = 92;
              const outwardR = 78;

              return (
                <g key={c.id}>
                  {/* Locker arc backdrop */}
                  <path
                    d={describeArc(x, y, lockerR + 8, angle - arcSpan / 2 - 0.15, angle + arcSpan / 2 + 0.15)}
                    fill="none"
                    stroke="rgba(120,160,255,0.08)"
                    strokeWidth="1.2"
                  />

                  {/* Lockers */}
                  {lockers.map((l, i) => {
                    const t = lockerCount === 1 ? 0.5 : i / (lockerCount - 1);
                    const a = arcStart + t * arcSpan;
                    const lx = x + Math.cos(a) * lockerR;
                    const ly = y + Math.sin(a) * lockerR;
                    return (
                      <g
                        key={l.id}
                        onMouseEnter={() => setHover({ kind: 'locker', id: l.id })}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <line
                          x1={x + Math.cos(a) * outwardR}
                          y1={y + Math.sin(a) * outwardR}
                          x2={lx} y2={ly}
                          stroke={l.studentId ? 'rgba(34,211,238,0.4)' : 'rgba(120,160,255,0.18)'}
                          strokeWidth="1"
                        />
                        <rect
                          x={lx - 7} y={ly - 7} width="14" height="14" rx="3"
                          className={`tlocker ${l.status}`}
                        />
                      </g>
                    );
                  })}

                  {/* Controller node */}
                  <g
                    onMouseEnter={() => setHover({ kind: 'controller', id: c.id })}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={x} cy={y} r="44" fill={grad} />
                    <circle cx={x} cy={y} r="34" className={`tnode-controller ${c.status}`} fill="rgba(8,12,28,0.85)" />
                    <text x={x} y={y - 4} textAnchor="middle" className="tlabel">{c.hostname.replace('locker-ctl-','CTL-').toUpperCase()}</text>
                    <text x={x} y={y + 10} textAnchor="middle" className="tlabel-sub mono">{c.ip}</text>
                    {klass && (
                      <g>
                        <rect x={x - 32} y={y + 38} width="64" height="18" rx="9"
                          fill="rgba(8,12,28,0.85)" stroke={klass.color} strokeWidth="1" />
                        <text x={x} y={y + 50} textAnchor="middle" className="tlabel" style={{ fill: klass.color, fontSize: 10 }}>
                          {klass.name}
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {hover && <HoverCard hover={hover} />}
          {controllers.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              color: 'var(--text-mute)', textAlign: 'center', padding: 24,
            }}>
              <div>
                <div style={{ fontSize: 14, marginBottom: 6, color: 'var(--text-dim)' }}>Belum ada controller pada topology.</div>
                <div style={{ fontSize: 12 }}>Buka <b>Discovery</b> untuk memindai LAN port 8000.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card topology-flow">
        <div className="flow-header">
          <div>
            <h2>Alur Sistem</h2>
            <p className="muted">Bagaimana perintah mengalir dari dashboard operator hingga membuka locker fisik di lapangan.</p>
          </div>
          <span className="tag online">Realtime · Bidirectional</span>
        </div>

        <div className="flow-chain">
          <FlowStep
            n="01"
            title="Operator App"
            sub="Web Dashboard"
            desc="Operator memilih siswa dan menekan assign atau unlock dari halaman Lockers."
            icon={<IconUsers />}
            accent="cyan"
          />
          <FlowArrow protocol="HTTPS · WS" />
          <FlowStep
            n="02"
            title="LAN Gateway"
            sub="192.168.1.1 · :8000"
            desc="Routing antar segmen kelas, broadcast perintah ke controller tujuan."
            icon={<IconWifi />}
            accent="cyan"
          />
          <FlowArrow protocol="UDP Broadcast" />
          <FlowStep
            n="03"
            title="Controller"
            sub="ESP32 / RPi Node"
            desc="Verifikasi UID kartu RFID, eksekusi perintah, dan trigger relay solenoid."
            icon={<IconChip />}
            accent="green"
          />
          <FlowArrow protocol="GPIO · I²C" />
          <FlowStep
            n="04"
            title="Locker"
            sub="Slot Fisik"
            desc="Kunci elektrik terbuka, sensor pintu kirim status balik ke dashboard."
            icon={<IconLocker />}
            accent="amber"
          />
        </div>

        <div className="flow-foot">
          <div className="flow-foot-item">
            <span className="dot cyan" />
            <span><b>Telemetry</b> — heartbeat tiap 5 detik, RSSI &amp; uptime ter-stream ke topology.</span>
          </div>
          <div className="flow-foot-item">
            <span className="dot green" />
            <span><b>Provisioning</b> — controller baru muncul di Discovery, lalu di-link ke Class.</span>
          </div>
          <div className="flow-foot-item">
            <span className="dot amber" />
            <span><b>Audit Trail</b> — setiap unlock tercatat di Logs dengan timestamp &amp; UID.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({
  n, title, sub, desc, icon, accent,
}: {
  n: string;
  title: string;
  sub: string;
  desc: string;
  icon: ReactNode;
  accent: 'cyan' | 'green' | 'amber';
}) {
  return (
    <div className={`flow-step accent-${accent}`}>
      <div className="num">STEP {n}</div>
      <div className="head">
        <div className="icon-wrap">{icon}</div>
        <div>
          <div className="title">{title}</div>
          <div className="sub mono">{sub}</div>
        </div>
      </div>
      <div className="desc">{desc}</div>
    </div>
  );
}

function FlowArrow({ protocol }: { protocol: string }) {
  return (
    <div className="flow-arrow" aria-hidden>
      <div className="line" />
      <div className="protocol">{protocol}</div>
    </div>
  );
}

function HoverCard({ hover }: { hover: { kind: 'controller' | 'locker'; id: string } }) {
  const { state } = useStore();
  if (hover.kind === 'controller') {
    const c = state.controllers.find(x => x.id === hover.id);
    if (!c) return null;
    const klass = state.classes.find(k => k.id === c.classId);
    const lockers = state.lockers.filter(l => l.controllerId === c.id);
    const occupied = lockers.filter(l => l.studentId).length;
    return (
      <div className="card" style={{
        position: 'absolute', right: 16, top: 14, width: 260, padding: 14, zIndex: 3,
      }}>
        <div className="row" style={{ marginBottom: 8 }}>
          <span className={`led ${c.status}`} />
          <strong style={{ color: '#fff' }}>{c.hostname}</strong>
        </div>
        <KV k="IP" v={`${c.ip}:${c.port}`} />
        <KV k="MAC" v={c.mac} />
        <KV k="Firmware" v={c.firmware} />
        <KV k="RSSI" v={`${c.rssi} dBm`} />
        <KV k="Class" v={klass?.name ?? '— belum di-set'} />
        <KV k="Lockers" v={`${occupied}/${lockers.length} terpakai`} />
      </div>
    );
  }
  const l = state.lockers.find(x => x.id === hover.id);
  if (!l) return null;
  const c = state.controllers.find(x => x.id === l.controllerId);
  const stu = state.students.find(s => s.id === l.studentId);
  return (
    <div className="card" style={{
      position: 'absolute', right: 16, top: 14, width: 260, padding: 14, zIndex: 3,
    }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className={`tag ${l.status}`}>{l.status}</span>
        <strong style={{ color: '#fff' }}>Locker #{l.slot}</strong>
      </div>
      <KV k="Controller" v={c?.hostname ?? '-'} />
      <KV k="Student" v={stu?.name ?? '— kosong'} />
      <KV k="UID" v={stu?.uid ?? '—'} />
      <KV k="Last access" v={l.lastAccessed ? new Date(l.lastAccessed).toLocaleTimeString('id-ID') : '—'} />
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="kv" style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
      <span style={{ color: 'var(--text-mute)' }}>{k}</span>
      <span style={{ color: 'var(--text)', fontFamily: k === 'IP' || k === 'MAC' || k === 'UID' ? 'JetBrains Mono, ui-monospace, monospace' : undefined }}>{v}</span>
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

// Polar arc helper
function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function describeArc(cx: number, cy: number, r: number, startA: number, endA: number) {
  const start = polar(cx, cy, r, endA);
  const end = polar(cx, cy, r, startA);
  const large = endA - startA <= Math.PI ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
