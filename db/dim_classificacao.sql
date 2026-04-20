-- Dimensão: dim_classificacao
-- Alimenta o radio group da Etapa 1 do Comunicado de Intervenção.

CREATE TABLE dim_classificacao (
    id          SMALLSERIAL  PRIMARY KEY,
    codigo      VARCHAR(32)  NOT NULL UNIQUE,
    descricao   VARCHAR(80)  NOT NULL,
    ordem       SMALLINT     NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO dim_classificacao (codigo, descricao, ordem) VALUES
    ('comportamento',  'Comportamento Inseguro', 1),
    ('condicao',       'Condição Insegura',      2),
    ('quase_acidente', 'Quase Acidente',         3);
