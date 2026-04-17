/*
 * Biblioteca de ícones mínima, em traço fino, coerente com iOS.
 * Todos os ícones herdam currentColor.
 */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const ChevronRight = (p) => (
  <svg {...base} {...p}><path d="M9 6l6 6-6 6" /></svg>
)
export const ChevronLeft = (p) => (
  <svg {...base} {...p}><path d="M15 6l-6 6 6 6" /></svg>
)
export const Search = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)
export const Plus = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)
export const Bell = (p) => (
  <svg {...base} {...p}>
    <path d="M6 16a6 6 0 0 1 12 0v1l1.5 2H4.5L6 17z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)
export const Home = (p) => (
  <svg {...base} {...p}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9h12v-9" />
  </svg>
)
export const Compass = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-1.5 4.5L9 15l1.5-4.5L15 9z" />
  </svg>
)
export const Heart = (p) => (
  <svg {...base} {...p}>
    <path d="M20.5 8.5a4.5 4.5 0 0 0-8.5-2 4.5 4.5 0 0 0-8.5 2c0 5 8.5 10 8.5 10s8.5-5 8.5-10z" />
  </svg>
)
export const User = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)
export const Settings = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.1 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.9 7l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)
export const Moon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
)
export const Lock = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
  </svg>
)
export const Globe = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
)
export const Card = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="18" height="12" rx="3" />
    <path d="M3 10h18M7 15h3" />
  </svg>
)
export const Camera = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
)
export const Image = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M4 18l5-5 4 4 3-3 4 4" />
  </svg>
)
export const Close = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
)
