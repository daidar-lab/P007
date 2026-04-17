import { ChevronRight } from './Icon.jsx'
import './ListItem.css'

export default function ListItem({
  leading,
  title,
  subtitle,
  trailing,
  showChevron = false,
  onClick,
  as = 'button',
}) {
  const Tag = as
  return (
    <Tag className="list-item" onClick={onClick} type={as === 'button' ? 'button' : undefined}>
      {leading && <span className="list-item__leading">{leading}</span>}
      <span className="list-item__body">
        <span className="list-item__title">{title}</span>
        {subtitle && <span className="list-item__subtitle">{subtitle}</span>}
      </span>
      {trailing && <span className="list-item__trailing">{trailing}</span>}
      {showChevron && <ChevronRight className="list-item__chevron" width={18} height={18} />}
    </Tag>
  )
}

export function List({ children }) {
  return <div className="list-group">{children}</div>
}
