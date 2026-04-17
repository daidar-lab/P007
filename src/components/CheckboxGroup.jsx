import './CheckboxGroup.css'

export default function CheckboxGroup({ value = [], onChange, options }) {
  const toggle = (v) => {
    const set = new Set(value)
    set.has(v) ? set.delete(v) : set.add(v)
    onChange && onChange(Array.from(set))
  }
  return (
    <div className="checkbox-group">
      {options.map(opt => {
        const checked = value.includes(opt.value)
        return (
          <div key={opt.value} className="check-row">
            <label className={`check${checked ? ' is-active' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
              />
              <span className="check__box" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="12" height="12">
                  <path d="M3 8.5L6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="check__label">{opt.label}</span>
            </label>
            {checked && opt.extra && (
              <div className="check__extra">{opt.extra}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
