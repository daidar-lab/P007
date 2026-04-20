import { navigate } from '../lib/router.js'
import './AppNav.css'

export default function AppNav({ route, user, onLogout }) {
  const section = route.split('/')[0] || 'home'
  return (
    <>
      {user && (
        <div className="app-user">
          <div className="app-user__info">
            <span className="app-user__name">{user.nome}</span>
            <span className="app-user__login">@{user.usuario}</span>
          </div>
          <button type="button" className="app-user__logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      )}
      <nav className="app-nav" aria-label="Navegação principal">
        <button
          type="button"
          className={`app-nav__item${section === 'home' ? ' is-active' : ''}`}
          onClick={() => navigate('home')}
        >
          Comunicado
        </button>
        <button
          type="button"
          className={`app-nav__item${section === 'comunicados' ? ' is-active' : ''}`}
          onClick={() => navigate('comunicados')}
        >
          Histórico
        </button>
        <button
          type="button"
          className={`app-nav__item${section === 'cadastros' ? ' is-active' : ''}`}
          onClick={() => navigate('cadastros')}
        >
          Cadastros
        </button>
      </nav>
    </>
  )
}
