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

export default router
