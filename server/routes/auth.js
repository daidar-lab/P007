import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { signToken, requireAuth } from '../middleware/auth.js'

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
      `SELECT id, usuario, senha_hash, nome, ativo
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
      user: { id: user.id, usuario: user.usuario, nome: user.nome },
    })
  } catch (err) {
    console.error('[auth] login falhou:', err)
    res.status(500).json({ error: 'Erro no login' })
  }
})

// GET /api/auth/me — retorna o usuário atual a partir do token
router.get('/me', requireAuth, (req, res) => {
  res.json({
    id:      req.user.sub,
    usuario: req.user.usuario,
    nome:    req.user.nome,
  })
})

// POST /api/auth/change-password — usuário logado troca a própria senha
router.post('/change-password', requireAuth, async (req, res) => {
  const senhaAtual = String(req.body?.senha_atual ?? '')
  const novaSenha  = String(req.body?.nova_senha  ?? '')
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ error: 'senha_atual e nova_senha são obrigatórios' })
  }
  if (novaSenha.length < 6) {
    return res.status(400).json({ error: 'a nova senha precisa ter ao menos 6 caracteres' })
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

export default router
