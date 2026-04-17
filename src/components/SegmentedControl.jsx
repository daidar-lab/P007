import { useState } from 'react'
import './SegmentedControl.css'

export default function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
}) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const select = (v) => {
    if (!isControlled) setInternal(v)
    onChange && onChange(v)
  }
  return (
    <div className="segmented" role="tablist">
      {options.map(opt => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={current === opt.value}
          className={`segmented__item${current === opt.value ? ' is-active' : ''}`}
          onClick={() => select(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
