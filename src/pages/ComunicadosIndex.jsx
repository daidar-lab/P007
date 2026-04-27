import { useEffect, useMemo, useState, useRef } from 'react'
import Header from '../components/Header.jsx'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Combobox from '../components/Combobox.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import { Image as ImageIcon, Download } from '../components/Icon.jsx'
import { navigate } from '../lib/router.js'
import {
  getComunicados,
  getFiliais,
  getAreas,
  getClassificacoes,
  downloadComunicadosXlsx,
} from '../lib/api.js'
import './ComunicadosIndex.css'

function formatData(dateValue) {
  if (!dateValue) return ''
  const d = typeof dateValue === 'string' ? dateValue.slice(0, 10)
          : dateValue instanceof Date    ? dateValue.toISOString().slice(0, 10)
          : ''
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
function formatHora(time) {
  if (!time) return ''
  return String(time).slice(0, 5)
}

const EMPTY_FILTERS = {
  filial_id: '',
  area_id: '',
  classificacao_id: '',
  alto_risco: '',       // '' | 'sim' | 'nao'
}

export default function ComunicadosIndex() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // Opções dos filtros
  const [filiais, setFiliais] = useState([])
  const [areas, setAreas] = useState([])
  const [classificacoes, setClassificacoes] = useState([])

  // Lista de comunicados
  const [list, setList] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  // Exportação Excel
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  const doExport = async () => {
    if (exporting) return
    setExporting(true)
    setExportError('')
    try {
      await downloadComunicadosXlsx(filters)
    } catch (err) {
      setExportError(err.message || 'Falha ao exportar')
      setTimeout(() => setExportError(''), 4000)
    } finally {
      setExporting(false)
    }
  }

  // Carrega filiais e classificações no mount
  useEffect(() => {
    let cancelled = false
    Promise.all([getFiliais(true), getClassificacoes(true)])
      .then(([fs, cs]) => {
        if (cancelled) return
        setFiliais(fs)
        setClassificacoes(cs)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Carrega áreas quando a filial muda (cascata)
  useEffect(() => {
    if (!filters.filial_id) {
      setAreas([])
      return
    }
    let cancelled = false
    getAreas({ onlyActive: true, filialId: filters.filial_id })
      .then(rows => { if (!cancelled) setAreas(rows) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [filters.filial_id])

  // Busca a lista sempre que algum filtro muda
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getComunicados(filters)
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
  }, [filters])

  // Reset de filtros dependentes: trocar filial zera área
  const onFilialChange = (v) =>
    setFilters(f => ({ ...f, filial_id: v, area_id: '' }))
  const onAreaChange = (v) =>
    setFilters(f => ({ ...f, area_id: v }))
  const onClassifChange = (v) =>
    setFilters(f => ({ ...f, classificacao_id: v }))
  const onAltoRiscoChange = (v) =>
    setFilters(f => ({ ...f, alto_risco: v }))

  const filiaisOptions = useMemo(
    () => filiais.map(f => ({ value: String(f.id), label: f.descricao })),
    [filiais]
  )
  const areasOptions = useMemo(
    () => areas.map(a => ({ value: String(a.id), label: a.descricao })),
    [areas]
  )
  const classificacoesOptions = useMemo(
    () => classificacoes.map(c => ({ value: String(c.id), label: c.descricao })),
    [classificacoes]
  )

  const activeCount = [
    filters.filial_id, filters.area_id, filters.classificacao_id, filters.alto_risco,
  ].filter(Boolean).length

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  return (
    <div className="screen screen--wide">
      <Header
        title="Histórico"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'comunicado' : 'comunicados'}` : undefined}
        trailing={
          <Button
            variant="secondary"
            size="sm"
            icon={exporting ? <span className="spinner" aria-hidden="true" /> : <Download width={16} height={16} />}
            onClick={doExport}
            disabled={exporting || status !== 'ok' || list.length === 0}
            aria-label="Exportar para Excel"
          >
            {exporting ? 'Gerando…' : 'Exportar'}
          </Button>
        }
      />

      {exportError && <p className="crud-error">{exportError}</p>}

      <details className="filters-card" open={activeCount > 0}>
        <summary className="filters-card__head">
          <span className="filters-card__title">Filtros</span>
          {activeCount > 0 && (
            <span className="filters-card__badge">{activeCount}</span>
          )}
          <span className="filters-card__hint">
            {activeCount === 0 ? 'Nenhum aplicado' : 'Tap para expandir'}
          </span>
        </summary>

        <div className="filters-card__body stack stack-md">
          <section className="stack stack-sm">
            <h4 className="filters-card__section">Localização</h4>
            <Field label="Filial">
              <Combobox
                value={filters.filial_id}
                onChange={onFilialChange}
                options={filiaisOptions}
                placeholder="Todas as filiais"
                searchPlaceholder="Buscar filial…"
              />
            </Field>
            <Field
              label="Área"
              hint={!filters.filial_id ? 'Selecione a filial primeiro' : undefined}
            >
              <Combobox
                value={filters.area_id}
                onChange={onAreaChange}
                options={areasOptions}
                placeholder={filters.filial_id ? 'Todas as áreas' : 'Indisponível'}
                searchPlaceholder="Buscar área…"
                emptyLabel={filters.filial_id ? 'Nenhuma área nesta filial' : 'Selecione a filial'}
              />
            </Field>
          </section>

          <section className="stack stack-sm">
            <h4 className="filters-card__section">Tipo</h4>
            <Field label="Classificação">
              <Combobox
                value={filters.classificacao_id}
                onChange={onClassifChange}
                options={classificacoesOptions}
                placeholder="Todas as classificações"
                searchPlaceholder="Buscar classificação…"
              />
            </Field>
          </section>

          <section className="stack stack-sm">
            <h4 className="filters-card__section">Severidade</h4>
            <Field label="Alto risco potencial">
              <SegmentedControl
                value={filters.alto_risco}
                onChange={onAltoRiscoChange}
                options={[
                  { value: '',    label: 'Todos' },
                  { value: 'sim', label: 'Sim' },
                  { value: 'nao', label: 'Não' },
                ]}
              />
            </Field>
          </section>

          {activeCount > 0 && (
            <Button variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      </details>

      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}

      {status === 'ok' && list.length === 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>
            {activeCount === 0
              ? 'Nenhum comunicado registrado ainda.'
              : 'Nenhum comunicado com os filtros atuais.'}
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
