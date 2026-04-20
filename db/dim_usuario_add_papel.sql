-- Migration idempotente: adiciona a coluna `papel` em dim_usuario para
-- quem já criou a tabela antes da introdução do RBAC. Rode uma única
-- vez; execuções subsequentes são no-op.

ALTER TABLE dim_usuario
    ADD COLUMN IF NOT EXISTS papel VARCHAR(20) NOT NULL DEFAULT 'operador';

-- Garante o CHECK (idempotente via bloco DO)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'dim_usuario_papel_check'
    ) THEN
        ALTER TABLE dim_usuario
            ADD CONSTRAINT dim_usuario_papel_check
            CHECK (papel IN ('admin', 'gestor', 'auditor', 'operador'));
    END IF;
END$$;

-- Promove o usuário admin já existente
UPDATE dim_usuario SET papel = 'admin' WHERE usuario = 'admin' AND papel <> 'admin';
