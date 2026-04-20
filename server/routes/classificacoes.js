import { Router } from 'express'
import { pool } from '../db.js'
import { requirePermission, PERMISSIONS } from '../lib/rbac.js'

const router = Router()

const manage = requirePermission(PERMISSIONS.CADASTROS_MANAGE)

// GET /api/classificacoes          → todas as classificações
// GET /api/classificacoes?ativos=true → somente ativas (usado pelo formulário)
router.get('/', async (req, res) => {
  const onlyActive = req.query.ativos === 'true'
  try {
    const { rows } = await pool.query(
      onlyActive
        ? `SELECT id, descricao, ativo FROM dim_classificacao WHERE ativo = TRUE ORDER BY id`
        : `SELECT id, descricao, ativo FROM dim_classificacao ORDER BY id`
    )
    res.json(rows)
  } catch (err) {
    console.error('[classificacoes] GET falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar classificações' })
  }
})

// GET /api/classificacoes/:id
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, descricao, ativo FROM dim_classificacao WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.json(rows[0])
  } catch (err) {
    console.error('[classificacoes] GET :id falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar classificação' })
  }
})

// POST /api/classificacoes
router.post('/', manage, async (req, res) => {
  const { descricao, ativo = true } = req.body || {}
  if (!descricao || typeof descricao !== 'string' || !descricao.trim()) {
    return res.status(400).json({ error: 'descricao é obrigatória' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO dim_classificacao (descricao, ativo)
       VALUES ($1, $2)
       RETURNING id, descricao, ativo`,
      [descricao.trim().slice(0, 80), Boolean(ativo)]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[classificacoes] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar classificação' })
  }
})

// PUT /api/classificacoes/:id
router.put('/:id(\\d+)', manage, async (req, res) => {
  const { descricao, ativo } = req.body || {}
  if (!descricao || typeof descricao !== 'string' || !descricao.trim()) {
    return res.status(400).json({ error: 'descricao é obrigatória' })
  }
  try {
    const { rows } = await pool.query(
      `UPDATE dim_classificacao
          SET descricao = $1,
              ativo     = $2
        WHERE id = $3
        RETURNING id, descricao, ativo`,
      [descricao.trim().slice(0, 80), Boolean(ativo), req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.json(rows[0])
  } catch (err) {
    console.error('[classificacoes] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar classificação' })
  }
})

// DELETE /api/classificacoes/:id
router.delete('/:id(\\d+)', manage, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM dim_classificacao WHERE id = $1`,
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.status(204).end()
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Existe comunicado vinculado a esta classificação. Desative em vez de excluir.',
      })
    }
    console.error('[classificacoes] DELETE falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir classificação' })
  }
})

export default router
