-- Dimensão: dim_filial
-- Alimenta a lista de empresas/filiais da Etapa 2 do Comunicado de Intervenção.

CREATE TABLE dim_filial (
    id          SERIAL       PRIMARY KEY,
    descricao   VARCHAR(80)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO dim_filial (descricao) VALUES
    ('Frutal'),
    ('Petrópolis');
