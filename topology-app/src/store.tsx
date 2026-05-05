import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Controller, Locker, LockerClass, Student, LogEntry, ScanState, LogType,
} from './types';
import { mockClasses, buildInitialStudents } from './data/mock';

interface State {
  scan: ScanState;
  scanProgress: number;
  controllers: Controller[];
  classes: LockerClass[];
  students: Student[];
  lockers: Locker[];
  logs: LogEntry[];
}

type Action =
  | { type: 'scan/start' }
  | { type: 'scan/progress'; value: number }
  | { type: 'scan/done' }
  | { type: 'controllers/upsert'; controller: Controller; lockers?: Locker[] }
  | { type: 'controllers/setStatus'; id: string; status: Controller['status'] }
  | { type: 'controllers/assignClass'; id: string; classId: string | null }
  | { type: 'controllers/remove'; id: string }
  | { type: 'lockers/assignStudent'; lockerId: string; studentId: string | null }
  | { type: 'lockers/setStatus'; lockerId: string; status: Locker['status']; ts?: number }
  | { type: 'log/add'; entry: LogEntry };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'scan/start': return { ...state, scan: 'scanning', scanProgress: 0 };
    case 'scan/progress': return { ...state, scanProgress: action.value };
    case 'scan/done': return { ...state, scan: 'done', scanProgress: 100 };
    case 'controllers/upsert': {
      const exists = state.controllers.some(c => c.id === action.controller.id);
      const controllers = exists
        ? state.controllers.map(c => c.id === action.controller.id ? action.controller : c)
        : [...state.controllers, action.controller];
      const lockers = action.lockers
        ? [...state.lockers.filter(l => l.controllerId !== action.controller.id), ...action.lockers]
        : state.lockers;
      return { ...state, controllers, lockers };
    }
    case 'controllers/setStatus':
      return {
        ...state,
        controllers: state.controllers.map(c => c.id === action.id ? { ...c, status: action.status, lastSeen: Date.now() } : c),
      };
    case 'controllers/assignClass':
      return {
        ...state,
        controllers: state.controllers.map(c => c.id === action.id ? { ...c, classId: action.classId } : c),
      };
    case 'controllers/remove':
      return {
        ...state,
        controllers: state.controllers.filter(c => c.id !== action.id),
        lockers: state.lockers.filter(l => l.controllerId !== action.id),
      };
    case 'lockers/assignStudent':
      return {
        ...state,
        lockers: state.lockers.map(l => l.id === action.lockerId
          ? { ...l, studentId: action.studentId, status: action.studentId ? 'idle' : 'unassigned' }
          : l),
      };
    case 'lockers/setStatus':
      return {
        ...state,
        lockers: state.lockers.map(l => l.id === action.lockerId
          ? { ...l, status: action.status, lastAccessed: action.ts ?? l.lastAccessed }
          : l),
      };
    case 'log/add':
      return { ...state, logs: [action.entry, ...state.logs].slice(0, 500) };
  }
}

const initialState: State = {
  scan: 'idle',
  scanProgress: 0,
  controllers: [],
  classes: mockClasses,
  students: buildInitialStudents(),
  lockers: [],
  logs: [{
    id: 'log-boot',
    ts: Date.now(),
    type: 'system',
    message: 'LockerNet controller console initialized — UDP broadcast siap di port 8000',
  }],
};

interface StoreApi {
  state: State;
  dispatch: React.Dispatch<Action>;
  log: (type: LogType, message: string, extra?: Partial<Omit<LogEntry, 'id' | 'ts' | 'type' | 'message'>>) => void;
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const log = useCallback<StoreApi['log']>((type, message, extra) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
      type,
      message,
      ...extra,
    };
    dispatch({ type: 'log/add', entry });
  }, []);

  // Background heartbeat: random locker open/close events on assigned lockers
  useEffect(() => {
    const t = setInterval(() => {
      const assigned = state.lockers.filter(l => l.studentId && l.status === 'idle');
      if (assigned.length === 0) return;
      if (Math.random() > 0.55) return;
      const target = assigned[Math.floor(Math.random() * assigned.length)];
      const student = state.students.find(s => s.id === target.studentId);
      dispatch({ type: 'lockers/setStatus', lockerId: target.id, status: 'opening', ts: Date.now() });
      log('open', `Locker #${target.slot} dibuka oleh ${student?.name ?? 'unknown'}`, {
        controllerId: target.controllerId, lockerId: target.id, studentId: target.studentId ?? undefined,
      });
      setTimeout(() => {
        dispatch({ type: 'lockers/setStatus', lockerId: target.id, status: 'idle', ts: Date.now() });
        log('close', `Locker #${target.slot} ditutup`, {
          controllerId: target.controllerId, lockerId: target.id, studentId: target.studentId ?? undefined,
        });
      }, 1800);
    }, 4500);
    return () => clearInterval(t);
  }, [state.lockers, state.students, log]);

  // Heartbeat: occasional controller offline/online flicker
  useEffect(() => {
    const t = setInterval(() => {
      if (state.controllers.length < 2) return;
      if (Math.random() > 0.92) {
        const c = state.controllers[Math.floor(Math.random() * state.controllers.length)];
        const next = c.status === 'online' ? 'offline' : 'online';
        dispatch({ type: 'controllers/setStatus', id: c.id, status: next });
        log(next === 'online' ? 'system' : 'fault',
          `Controller ${c.hostname} → ${next.toUpperCase()}`,
          { controllerId: c.id });
      }
    }, 9000);
    return () => clearInterval(t);
  }, [state.controllers, log]);

  const value = useMemo<StoreApi>(() => ({ state, dispatch, log }), [state, log]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
