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

// ---------- Filiais ----------
export const getFiliais = (onlyActive = false) =>
  request(`/api/filiais${onlyActive ? '?ativos=true' : ''}`)

export const getFilial = (id) =>
  request(`/api/filiais/${id}`)

export const createFilial = (data) =>
  request('/api/filiais', { method: 'POST', ...jsonBody(data) })

export const updateFilial = (id, data) =>
  request(`/api/filiais/${id}`, { method: 'PUT', ...jsonBody(data) })

export const deleteFilial = (id) =>
  request(`/api/filiais/${id}`, { method: 'DELETE' })

// ---------- Áreas ----------
export const getAreas = ({ onlyActive = false, filialId } = {}) => {
  const qs = []
  if (onlyActive) qs.push('ativos=true')
  if (filialId)   qs.push(`filial_id=${filialId}`)
  const suffix = qs.length ? `?${qs.join('&')}` : ''
  return request(`/api/areas${suffix}`)
}

export const getArea = (id) =>
  request(`/api/areas/${id}`)

export const createArea = (data) =>
  request('/api/areas', { method: 'POST', ...jsonBody(data) })

export const updateArea = (id, data) =>
  request(`/api/areas/${id}`, { method: 'PUT', ...jsonBody(data) })

export const deleteArea = (id) =>
  request(`/api/areas/${id}`, { method: 'DELETE' })

// ---------- Itens observados ----------
export const getItensObservados = (onlyActive = false) =>
  request(`/api/itens-observados${onlyActive ? '?ativos=true' : ''}`)

export const getItemObservado = (id) =>
  request(`/api/itens-observados/${id}`)

export const createItemObservado = (data) =>
  request('/api/itens-observados', { method: 'POST', ...jsonBody(data) })

export const updateItemObservado = (id, data) =>
  request(`/api/itens-observados/${id}`, { method: 'PUT', ...jsonBody(data) })

export const deleteItemObservado = (id) =>
  request(`/api/itens-observados/${id}`, { method: 'DELETE' })
