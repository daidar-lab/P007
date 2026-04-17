import './Field.css'

export default function Field({ label, hint, required, children }) {
  return (
    <label className="field">
      {label && (
        <span className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </span>
      )}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

export function FieldRow({ children }) {
  return <div className="field-row">{children}</div>
}
