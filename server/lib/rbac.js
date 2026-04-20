// RBAC — papéis e permissões.
// Referenciado pelas rotas via requirePermission(perm).

export const PERMISSIONS = {
  COMUNICADOS_CREATE: 'comunicados:create',
  HISTORICO_VIEW:     'historico:view',
  CADASTROS_MANAGE:   'cadastros:manage',
  USUARIOS_MANAGE:    'usuarios:manage',
}

export const ROLES = {
  admin: {
    label: 'Administrador',
    perms: [
      PERMISSIONS.COMUNICADOS_CREATE,
      PERMISSIONS.HISTORICO_VIEW,
      PERMISSIONS.CADASTROS_MANAGE,
      PERMISSIONS.USUARIOS_MANAGE,
    ],
  },
  gestor: {
    label: 'Gestor',
    perms: [
      PERMISSIONS.COMUNICADOS_CREATE,
      PERMISSIONS.HISTORICO_VIEW,
      PERMISSIONS.CADASTROS_MANAGE,
    ],
  },
  auditor: {
    label: 'Auditor',
    perms: [
      PERMISSIONS.COMUNICADOS_CREATE,
      PERMISSIONS.HISTORICO_VIEW,
    ],
  },
  operador: {
    label: 'Operador',
    perms: [
      PERMISSIONS.COMUNICADOS_CREATE,
    ],
  },
}

export const ROLE_KEYS = Object.keys(ROLES)

export function roleLabel(papel) {
  return ROLES[papel]?.label || papel || ''
}

export function hasPermission(papel, perm) {
  return ROLES[papel]?.perms.includes(perm) ?? false
}

export function requirePermission(perm) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' })
    }
    if (!req.user.papel) {
      // Token antigo (emitido antes do RBAC) — força re-login
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' })
    }
    if (!hasPermission(req.user.papel, perm)) {
      return res.status(403).json({ error: 'Permissão insuficiente para esta ação.' })
    }
    next()
  }
}
