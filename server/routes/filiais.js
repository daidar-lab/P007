import { Router } from 'express'
import { requirePermission, PERMISSIONS } from '../lib/rbac.js'
import { pool } from '../db.js'

const router = Router()
const manage = requirePermission(PERMISSIONS.CADASTROS_MANAGE)

const COLS = `id, descricao, abreviatura, codigo_protheus, ativo`

function uniqueViolationMessage(err) {
  if (err.code !== '23505') return null
  if (err.constraint === 'uq_dim_filial_abreviatura')
    return 'Abreviatura já cadastrada em outra filial.'
  if (err.constraint === 'uq_dim_filial_codigo_protheus')
    return 'Código Protheus já cadastrado em outra filial.'
  return 'Registro duplicado.'
}

// GET /api/filiais            → todas
// GET /api/filiais?ativos=true → somente ativas
router.get('/', async (req, res) => {
  const onlyActive = req.query.ativos === 'true'
  try {
    const { rows } = await pool.query(
      onlyActive
        ? `SELECT ${COLS} FROM dim_filial WHERE ativo = TRUE ORDER BY id`
        : `SELECT ${COLS} FROM dim_filial ORDER BY id`
    )
    res.json(rows)
  } catch (err) {
    console.error('[filiais] GET falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar filiais' })
  }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM dim_filial WHERE id = $1`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.json(rows[0])
  } catch (err) {
    console.error('[filiais] GET :id falhou:', err)
    res.status(500).json({ error: 'Erro ao consultar filial' })
  }
})

function validatePayload(body) {
  const descricao       = (body?.descricao       ?? '').toString().trim()
  const abreviatura     = (body?.abreviatura     ?? '').toString().trim().toUpperCase()
  const codigo_protheus = (body?.codigo_protheus ?? '').toString().trim()
  const ativo           = body?.ativo === undefined ? true : Boolean(body.ativo)

  if (!descricao)       return { error: 'descricao é obrigatória' }
  if (!abreviatura)     return { error: 'abreviatura é obrigatória' }
  if (!codigo_protheus) return { error: 'codigo_protheus é obrigatório' }
  if (descricao.length       > 80) return { error: 'descricao excede 80 caracteres' }
  if (abreviatura.length     > 10) return { error: 'abreviatura excede 10 caracteres' }
  if (codigo_protheus.length >  8) return { error: 'codigo_protheus excede 8 caracteres' }

  return {
    data: { descricao, abreviatura, codigo_protheus, ativo },
  }
}

// POST /api/filiais
router.post('/', manage, async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, abreviatura, codigo_protheus, ativo } = parsed.data
  try {
    const { rows } = await pool.query(
      `INSERT INTO dim_filial (descricao, abreviatura, codigo_protheus, ativo)
            VALUES ($1, $2, $3, $4)
         RETURNING ${COLS}`,
      [descricao, abreviatura, codigo_protheus, ativo]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    const msg = uniqueViolationMessage(err)
    if (msg) return res.status(409).json({ error: msg })
    console.error('[filiais] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar filial' })
  }
})

// PUT /api/filiais/:id
router.put('/:id(\\d+)', manage, async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const { descricao, abreviatura, codigo_protheus, ativo } = parsed.data
  try {
    const { rows } = await pool.query(
      `UPDATE dim_filial
          SET descricao       = $1,
              abreviatura     = $2,
              codigo_protheus = $3,
              ativo           = $4
        WHERE id = $5
        RETURNING ${COLS}`,
      [descricao, abreviatura, codigo_protheus, ativo, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.json(rows[0])
  } catch (err) {
    const msg = uniqueViolationMessage(err)
    if (msg) return res.status(409).json({ error: msg })
    console.error('[filiais] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar filial' })
  }
})

// DELETE /api/filiais/:id
router.delete('/:id(\\d+)', manage, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM dim_filial WHERE id = $1`,
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Não encontrada' })
    res.status(204).end()
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Existem áreas ou comunicados vinculados a esta filial. Desative em vez de excluir.',
      })
    }
    console.error('[filiais] DELETE falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir filial' })
  }
})

export default router
