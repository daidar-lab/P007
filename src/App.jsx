import AppNav from './components/AppNav.jsx'
import Home from './pages/Home.jsx'
import ComunicadosIndex from './pages/ComunicadosIndex.jsx'
import ComunicadoDetail from './pages/ComunicadoDetail.jsx'
import CadastrosIndex from './pages/CadastrosIndex.jsx'
import ClassificacoesCrud from './pages/ClassificacoesCrud.jsx'
import FiliaisCrud from './pages/FiliaisCrud.jsx'
import AreasCrud from './pages/AreasCrud.jsx'
import SetoresCrud from './pages/SetoresCrud.jsx'
import ItensObservadosCrud from './pages/ItensObservadosCrud.jsx'
import { useHashRoute } from './lib/router.js'

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
  return (
    <div className="app-shell">
      <AppNav route={route} />
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
