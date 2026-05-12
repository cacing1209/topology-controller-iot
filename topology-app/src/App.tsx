import { useState } from 'react';
import './App.css';
import { StoreProvider } from './store';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Topology } from './pages/Topology';
import { Discovery } from './pages/Discovery';
import { Controllers } from './pages/Controllers';
import { Lockers } from './pages/Lockers';
import { Classes } from './pages/Classes';
import { Logs } from './pages/Logs';
import { Tutorial, hasSeenTutorial } from './components/Tutorial';
import type { Page } from './types';

const TITLES: Record<Page, { title: string; subtitle: string }> = {
  topology:    { title: 'Network Topology',     subtitle: 'Live view dari controller, locker, dan kelas yang terhubung' },
  discovery:   { title: 'Network Discovery',    subtitle: 'Scan broadcast LAN untuk menemukan controller di port 8000' },
  controllers: { title: 'Controllers',          subtitle: 'Kelola controller — assign ke kelas dan lihat status hardware' },
  lockers:     { title: 'Lockers',              subtitle: 'Per controller — assign UID kartu siswa ke setiap locker' },
  classes:     { title: 'Classes & Students',   subtitle: 'Daftar kelas dan registrasi UID siswa' },
  logs:        { title: 'Activity Log',         subtitle: 'Audit trail semua kejadian: discover, assign, open, close, fault' },
};

function Shell() {
  const [page, setPage] = useState<Page>('topology');
  const [selectedController, setSelectedController] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(() => !hasSeenTutorial());

  const navigate = (p: Page) => setPage(p);

  return (
    <div className="app">
      <Sidebar active={page} onNavigate={navigate} />
      <div className="main">
        <Topbar
          title={TITLES[page].title}
          subtitle={TITLES[page].subtitle}
          onOpenTutorial={() => setShowTutorial(true)}
        />
        <div className="content">
          {page === 'topology'    && <Topology />}
          {page === 'discovery'   && <Discovery onDone={() => navigate('topology')} />}
          {page === 'controllers' && <Controllers onOpenLockers={(id) => { setSelectedController(id); navigate('lockers'); }} />}
          {page === 'lockers'     && <Lockers controllerId={selectedController} onSelectController={setSelectedController} />}
          {page === 'classes'     && <Classes />}
          {page === 'logs'        && <Logs />}
        </div>
      </div>
      {showTutorial && (
        <Tutorial
          onClose={() => setShowTutorial(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
