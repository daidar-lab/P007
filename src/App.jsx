import { useEffect, useState } from 'react'
import AppNav from './components/AppNav.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import ComunicadosIndex from './pages/ComunicadosIndex.jsx'
import ComunicadoDetail from './pages/ComunicadoDetail.jsx'
import CadastrosIndex from './pages/CadastrosIndex.jsx'
import ClassificacoesCrud from './pages/ClassificacoesCrud.jsx'
import FiliaisCrud from './pages/FiliaisCrud.jsx'
import AreasCrud from './pages/AreasCrud.jsx'
import SetoresCrud from './pages/SetoresCrud.jsx'
import ItensObservadosCrud from './pages/ItensObservadosCrud.jsx'
import { useHashRoute } from './lib/router.js'
import { getToken, clearSession } from './lib/auth.js'
import { getMe } from './lib/api.js'

function renderRoute(route) {
  if (route === 'home' || route === '')            return <Home />
  if (route === 'comunicados')                      return <ComunicadosIndex />
  const mDetail = route.match(/^comunicados\/(\d+)$/)
  if (mDetail)                                      return <ComunicadoDetail id={mDetail[1]} />
  if (route === 'cadastros')                        return <CadastrosIndex />
  if (route === 'cadastros/classificacoes')         return <ClassificacoesCrud />
  if (route === 'cadastros/filiais')                return <FiliaisCrud />
  if (route === 'cadastros/areas')                  return <AreasCrud />
  if (route === 'cadastros/setores')                return <SetoresCrud />
  if (route === 'cadastros/itens-observados')       return <ItensObservadosCrud />
  return <NotFound />
}

export default function App() {
  const route = useHashRoute()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Valida a sessão contra a API no primeiro render.
  // Enquanto não conclui, NÃO renderiza nem Login nem o app.
  useEffect(() => {
    let cancelled = false
    const token = getToken()
    if (!token) {
      if (!cancelled) setReady(true)
      return
    }
    getMe()
      .then(u => { if (!cancelled) setUser(u) })
      .catch(() => { if (!cancelled) clearSession() })
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  // Reagir a login/logout emitidos por outros pontos da app
  useEffect(() => {
    const onLogin  = (e) => setUser(e.detail)
    const onLogout = ()  => setUser(null)
    window.addEventListener('auth:login',  onLogin)
    window.addEventListener('auth:logout', onLogout)
    return () => {
      window.removeEventListener('auth:login',  onLogin)
      window.removeEventListener('auth:logout', onLogout)
    }
  }, [])

  const logout = () => clearSession()

  // Splash enquanto valida o token (curto — um round-trip)
  if (!ready) {
    return (
      <div className="auth-splash">
        <div className="auth-splash__logo">CI</div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="app-shell">
      <AppNav route={route} user={user} onLogout={logout} />
      {renderRoute(route)}
    </div>
  )
}

function NotFound() {
  return (
    <div className="screen">
      <p className="text-muted">Página não encontrada.</p>
    </div>
  )
}
