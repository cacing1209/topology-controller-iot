import type { Page } from '../types';
import { useStore } from '../store';
import { IconTopology, IconRadar, IconChip, IconLocker, IconUsers, IconLogs } from './Icons';

interface Props {
  active: Page;
  onNavigate: (p: Page) => void;
}

export function Sidebar({ active, onNavigate }: Props) {
  const { state } = useStore();
  const onlineCount = state.controllers.filter(c => c.status === 'online').length;
  const provisioned = state.controllers.filter(c => c.classId).length;
  const occupied = state.lockers.filter(l => l.studentId).length;

  const items: Array<{
    page: Page; label: string; ico: React.ReactNode; badge?: string;
  }> = [
    { page: 'topology',    label: 'Topology',     ico: <IconTopology /> },
    { page: 'discovery',   label: 'Discovery',    ico: <IconRadar />,  badge: state.scan === 'scanning' ? 'scan' : undefined },
    { page: 'controllers', label: 'Controllers',  ico: <IconChip />,   badge: state.controllers.length ? `${onlineCount}/${state.controllers.length}` : undefined },
    { page: 'lockers',     label: 'Lockers',      ico: <IconLocker />, badge: state.lockers.length ? `${occupied}/${state.lockers.length}` : undefined },
    { page: 'classes',     label: 'Classes',      ico: <IconUsers />,  badge: provisioned ? `${provisioned}` : undefined },
    { page: 'logs',        label: 'Activity Log', ico: <IconLogs />,   badge: state.logs.length > 0 ? `${state.logs.length}` : undefined },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">LockerNet</div>
          <div className="brand-sub">IoT Control · v1.4</div>
        </div>
      </div>

      <div className="nav-group">
        <div className="label">Operations</div>
        {items.map(item => (
          <button
            key={item.page}
            className={`nav-item ${active === item.page ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
          >
            {item.ico}
            <span>{item.label}</span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <span className="led online" />
        <span>LAN gateway · 192.168.1.1</span>
      </div>
    </aside>
  );
}
