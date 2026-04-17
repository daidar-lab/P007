import './Avatar.css'

export default function Avatar({ name = '', src, size = 40 }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) }
  return (
    <span className="avatar" style={style} aria-label={name}>
      {src
        ? <img src={src} alt={name} className="avatar__img" />
        : <span className="avatar__initials">{initials || '·'}</span>}
    </span>
  )
}
