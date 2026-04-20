import { useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Field from '../components/Field.jsx'
import TextField from '../components/TextField.jsx'
import { ChevronLeft, Check } from '../components/Icon.jsx'
import { navigate } from '../lib/router.js'
import { getUser } from '../lib/auth.js'
import { changePassword } from '../lib/api.js'
import { checklistStatus, validatePasswordStrength } from '../lib/password.js'
import './Conta.css'

export default function Conta() {
  const user = getUser() || {}
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha]   = useState('')
  const [confirmar, setConfirmar]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  const checklist      = useMemo(() => checklistStatus(novaSenha), [novaSenha])
  const strength       = useMemo(() => validatePasswordStrength(novaSenha), [novaSenha])
  const confirmOk      = confirmar.length > 0 && novaSenha === confirmar
  const canSubmit      = !saving && senhaAtual.length > 0 && strength.ok && confirmOk

  const save = async () => {
    setError('')
    setSuccess(false)
    if (!canSubmit) return
    if (novaSenha === senhaAtual) {
      setError('A nova senha deve ser diferente da atual.')
      return
    }
    setSaving(true)
    try {
      await changePassword(senhaAtual, novaSenha)
      setSuccess(true)
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmar('')
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err.message || 'Falha ao alterar a senha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <Header
        leading={
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft width={18} height={18} />}
            onClick={() => navigate('home')}
            aria-label="Voltar"
          />
        }
        title="Minha conta"
      />

      <Card padding="lg" className="stack stack-sm">
        <span className="text-section">Usuário</span>
        <div className="conta-info">
          <div className="conta-info__avatar">
            {(user.nome || user.usuario || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="conta-info__body">
            <p className="conta-info__name">{user.nome || '—'}</p>
            <p className="conta-info__login">
              @{user.usuario || ''} · {user.papel_label || user.papel || ''}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="lg" className="stack stack-md">
        <span className="text-section">Alterar senha</span>

        <Field label="Senha atual" required>
          <TextField
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>

        <Field label="Nova senha" required>
          <TextField
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>

        <ul className="password-rules">
          {checklist.map(r => (
            <li
              key={r.key}
              className={`password-rules__item${r.ok ? ' is-ok' : ''}`}
            >
              <span className="password-rules__mark" aria-hidden="true">
                {r.ok ? <Check width={12} height={12} /> : <span className="password-rules__dot" />}
              </span>
              <span>{r.label}</span>
            </li>
          ))}
        </ul>

        <Field
          label="Confirmar nova senha"
          required
          hint={
            confirmar.length > 0 && !confirmOk
              ? 'As senhas ainda não coincidem.'
              : undefined
          }
        >
          <TextField
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>

        {error   && <p className="conta-error">{error}</p>}
        {success && <p className="conta-success">Senha alterada com sucesso.</p>}

        <Button
          variant="primary"
          size="lg"
          full
          onClick={save}
          disabled={!canSubmit}
          icon={saving ? <span className="spinner" aria-hidden="true" /> : null}
        >
          {saving ? 'Alterando…' : 'Alterar senha'}
        </Button>
      </Card>
    </div>
  )
}
