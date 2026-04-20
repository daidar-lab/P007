import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const EXPIRES_IN = '8h'

if (SECRET === 'dev-secret-change-me') {
  console.warn('[auth] JWT_SECRET não configurado — usando valor de desenvolvimento.')
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, usuario: user.usuario, nome: user.nome },
    SECRET,
    { expiresIn: EXPIRES_IN }
  )
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Não autenticado' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Sessão expirada ou inválida' })
  }
}
