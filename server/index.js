import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import classificacoesRouter from './routes/classificacoes.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/classificacoes', classificacoesRouter)

app.listen(port, () => {
  console.log(`[api] ouvindo em http://localhost:${port}`)
})
