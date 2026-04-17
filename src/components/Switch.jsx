import { useState } from 'react'
import './Switch.css'

export default function Switch({ checked, defaultChecked = false, onChange, ariaLabel }) {
  const [internal, setInternal] = useState(defaultChecked)
  const isControlled = typeof checked === 'boolean'
  const value = isControlled ? checked : internal
  const toggle = () => {
    const next = !value
    if (!isControlled) setInternal(next)
    onChange && onChange(next)
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      onClick={toggle}
      className={`switch${value ? ' switch--on' : ''}`}
    >
      <span className="switch__thumb" />
    </button>
  )
}
