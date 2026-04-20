import { Router } from 'express'
import { pool } from '../db.js'
import { requirePermission, PERMISSIONS } from '../lib/rbac.js'

const router = Router()

const canView   = requirePermission(PERMISSIONS.HISTORICO_VIEW)
const canCreate = requirePermission(PERMISSIONS.COMUNICADOS_CREATE)
const canDelete = requirePermission(PERMISSIONS.COMUNICADOS_DELETE)

const MAX_FOTOS = 10
const MAX_FOTO_BYTES = 8 * 1024 * 1024 // 8 MB por foto
const MIME_PERMITIDO = /^image\//

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

  // Fotos: payload no formato [{ nome, mime, base64 }, ...]
  const fotos = []
  const rawFotos = Array.isArray(body?.fotos) ? body.fotos : []
  if (rawFotos.length > MAX_FOTOS) {
    errors.push(`limite de ${MAX_FOTOS} fotos por comunicado`)
  } else {
    for (const [i, f] of rawFotos.entries()) {
      const nome = typeof f?.nome === 'string' ? f.nome.slice(0, 255) : `foto_${i + 1}`
      const mime = typeof f?.mime === 'string' ? f.mime : ''
      const b64  = typeof f?.base64 === 'string' ? f.base64 : ''
      if (!MIME_PERMITIDO.test(mime)) {
        errors.push(`foto ${i + 1}: tipo inválido (${mime})`)
        continue
      }
      if (!b64) {
        errors.push(`foto ${i + 1}: conteúdo ausente`)
        continue
      }
      let buf
      try { buf = Buffer.from(b64, 'base64') }
      catch { errors.push(`foto ${i + 1}: base64 inválido`); continue }
      if (buf.length === 0) {
        errors.push(`foto ${i + 1}: conteúdo vazio`)
        continue
      }
      if (buf.length > MAX_FOTO_BYTES) {
        errors.push(`foto ${i + 1}: excede ${(MAX_FOTO_BYTES / 1024 / 1024).toFixed(0)} MB`)
        continue
      }
      fotos.push({ nome, mime, bytes: buf.length, buffer: buf })
    }
  }

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
    fotos,
  }

  if (errors.length) return { error: errors.join('; ') }
  return { data }
}

// GET /api/comunicados — lista (sem blobs das fotos)
// Filtros (query string): filial_id, area_id, classificacao_id, alto_risco=true|false
router.get('/', canView, async (req, res) => {
  const params = []
  const conds  = []
  if (req.query.filial_id) {
    params.push(Number(req.query.filial_id))
    conds.push(`c.filial_id = $${params.length}`)
  }
  if (req.query.area_id) {
    params.push(Number(req.query.area_id))
    conds.push(`c.area_id = $${params.length}`)
  }
  if (req.query.classificacao_id) {
    params.push(Number(req.query.classificacao_id))
    conds.push(`c.classificacao_id = $${params.length}`)
  }
  if (req.query.alto_risco === 'true')  conds.push(`c.alto_risco_potencial = TRUE`)
  if (req.query.alto_risco === 'false') conds.push(`c.alto_risco_potencial = FALSE`)
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

  try {
    const { rows } = await pool.query(
      `SELECT c.id,
              c.data_comunicado,
              c.hora_comunicado,
              c.alto_risco_potencial,
              c.intervencao_por,
              c.criado_em,
              cl.descricao AS classificacao_descricao,
              f.descricao  AS filial_descricao,
              a.descricao  AS area_descricao,
              s.descricao  AS setor_descricao,
              (SELECT COUNT(*)::int FROM fato_comunicado_foto          WHERE comunicado_id = c.id) AS fotos_count,
              (SELECT COUNT(*)::int FROM fato_comunicado_item_observado WHERE comunicado_id = c.id) AS itens_count
         FROM fato_comunicado c
         JOIN dim_classificacao cl ON cl.id = c.classificacao_id
         JOIN dim_filial        f  ON f.id  = c.filial_id
         JOIN dim_area          a  ON a.id  = c.area_id
         JOIN dim_setor         s  ON s.id  = c.setor_id
         ${where}
        ORDER BY c.criado_em DESC`,
      params
    )
    res.json(rows)
  } catch (err) {
    console.error('[comunicados] GET / falhou:', err)
    res.status(500).json({ error: 'Erro ao listar comunicados' })
  }
})

// GET /api/comunicados/:id — detalhe completo (metadata das fotos, sem blob)
router.get('/:id(\\d+)', canView, async (req, res) => {
  try {
    const { rows: comunicadoRows } = await pool.query(
      `SELECT c.id, c.data_comunicado, c.hora_comunicado,
              c.atividade, c.intervencao_por, c.matricula, c.funcao,
              c.outros_descricao, c.descricao_observado, c.acoes_imediatas,
              c.alto_risco_potencial, c.criado_em,
              c.classificacao_id, c.filial_id, c.area_id, c.setor_id,
              cl.descricao     AS classificacao_descricao,
              f.descricao      AS filial_descricao,
              f.abreviatura    AS filial_abreviatura,
              f.codigo_protheus,
              a.descricao      AS area_descricao,
              s.descricao      AS setor_descricao
         FROM fato_comunicado c
         JOIN dim_classificacao cl ON cl.id = c.classificacao_id
         JOIN dim_filial        f  ON f.id  = c.filial_id
         JOIN dim_area          a  ON a.id  = c.area_id
         JOIN dim_setor         s  ON s.id  = c.setor_id
        WHERE c.id = $1`,
      [req.params.id]
    )
    if (comunicadoRows.length === 0) {
      return res.status(404).json({ error: 'Comunicado não encontrado' })
    }

    const { rows: itens } = await pool.query(
      `SELECT io.id, io.descricao
         FROM fato_comunicado_item_observado ci
         JOIN dim_item_observado io ON io.id = ci.item_observado_id
        WHERE ci.comunicado_id = $1
        ORDER BY io.id`,
      [req.params.id]
    )

    const { rows: fotos } = await pool.query(
      `SELECT id, nome_original, mime, tamanho_bytes, criado_em
         FROM fato_comunicado_foto
        WHERE comunicado_id = $1
        ORDER BY id`,
      [req.params.id]
    )

    res.json({
      ...comunicadoRows[0],
      itens_observados: itens,
      fotos,
    })
  } catch (err) {
    console.error('[comunicados] GET /:id falhou:', err)
    res.status(500).json({ error: 'Erro ao carregar comunicado' })
  }
})

// GET /api/comunicados/:id/fotos/:fotoId — serve o binário da foto
router.get('/:id(\\d+)/fotos/:fotoId(\\d+)', canView, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mime, conteudo
         FROM fato_comunicado_foto
        WHERE id = $1 AND comunicado_id = $2`,
      [req.params.fotoId, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Foto não encontrada' })
    res.setHeader('Content-Type', rows[0].mime)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.send(rows[0].conteudo)
  } catch (err) {
    console.error('[comunicados] GET foto falhou:', err)
    res.status(500).json({ error: 'Erro ao carregar foto' })
  }
})

// POST /api/comunicados
router.post('/', canCreate, async (req, res) => {
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

    // Ponte N:N — itens observados
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

    // Fotos — BYTEA na mesma transação
    for (const f of d.fotos) {
      await client.query(
        `INSERT INTO fato_comunicado_foto
           (comunicado_id, nome_original, mime, tamanho_bytes, conteudo)
         VALUES ($1, $2, $3, $4, $5)`,
        [created.id, f.nome, f.mime, f.bytes, f.buffer]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({
      id: created.id,
      criado_em: created.criado_em,
      fotos_salvas: d.fotos.length,
    })
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

// DELETE /api/comunicados/:id — apenas admin
// ON DELETE CASCADE em fato_comunicado_item_observado e fato_comunicado_foto
// remove as dependências automaticamente.
router.delete('/:id(\\d+)', canDelete, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM fato_comunicado WHERE id = $1`,
      [req.params.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Comunicado não encontrado' })
    res.status(204).end()
  } catch (err) {
    console.error('[comunicados] DELETE falhou:', err)
    res.status(500).json({ error: 'Erro ao excluir comunicado' })
  }
})

export default router
