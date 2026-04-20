import { Router } from 'express'
import { requirePermission, PERMISSIONS } from '../lib/rbac.js'
import { pool } from '../db.js'

const router = Router()
const manage = requirePermission(PERMISSIONS.CADASTROS_MANAGE)

const FULL_SELECT = `
  SELECT a.id, a.descricao, a.filial_id, a.ativo,
         f.descricao AS filial_descricao
    FROM dim_area a
    JOIN dim_filial f ON f.id = a.filial_id
`

function uniqueViolationMessage(err) {
  if (err.code !== '23505') return null
  if (err.constraint === 'uq_dim_area_filial_descricao')
    return 'Já existe uma área com essa descrição nesta filial.'
  return 'Registro duplicado.'
}

// GET /api/areas
// Filtros opcionais: ?ativos=true  ?filial_id=N
router.get('/', async (req, res) => {
  const params = []
  const conds = []
  if (req.query.ativos === 'true') conds.push('a.ativo = TRUE')
  if (req.query.filial_id) {
    params.push(Number(req.query.filial_id))
    conds.push(`a.filial_id = $${params.length}`)
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
  try {
    const { rows } = await pool.query(
      `${FULL_SELECT} ${where} ORDER BY f.descricao, a.descricao`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[areas] GET falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar áreas' })
  }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${FULL_SELECT} WHERE a.id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.json(rows[0])
  } catch (err) {
    console.error('[areas] GET :id falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar área' })
  }
})

function validatePayload(body) {
  const descricao = (body?.descricao ?? '').toString().trim()
  const filial_id = Number(body?.filial_id)
  const ativo     = body?.ativo === undefined ? true : Boolean(body.ativo)
  if (!descricao)  return { error: 'descricao é obrigatória' }
  if (!Number.isInteger(filial_id) || filial_id <= 0)
    return { error: 'filial_id é obrigatório' }
  if (descricao.length > 80)
    return { error: 'descricao excede 80 caracteres' }
  return { data: { descricao, filial_id, ativo } }
}

async function loadFull(id) {
  const { rows } = await pool.query(`${FULL_SELECT} WHERE a.id = $1`, [id])
  return rows[0]
}

router.post('/', manage, async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, filial_id, ativo } = parsed.data
  try {
    const { rows } = await pool.query(
      `INSERT INTO dim_area (descricao, filial_id, ativo)
            VALUES ($1, $2, $3)
         RETURNING id`,
      [descricao, filial_id, ativo]
    )
    res.status(201).json(await loadFull(rows[0].id))
  } catch (err) {
    const msg = uniqueViolationMessage(err)
    if (msg) return res.status(409).json({ error: msg })
    if (err.code === '23503') return res.status(400).json({ error: 'filial_id inválido' })
    console.error('[areas] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar área' })
  }
})

router.put('/:id(\\d+)', manage, async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, filial_id, ativo } = parsed.data
  try {
    const { rowCount } = await pool.query(
      `UPDATE dim_area
          SET descricao = $1, filial_id = $2, ativo = $3
        WHERE id = $4`,
      [descricao, filial_id, ativo, req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.json(await loadFull(req.params.id))
  } catch (err) {
    const msg = uniqueViolationMessage(err)
    if (msg) return res.status(409).json({ error: msg })
    if (err.code === '23503') return res.status(400).json({ error: 'filial_id inválido' })
    console.error('[areas] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar área' })
  }
})

router.delete('/:id(\\d+)', manage, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM dim_area WHERE id = $1`,
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.status(204).end()
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Existem setores ou comunicados vinculados a esta área. Desative em vez de excluir.',
      })
    }
    console.error('[areas] DELETE falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir área' })
  }
})

export default router
