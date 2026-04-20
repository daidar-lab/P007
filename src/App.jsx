import { useEffect, useState } from 'react'
import AppNav from './components/AppNav.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Conta from './pages/Conta.jsx'
import ComunicadosIndex from './pages/ComunicadosIndex.jsx'
import ComunicadoDetail from './pages/ComunicadoDetail.jsx'
import CadastrosIndex from './pages/CadastrosIndex.jsx'
import ClassificacoesCrud from './pages/ClassificacoesCrud.jsx'
import FiliaisCrud from './pages/FiliaisCrud.jsx'
import AreasCrud from './pages/AreasCrud.jsx'
import SetoresCrud from './pages/SetoresCrud.jsx'
import ItensObservadosCrud from './pages/ItensObservadosCrud.jsx'
import UsuariosCrud from './pages/UsuariosCrud.jsx'
import { useHashRoute } from './lib/router.js'
import { getToken, clearSession } from './lib/auth.js'
import { getMe } from './lib/api.js'
import { hasPermission, PERMISSIONS } from './lib/rbac.js'

function Denied() {
  return (
    <div className="screen">
      <p className="text-muted">
        Você não tem permissão para acessar esta página.
      </p>
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

function renderRoute(route, user) {
  const guard = (perm, el) => hasPermission(user, perm) ? el : <Denied />

  if (route === 'home' || route === '')  return <Home />
  if (route === 'conta')                  return <Conta />

  if (route === 'comunicados')            return guard(PERMISSIONS.HISTORICO_VIEW, <ComunicadosIndex />)
  const mDetail = route.match(/^comunicados\/(\d+)$/)
  if (mDetail)                            return guard(PERMISSIONS.HISTORICO_VIEW, <ComunicadoDetail id={mDetail[1]} />)

  if (route === 'cadastros')              return <CadastrosIndex />
  if (route === 'cadastros/classificacoes')     return guard(PERMISSIONS.CADASTROS_MANAGE, <ClassificacoesCrud />)
  if (route === 'cadastros/filiais')            return guard(PERMISSIONS.CADASTROS_MANAGE, <FiliaisCrud />)
  if (route === 'cadastros/areas')              return guard(PERMISSIONS.CADASTROS_MANAGE, <AreasCrud />)
  if (route === 'cadastros/setores')            return guard(PERMISSIONS.CADASTROS_MANAGE, <SetoresCrud />)
  if (route === 'cadastros/itens-observados')   return guard(PERMISSIONS.CADASTROS_MANAGE, <ItensObservadosCrud />)
  if (route === 'cadastros/usuarios')           return guard(PERMISSIONS.USUARIOS_MANAGE, <UsuariosCrud />)

  return <NotFound />
}

export default function App() {
  const route = useHashRoute()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

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
      {renderRoute(route, user)}
    </div>
  )
}
