import './RadioGroup.css'

export default function RadioGroup({ name, value, onChange, options, direction = 'row' }) {
  return (
    <div className={`radio-group radio-group--${direction}`} role="radiogroup">
      {options.map(opt => {
        const checked = value === opt.value
        return (
          <label key={opt.value} className={`radio${checked ? ' is-active' : ''}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange && onChange(opt.value)}
            />
            <span className="radio__dot" aria-hidden="true" />
            <span className="radio__label">{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}
