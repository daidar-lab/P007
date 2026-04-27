-- Migration idempotente: adiciona a coluna `subsetor` em fato_comunicado.
-- Texto livre, opcional, complementa a hierarquia filial → área → setor.

ALTER TABLE fato_comunicado
    ADD COLUMN IF NOT EXISTS subsetor VARCHAR(120);
