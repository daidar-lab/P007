-- Dimensão: dim_usuario
-- Usuários autenticados da aplicação. Senha é armazenada como hash bcrypt.

CREATE TABLE dim_usuario (
    id            SERIAL        PRIMARY KEY,
    usuario       VARCHAR(60)   NOT NULL UNIQUE,
    senha_hash    VARCHAR(255)  NOT NULL,
    nome          VARCHAR(120)  NOT NULL,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- O usuário padrão "admin" com senha "admin" é criado automaticamente
-- pelo servidor no primeiro boot quando a tabela estiver vazia.
-- Troque a senha imediatamente em produção.
