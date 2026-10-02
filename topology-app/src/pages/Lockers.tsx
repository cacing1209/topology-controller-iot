import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Modal } from '../components/Modal';
import type { Locker } from '../types';
import { IconCard, IconPlay } from '../components/Icons';

interface Props {
  controllerId: string | null;
  onSelectController: (id: string) => void;
}

export function Lockers({ controllerId, onSelectController }: Props) {
  const { state, dispatch, log } = useStore();
  const ctl = state.controllers.find(c => c.id === controllerId) ?? state.controllers[0];

  const [editingLocker, setEditingLocker] = useState<Locker | null>(null);
  const [studentChoice, setStudentChoice] = useState<string>('');

  useEffect(() => {
    if (!controllerId && state.controllers[0]) onSelectController(state.controllers[0].id);
  }, [controllerId, state.controllers, onSelectController]);

  const klass = state.classes.find(c => c.id === ctl?.classId);
  const studentsInClass = useMemo(
    () => klass ? state.students.filter(s => s.classId === klass.id) : [],
    [state.students, klass],
  );
  const lockers = useMemo(
    () => ctl ? state.lockers.filter(l => l.controllerId === ctl.id).sort((a, b) => a.slot - b.slot) : [],
    [state.lockers, ctl],
  );

  if (!ctl) {
    return <div className="empty">Belum ada controller. Buka <b>Discovery</b> untuk memindai LAN.</div>;
  }

  const startAssign = (l: Locker) => {
    setEditingLocker(l);
    setStudentChoice(l.studentId ?? '');
  };

  const chosenStudent = state.students.find(s => s.id === studentChoice);

  const saveAssign = () => {
    const stu = chosenStudent;
    if (!editingLocker || !stu) return;
    dispatch({ type: 'lockers/assignStudent', lockerId: editingLocker.id, studentId: stu.id });
    log('assign',
      `Locker #${editingLocker.slot} di-assign ke ${stu.name} (UID ${stu.uid})`,
      { controllerId: ctl.id, lockerId: editingLocker.id, studentId: stu.id });
    setEditingLocker(null);
  };

  const unassign = () => {
    if (!editingLocker) return;
    const stu = state.students.find(s => s.id === editingLocker.studentId);
    dispatch({ type: 'lockers/assignStudent', lockerId: editingLocker.id, studentId: null });
    log('unassign',
      `Locker #${editingLocker.slot} di-unassign${stu ? ` (sebelumnya: ${stu.name})` : ''}`,
      { controllerId: ctl.id, lockerId: editingLocker.id });
    setEditingLocker(null);
  };

  const triggerOpen = (l: Locker) => {
    if (!l.studentId) return;
    const stu = state.students.find(s => s.id === l.studentId);
    dispatch({ type: 'lockers/setStatus', lockerId: l.id, status: 'opening', ts: Date.now() });
    log('open', `Manual open locker #${l.slot} oleh admin · siswa ${stu?.name ?? '-'}`,
      { controllerId: ctl.id, lockerId: l.id, studentId: l.studentId ?? undefined });
    setTimeout(() => {
      dispatch({ type: 'lockers/setStatus', lockerId: l.id, status: 'idle', ts: Date.now() });
      log('close', `Locker #${l.slot} ditutup`, { controllerId: ctl.id, lockerId: l.id });
    }, 1700);
  };

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="spread">
          <div>
            <h2>Locker Bay — {ctl.hostname}</h2>
            <div className="muted">
              <span className={`tag ${ctl.status}`}><span className={`led ${ctl.status}`} /> {ctl.status}</span>
              {' '} · {ctl.ip}:{ctl.port} · {lockers.length} slot
              {klass && <> · kelas <b style={{ color: klass.color }}>{klass.name}</b> ({studentsInClass.length} siswa)</>}
            </div>
          </div>
          <div className="row">
            <select
              className="select"
              style={{ width: 260 }}
              value={ctl.id}
              onChange={(e) => onSelectController(e.target.value)}
            >
              {state.controllers.map(c => (
                <option key={c.id} value={c.id}>{c.hostname} — {c.ip}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!klass && (
        <div className="card" style={{ borderColor: 'rgba(251,191,36,0.45)' }}>
          <div className="row">
            <span className="tag unprov">Unprovisioned</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              Controller ini belum di-assign ke kelas. Set kelas dulu di halaman <b>Controllers</b> sebelum assign UID siswa.
            </span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="spread" style={{ marginBottom: 12 }}>
          <h2>Locker Slots</h2>
          <div className="row" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            <span><span className="led online" /> idle</span>
            <span><span className="tag occupied">occupied</span></span>
            <span><span className="tag opening">opening</span></span>
            <span><span className="tag unassigned">unassigned</span></span>
          </div>
        </div>
        <div className="locker-grid">
          {lockers.map(l => {
            const stu = state.students.find(s => s.id === l.studentId);
            return (
              <div
                key={l.id}
                className={`locker-tile ${l.status}`}
                onClick={() => startAssign(l)}
              >
                <span className={`tag ${l.status} corner-tag`}>{l.status}</span>
                <div className="num">#{l.slot.toString().padStart(2, '0')}</div>
                <div className="student">{stu ? stu.name : '— belum di-assign'}</div>
                <div className="uid">{stu ? `UID ${stu.uid}` : 'tap untuk assign'}</div>
                {l.studentId && (
                  <div className="row" style={{ marginTop: 10 }}>
                    <button
                      className="btn"
                      style={{ padding: '5px 9px', fontSize: 11 }}
                      onClick={(e) => { e.stopPropagation(); triggerOpen(l); }}
                      disabled={l.status === 'opening'}
                    >
                      <IconPlay /> Open
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editingLocker && (
        <Modal
          title={`Locker #${editingLocker.slot.toString().padStart(2, '0')}`}
          subtitle={`Controller ${ctl.hostname} · ${klass?.name ?? '— belum di-assign kelas —'}`}
          onClose={() => setEditingLocker(null)}
          footer={
            <>
              {editingLocker.studentId && (
                <button className="btn danger" onClick={unassign}>Unassign</button>
              )}
              <button className="btn ghost" onClick={() => setEditingLocker(null)}>Batal</button>
              <button className="btn primary" onClick={saveAssign} disabled={!klass || !chosenStudent}>Simpan</button>
            </>
          }
        >
          {!klass ? (
            <div className="muted">Set kelas controller ini terlebih dahulu di halaman <b>Controllers</b>.</div>
          ) : (
            <>
              <div className="kv" style={{ marginBottom: 6 }}>Pilih siswa kelas {klass.name}:</div>
              <select className="select" value={studentChoice} onChange={e => setStudentChoice(e.target.value)} autoFocus>
                <option value="">— pilih siswa —</option>
                {studentsInClass.map(s => (
                  <option key={s.id} value={s.id}>{s.name} · NIS {s.nis} · UID {s.uid}</option>
                ))}
              </select>

              <div className="row" style={{ marginTop: 12 }}>
                <IconCard />
                <span className="mono">{chosenStudent ? `UID ${chosenStudent.uid}` : '— pilih siswa untuk melihat UID —'}</span>
              </div>

              <div className="kv" style={{ marginTop: 12, fontSize: 11.5 }}>
                Total {studentsInClass.length} siswa di kelas ini. UID kartu diambil dari data siswa (database).
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
