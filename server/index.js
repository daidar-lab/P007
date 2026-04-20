import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import classificacoesRouter   from './routes/classificacoes.js'
import filiaisRouter          from './routes/filiais.js'
import areasRouter            from './routes/areas.js'
import setoresRouter          from './routes/setores.js'
import itensObservadosRouter  from './routes/itens-observados.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/classificacoes',    classificacoesRouter)
app.use('/api/filiais',           filiaisRouter)
app.use('/api/areas',             areasRouter)
app.use('/api/setores',           setoresRouter)
app.use('/api/itens-observados',  itensObservadosRouter)

app.listen(port, () => {
  console.log(`[api] ouvindo em http://localhost:${port}`)
})
