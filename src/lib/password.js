// Política de complexidade da senha (deve bater com server/lib/password.js).

export const PASSWORD_RULES = [
  { key: 'length',    label: 'no mínimo 8 caracteres',    test: (s) => s.length >= 8 },
  { key: 'lowercase', label: 'uma letra minúscula (a-z)', test: (s) => /[a-z]/.test(s) },
  { key: 'uppercase', label: 'uma letra maiúscula (A-Z)', test: (s) => /[A-Z]/.test(s) },
  { key: 'number',    label: 'um número (0-9)',           test: (s) => /[0-9]/.test(s) },
  { key: 'special',   label: 'um caractere especial',     test: (s) => /[^A-Za-z0-9]/.test(s) },
]

export function validatePasswordStrength(senha) {
  const s = String(senha ?? '')
  const failing = PASSWORD_RULES.filter(r => !r.test(s)).map(r => r.label)
  return { ok: failing.length === 0, errors: failing }
}

export function checklistStatus(senha) {
  const s = String(senha ?? '')
  return PASSWORD_RULES.map(r => ({ key: r.key, label: r.label, ok: r.test(s) }))
}
