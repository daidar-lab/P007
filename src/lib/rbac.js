// RBAC no front — precisa espelhar server/lib/rbac.js.

export const PERMISSIONS = {
  COMUNICADOS_CREATE: 'comunicados:create',
  HISTORICO_VIEW:     'historico:view',
  CADASTROS_MANAGE:   'cadastros:manage',
  USUARIOS_MANAGE:    'usuarios:manage',
}

export const ROLES = {
  admin:    { label: 'Administrador', perms: Object.values(PERMISSIONS) },
  gestor:   { label: 'Gestor',        perms: [PERMISSIONS.COMUNICADOS_CREATE, PERMISSIONS.HISTORICO_VIEW, PERMISSIONS.CADASTROS_MANAGE] },
  auditor:  { label: 'Auditor',       perms: [PERMISSIONS.COMUNICADOS_CREATE, PERMISSIONS.HISTORICO_VIEW] },
  operador: { label: 'Operador',      perms: [PERMISSIONS.COMUNICADOS_CREATE] },
}

export const ROLE_KEYS = Object.keys(ROLES)

export function roleLabel(papel) {
  return ROLES[papel]?.label || papel || ''
}

export function roleOptions() {
  return ROLE_KEYS.map(k => ({ value: k, label: ROLES[k].label }))
}

export function hasPermission(user, perm) {
  if (!user || !user.papel) return false
  return ROLES[user.papel]?.perms.includes(perm) ?? false
}
