import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

function validatePayload(body) {
  const errors = []
  const num = (v, field) => {
    const n = Number(v)
    if (!Number.isInteger(n) || n <= 0) {
      errors.push(`${field} é obrigatório`)
      return null
    }
    return n
  }
  const str = (v, field, max) => {
    if (v == null || typeof v !== 'string' || !v.trim()) {
      errors.push(`${field} é obrigatório`)
      return null
    }
    const s = v.trim()
    if (max && s.length > max) {
      errors.push(`${field} excede ${max} caracteres`)
      return null
    }
    return s
  }

  const itens = Array.isArray(body?.itens_observados_ids)
    ? Array.from(new Set(
        body.itens_observados_ids
          .map(Number)
          .filter(n => Number.isInteger(n) && n > 0)
      ))
    : []
  if (itens.length === 0) errors.push('itens_observados_ids deve ter ao menos um item')

  const data = {
    classificacao_id:     num(body?.classificacao_id, 'classificacao_id'),
    filial_id:            num(body?.filial_id, 'filial_id'),
    area_id:              num(body?.area_id, 'area_id'),
    setor_id:             num(body?.setor_id, 'setor_id'),
    data_comunicado:      str(body?.data_comunicado, 'data_comunicado'),
    hora_comunicado:      str(body?.hora_comunicado, 'hora_comunicado'),
    atividade:            str(body?.atividade, 'atividade'),
    intervencao_por:      str(body?.intervencao_por, 'intervencao_por', 200),
    matricula:            str(body?.matricula, 'matricula', 20),
    funcao:               str(body?.funcao, 'funcao', 80),
    descricao_observado:  str(body?.descricao_observado, 'descricao_observado'),
    acoes_imediatas:      str(body?.acoes_imediatas, 'acoes_imediatas'),
    outros_descricao:     body?.outros_descricao
      ? String(body.outros_descricao).trim().slice(0, 200) || null
      : null,
    alto_risco_potencial: body?.alto_risco_potencial === true || body?.alto_risco_potencial === 'true',
    itens_observados_ids: itens,
  }

  if (errors.length) return { error: errors.join('; ') }
  return { data }
}

// POST /api/comunicados
router.post('/', async (req, res) => {
  const parsed = validatePayload(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const d = parsed.data

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [created] } = await client.query(
      `INSERT INTO fato_comunicado (
          classificacao_id, filial_id, area_id, setor_id,
          data_comunicado, hora_comunicado,
          atividade,
          intervencao_por, matricula, funcao,
          outros_descricao,
          descricao_observado, acoes_imediatas,
          alto_risco_potencial
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, criado_em`,
      [
        d.classificacao_id, d.filial_id, d.area_id, d.setor_id,
        d.data_comunicado, d.hora_comunicado,
        d.atividade,
        d.intervencao_por, d.matricula, d.funcao,
        d.outros_descricao,
        d.descricao_observado, d.acoes_imediatas,
        d.alto_risco_potencial,
      ]
    )

    // Tabela-ponte: uma linha por item observado selecionado
    if (d.itens_observados_ids.length > 0) {
      const values = d.itens_observados_ids
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ')
      await client.query(
        `INSERT INTO fato_comunicado_item_observado (comunicado_id, item_observado_id)
              VALUES ${values}`,
        [created.id, ...d.itens_observados_ids]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ id: created.id, criado_em: created.criado_em })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Referência inválida (classificacao/filial/area/setor/item).' })
    }
    console.error('[comunicados] POST falhou:', err)
    res.status(500).json({ error: 'Erro ao salvar comunicado' })
  } finally {
    client.release()
  }
})

export default router
