export type ControllerStatus = 'online' | 'offline' | 'unprovisioned';

export interface Controller {
  id: string;
  hostname: string;
  ip: string;
  mac: string;
  port: number;
  status: ControllerStatus;
  classId: string | null;
  firmware: string;
  bootedAt: number;
  rssi: number;
  lockerSlots: number;
  lastSeen: number;
}

export interface LockerClass {
  id: string;
  name: string;
  grade: string;
  homeroom: string;
  color: string;
}

export interface Student {
  id: string;
  uid: string;
  name: string;
  classId: string;
  nis: string;
}

export type LockerStatus = 'idle' | 'occupied' | 'opening' | 'unassigned' | 'fault';

export interface Locker {
  id: string;
  controllerId: string;
  slot: number;
  studentId: string | null;
  status: LockerStatus;
  lastAccessed: number | null;
}

export type LogType =
  | 'discover'
  | 'provision'
  | 'assign'
  | 'unassign'
  | 'open'
  | 'close'
  | 'denied'
  | 'fault'
  | 'system';

export interface LogEntry {
  id: string;
  ts: number;
  type: LogType;
  controllerId?: string;
  lockerId?: string;
  studentId?: string;
  message: string;
}

export type ScanState = 'idle' | 'scanning' | 'done';

export type Page = 'topology' | 'discovery' | 'controllers' | 'lockers' | 'classes' | 'logs';
