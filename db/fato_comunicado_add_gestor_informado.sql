-- Migration idempotente: adiciona `gestor_informado` em fato_comunicado.
-- Usado para a pergunta "O gestor foi informado?" que aparece no formulário
-- antes da etapa de fotos.

ALTER TABLE fato_comunicado
    ADD COLUMN IF NOT EXISTS gestor_informado BOOLEAN NOT NULL DEFAULT FALSE;
