import { Router } from 'express'
import { pool } from '../db.js'
import { requirePermission, PERMISSIONS } from '../lib/rbac.js'

const router = Router()
const canManage = requirePermission(PERMISSIONS.CADASTROS_MANAGE)

router.get('/', canManage, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        e.id, e.nome, e.email, e.ativo, e.criado_em,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'area_id', r.area_id,
              'area_descricao', a.descricao,
              'setor_id', r.setor_id,
              'setor_descricao', s.descricao
            ) ORDER BY a.descricao, s.descricao
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS regras
      FROM dim_email_workflow e
      LEFT JOIN dim_email_workflow_regra r ON r.email_workflow_id = e.id
      LEFT JOIN dim_area a ON a.id = r.area_id
      LEFT JOIN dim_setor s ON s.id = r.setor_id
      GROUP BY e.id
      ORDER BY e.nome
    `)
    res.json(rows)
  } catch (err) {
    console.error('[emails-workflow] GET / falhou:', err)
    res.status(500).json({ error: 'Erro ao listar e-mails do workflow' })
  }
})

router.post('/', canManage, async (req, res) => {
  const { nome, email, ativo, regras } = req.body
  if (!nome || !email || !Array.isArray(regras)) {
    return res.status(400).json({ error: 'Nome, email e array de regras são obrigatórios' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `INSERT INTO dim_email_workflow (nome, email, ativo) VALUES ($1, $2, $3) RETURNING id`,
      [nome.trim(), email.trim(), ativo !== false]
    )
    const emailId = rows[0].id

    for (const r of regras) {
      if (!r.area_id) continue
      await client.query(
        `INSERT INTO dim_email_workflow_regra (email_workflow_id, area_id, setor_id) VALUES ($1, $2, $3)`,
        [emailId, Number(r.area_id), r.setor_id ? Number(r.setor_id) : null]
      )
    }
    
    await client.query('COMMIT')
    res.status(201).json({ id: emailId })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    if (err.code === '23503') return res.status(400).json({ error: 'Área ou setor inválido' })
    console.error('[emails-workflow] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao criar e-mail' })
  } finally {
    client.release()
  }
})

router.put('/:id(\\d+)', canManage, async (req, res) => {
  const { nome, email, ativo, regras } = req.body
  const emailId = Number(req.params.id)
  if (!nome || !email || !Array.isArray(regras)) {
    return res.status(400).json({ error: 'Nome, email e array de regras são obrigatórios' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rowCount } = await client.query(
      `UPDATE dim_email_workflow SET nome = $1, email = $2, ativo = $3 WHERE id = $4`,
      [nome.trim(), email.trim(), ativo, emailId]
    )
    if (rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'E-mail não encontrado' })
    }

    await client.query(`DELETE FROM dim_email_workflow_regra WHERE email_workflow_id = $1`, [emailId])

    for (const r of regras) {
      if (!r.area_id) continue
      await client.query(
        `INSERT INTO dim_email_workflow_regra (email_workflow_id, area_id, setor_id) VALUES ($1, $2, $3)`,
        [emailId, Number(r.area_id), r.setor_id ? Number(r.setor_id) : null]
      )
    }

    await client.query('COMMIT')
    res.json({ id: emailId })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    if (err.code === '23503') return res.status(400).json({ error: 'Área ou setor inválido' })
    console.error('[emails-workflow] PUT falhou:', err)
    res.status(500).json({ error: 'Erro ao atualizar e-mail' })
  } finally {
    client.release()
  }
})

router.delete('/:id(\\d+)', canManage, async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM dim_email_workflow WHERE id = $1`, [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'E-mail não encontrado' })
    res.status(204).end()
  } catch (err) {
    console.error('[emails-workflow] DELETE /:id falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir e-mail' })
  }
})

export default router
