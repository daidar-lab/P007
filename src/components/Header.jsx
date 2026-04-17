import './Header.css'

export default function Header({ leading, title, subtitle, trailing }) {
  return (
    <header className="header">
      <div className="header__side">{leading}</div>
      <div className="header__center">
        {title && <h1 className="header__title">{title}</h1>}
        {subtitle && <p className="header__subtitle">{subtitle}</p>}
      </div>
      <div className="header__side header__side--end">{trailing}</div>
    </header>
  )
}
