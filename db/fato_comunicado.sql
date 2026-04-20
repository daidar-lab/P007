-- Fato: fato_comunicado
-- Armazena cada Comunicado de Intervenção preenchido no formulário.
-- Cada linha referencia as dimensões (classificação, filial, área, setor)
-- por FK. Os itens observados ficam em um array de ids de dim_item_observado.

CREATE TABLE fato_comunicado (
    id                      SERIAL        PRIMARY KEY,

    -- Dimensões
    classificacao_id        INT           NOT NULL REFERENCES dim_classificacao (id),
    filial_id               INT           NOT NULL REFERENCES dim_filial        (id),
    area_id                 INT           NOT NULL REFERENCES dim_area          (id),
    setor_id                INT           NOT NULL REFERENCES dim_setor         (id),

    -- Data/hora do comunicado (o front bloqueia valor futuro)
    data_comunicado         DATE          NOT NULL,
    hora_comunicado         TIME          NOT NULL,

    -- Atividade realizada no momento da intervenção
    atividade               TEXT          NOT NULL,

    -- Responsável pela intervenção
    intervencao_por         VARCHAR(200)  NOT NULL,
    matricula               VARCHAR(20)   NOT NULL,
    funcao                  VARCHAR(80)   NOT NULL,

    -- Itens do checklist "O que observei?" — ids de dim_item_observado
    itens_observados_ids    INT[]         NOT NULL,

    -- Preenchido SOMENTE quando o usuário marca "Outros" no checklist
    outros_descricao        VARCHAR(200),

    -- Relato
    descricao_observado     TEXT          NOT NULL,
    acoes_imediatas         TEXT          NOT NULL,

    -- A classificação deste reporte é de Alto Risco Potencial?
    alto_risco_potencial    BOOLEAN       NOT NULL,

    -- Auditoria
    criado_em               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_fato_comunicado_itens_nao_vazio
        CHECK (array_length(itens_observados_ids, 1) >= 1)
);

CREATE INDEX ix_fato_comunicado_data           ON fato_comunicado (data_comunicado);
CREATE INDEX ix_fato_comunicado_filial         ON fato_comunicado (filial_id);
CREATE INDEX ix_fato_comunicado_area           ON fato_comunicado (area_id);
CREATE INDEX ix_fato_comunicado_setor          ON fato_comunicado (setor_id);
CREATE INDEX ix_fato_comunicado_classificacao  ON fato_comunicado (classificacao_id);

-- Índice GIN para consultas do tipo "comunicados que marcaram o item X"
-- Uso:   WHERE itens_observados_ids @> ARRAY[5]::int[]
CREATE INDEX ix_fato_comunicado_itens_observados
    ON fato_comunicado USING GIN (itens_observados_ids);
