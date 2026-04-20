import './BrandLogo.css'

// Logo lockup da Cervejaria Cidade Imperial.
// Usa apenas o preto e o dourado da marca (tokens de tema).
export default function BrandLogo({ size = 'md', className = '' }) {
  const cls = `brand-logo brand-logo--${size} ${className}`.trim()
  return (
    <div className={cls} role="img" aria-label="Cervejaria Cidade Imperial">
      <span className="brand-logo__top">CERVEJARIA</span>
      <span className="brand-logo__mid">
        <span className="brand-logo__dot" aria-hidden="true" />
        <span className="brand-logo__word">CIDADE</span>
        <span className="brand-logo__dot" aria-hidden="true" />
      </span>
      <span className="brand-logo__bot">IMPERIAL</span>
    </div>
  )
}
