const apiBase = import.meta.env.VITE_API_BASE || ''

async function request(path, init) {
  const res = await fetch(`${apiBase}${path}`, init)
  if (!res.ok) {
    let message = res.statusText
    try {
      const j = await res.json()
      if (j && j.error) message = j.error
    } catch { /* resposta sem JSON */ }
    const err = new Error(message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

const jsonBody = (body) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// ---------- Classificações ----------
export const getClassificacoes = (onlyActive = false) =>
  request(`/api/classificacoes${onlyActive ? '?ativos=true' : ''}`)

export const getClassificacao = (id) =>
  request(`/api/classificacoes/${id}`)

export const createClassificacao = (data) =>
  request('/api/classificacoes', { method: 'POST', ...jsonBody(data) })

export const updateClassificacao = (id, data) =>
  request(`/api/classificacoes/${id}`, { method: 'PUT', ...jsonBody(data) })

export const deleteClassificacao = (id) =>
  request(`/api/classificacoes/${id}`, { method: 'DELETE' })
