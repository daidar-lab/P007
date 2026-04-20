import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import Badge from '../components/Badge.jsx'
import Field from '../components/Field.jsx'
import TextField from '../components/TextField.jsx'
import Combobox from '../components/Combobox.jsx'
import Switch from '../components/Switch.jsx'
import { ChevronLeft, Plus } from '../components/Icon.jsx'
import { navigate } from '../lib/router.js'
import {
  getAreas,
  getFiliais,
  createArea,
  updateArea,
  deleteArea,
} from '../lib/api.js'
import './ClassificacoesCrud.css'

const emptyDraft = () => ({
  descricao: '',
  filial_id: '',
  ativo: true,
})

export default function AreasCrud() {
  const [list, setList] = useState([])
  const [filiais, setFiliais] = useState([])
  const [status, setStatus] = useState('loading')  // loading | ok | error
  const [error, setError] = useState('')

  const [mode, setMode] = useState('list')
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    setStatus('loading')
    try {
      const [areas, filiaisResp] = await Promise.all([
        getAreas({ onlyActive: false }),
        getFiliais(true),
      ])
      setList(areas)
      setFiliais(filiaisResp)
      setStatus('ok')
    } catch (err) {
      setError(err.message || 'Falha ao carregar')
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

  const filiaisOptions = filiais.map(f => ({
    value: String(f.id),
    label: f.descricao,
  }))

  const groupedByFilial = useMemo(() => {
    const map = new Map()
    for (const item of list) {
      if (!map.has(item.filial_id)) {
        map.set(item.filial_id, {
          filial_id: item.filial_id,
          filial_descricao: item.filial_descricao,
          items: [],
        })
      }
      map.get(item.filial_id).items.push(item)
    }
    return Array.from(map.values())
  }, [list])

  const startNew = () => {
    setDraft(emptyDraft())
    setConfirmDelete(false)
    setError('')
    setMode('edit')
  }
  const startEdit = (item) => {
    setDraft({
      id: item.id,
      descricao: item.descricao,
      filial_id: String(item.filial_id),
      ativo: item.ativo,
    })
    setConfirmDelete(false)
    setError('')
    setMode('edit')
  }
  const cancel = () => {
    setDraft(null)
    setMode('list')
    setError('')
  }

  const isDraftValid = () => !!draft
    && draft.descricao.trim()
    && draft.filial_id

  const save = async () => {
    if (!isDraftValid()) return
    setSaving(true)
    setError('')
    const payload = {
      descricao: draft.descricao.trim(),
      filial_id: Number(draft.filial_id),
      ativo: draft.ativo,
    }
    try {
      if (draft.id) await updateArea(draft.id, payload)
      else          await createArea(payload)
      await load()
      setMode('list')
      setDraft(null)
    } catch (err) {
      setError(err.message || 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!draft?.id) return
    setDeleting(true)
    setError('')
    try {
      await deleteArea(draft.id)
      await load()
      setMode('list')
      setDraft(null)
      setConfirmDelete(false)
    } catch (err) {
      setError(err.message || 'Falha ao excluir')
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (mode === 'edit') {
    const isNew = !draft.id
    const canSave = isDraftValid() && !saving && !deleting
    return (
      <div className="screen">
        <Header
          leading={
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft width={18} height={18} />}
              onClick={cancel}
              aria-label="Voltar"
            />
          }
          title={isNew ? 'Nova área' : 'Editar área'}
          subtitle={isNew ? undefined : `ID #${draft.id}`}
        />

        <Card padding="lg" className="stack stack-md">
          <Field label="Filial" required>
            <Combobox
              value={draft.filial_id}
              onChange={(v) => setDraft(d => ({ ...d, filial_id: v }))}
              options={filiaisOptions}
              placeholder="Selecione a filial"
              searchPlaceholder="Buscar filial…"
            />
          </Field>

          <Field label="Descrição" required>
            <TextField
              value={draft.descricao}
              onChange={(e) => setDraft(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Ex.: ADMINISTRATIVO"
              maxLength={80}
            />
          </Field>

          <div className="row row-between row-gap-4" style={{ padding: '0 4px' }}>
            <div className="stack stack-sm">
              <span className="field__label">Ativa</span>
              <span className="text-subtle" style={{ fontSize: 'var(--fs-12)' }}>
                Áreas inativas não aparecem no formulário.
              </span>
            </div>
            <Switch
              checked={draft.ativo}
              onChange={(v) => setDraft(d => ({ ...d, ativo: v }))}
              ariaLabel="Ativa"
            />
          </div>
        </Card>

        {error && <p className="crud-error">{error}</p>}

        <div className="crud-actions">
          <Button variant="secondary" onClick={cancel} disabled={saving || deleting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>

        {!isNew && (
          <div className="crud-danger">
            {!confirmDelete ? (
              <Button
                variant="ghost"
                size="md"
                onClick={() => setConfirmDelete(true)}
                disabled={saving || deleting}
                className="crud-danger__trigger"
              >
                Excluir área
              </Button>
            ) : (
              <Card padding="md" className="stack stack-sm">
                <p className="text-body" style={{ margin: 0 }}>
                  Excluir <strong>{draft.descricao}</strong>? Esta ação não pode
                  ser desfeita.
                </p>
                <div className="crud-actions">
                  <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={remove} disabled={deleting} className="btn--danger">
                    {deleting ? 'Excluindo…' : 'Sim, excluir'}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    )
  }

  // --- modo list ---
  return (
    <div className="screen">
      <Header
        leading={
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft width={18} height={18} />}
            onClick={() => navigate('cadastros')}
            aria-label="Voltar"
          />
        }
        title="Áreas"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'registro' : 'registros'}` : undefined}
        trailing={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus width={18} height={18} />}
            onClick={startNew}
            aria-label="Nova área"
            disabled={filiais.length === 0}
          />
        }
      />

      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}

      {status === 'ok' && filiais.length === 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>
            Cadastre uma filial antes de criar áreas.
          </p>
        </Card>
      )}

      {status === 'ok' && list.length === 0 && filiais.length > 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>Nenhuma área cadastrada.</p>
        </Card>
      )}

      {status === 'ok' && list.length > 0 && (
        <div className="stack stack-lg">
          {groupedByFilial.map(g => (
            <section key={g.filial_id} className="group-filial">
              <h3 className="group-filial__title">{g.filial_descricao}</h3>
              <List>
                {g.items.map(item => (
                  <ListItem
                    key={item.id}
                    title={item.descricao}
                    trailing={
                      <Badge variant={item.ativo ? 'solid' : 'soft'}>
                        {item.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    }
                    showChevron
                    onClick={() => startEdit(item)}
                  />
                ))}
              </List>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
