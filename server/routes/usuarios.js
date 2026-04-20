import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { requirePermission, PERMISSIONS, ROLE_KEYS, roleLabel } from '../lib/rbac.js'
import { validatePasswordStrength } from '../lib/password.js'

const router = Router()
const manage = requirePermission(PERMISSIONS.USUARIOS_MANAGE)

const COLS = `id, usuario, nome, papel, ativo, criado_em`

// GET /api/usuarios — lista
router.get('/', manage, async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${COLS} FROM dim_usuario ORDER BY id`)
    res.json(rows.map(r => ({ ...r, papel_label: roleLabel(r.papel) })))
  } catch (err) {
    console.error('[usuarios] GET falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar usuários' })
  }
})

// GET /api/usuarios/:id
router.get('/:id(\\d+)', manage, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM dim_usuario WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json({ ...rows[0], papel_label: roleLabel(rows[0].papel) })
  } catch (err) {
    console.error('[usuarios] GET :id falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar usuário' })
  }
})

function validateBase(body) {
  const usuario = String(body?.usuario ?? '').trim().toLowerCase()
  const nome    = String(body?.nome ?? '').trim()
  const papel   = String(body?.papel ?? '').trim()
  const ativo   = body?.ativo === undefined ? true : Boolean(body.ativo)
  if (!usuario) return { error: 'usuario é obrigatório' }
  if (!/^[a-z0-9._-]{3,60}$/.test(usuario))
    return { error: 'usuario deve ter 3 a 60 chars (letras, números, . _ -)' }
  if (!nome) return { error: 'nome é obrigatório' }
  if (nome.length > 120) return { error: 'nome excede 120 caracteres' }
  if (!ROLE_KEYS.includes(papel)) return { error: `papel inválido (válidos: ${ROLE_KEYS.join(', ')})` }
  return { data: { usuario, nome, papel, ativo } }
}

// POST /api/usuarios — cria com senha inicial definida pelo admin
router.post('/', manage, async (req, res) => {
  const parsed = validateBase(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const senha = String(req.body?.senha ?? '')
  const strength = validatePasswordStrength(senha)
  if (!strength.ok) {
    return res.status(400).json({
      error: 'A senha precisa ter: ' + strength.errors.join(', ') + '.',
    })
  }
  try {
    const hash = await bcrypt.hash(senha, 10)
    const { rows } = await pool.query(
      `INSERT INTO dim_usuario (usuario, senha_hash, nome, papel, ativo)
            VALUES ($1, $2, $3, $4, $5)
         RETURNING ${COLS}`,
      [parsed.data.usuario, hash, parsed.data.nome, parsed.data.papel, parsed.data.ativo]
    )
    res.status(201).json({ ...rows[0], papel_label: roleLabel(rows[0].papel) })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Nome de usuário já cadastrado.' })
    }
    console.error('[usuarios] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

// PUT /api/usuarios/:id — atualiza nome, papel e ativo (não mexe em senha ou usuario)
router.put('/:id(\\d+)', manage, async (req, res) => {
  const id = Number(req.params.id)
  const nome  = String(req.body?.nome ?? '').trim()
  const papel = String(req.body?.papel ?? '').trim()
  const ativo = body_bool(req.body?.ativo)
  if (!nome) return res.status(400).json({ error: 'nome é obrigatório' })
  if (!ROLE_KEYS.includes(papel)) return res.status(400).json({ error: 'papel inválido' })
  // Safeguards: não pode se rebaixar nem se desativar
  if (id === req.user.sub && papel !== 'admin') {
    return res.status(400).json({ error: 'Você não pode rebaixar o próprio papel.' })
  }
  if (id === req.user.sub && !ativo) {
    return res.status(400).json({ error: 'Você não pode desativar a própria conta.' })
  }
  // Não pode deixar o sistema sem admins
  if (ativo === false || papel !== 'admin') {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS c FROM dim_usuario WHERE papel = 'admin' AND ativo = TRUE AND id <> $1`,
      [id]
    )
    const atualSeriaAdminAtivo = ativo && papel === 'admin'
    if (!atualSeriaAdminAtivo && rows[0].c === 0) {
      return res.status(400).json({ error: 'Precisa existir ao menos um administrador ativo.' })
    }
  }
  try {
    const { rows } = await pool.query(
      `UPDATE dim_usuario
          SET nome = $1, papel = $2, ativo = $3
        WHERE id = $4
        RETURNING ${COLS}`,
      [nome, papel, ativo, id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json({ ...rows[0], papel_label: roleLabel(rows[0].papel) })
  } catch (err) {
    console.error('[usuarios] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar usuário' })
  }
})

// POST /api/usuarios/:id/reset-password — admin define nova senha
router.post('/:id(\\d+)/reset-password', manage, async (req, res) => {
  const senha = String(req.body?.senha ?? '')
  const strength = validatePasswordStrength(senha)
  if (!strength.ok) {
    return res.status(400).json({
      error: 'A senha precisa ter: ' + strength.errors.join(', ') + '.',
    })
  }
  try {
    const hash = await bcrypt.hash(senha, 10)
    const { rowCount } = await pool.query(
      `UPDATE dim_usuario SET senha_hash = $1 WHERE id = $2`,
      [hash, req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json({ ok: true })
  } catch (err) {
    console.error('[usuarios] reset-password falhou:', err)
    res.status(500).json({ error: 'Erro ao redefinir senha' })
  }
})

function body_bool(v) {
  if (v === undefined) return true
  return Boolean(v)
}

export default router
