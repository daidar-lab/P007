import './Button.css'

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  full = false,
  icon,
  iconRight,
  children,
  className = '',
  ...rest
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    full && 'btn--full',
    (icon || iconRight) && !children && 'btn--icon-only',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={cls} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
      {iconRight && <span className="btn__icon">{iconRight}</span>}
    </button>
  )
}
