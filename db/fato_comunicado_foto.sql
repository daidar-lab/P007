-- Armazena as fotos anexadas a um Comunicado de Intervenção.
-- O conteúdo binário fica em BYTEA; o comunicado apaga em cascata.

CREATE TABLE fato_comunicado_foto (
    id              SERIAL        PRIMARY KEY,
    comunicado_id   INT           NOT NULL REFERENCES fato_comunicado (id) ON DELETE CASCADE,
    nome_original   VARCHAR(255)  NOT NULL,
    mime            VARCHAR(100)  NOT NULL,
    tamanho_bytes   INT           NOT NULL,
    conteudo        BYTEA         NOT NULL,
    analise_ia      TEXT,
    criado_em       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_fato_comunicado_foto_comunicado
    ON fato_comunicado_foto (comunicado_id);
