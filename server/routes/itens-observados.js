import { Router } from 'express'
import { requirePermission, PERMISSIONS } from '../lib/rbac.js'
import { pool } from '../db.js'

const router = Router()
const manage = requirePermission(PERMISSIONS.CADASTROS_MANAGE)

const COLS = `id, descricao, ativo`

router.get('/', async (req, res) => {
  const onlyActive = req.query.ativos === 'true'
  try {
    const { rows } = await pool.query(
      onlyActive
        ? `SELECT ${COLS} FROM dim_item_observado WHERE ativo = TRUE ORDER BY id`
        : `SELECT ${COLS} FROM dim_item_observado ORDER BY id`
    )
    res.json(rows)
  } catch (err) {
    console.error('[itens-observados] GET falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar itens observados' })
  }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM dim_item_observado WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('[itens-observados] GET :id falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar item observado' })
  }
})

function validatePayload(body) {
  const descricao = (body?.descricao ?? '').toString().trim()
  const ativo     = body?.ativo === undefined ? true : Boolean(body.ativo)
  if (!descricao) return { error: 'descricao é obrigatória' }
  if (descricao.length > 120) return { error: 'descricao excede 120 caracteres' }
  return { data: { descricao, ativo } }
}

router.post('/', manage, async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, ativo } = parsed.data
  try {
    const { rows } = await pool.query(
      `INSERT INTO dim_item_observado (descricao, ativo)
            VALUES ($1, $2)
         RETURNING ${COLS}`,
      [descricao, ativo]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[itens-observados] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar item observado' })
  }
})

router.put('/:id(\\d+)', manage, async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, ativo } = parsed.data
  try {
    const { rows } = await pool.query(
      `UPDATE dim_item_observado
          SET descricao = $1, ativo = $2
        WHERE id = $3
        RETURNING ${COLS}`,
      [descricao, ativo, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('[itens-observados] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar item observado' })
  }
})

router.delete('/:id(\\d+)', manage, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM dim_item_observado WHERE id = $1`,
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).end()
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Existem comunicados vinculados a este item. Desative em vez de excluir.',
      })
    }
    console.error('[itens-observados] DELETE falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir item observado' })
  }
})

export default router
