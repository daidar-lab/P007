-- Dimensão: dim_classificacao
-- Alimenta o radio group da Etapa 1 do Comunicado de Intervenção.

CREATE TABLE dim_classificacao (
    id          SERIAL       PRIMARY KEY,
    descricao   VARCHAR(80)  NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO dim_classificacao (descricao) VALUES
    ('Comportamento Inseguro'),
    ('Condição Insegura'),
    ('Quase Acidente');
