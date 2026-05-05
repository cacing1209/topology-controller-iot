import type { Controller, Locker, LockerClass, Student } from '../types';

export const mockClasses: LockerClass[] = [
  { id: 'cls-xa1', name: 'X RPL 1',  grade: 'X',   homeroom: 'Bu Sari',     color: '#22d3ee' },
  { id: 'cls-xa2', name: 'X RPL 2',  grade: 'X',   homeroom: 'Pak Andre',   color: '#a78bfa' },
  { id: 'cls-xib', name: 'XI TKJ 1', grade: 'XI',  homeroom: 'Bu Wulan',    color: '#4ade80' },
  { id: 'cls-xic', name: 'XI MM 1',  grade: 'XI',  homeroom: 'Pak Bambang', color: '#fbbf24' },
  { id: 'cls-xii', name: 'XII RPL 1',grade: 'XII', homeroom: 'Bu Lestari',  color: '#f472b6' },
];

const firstNames = ['Aisyah','Budi','Citra','Dimas','Eka','Farhan','Galih','Hana','Indra','Joko','Kirana','Lutfi','Maya','Nanda','Oka','Putri','Rafi','Siti','Tomi','Umar','Vina','Wahyu','Yanti','Zahra'];
const lastNames  = ['Saputra','Wibowo','Hartono','Pratama','Lestari','Maulana','Setiawan','Anggraini','Permata','Nugraha','Suryadi','Halim','Kusuma','Rahayu','Iskandar'];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

let sCount = 0;
function makeStudent(classId: string): Student {
  sCount += 1;
  const fn = pick(firstNames, sCount * 7);
  const ln = pick(lastNames,  sCount * 11);
  return {
    id: `stu-${sCount.toString().padStart(3, '0')}`,
    uid: Array.from({length: 4}, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(' '),
    name: `${fn} ${ln}`,
    classId,
    nis: `2024${(10000 + sCount).toString()}`,
  };
}

export function buildInitialStudents(): Student[] {
  const list: Student[] = [];
  for (const c of mockClasses) {
    const n = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) list.push(makeStudent(c.id));
  }
  return list;
}

export const initialControllers: Controller[] = [];
export const initialLockers: Locker[] = [];

export const candidateControllers: Omit<Controller,'status'|'classId'|'lastSeen'>[] = [
  { id: 'ctl-a1', hostname: 'locker-ctl-a1', ip: '192.168.1.21', mac: 'AA:BB:CC:11:22:01', port: 8000, firmware: 'v1.4.2', bootedAt: Date.now() - 3_600_000 * 23, rssi: -52, lockerSlots: 12 },
  { id: 'ctl-a2', hostname: 'locker-ctl-a2', ip: '192.168.1.22', mac: 'AA:BB:CC:11:22:02', port: 8000, firmware: 'v1.4.2', bootedAt: Date.now() - 3_600_000 * 19, rssi: -61, lockerSlots: 12 },
  { id: 'ctl-b1', hostname: 'locker-ctl-b1', ip: '192.168.1.23', mac: 'AA:BB:CC:11:22:03', port: 8000, firmware: 'v1.4.1', bootedAt: Date.now() - 3_600_000 * 41, rssi: -58, lockerSlots: 16 },
  { id: 'ctl-b2', hostname: 'locker-ctl-b2', ip: '192.168.1.24', mac: 'AA:BB:CC:11:22:04', port: 8000, firmware: 'v1.4.2', bootedAt: Date.now() - 3_600_000 * 12, rssi: -49, lockerSlots: 16 },
  { id: 'ctl-c1', hostname: 'locker-ctl-c1', ip: '192.168.1.25', mac: 'AA:BB:CC:11:22:05', port: 8000, firmware: 'v1.4.0', bootedAt: Date.now() - 3_600_000 * 67, rssi: -71, lockerSlots: 12 },
];

export function lockersFor(controllerId: string, slots: number): Locker[] {
  return Array.from({ length: slots }, (_, i) => ({
    id: `${controllerId}-l${(i + 1).toString().padStart(2, '0')}`,
    controllerId,
    slot: i + 1,
    studentId: null,
    status: 'unassigned' as const,
    lastAccessed: null,
  }));
}
