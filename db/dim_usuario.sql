-- Dimensão: dim_usuario
-- Usuários autenticados da aplicação. Senha em hash bcrypt.
-- Campo `papel` define o grupo RBAC (ver server/lib/rbac.js).

CREATE TABLE dim_usuario (
    id            SERIAL        PRIMARY KEY,
    usuario       VARCHAR(60)   NOT NULL UNIQUE,
    senha_hash    VARCHAR(255)  NOT NULL,
    nome          VARCHAR(120)  NOT NULL,
    papel         VARCHAR(20)   NOT NULL DEFAULT 'operador'
                  CHECK (papel IN ('admin', 'gestor', 'auditor', 'operador')),
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Papéis disponíveis (reflete o que está em server/lib/rbac.js):
--   admin    — tudo, inclusive gerenciar usuários
--   gestor   — cadastros, histórico e comunicado (sem usuários)
--   auditor  — histórico e comunicado
--   operador — apenas comunicado
--
-- No primeiro boot do servidor, se a tabela estiver vazia, é criado o
-- usuário "admin" (senha "admin") com papel='admin'. Troque na primeira
-- sessão em /conta.
