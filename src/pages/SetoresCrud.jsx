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
  getSetores,
  getAreas,
  getFiliais,
  createSetor,
  updateSetor,
  deleteSetor,
} from '../lib/api.js'
import './ClassificacoesCrud.css'

const emptyDraft = () => ({
  descricao: '',
  filial_id: '',
  area_id: '',
  ativo: true,
})

export default function SetoresCrud() {
  const [list, setList] = useState([])
  const [filiais, setFiliais] = useState([])
  const [areas, setAreas] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const [mode, setMode] = useState('list')
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    setStatus('loading')
    try {
      const [setores, filiaisResp, areasResp] = await Promise.all([
        getSetores({ onlyActive: false }),
        getFiliais(true),
        getAreas({ onlyActive: true }),
      ])
      setList(setores)
      setFiliais(filiaisResp)
      setAreas(areasResp)
      setStatus('ok')
    } catch (err) {
      setError(err.message || 'Falha ao carregar')
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

  const filiaisOptions = useMemo(
    () => filiais.map(f => ({ value: String(f.id), label: f.descricao })),
    [filiais]
  )
  const groupedByFilialAndArea = useMemo(() => {
    const filialMap = new Map()
    for (const item of list) {
      if (!filialMap.has(item.filial_id)) {
        filialMap.set(item.filial_id, {
          filial_id: item.filial_id,
          filial_descricao: item.filial_descricao,
          areas: new Map(),
        })
      }
      const filial = filialMap.get(item.filial_id)
      if (!filial.areas.has(item.area_id)) {
        filial.areas.set(item.area_id, {
          area_id: item.area_id,
          area_descricao: item.area_descricao,
          items: [],
        })
      }
      filial.areas.get(item.area_id).items.push(item)
    }
    return Array.from(filialMap.values()).map(f => ({
      filial_id: f.filial_id,
      filial_descricao: f.filial_descricao,
      areas: Array.from(f.areas.values()),
    }))
  }, [list])

  const areasOptionsForFilial = useMemo(() => {
    if (!draft?.filial_id) return []
    return areas
      .filter(a => String(a.filial_id) === String(draft.filial_id))
      .map(a => ({ value: String(a.id), label: a.descricao }))
  }, [areas, draft?.filial_id])

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
      area_id: String(item.area_id),
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

  const onFilialChange = (v) => {
    setDraft(d => ({ ...d, filial_id: v, area_id: '' }))
  }
  const onAreaChange = (v) => {
    setDraft(d => ({ ...d, area_id: v }))
  }

  const isDraftValid = () => !!draft
    && draft.descricao.trim()
    && draft.filial_id
    && draft.area_id

  const save = async () => {
    if (!isDraftValid()) return
    setSaving(true)
    setError('')
    const payload = {
      descricao: draft.descricao.trim(),
      area_id: Number(draft.area_id),
      ativo: draft.ativo,
    }
    try {
      if (draft.id) await updateSetor(draft.id, payload)
      else          await createSetor(payload)
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
      await deleteSetor(draft.id)
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
          title={isNew ? 'Novo setor' : 'Editar setor'}
          subtitle={isNew ? undefined : `ID #${draft.id}`}
        />

        <Card padding="lg" className="stack stack-md">
          <Field label="Filial" required>
            <Combobox
              value={draft.filial_id}
              onChange={onFilialChange}
              options={filiaisOptions}
              placeholder="Selecione a filial"
              searchPlaceholder="Buscar filial…"
            />
          </Field>

          <Field
            label="Área"
            required
            hint={!draft.filial_id ? 'Selecione a filial primeiro' : undefined}
          >
            <Combobox
              value={draft.area_id}
              onChange={onAreaChange}
              options={areasOptionsForFilial}
              placeholder={draft.filial_id ? 'Selecione a área' : 'Indisponível'}
              searchPlaceholder="Buscar área…"
              emptyLabel={draft.filial_id ? 'Nenhuma área ativa nesta filial' : 'Selecione a filial'}
            />
          </Field>

          <Field label="Descrição" required>
            <TextField
              value={draft.descricao}
              onChange={(e) => setDraft(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Ex.: MANUTENÇÃO"
              maxLength={80}
            />
          </Field>

          <div className="row row-between row-gap-4" style={{ padding: '0 4px' }}>
            <div className="stack stack-sm">
              <span className="field__label">Ativo</span>
              <span className="text-subtle" style={{ fontSize: 'var(--fs-12)' }}>
                Setores inativos não aparecem no formulário.
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
                Excluir setor
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
  const canCreate = filiais.length > 0 && areas.length > 0
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
        title="Setores"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'registro' : 'registros'}` : undefined}
        trailing={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus width={18} height={18} />}
            onClick={startNew}
            aria-label="Novo setor"
            disabled={!canCreate}
          />
        }
      />

      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}

      {status === 'ok' && !canCreate && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>
            Cadastre uma filial e ao menos uma área antes de criar setores.
          </p>
        </Card>
      )}

      {status === 'ok' && canCreate && list.length === 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>Nenhum setor cadastrado.</p>
        </Card>
      )}

      {status === 'ok' && list.length > 0 && (
        <div className="stack stack-lg">
          {groupedByFilialAndArea.map(fg => (
            <section key={fg.filial_id} className="group-filial">
              <h3 className="group-filial__title">{fg.filial_descricao}</h3>
              {fg.areas.map(ag => (
                <section key={ag.area_id} className="group-area">
                  <h4 className="group-area__title">{ag.area_descricao}</h4>
                  <List>
                    {ag.items.map(item => (
                      <ListItem
                        key={item.id}
                        title={item.descricao}
                        trailing={
                          <Badge variant={item.ativo ? 'solid' : 'soft'}>
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        }
                        showChevron
                        onClick={() => startEdit(item)}
                      />
                    ))}
                  </List>
                </section>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
