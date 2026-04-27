-- Migration idempotente: adiciona coluna `analise_ia` em fato_comunicado_foto.
-- Armazena o texto gerado pelo Amazon Bedrock (Claude) ao analisar cada foto
-- buscando situações de risco / Segurança do Trabalho.

ALTER TABLE fato_comunicado_foto
    ADD COLUMN IF NOT EXISTS analise_ia TEXT;
