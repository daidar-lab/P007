import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, descricao
         FROM dim_classificacao
        WHERE ativo = TRUE
        ORDER BY id`
    )
    res.json(rows)
  } catch (err) {
    console.error('[classificacoes] falha ao consultar:', err)
    res.status(500).json({ error: 'Erro ao consultar classificações' })
  }
})

export default router
