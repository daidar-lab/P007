import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

const FULL_SELECT = `
  SELECT s.id, s.descricao, s.area_id, s.ativo,
         a.descricao   AS area_descricao,
         a.filial_id,
         f.descricao   AS filial_descricao
    FROM dim_setor  s
    JOIN dim_area   a ON a.id = s.area_id
    JOIN dim_filial f ON f.id = a.filial_id
`

function uniqueViolationMessage(err) {
  if (err.code !== '23505') return null
  if (err.constraint === 'uq_dim_setor_area_descricao')
    return 'Já existe um setor com essa descrição nesta área.'
  return 'Registro duplicado.'
}

// GET /api/setores
// Filtros: ?ativos=true  ?area_id=N  ?filial_id=N
router.get('/', async (req, res) => {
  const params = []
  const conds  = []
  if (req.query.ativos === 'true') conds.push('s.ativo = TRUE')
  if (req.query.area_id) {
    params.push(Number(req.query.area_id))
    conds.push(`s.area_id = $${params.length}`)
  }
  if (req.query.filial_id) {
    params.push(Number(req.query.filial_id))
    conds.push(`a.filial_id = $${params.length}`)
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
  try {
    const { rows } = await pool.query(
      `${FULL_SELECT} ${where} ORDER BY f.descricao, a.descricao, s.descricao`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[setores] GET falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar setores' })
  }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${FULL_SELECT} WHERE s.id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('[setores] GET :id falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar setor' })
  }
})

function validatePayload(body) {
  const descricao = (body?.descricao ?? '').toString().trim()
  const area_id   = Number(body?.area_id)
  const ativo     = body?.ativo === undefined ? true : Boolean(body.ativo)
  if (!descricao) return { error: 'descricao é obrigatória' }
  if (!Number.isInteger(area_id) || area_id <= 0)
    return { error: 'area_id é obrigatório' }
  if (descricao.length > 80)
    return { error: 'descricao excede 80 caracteres' }
  return { data: { descricao, area_id, ativo } }
}

async function loadFull(id) {
  const { rows } = await pool.query(`${FULL_SELECT} WHERE s.id = $1`, [id])
  return rows[0]
}

router.post('/', async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, area_id, ativo } = parsed.data
  try {
    const { rows } = await pool.query(
      `INSERT INTO dim_setor (descricao, area_id, ativo)
            VALUES ($1, $2, $3)
         RETURNING id`,
      [descricao, area_id, ativo]
    )
    res.status(201).json(await loadFull(rows[0].id))
  } catch (err) {
    const msg = uniqueViolationMessage(err)
    if (msg) return res.status(409).json({ error: msg })
    if (err.code === '23503') return res.status(400).json({ error: 'area_id inválido' })
    console.error('[setores] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar setor' })
  }
})

router.put('/:id(\\d+)', async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, area_id, ativo } = parsed.data
  try {
    const { rowCount } = await pool.query(
      `UPDATE dim_setor
          SET descricao = $1, area_id = $2, ativo = $3
        WHERE id = $4`,
      [descricao, area_id, ativo, req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.json(await loadFull(req.params.id))
  } catch (err) {
    const msg = uniqueViolationMessage(err)
    if (msg) return res.status(409).json({ error: msg })
    if (err.code === '23503') return res.status(400).json({ error: 'area_id inválido' })
    console.error('[setores] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar setor' })
  }
})

router.delete('/:id(\\d+)', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM dim_setor WHERE id = $1`,
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrado' })
    res.status(204).end()
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Existem comunicados vinculados a este setor. Desative em vez de excluir.',
      })
    }
    console.error('[setores] DELETE falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir setor' })
  }
})

export default router
