import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { pool } from './db.js'
import { requireAuth } from './middleware/auth.js'
import { migrate } from './lib/migrate.js'
import { describe as describeBedrock } from './lib/bedrock.js'
import authRouter             from './routes/auth.js'
import usuariosRouter         from './routes/usuarios.js'
import classificacoesRouter   from './routes/classificacoes.js'
import filiaisRouter          from './routes/filiais.js'
import areasRouter            from './routes/areas.js'
import setoresRouter          from './routes/setores.js'
import itensObservadosRouter  from './routes/itens-observados.js'
import comunicadosRouter      from './routes/comunicados.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
// Limite alto para acomodar uploads de fotos em base64 no payload
app.use(express.json({ limit: '30mb' }))

// --- Rotas públicas ---
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)

// --- Tudo abaixo exige autenticação ---
app.use('/api', requireAuth)

app.use('/api/usuarios',          usuariosRouter)
app.use('/api/classificacoes',    classificacoesRouter)
app.use('/api/filiais',           filiaisRouter)
app.use('/api/areas',             areasRouter)
app.use('/api/setores',           setoresRouter)
app.use('/api/itens-observados',  itensObservadosRouter)
app.use('/api/comunicados',       comunicadosRouter)

async function ensureAdminUser() {
  try {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM dim_usuario`)
    if (rows[0].c === 0) {
      const hash = await bcrypt.hash('admin', 10)
      await pool.query(
        `INSERT INTO dim_usuario (usuario, senha_hash, nome, papel, ativo)
              VALUES ($1, $2, $3, 'admin', TRUE)`,
        ['admin', hash, 'Administrador']
      )
      console.log('[auth] usuário padrão criado: admin/admin (papel=admin) — TROQUE A SENHA')
    }
  } catch (err) {
    console.error('[auth] bootstrap do admin falhou:', err.message)
  }
}

app.listen(port, async () => {
  console.log(`[api] ouvindo em http://localhost:${port}`)
  try {
    await migrate()
  } catch (err) {
    console.error('[migrate] FALHA no bootstrap do schema:', err.message)
    console.error('[migrate] A API continua de pé, mas algumas rotas podem falhar.')
  }
  await ensureAdminUser()
  const b = describeBedrock()
  if (b.enabled) {
    console.log(`[bedrock] habilitado — model="${b.model}" region="${b.region}"`)
  } else {
    console.log('[bedrock] desabilitado — defina AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY em .env para ativar')
  }
})
