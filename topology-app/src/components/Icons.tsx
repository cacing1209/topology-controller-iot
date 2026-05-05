import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const IconTopology = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5" cy="18" r="2.2" />
    <circle cx="19" cy="18" r="2.2" />
    <path d="M12 7.2v3.6M11 11.5l-5 4.8M13 11.5l5 4.8" />
  </svg>
);

export const IconRadar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 12L20 8" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const IconChip = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="0.5" />
    <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" />
  </svg>
);

export const IconLocker = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M9 8h2M9 12h2" />
    <path d="M14 7v4" />
  </svg>
);

export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16 14c2.5 0 5 1.6 5 4" />
  </svg>
);

export const IconLogs = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M16 4v3h3" />
    <path d="M8 12h8M8 16h8M8 8h4" />
  </svg>
);

export const IconRefresh = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <path d="M5 12.5l4 4L19 7" />
  </svg>
);

export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconPlay = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconWifi = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <path d="M2 9c6-5 14-5 20 0" />
    <path d="M5 13c4-3 10-3 14 0" />
    <path d="M8.5 16.5c2-1.5 5-1.5 7 0" />
    <circle cx="12" cy="20" r="0.8" fill="currentColor" />
  </svg>
);

export const IconCard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} className={`ico ${p.className ?? ''}`}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </svg>
);
