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
import { ChevronLeft, Plus, Check } from '../components/Icon.jsx'
import { navigate } from '../lib/router.js'
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  resetUsuarioPassword,
} from '../lib/api.js'
import { roleOptions, roleLabel } from '../lib/rbac.js'
import { checklistStatus, validatePasswordStrength } from '../lib/password.js'
import { getUser } from '../lib/auth.js'
import './ClassificacoesCrud.css'

const emptyDraft = () => ({
  usuario: '',
  nome: '',
  papel: 'operador',
  ativo: true,
  senha: '',
})

function PasswordChecklist({ senha }) {
  const checklist = useMemo(() => checklistStatus(senha), [senha])
  return (
    <ul className="password-rules">
      {checklist.map(r => (
        <li key={r.key} className={`password-rules__item${r.ok ? ' is-ok' : ''}`}>
          <span className="password-rules__mark" aria-hidden="true">
            {r.ok ? <Check width={12} height={12} /> : <span className="password-rules__dot" />}
          </span>
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default function UsuariosCrud() {
  const me = getUser() || {}
  const [list, setList]   = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const [mode, setMode]   = useState('list')           // list | edit | reset
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  const [novaSenha, setNovaSenha] = useState('')

  const rolesAsOptions = useMemo(() => roleOptions(), [])

  const load = async () => {
    setStatus('loading')
    try {
      setList(await getUsuarios())
      setStatus('ok')
    } catch (err) {
      setError(err.message || 'Falha ao carregar')
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [])

  const startNew   = () => { setDraft(emptyDraft()); setError(''); setMode('edit') }
  const startEdit  = (u) => {
    setDraft({
      id: u.id, usuario: u.usuario, nome: u.nome,
      papel: u.papel, ativo: u.ativo, senha: '',
    })
    setError(''); setMode('edit')
  }
  const startReset = () => {
    setNovaSenha(''); setError(''); setMode('reset')
  }
  const cancel = () => {
    setMode('list'); setDraft(null); setNovaSenha(''); setError('')
  }

  const senhaOk = (s) => validatePasswordStrength(s).ok

  const canSaveEdit = () => {
    if (!draft) return false
    if (!draft.nome.trim()) return false
    if (!draft.usuario.trim()) return false
    if (!draft.papel) return false
    if (!draft.id && !senhaOk(draft.senha || '')) return false
    return true
  }

  const save = async () => {
    if (!canSaveEdit() || saving) return
    setSaving(true); setError('')
    try {
      if (draft.id) {
        await updateUsuario(draft.id, {
          nome: draft.nome.trim(),
          papel: draft.papel,
          ativo: draft.ativo,
        })
      } else {
        await createUsuario({
          usuario: draft.usuario.trim().toLowerCase(),
          nome:    draft.nome.trim(),
          papel:   draft.papel,
          ativo:   draft.ativo,
          senha:   draft.senha,
        })
      }
      await load()
      cancel()
    } catch (err) {
      setError(err.message || 'Falha ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const resetPassword = async () => {
    if (!senhaOk(novaSenha) || saving) return
    setSaving(true); setError('')
    try {
      await resetUsuarioPassword(draft.id, novaSenha)
      cancel()
    } catch (err) {
      setError(err.message || 'Falha ao redefinir senha')
    } finally {
      setSaving(false)
    }
  }

  // ---------- MODO: RESET PASSWORD ----------
  if (mode === 'reset' && draft) {
    return (
      <div className="screen">
        <Header
          leading={<Button variant="ghost" size="sm" icon={<ChevronLeft width={18} height={18} />} onClick={cancel} aria-label="Voltar" />}
          title="Redefinir senha"
          subtitle={`${draft.nome} · @${draft.usuario}`}
        />
        <Card padding="lg" className="stack stack-md">
          <Field label="Nova senha" required>
            <TextField
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </Field>
          <PasswordChecklist senha={novaSenha} />
          {error && <p className="crud-error">{error}</p>}
          <div className="crud-actions">
            <Button variant="secondary" onClick={cancel} disabled={saving}>Cancelar</Button>
            <Button variant="primary" onClick={resetPassword} disabled={!senhaOk(novaSenha) || saving}>
              {saving ? 'Salvando…' : 'Redefinir'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ---------- MODO: EDIT / NOVO ----------
  if (mode === 'edit' && draft) {
    const isNew = !draft.id
    const isSelf = draft.id === me.id
    return (
      <div className="screen">
        <Header
          leading={<Button variant="ghost" size="sm" icon={<ChevronLeft width={18} height={18} />} onClick={cancel} aria-label="Voltar" />}
          title={isNew ? 'Novo usuário' : 'Editar usuário'}
          subtitle={isNew ? undefined : `@${draft.usuario}`}
        />
        <Card padding="lg" className="stack stack-md">
          <Field
            label="Usuário"
            required
            hint={isNew ? 'Login — minúsculas, números, . _ -' : 'Não pode ser alterado'}
          >
            <TextField
              value={draft.usuario}
              onChange={(e) => setDraft(d => ({ ...d, usuario: e.target.value.toLowerCase() }))}
              placeholder="ex.: joao.silva"
              maxLength={60}
              disabled={!isNew}
              autoCapitalize="none"
              spellCheck={false}
              autoFocus={isNew}
            />
          </Field>
          <Field label="Nome completo" required>
            <TextField
              value={draft.nome}
              onChange={(e) => setDraft(d => ({ ...d, nome: e.target.value }))}
              placeholder="ex.: João da Silva"
              maxLength={120}
            />
          </Field>
          <Field label="Papel" required>
            <Combobox
              value={draft.papel}
              onChange={(v) => setDraft(d => ({ ...d, papel: v || 'operador' }))}
              options={rolesAsOptions}
              placeholder="Selecione o papel"
              searchPlaceholder="Buscar papel…"
              clearable={false}
            />
          </Field>

          {isNew && (
            <>
              <Field label="Senha inicial" required>
                <TextField
                  type="password"
                  value={draft.senha}
                  onChange={(e) => setDraft(d => ({ ...d, senha: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>
              <PasswordChecklist senha={draft.senha} />
            </>
          )}

          <div className="row row-between row-gap-4" style={{ padding: '0 4px' }}>
            <div className="stack stack-sm">
              <span className="field__label">Ativo</span>
              <span className="text-subtle" style={{ fontSize: 'var(--fs-12)' }}>
                {isSelf
                  ? 'Você não pode desativar a própria conta.'
                  : 'Usuários inativos não conseguem logar.'}
              </span>
            </div>
            {isSelf ? (
              <Badge variant="solid">Ativo</Badge>
            ) : (
              <Switch
                checked={draft.ativo}
                onChange={(v) => setDraft(d => ({ ...d, ativo: v }))}
                ariaLabel="Ativo"
              />
            )}
          </div>

          {error && <p className="crud-error">{error}</p>}

          <div className="crud-actions">
            <Button variant="secondary" onClick={cancel} disabled={saving}>Cancelar</Button>
            <Button variant="primary" onClick={save} disabled={!canSaveEdit() || saving}>
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </Card>

        {!isNew && (
          <div className="crud-danger">
            <Button variant="ghost" size="md" onClick={startReset} className="crud-danger__trigger">
              Redefinir senha
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ---------- MODO: LISTA ----------
  return (
    <div className="screen">
      <Header
        leading={<Button variant="ghost" size="sm" icon={<ChevronLeft width={18} height={18} />} onClick={() => navigate('cadastros')} aria-label="Voltar" />}
        title="Usuários"
        subtitle={status === 'ok' ? `${list.length} ${list.length === 1 ? 'registro' : 'registros'}` : undefined}
        trailing={<Button variant="primary" size="sm" icon={<Plus width={18} height={18} />} onClick={startNew} aria-label="Novo usuário" />}
      />
      {status === 'loading' && <p className="text-muted">Carregando…</p>}
      {status === 'error'   && <p className="crud-error">Erro: {error}</p>}
      {status === 'ok' && list.length === 0 && (
        <Card padding="lg"><p className="text-muted" style={{ margin: 0 }}>Nenhum usuário cadastrado.</p></Card>
      )}
      {status === 'ok' && list.length > 0 && (
        <List>
          {list.map(u => (
            <ListItem
              key={u.id}
              title={u.nome}
              subtitle={`@${u.usuario} · ${u.papel_label || roleLabel(u.papel)}`}
              trailing={
                <span className="comunicado-meta">
                  {u.id === me.id && <Badge variant="outline">Você</Badge>}
                  <Badge variant={u.ativo ? 'solid' : 'soft'}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </span>
              }
              showChevron
              onClick={() => startEdit(u)}
            />
          ))}
        </List>
      )}
    </div>
  )
}
