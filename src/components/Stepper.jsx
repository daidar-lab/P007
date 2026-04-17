import './Stepper.css'

export default function Stepper({ steps, current }) {
  const total = steps.length
  const pct = ((current + 1) / total) * 100
  const activeLabel = steps[current]
  return (
    <div className="stepper">
      <div className="stepper__meta">
        <span className="stepper__count">Etapa {current + 1} de {total}</span>
        <span className="stepper__label">{activeLabel}</span>
      </div>
      <div className="stepper__track" aria-hidden="true">
        <div className="stepper__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
