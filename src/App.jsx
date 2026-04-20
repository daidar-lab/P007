import AppNav from './components/AppNav.jsx'
import Home from './pages/Home.jsx'
import CadastrosIndex from './pages/CadastrosIndex.jsx'
import ClassificacoesCrud from './pages/ClassificacoesCrud.jsx'
import FiliaisCrud from './pages/FiliaisCrud.jsx'
import { useHashRoute } from './lib/router.js'

export default function App() {
  const route = useHashRoute()

  let page
  if (route === 'home' || route === '')            page = <Home />
  else if (route === 'cadastros')                   page = <CadastrosIndex />
  else if (route === 'cadastros/classificacoes')    page = <ClassificacoesCrud />
  else if (route === 'cadastros/filiais')           page = <FiliaisCrud />
  else                                              page = <NotFound />

  return (
    <div className="app-shell">
      <AppNav route={route} />
      {page}
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
