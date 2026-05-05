import { useStore } from '../store';

export function Classes() {
  const { state } = useStore();

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <h2>Kelas Terdaftar</h2>
        <div className="muted">Controller di-assign ke kelas → UID siswa di kelas tersebut bisa di-binding ke locker.</div>
      </div>

      <div className="grid cols-3">
        {state.classes.map(c => {
          const students = state.students.filter(s => s.classId === c.id);
          const ctls = state.controllers.filter(ct => ct.classId === c.id);
          const lockers = state.lockers.filter(l => ctls.some(ct => ct.id === l.controllerId));
          const occ = lockers.filter(l => l.studentId).length;
          return (
            <div key={c.id} className="card" style={{ borderColor: 'transparent', boxShadow: `0 0 0 1px ${c.color}33`, background: `linear-gradient(180deg, ${c.color}10, rgba(11,16,32,0.6))` }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 3, background: c.color,
                  boxShadow: `0 0 14px ${c.color}80`,
                }} />
                <strong style={{ color: '#fff', fontSize: 15 }}>{c.name}</strong>
                <span className="kv" style={{ marginLeft: 'auto' }}>Grade {c.grade}</span>
              </div>
              <div className="kv">Wali · <b>{c.homeroom}</b></div>
              <div className="kv">Siswa · <b>{students.length}</b></div>
              <div className="kv">Controller · <b>{ctls.length}</b> {ctls.map(ct => ct.hostname).join(', ') || '—'}</div>
              <div className="kv">Locker terpakai · <b>{occ}/{lockers.length}</b></div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>Daftar Siswa</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIS</th>
              <th>Kelas</th>
              <th>UID Kartu</th>
              <th>Locker</th>
            </tr>
          </thead>
          <tbody>
            {state.students.map(s => {
              const k = state.classes.find(c => c.id === s.classId);
              const l = state.lockers.find(ll => ll.studentId === s.id);
              const ct = l ? state.controllers.find(c => c.id === l.controllerId) : undefined;
              return (
                <tr key={s.id}>
                  <td><b>{s.name}</b></td>
                  <td className="mono">{s.nis}</td>
                  <td><span style={{ color: k?.color }}>{k?.name}</span></td>
                  <td className="mono">{s.uid}</td>
                  <td>{l ? `#${l.slot.toString().padStart(2,'0')} · ${ct?.hostname}` : <span className="kv">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
