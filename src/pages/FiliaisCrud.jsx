import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import { List } from '../components/ListItem.jsx'
import ListItem from '../components/ListItem.jsx'
import Badge from '../components/Badge.jsx'
import Field, { FieldRow } from '../components/Field.jsx'
import TextField from '../components/TextField.jsx'
import Switch from '../components/Switch.jsx'
import { ChevronLeft, Plus } from '../components/Icon.jsx'
import { navigate } from '../lib/router.js'
import {
  getFiliais,
  createFilial,
  updateFilial,
  deleteFilial,
} from '../lib/api.js'
import './ClassificacoesCrud.css'

const emptyDraft = () => ({
  descricao: '',
  abreviatura: '',
  codigo_protheus: '',
  ativo: true,
})

export default function FiliaisCrud() {
  const [list, setList] = useState([])
  const [status, setStatus] = useState('loading')  // loading | ok | error
  const [error, setError] = useState('')

  const [mode, setMode] = useState('list')         // list | edit
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    setStatus('loading')
    try {
      setList(await getFiliais(false))
      setStatus('ok')
    } catch (err) {
      setError(err.message || 'Falha ao carregar')
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

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
      abreviatura: item.abreviatura,
      codigo_protheus: item.codigo_protheus,
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
    && draft.abreviatura.trim()
    && draft.codigo_protheus.trim()

  const save = async () => {
    if (!isDraftValid()) return
    setSaving(true)
    setError('')
    const payload = {
      descricao: draft.descricao.trim(),
      abreviatura: draft.abreviatura.trim().toUpperCase(),
      codigo_protheus: draft.codigo_protheus.trim(),
      ativo: draft.ativo,
    }
    try {
      if (draft.id) await updateFilial(draft.id, payload)
      else          await createFilial(payload)
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
      await deleteFilial(draft.id)
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
          title={isNew ? 'Nova filial' : 'Editar filial'}
          subtitle={isNew ? undefined : `ID #${draft.id}`}
        />

        <Card padding="lg" className="stack stack-md">
          <Field label="Descrição" required>
            <TextField
              value={draft.descricao}
              onChange={(e) => setDraft(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Ex.: Frutal"
              maxLength={80}
              autoFocus
            />
          </Field>

          <FieldRow>
            <Field label="Abreviatura" required hint="Até 10 caracteres">
              <TextField
                value={draft.abreviatura}
                onChange={(e) => setDraft(d => ({ ...d, abreviatura: e.target.value.toUpperCase() }))}
                placeholder="Ex.: FRU"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
              />
            </Field>
            <Field label="Código Protheus" required hint="Até 8 caracteres">
              <TextField
                value={draft.codigo_protheus}
                onChange={(e) => setDraft(d => ({ ...d, codigo_protheus: e.target.value }))}
                placeholder="Ex.: 01"
                maxLength={8}
              />
            </Field>
          </FieldRow>

          <div className="row row-between row-gap-4" style={{ padding: '0 4px' }}>
            <div className="stack stack-sm">
              <span className="field__label">Ativo</span>
              <span className="text-subtle" style={{ fontSize: 'var(--fs-12)' }}>
                Filiais inativas não aparecem no formulário.
              </span>
            </div>
            <Switch
              checked={draft.ativo}
              onChange={(v) => setDraft(d => ({ ...d, ativo: v }))}
              ariaLabel="Ativo"
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
                Excluir filial
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
        title="Filiais"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'registro' : 'registros'}` : undefined}
        trailing={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus width={18} height={18} />}
            onClick={startNew}
            aria-label="Nova filial"
          />
        }
      />

      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}

      {status === 'ok' && list.length === 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>Nenhuma filial cadastrada.</p>
        </Card>
      )}

      {status === 'ok' && list.length > 0 && (
        <List>
          {list.map(item => (
            <ListItem
              key={item.id}
              title={item.descricao}
              subtitle={`${item.abreviatura} · Protheus ${item.codigo_protheus}`}
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
      )}
    </div>
  )
}
