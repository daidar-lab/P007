import { navigate } from '../lib/router.js'
import './AppNav.css'

export default function AppNav({ route }) {
  const section = route.split('/')[0] || 'home'
  return (
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
  )
}
