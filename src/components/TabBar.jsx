import { useState } from 'react'
import './TabBar.css'

export default function TabBar({ items, value, defaultValue, onChange }) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const select = (v) => {
    if (!isControlled) setInternal(v)
    onChange && onChange(v)
  }
  return (
    <nav className="tabbar" aria-label="Navegação principal">
      <ul className="tabbar__list">
        {items.map(item => {
          const active = item.value === current
          return (
            <li key={item.value} className={`tabbar__item${active ? ' is-active' : ''}`}>
              <button
                type="button"
                onClick={() => select(item.value)}
                aria-current={active ? 'page' : undefined}
                className="tabbar__btn"
              >
                <span className="tabbar__icon">{item.icon}</span>
                <span className="tabbar__label">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
