// Migrations automáticas — roda no boot da API.
// - Cria a tabela _schema_migrations (tracker).
// - Aplica os arquivos .sql do diretório db/ na ordem definida abaixo.
// - Cada arquivo roda DENTRO de uma transação; se falhar, faz rollback.
// - Arquivos já aplicados são pulados em execuções subsequentes.
// - Quando uma tabela já existe (setup manual antigo), marca como aplicada
//   e segue em frente — sem quebrar.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const DB_DIR     = path.resolve(__dirname, '..', '..', 'db')

// Ordem importa: FK dependem de tabelas anteriores existirem.
const ORDERED_FILES = [
  // 1) Dimensões sem FK
  'dim_classificacao.sql',
  'dim_filial.sql',
  'dim_item_observado.sql',
  'dim_usuario.sql',

  // 2) Dimensões com FK (filial → área → setor)
  'dim_area.sql',
  'dim_setor.sql',

  // 3) Fatos
  'fato_comunicado.sql',
  'fato_comunicado_foto.sql',

  // 4) Migrations idempotentes (ALTER TABLE / ADD COLUMN IF NOT EXISTS)
  //    Seguras de rodar mesmo se a coluna já existir.
  'dim_usuario_add_papel.sql',
  'fato_comunicado_add_subsetor.sql',
  'fato_comunicado_foto_add_analise.sql',
  'fato_comunicado_add_gestor_informado.sql',
]

const ALREADY_EXISTS_CODES = new Set([
  '42P07', // duplicate_table
  '42710', // duplicate_object (constraint, index)
  '42701', // duplicate_column (caso ALTER ADD sem IF NOT EXISTS encontre coluna)
  '42P06', // duplicate_schema
])

async function ensureTrackerTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `)
}

async function loadAlreadyApplied() {
  const { rows } = await pool.query(`SELECT filename FROM _schema_migrations`)
  return new Set(rows.map(r => r.filename))
}

async function applyOne(filename) {
  const filepath = path.join(DB_DIR, filename)
  let sql
  try {
    sql = await fs.readFile(filepath, 'utf8')
  } catch {
    console.warn(`[migrate] arquivo não encontrado, ignorado: ${filename}`)
    return 'skipped'
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query(
      `INSERT INTO _schema_migrations (filename) VALUES ($1)
       ON CONFLICT (filename) DO NOTHING`,
      [filename]
    )
    await client.query('COMMIT')
    return 'applied'
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})

    // Setup manual antigo: tabela/coluna já existe.
    // Marca como aplicada (fora da transação) e segue.
    if (ALREADY_EXISTS_CODES.has(err.code)) {
      await pool.query(
        `INSERT INTO _schema_migrations (filename) VALUES ($1)
         ON CONFLICT (filename) DO NOTHING`,
        [filename]
      )
      return 'pre-existing'
    }

    console.error(`[migrate] FALHA em ${filename}: ${err.message}`)
    throw err
  } finally {
    client.release()
  }
}

export async function migrate() {
  await ensureTrackerTable()
  const applied = await loadAlreadyApplied()

  const counters = { applied: 0, skipped: 0, preExisting: 0 }
  for (const filename of ORDERED_FILES) {
    if (applied.has(filename)) {
      counters.skipped++
      continue
    }
    const status = await applyOne(filename)
    if (status === 'applied') {
      counters.applied++
      console.log(`[migrate] ✓ ${filename}`)
    } else if (status === 'pre-existing') {
      counters.preExisting++
      console.log(`[migrate] = ${filename} (já existia, marcada)`)
    }
  }

  if (counters.applied === 0 && counters.preExisting === 0) {
    console.log('[migrate] schema em dia — nada a aplicar')
  } else {
    console.log(
      `[migrate] resumo: ${counters.applied} aplicada(s), ` +
      `${counters.preExisting} pré-existente(s), ${counters.skipped} já no histórico.`
    )
  }
}
