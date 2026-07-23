import { useEffect, useState } from 'react'
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
  getEmailsWorkflow,
  createEmailWorkflow,
  updateEmailWorkflow,
  deleteEmailWorkflow,
  getAreas,
  getSetores,
} from '../lib/api.js'
import './ClassificacoesCrud.css'

const emptyDraft = () => ({
  nome: '',
  email: '',
  ativo: true,
  regras: [],
})

export default function EmailsWorkflowCrud() {
  const [list, setList] = useState([])
  const [areas, setAreas] = useState([])
  const [setores, setSetores] = useState([])
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
      const [emailsResp, areasResp, setoresResp] = await Promise.all([
        getEmailsWorkflow(),
        getAreas({ onlyActive: true }),
        getSetores({ onlyActive: true }),
      ])
      setList(emailsResp)
      setAreas(areasResp)
      setSetores(setoresResp)
      setStatus('ok')
    } catch (err) {
      setError(err.message || 'Falha ao carregar')
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

  const areasOptions = areas.map(a => ({
    value: String(a.id),
    label: `${a.filial_descricao} - ${a.descricao}`,
  }))

  const startNew = () => {
    setDraft(emptyDraft())
    setConfirmDelete(false)
    setError('')
    setMode('edit')
  }

  const startEdit = (item) => {
    setDraft({
      id: item.id,
      nome: item.nome,
      email: item.email,
      ativo: item.ativo,
      regras: item.regras.map(r => ({
        id: Math.random().toString(),
        area_id: String(r.area_id),
        setor_id: r.setor_id ? String(r.setor_id) : '',
      })),
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
    && draft.nome.trim()
    && draft.email.trim()
    && draft.regras.length > 0
    && draft.regras.every(r => r.area_id)

  const save = async () => {
    if (!isDraftValid()) return
    setSaving(true)
    setError('')
    
    const regrasPayload = draft.regras
      .filter(r => !!r.area_id)
      .map(r => ({
        area_id: Number(r.area_id),
        setor_id: r.setor_id ? Number(r.setor_id) : null,
      }))

    const payload = {
      nome: draft.nome.trim(),
      email: draft.email.trim(),
      ativo: draft.ativo,
      regras: regrasPayload,
    }
    
    try {
      if (draft.id) await updateEmailWorkflow(draft.id, payload)
      else          await createEmailWorkflow(payload)
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
      await deleteEmailWorkflow(draft.id)
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

  const addRegra = () => {
    setDraft(d => ({
      ...d,
      regras: [...d.regras, { id: Math.random().toString(), area_id: '', setor_id: '' }]
    }))
  }

  const updateRegra = (index, field, value) => {
    setDraft(d => {
      const newRegras = [...d.regras]
      newRegras[index] = { ...newRegras[index], [field]: value }
      if (field === 'area_id') newRegras[index].setor_id = '' 
      return { ...d, regras: newRegras }
    })
  }

  const removeRegra = (index) => {
    setDraft(d => {
      const newRegras = [...d.regras]
      newRegras.splice(index, 1)
      return { ...d, regras: newRegras }
    })
  }

  if (mode === 'edit') {
    const isNew = !draft.id
    const canSave = isDraftValid() && !saving && !deleting

    return (
      <div className="screen screen--wide">
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
          title={isNew ? 'Novo e-mail' : 'Editar e-mail'}
          subtitle={isNew ? undefined : `ID #${draft.id}`}
        />

        <Card padding="lg" className="stack stack-md">
          <Field label="Nome do destinatário" required>
            <TextField
              value={draft.nome}
              onChange={(e) => setDraft(d => ({ ...d, nome: e.target.value }))}
              placeholder="Ex.: João Silva"
              maxLength={120}
            />
          </Field>
          
          <Field label="Endereço de E-mail" required>
            <TextField
              type="email"
              value={draft.email}
              onChange={(e) => setDraft(d => ({ ...d, email: e.target.value }))}
              placeholder="Ex.: joao.silva@email.com"
              maxLength={255}
            />
          </Field>

          <div className="row row-between row-gap-4" style={{ padding: '0 4px', marginTop: 12 }}>
            <div className="stack stack-sm">
              <span className="field__label">Ativo</span>
              <span className="text-subtle" style={{ fontSize: 'var(--fs-12)' }}>
                Somente e-mails ativos receberão os alertas.
              </span>
            </div>
            <Switch
              checked={draft.ativo}
              onChange={(v) => setDraft(d => ({ ...d, ativo: v }))}
              ariaLabel="Ativo"
            />
          </div>
        </Card>
        
        <h3 style={{ marginTop: 24, marginBottom: 12, padding: '0 12px' }}>Regras de Envio</h3>
        
        {draft.regras.length === 0 && (
          <p className="text-muted" style={{ padding: '0 12px' }}>Nenhuma regra configurada. Adicione ao menos uma área.</p>
        )}

        <div className="stack stack-sm">
          {draft.regras.map((regra, index) => {
            const setoresFiltrados = regra.area_id 
              ? setores.filter(s => String(s.area_id) === String(regra.area_id))
              : []
            const setoresOptions = [{ value: '', label: 'Todos os setores (Nível Área)' }, ...setoresFiltrados.map(s => ({
              value: String(s.id),
              label: s.descricao
            }))]

            return (
              <Card key={regra.id} padding="md" className="stack stack-sm">
                <div className="row row-between" style={{ alignItems: 'flex-start' }}>
                  <div className="stack stack-sm" style={{ flex: 1, paddingRight: 12 }}>
                    <Field label={`Área ${index + 1}`} required>
                      <Combobox
                        value={regra.area_id}
                        onChange={(v) => updateRegra(index, 'area_id', v)}
                        options={areasOptions}
                        placeholder="Selecione a área"
                        searchPlaceholder="Buscar área…"
                      />
                    </Field>

                    <Field label="Setor (Opcional)">
                      <Combobox
                        value={regra.setor_id}
                        onChange={(v) => updateRegra(index, 'setor_id', v)}
                        options={setoresOptions}
                        placeholder="Todos os setores (Nível Área)"
                        searchPlaceholder="Buscar setor…"
                        disabled={!regra.area_id || setoresFiltrados.length === 0}
                      />
                    </Field>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRegra(index)} className="text-danger" style={{ marginTop: 24 }}>
                    Remover
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" size="sm" icon={<Plus width={16} height={16} />} onClick={addRegra}>
            Adicionar regra
          </Button>
        </div>

        {error && <p className="crud-error">{error}</p>}

        <div className="crud-actions" style={{ marginTop: 24 }}>
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
                Excluir e-mail
              </Button>
            ) : (
              <Card padding="md" className="stack stack-sm">
                <p className="text-body" style={{ margin: 0 }}>
                  Excluir <strong>{draft.nome} ({draft.email})</strong>? Esta ação não pode ser desfeita.
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

  return (
    <div className="screen screen--wide">
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
        title="Workflow de E-mails"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'destinatário' : 'destinatários'}` : undefined}
        trailing={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus width={18} height={18} />}
            onClick={startNew}
            aria-label="Novo e-mail"
            disabled={areas.length === 0}
          />
        }
      />

      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}

      {status === 'ok' && areas.length === 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>
            Cadastre uma área antes de configurar os e-mails do workflow.
          </p>
        </Card>
      )}

      {status === 'ok' && list.length === 0 && areas.length > 0 && (
        <Card padding="lg">
          <p className="text-muted" style={{ margin: 0 }}>Nenhum e-mail cadastrado.</p>
        </Card>
      )}

      {status === 'ok' && list.length > 0 && (
        <List>
          {list.map(item => {
            const regrasCount = item.regras.length
            const regrasLabel = regrasCount === 0 
              ? 'Nenhuma regra'
              : regrasCount === 1 
                ? '1 regra vinculada'
                : `${regrasCount} regras vinculadas`

            return (
              <ListItem
                key={item.id}
                title={item.nome}
                subtitle={`${item.email} • ${regrasLabel}`}
                trailing={
                  <Badge variant={item.ativo ? 'solid' : 'soft'}>
                    {item.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                }
                showChevron
                onClick={() => startEdit(item)}
              />
            )
          })}
        </List>
      )}
    </div>
  )
}
