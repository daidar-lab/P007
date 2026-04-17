import './Badge.css'

export default function Badge({ variant = 'soft', children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}
