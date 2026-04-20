-- Dimensão: dim_filial
-- Alimenta a lista de empresas/filiais da Etapa 2 do Comunicado de Intervenção.

CREATE TABLE dim_filial (
    id                SERIAL       PRIMARY KEY,
    descricao         VARCHAR(80)  NOT NULL,
    abreviatura       VARCHAR(10)  NOT NULL,
    codigo_protheus   VARCHAR(8)   NOT NULL,
    ativo             BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_dim_filial_abreviatura     UNIQUE (abreviatura),
    CONSTRAINT uq_dim_filial_codigo_protheus UNIQUE (codigo_protheus)
);

INSERT INTO dim_filial (descricao, abreviatura, codigo_protheus) VALUES
    ('Frutal',     'FRU', '01'),
    ('Petrópolis', 'PET', '02');
