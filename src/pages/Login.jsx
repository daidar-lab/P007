import { useState } from 'react'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import TextField from '../components/TextField.jsx'
import { login as apiLogin } from '../lib/api.js'
import { setSession } from '../lib/auth.js'
import './Login.css'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const canSubmit = usuario.trim() && senha.length > 0 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const { token, user } = await apiLogin(usuario.trim(), senha)
      setSession({ token, user })
      // O App.jsx reage ao evento "auth:login" e re-renderiza autenticado.
    } catch (err) {
      setError(err.message || 'Falha no login')
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="login">
      <div className="login__brand">
        <div className="login__logo">CI</div>
        <div>
          <p className="login__name">Cidade Imperial</p>
          <p className="login__tag">Comunicado de Intervenção</p>
        </div>
      </div>

      <Card elevated padding="lg" className="login__card stack stack-md">
        <div className="stack stack-sm">
          <h1 className="login__title">Entrar</h1>
          <p className="login__subtitle">Informe seu usuário e senha para continuar.</p>
        </div>

        <Field label="Usuário" required>
          <TextField
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="ex.: admin"
            autoComplete="username"
            autoFocus
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>

        <Field label="Senha" required>
          <TextField
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>

        {error && <p className="login__error">{error}</p>}

        <Button
          variant="primary"
          size="lg"
          full
          onClick={handleSubmit}
          disabled={!canSubmit}
          icon={loading ? <span className="spinner" aria-hidden="true" /> : null}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </Card>

      <p className="login__footer">Segurança do Trabalho · Interno</p>
    </div>
  )
}
