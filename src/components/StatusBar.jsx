import './StatusBar.css'

/*
 * Falsa status bar estilo iOS: hora à esquerda, indicadores à direita.
 * Puramente decorativa — deixa o template com cara de device.
 */
export default function StatusBar({ time = '9:41' }) {
  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-bar__time">{time}</span>
      <div className="status-bar__indicators">
        <span className="status-bar__signal">
          <span /><span /><span /><span />
        </span>
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1 5a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M4 6a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="8" cy="8" r="1" fill="currentColor"/>
        </svg>
        <span className="status-bar__battery">
          <span className="status-bar__battery-level" />
        </span>
      </div>
    </div>
  )
}
