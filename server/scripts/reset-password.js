#!/usr/bin/env node
// CLI para redefinir a senha de um usuário.
// Uso:   node server/scripts/reset-password.js <usuario> <nova_senha>
// Exige DATABASE_URL no .env e que a tabela dim_usuario exista.

import '../env.js'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { validatePasswordStrength } from '../lib/password.js'

async function main() {
  const [, , usuarioArg, senhaArg] = process.argv
  if (!usuarioArg || !senhaArg) {
    console.error('Uso: node server/scripts/reset-password.js <usuario> <nova_senha>')
    process.exit(1)
  }
  const usuario = String(usuarioArg).trim().toLowerCase()

  const strength = validatePasswordStrength(senhaArg)
  if (!strength.ok) {
    console.error('Senha não atende aos requisitos: ' + strength.errors.join(', '))
    process.exit(1)
  }

  try {
    const hash = await bcrypt.hash(senhaArg, 10)
    const { rowCount } = await pool.query(
      `UPDATE dim_usuario SET senha_hash = $1 WHERE usuario = $2`,
      [hash, usuario]
    )
    if (rowCount === 0) {
      console.error(`Usuário "${usuario}" não encontrado.`)
      process.exit(1)
    }
    console.log(`Senha de "${usuario}" redefinida com sucesso.`)
  } catch (err) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
