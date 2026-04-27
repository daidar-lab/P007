import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { signToken, requireAuth } from '../middleware/auth.js'
import { validatePasswordStrength } from '../lib/password.js'
import { roleLabel, requirePermission, PERMISSIONS } from '../lib/rbac.js'
import { describe as describeBedrock, analyzePhoto } from '../lib/bedrock.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const usuario = String(req.body?.usuario ?? '').trim().toLowerCase()
  const senha   = String(req.body?.senha ?? '')
  if (!usuario || !senha) {
    return res.status(400).json({ error: 'usuario e senha são obrigatórios' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, usuario, senha_hash, nome, papel, ativo
         FROM dim_usuario
        WHERE usuario = $1`,
      [usuario]
    )
    const user = rows[0]
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' })
    }
    const ok = await bcrypt.compare(senha, user.senha_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' })
    }
    const token = signToken(user)
    res.json({
      token,
      user: {
        id:          user.id,
        usuario:     user.usuario,
        nome:        user.nome,
        papel:       user.papel,
        papel_label: roleLabel(user.papel),
      },
    })
  } catch (err) {
    console.error('[auth] login falhou:', err)
    res.status(500).json({ error: 'Erro no login' })
  }
})

// GET /api/auth/me — retorna o usuário atual a partir do token
router.get('/me', requireAuth, (req, res) => {
  res.json({
    id:          req.user.sub,
    usuario:     req.user.usuario,
    nome:        req.user.nome,
    papel:       req.user.papel,
    papel_label: roleLabel(req.user.papel),
  })
})

// POST /api/auth/change-password — usuário logado troca a própria senha
router.post('/change-password', requireAuth, async (req, res) => {
  const senhaAtual = String(req.body?.senha_atual ?? '')
  const novaSenha  = String(req.body?.nova_senha  ?? '')
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ error: 'senha_atual e nova_senha são obrigatórios' })
  }
  const strength = validatePasswordStrength(novaSenha)
  if (!strength.ok) {
    return res.status(400).json({
      error: 'A nova senha precisa ter: ' + strength.errors.join(', ') + '.',
    })
  }
  if (novaSenha === senhaAtual) {
    return res.status(400).json({ error: 'a nova senha deve ser diferente da atual' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT senha_hash FROM dim_usuario WHERE id = $1 AND ativo = TRUE`,
      [req.user.sub]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const ok = await bcrypt.compare(senhaAtual, rows[0].senha_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Senha atual incorreta' })
    }
    const newHash = await bcrypt.hash(novaSenha, 10)
    await pool.query(
      `UPDATE dim_usuario SET senha_hash = $1 WHERE id = $2`,
      [newHash, req.user.sub]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[auth] change-password falhou:', err)
    res.status(500).json({ error: 'Erro ao alterar senha' })
  }
})

// GET  /api/auth/bedrock-status — admin diagnostica config (sem chamar a API)
// POST /api/auth/bedrock-status — admin dispara teste real com imagem 1x1 PNG
const BEDROCK_TEST_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

router.get('/bedrock-status', requireAuth, requirePermission(PERMISSIONS.USUARIOS_MANAGE), (_req, res) => {
  res.json(describeBedrock())
})

router.post('/bedrock-status', requireAuth, requirePermission(PERMISSIONS.USUARIOS_MANAGE), async (_req, res) => {
  const cfg = describeBedrock()
  if (!cfg.enabled) {
    return res.status(400).json({ ok: false, error: 'Bedrock desabilitado (AWS_ACCESS_KEY_ID vazio em .env)', ...cfg })
  }
  const t0 = Date.now()
  try {
    const text = await analyzePhoto(BEDROCK_TEST_PNG, 'image/png')
    if (!text) {
      return res.status(502).json({
        ok: false,
        ...cfg,
        elapsed_ms: Date.now() - t0,
        error: 'Resposta vazia ou erro silencioso. Verifique os logs do servidor — o erro foi logado com requestId.',
      })
    }
    res.json({ ok: true, ...cfg, elapsed_ms: Date.now() - t0, sample: text.slice(0, 200) })
  } catch (err) {
    res.status(500).json({ ok: false, ...cfg, error: err.message })
  }
})

export default router
