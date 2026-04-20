import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import { Image as ImageIcon } from '../components/Icon.jsx'
import { navigate } from '../lib/router.js'
import { getComunicados } from '../lib/api.js'
import './ComunicadosIndex.css'

function formatData(dateValue) {
  if (!dateValue) return ''
  const d = typeof dateValue === 'string' ? dateValue.slice(0, 10) : ''
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
function formatHora(time) {
  if (!time) return ''
  return String(time).slice(0, 5)
}

export default function ComunicadosIndex() {
  const [list, setList] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getComunicados()
      .then(rows => {
        if (cancelled) return
        setList(rows)
        setStatus('ok')
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message || 'Falha ao carregar')
        setStatus('error')
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="screen">
      <Header
        title="Histórico"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'comunicado' : 'comunicados'}` : undefined}
      />

      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}

      {status === 'ok' && list.length === 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>
            Nenhum comunicado registrado ainda.
          </p>
        </Card>
      )}

      {status === 'ok' && list.length > 0 && (
        <List>
          {list.map(c => (
            <ListItem
              key={c.id}
              title={c.classificacao_descricao}
              subtitle={
                `${formatData(c.data_comunicado)} ${formatHora(c.hora_comunicado)} · ` +
                `${c.filial_descricao} · ${c.area_descricao} · ${c.setor_descricao}`
              }
              trailing={
                <span className="comunicado-meta">
                  {c.alto_risco_potencial && <Badge variant="solid">Alto risco</Badge>}
                  {c.fotos_count > 0 && (
                    <span className="comunicado-meta__fotos" aria-label={`${c.fotos_count} fotos`}>
                      <ImageIcon width={14} height={14} />
                      <span>{c.fotos_count}</span>
                    </span>
                  )}
                </span>
              }
              showChevron
              onClick={() => navigate(`comunicados/${c.id}`)}
            />
          ))}
        </List>
      )}
    </div>
  )
}
