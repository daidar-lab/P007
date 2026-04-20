const apiBase = import.meta.env.VITE_API_BASE || ''

async function request(path, init) {
  const res = await fetch(`${apiBase}${path}`, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} — ${text || res.statusText}`)
  }
  return res.json()
}

export function getClassificacoes() {
  return request('/api/classificacoes')
}
