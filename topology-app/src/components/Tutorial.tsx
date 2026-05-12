import { useEffect, useState, type ReactNode } from 'react';
import {
  IconRadar, IconUsers, IconChip, IconLocker, IconLogs,
  IconClose, IconPlay, IconCheck,
} from './Icons';
import type { Page } from '../types';

interface Step {
  badge: string;
  title: string;
  desc: string;
  icon: ReactNode;
  accent: 'cyan' | 'green' | 'amber' | 'violet';
  bullets: string[];
  cta?: { label: string; page: Page };
}

const STEPS: Step[] = [
  {
    badge: 'WELCOME',
    title: 'Selamat datang di Locker Network Simulator',
    desc: 'Dashboard ini mensimulasikan sistem kunci locker sekolah berbasis IoT — server LAN broadcast ke controller (ESP32 / RPi), controller membaca UID kartu RFID, lalu membuka solenoid pada locker.',
    icon: <IconPlay />,
    accent: 'cyan',
    bullets: [
      'Ikuti 5 langkah singkat berikut untuk memulai simulasi dari nol.',
      'Kamu bisa membuka panduan ini kapan saja dari tombol bantuan di pojok atas.',
    ],
  },
  {
    badge: 'STEP 1',
    title: 'Discovery — Pindai LAN',
    desc: 'Mulai dari halaman Discovery untuk menjalankan broadcast UDP ke port :8000. Controller yang merespons akan muncul sebagai node baru di topology.',
    icon: <IconRadar />,
    accent: 'cyan',
    bullets: [
      'Klik tombol "Scan LAN" lalu tunggu hingga controller terdeteksi.',
      'Controller baru berstatus unprovisioned (kuning) sampai di-link ke kelas.',
    ],
    cta: { label: 'Buka Discovery', page: 'discovery' },
  },
  {
    badge: 'STEP 2',
    title: 'Classes — Daftarkan kelas & siswa',
    desc: 'Buat ruang kelas dan masukkan UID kartu RFID siswa. UID inilah yang nanti dipakai untuk membuka locker.',
    icon: <IconUsers />,
    accent: 'violet',
    bullets: [
      'Tambah kelas baru (mis. "XII RPL 1") dan beri warna identifikasi.',
      'Registrasi siswa beserta UID kartu (8 digit hex).',
    ],
    cta: { label: 'Buka Classes', page: 'classes' },
  },
  {
    badge: 'STEP 3',
    title: 'Controllers — Hubungkan ke kelas',
    desc: 'Setiap controller perlu di-assign ke satu kelas. Setelah di-link, controller berubah ke status online (hijau) dan terhubung ke topology.',
    icon: <IconChip />,
    accent: 'green',
    bullets: [
      'Pilih controller dari daftar, lalu tetapkan kelas dari dropdown.',
      'Klik "Buka Lockers" untuk lanjut konfigurasi slot.',
    ],
    cta: { label: 'Buka Controllers', page: 'controllers' },
  },
  {
    badge: 'STEP 4',
    title: 'Lockers — Assign UID siswa',
    desc: 'Tetapkan UID kartu siswa pada setiap slot locker. Slot yang sudah terisi akan menyala saat simulasi berjalan.',
    icon: <IconLocker />,
    accent: 'amber',
    bullets: [
      'Pilih siswa dari kelas controller untuk mengisi tiap slot.',
      'Tekan tombol Unlock untuk simulasikan buka kunci dan lihat animasinya di Topology.',
    ],
    cta: { label: 'Buka Lockers', page: 'lockers' },
  },
  {
    badge: 'STEP 5',
    title: 'Topology & Logs — Monitor real-time',
    desc: 'Kembali ke Topology untuk melihat aliran paket data antar node. Setiap aksi terekam pada Activity Log dengan timestamp dan UID.',
    icon: <IconLogs />,
    accent: 'cyan',
    bullets: [
      'Hover node controller / locker untuk melihat detail hardware.',
      'Buka Logs untuk audit trail lengkap dari semua aktivitas simulasi.',
    ],
    cta: { label: 'Lihat Topology', page: 'topology' },
  },
];

const STORAGE_KEY = 'topology-tutorial-seen-v1';

export function hasSeenTutorial(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; }
  catch { return false; }
}

interface Props {
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export function Tutorial({ onClose, onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const current = STEPS[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' && !isLast) setStep(s => s + 1);
      if (e.key === 'ArrowLeft' && !isFirst) setStep(s => s - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleClose = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    onClose();
  };

  const handleCta = () => {
    if (current.cta) {
      onNavigate(current.cta.page);
      handleClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className={`tutorial accent-${current.accent}`} onClick={e => e.stopPropagation()}>
        <button className="tutorial-close" onClick={handleClose} aria-label="Close">
          <IconClose />
        </button>

        <div className="tutorial-head">
          <div className={`tutorial-icon accent-${current.accent}`}>{current.icon}</div>
          <div className="tutorial-badge">{current.badge}</div>
          <h3 className="tutorial-title">{current.title}</h3>
          <p className="tutorial-desc">{current.desc}</p>
        </div>

        <ul className="tutorial-bullets">
          {current.bullets.map((b, i) => (
            <li key={i}>
              <span className="bullet-check"><IconCheck /></span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="tutorial-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        <div className="tutorial-foot">
          <button className="btn ghost" onClick={handleClose}>
            {isLast ? 'Tutup' : 'Lewati'}
          </button>
          <div className="row" style={{ gap: 8 }}>
            {!isFirst && (
              <button className="btn ghost" onClick={() => setStep(s => s - 1)}>
                Kembali
              </button>
            )}
            {current.cta && (
              <button className="btn primary" onClick={handleCta}>
                {current.cta.label}
              </button>
            )}
            {!isLast && (
              <button className="btn" onClick={() => setStep(s => s + 1)}>
                Selanjutnya
              </button>
            )}
            {isLast && !current.cta && (
              <button className="btn primary" onClick={handleClose}>
                Mulai Simulasi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
