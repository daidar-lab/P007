-- =====================================================================
-- Dimensão: dim_classificacao
-- Projeto: Comunicado de Intervenção — Cidade Imperial
-- Descrição: tabela de lookup da classificação do reporte (Etapa 1 da tela).
--            Alimenta o radio group "Comportamento Inseguro / Condição
--            Insegura / Quase Acidente".
-- =====================================================================

-- Schema opcional (mantém a app isolada de tabelas de sistema)
CREATE SCHEMA IF NOT EXISTS safety;

-- -------------------------------------------------
-- Tabela
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS safety.dim_classificacao (
    id               SMALLSERIAL   PRIMARY KEY,
    codigo           VARCHAR(32)   NOT NULL,
    descricao        VARCHAR(80)   NOT NULL,
    ordem            SMALLINT      NOT NULL DEFAULT 0,
    ativo            BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    atualizado_em    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_dim_classificacao_codigo UNIQUE (codigo),
    CONSTRAINT ck_dim_classificacao_codigo_fmt
        CHECK (codigo ~ '^[a-z0-9_]+$')
);

COMMENT ON TABLE  safety.dim_classificacao IS
    'Dimensão de classificação do Comunicado de Intervenção.';
COMMENT ON COLUMN safety.dim_classificacao.codigo IS
    'Chave de negócio usada pela API e pelo front (snake_case).';
COMMENT ON COLUMN safety.dim_classificacao.descricao IS
    'Rótulo exibido na UI (pt-BR).';
COMMENT ON COLUMN safety.dim_classificacao.ordem IS
    'Ordem de exibição na lista (menor primeiro).';
COMMENT ON COLUMN safety.dim_classificacao.ativo IS
    'Soft delete: FALSE oculta da UI sem perder histórico.';

-- -------------------------------------------------
-- Índices
-- -------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_dim_classificacao_ativo_ordem
    ON safety.dim_classificacao (ativo, ordem);

-- -------------------------------------------------
-- Trigger de atualizado_em
-- -------------------------------------------------
CREATE OR REPLACE FUNCTION safety.fn_set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_dim_classificacao_atualizado_em
    ON safety.dim_classificacao;

CREATE TRIGGER tg_dim_classificacao_atualizado_em
    BEFORE UPDATE ON safety.dim_classificacao
    FOR EACH ROW EXECUTE FUNCTION safety.fn_set_atualizado_em();

-- -------------------------------------------------
-- Seed (dados iniciais da tela Etapa 1)
-- -------------------------------------------------
INSERT INTO safety.dim_classificacao (codigo, descricao, ordem) VALUES
    ('comportamento',  'Comportamento Inseguro', 1),
    ('condicao',       'Condição Insegura',      2),
    ('quase_acidente', 'Quase Acidente',         3)
ON CONFLICT (codigo) DO UPDATE
   SET descricao = EXCLUDED.descricao,
       ordem     = EXCLUDED.ordem,
       ativo     = TRUE;

-- -------------------------------------------------
-- Consulta usada pelo endpoint /classificacoes
-- -------------------------------------------------
-- SELECT codigo  AS value,
--        descricao AS label
--   FROM safety.dim_classificacao
--  WHERE ativo = TRUE
--  ORDER BY ordem, descricao;
