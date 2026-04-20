-- Dimensão: dim_setor
-- Subdivisão de dim_area. Um setor pertence a uma única área.
-- Alimenta o campo "Setor onde a intervenção foi realizada".

CREATE TABLE dim_setor (
    id          SERIAL       PRIMARY KEY,
    descricao   VARCHAR(80)  NOT NULL,
    area_id     INT          NOT NULL REFERENCES dim_area (id),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_dim_setor_area_descricao UNIQUE (area_id, descricao)
);

CREATE INDEX ix_dim_setor_area ON dim_setor (area_id);
