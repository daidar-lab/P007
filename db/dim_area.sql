-- Dimensão: dim_area
-- Alimenta o Combobox "Área onde a intervenção foi realizada".
-- Cada área pertence a uma filial (dim_filial).

CREATE TABLE dim_area (
    id          SERIAL       PRIMARY KEY,
    descricao   VARCHAR(80)  NOT NULL,
    filial_id   INT          NOT NULL REFERENCES dim_filial (id),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,

    CONSTRAINT uq_dim_area_filial_descricao UNIQUE (filial_id, descricao)
);

CREATE INDEX ix_dim_area_filial ON dim_area (filial_id);

-- Semeia as 8 áreas padrão em todas as filiais ativas
INSERT INTO dim_area (descricao, filial_id)
SELECT a.descricao, f.id
  FROM (VALUES
          ('Logística'),
          ('Industrial'),
          ('Marketing'),
          ('TI'),
          ('Compras'),
          ('ETA'),
          ('ATDI'),
          ('Portaria')
       ) AS a(descricao)
 CROSS JOIN dim_filial f
 WHERE f.ativo = TRUE;
