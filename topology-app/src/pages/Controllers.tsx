import { useState } from 'react';
import { useStore } from '../store';
import { Modal } from '../components/Modal';
import type { Controller } from '../types';

export function Controllers({ onOpenLockers }: { onOpenLockers: (controllerId: string) => void }) {
  const { state, dispatch, log } = useStore();
  const [editing, setEditing] = useState<Controller | null>(null);
  const [classChoice, setClassChoice] = useState<string>('');

  const startEdit = (c: Controller) => {
    setEditing(c);
    setClassChoice(c.classId ?? '');
  };

  const saveAssign = () => {
    if (!editing) return;
    const classId = classChoice || null;
    dispatch({ type: 'controllers/assignClass', id: editing.id, classId });
    if (classId !== editing.status && editing.status === 'unprovisioned') {
      dispatch({ type: 'controllers/setStatus', id: editing.id, status: 'online' });
    }
    const klass = state.classes.find(c => c.id === classId);
    log('provision',
      classId
        ? `Controller ${editing.hostname} di-assign ke kelas ${klass?.name}`
        : `Controller ${editing.hostname} di-unassign dari kelas`,
      { controllerId: editing.id });
    setEditing(null);
  };

  const removeCtl = (c: Controller) => {
    dispatch({ type: 'controllers/remove', id: c.id });
    log('system', `Controller ${c.hostname} dihapus dari topology`, { controllerId: c.id });
  };

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div>
            <h2>Daftar Controller</h2>
            <div className="muted">Atur controller — assign ke kelas, lihat status & locker.</div>
          </div>
        </div>

        {state.controllers.length === 0 ? (
          <div className="empty">Belum ada controller. Buka halaman <b>Discovery</b> untuk memindai LAN.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Hostname</th>
                <th>IP : Port</th>
                <th>MAC</th>
                <th>RSSI</th>
                <th>Firmware</th>
                <th>Lockers</th>
                <th>Kelas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.controllers.map(c => {
                const klass = state.classes.find(k => k.id === c.classId);
                const lockers = state.lockers.filter(l => l.controllerId === c.id);
                const occ = lockers.filter(l => l.studentId).length;
                return (
                  <tr key={c.id}>
                    <td><span className={`tag ${c.status}`}><span className={`led ${c.status}`} /> {c.status}</span></td>
                    <td><b>{c.hostname}</b></td>
                    <td className="mono">{c.ip}:{c.port}</td>
                    <td className="mono" style={{ color: 'var(--text-mute)' }}>{c.mac}</td>
                    <td className="mono">{c.rssi} dBm</td>
                    <td>{c.firmware}</td>
                    <td>{occ}/{lockers.length}</td>
                    <td>
                      {klass ? (
                        <span style={{ color: klass.color, fontWeight: 600 }}>{klass.name}</span>
                      ) : (
                        <span style={{ color: 'var(--warn)' }}>— belum di-set</span>
                      )}
                    </td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn" onClick={() => startEdit(c)}>Set Class</button>
                        <button className="btn ghost" onClick={() => onOpenLockers(c.id)}>Lockers →</button>
                        <button className="btn danger" onClick={() => removeCtl(c)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal
          title={`Assign Class — ${editing.hostname}`}
          subtitle={`${editing.ip}:${editing.port} · ${editing.lockerSlots} locker`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn primary" onClick={saveAssign}>Simpan</button>
            </>
          }
        >
          <div className="kv" style={{ marginBottom: 6 }}>Pilih kelas yang akan menggunakan locker controller ini.</div>
          <select className="select" value={classChoice} onChange={e => setClassChoice(e.target.value)}>
            <option value="">— Tidak di-assign —</option>
            {state.classes.map(k => (
              <option key={k.id} value={k.id}>{k.name} · wali {k.homeroom}</option>
            ))}
          </select>
        </Modal>
      )}
    </div>
  );
}
