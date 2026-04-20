import { useEffect, useState } from 'react'

// Router por hash — simples, sem dependência externa.
// Exemplos de rotas: "home", "cadastros", "cadastros/classificacoes".

export function useHashRoute() {
  const [route, setRoute] = useState(() =>
    window.location.hash.replace(/^#\/?/, '') || 'home'
  )

  useEffect(() => {
    const onChange = () => {
      setRoute(window.location.hash.replace(/^#\/?/, '') || 'home')
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(to) {
  window.location.hash = '/' + to.replace(/^\/+/, '')
}
