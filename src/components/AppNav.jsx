import { navigate } from '../lib/router.js'
import { hasPermission, PERMISSIONS } from '../lib/rbac.js'
import './AppNav.css'

export default function AppNav({ route, user, onLogout }) {
  const section = route.split('/')[0] || 'home'
  const canHistorico = hasPermission(user, PERMISSIONS.HISTORICO_VIEW)
  const canCadastros = hasPermission(user, PERMISSIONS.CADASTROS_MANAGE)
                    || hasPermission(user, PERMISSIONS.USUARIOS_MANAGE)

  return (
    <>
      {user && (
        <div className="app-user">
          <button
            type="button"
            className="app-user__info"
            onClick={() => navigate('conta')}
            aria-label="Abrir minha conta"
          >
            <span className="app-user__name">{user.nome}</span>
            <span className="app-user__login">
              @{user.usuario} · {user.papel_label || user.papel}
            </span>
          </button>
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
        {canHistorico && (
          <button
            type="button"
            className={`app-nav__item${section === 'comunicados' ? ' is-active' : ''}`}
            onClick={() => navigate('comunicados')}
          >
            Histórico
          </button>
        )}
        {canCadastros && (
          <button
            type="button"
            className={`app-nav__item${section === 'cadastros' ? ' is-active' : ''}`}
            onClick={() => navigate('cadastros')}
          >
            Cadastros
          </button>
        )}
      </nav>
    </>
  )
}
