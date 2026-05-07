-- Fato: fato_comunicado
-- Armazena cada Comunicado de Intervenção preenchido no formulário.
-- Cada linha referencia as dimensões (classificação, filial, área, setor)
-- por FK e mantém uma relação N:N com dim_item_observado na tabela-ponte
-- definida mais abaixo.

CREATE TABLE fato_comunicado (
    id                      SERIAL        PRIMARY KEY,

    -- Dimensões
    classificacao_id        INT           NOT NULL REFERENCES dim_classificacao (id),
    filial_id               INT           NOT NULL REFERENCES dim_filial        (id),
    area_id                 INT           NOT NULL REFERENCES dim_area          (id),
    setor_id                INT           NOT NULL REFERENCES dim_setor         (id),
    subsetor                VARCHAR(120),

    -- Data/hora do comunicado (o front bloqueia valor futuro)
    data_comunicado         DATE          NOT NULL,
    hora_comunicado         TIME          NOT NULL,

    -- Atividade realizada no momento da intervenção
    atividade               TEXT          NOT NULL,

    -- Responsável pela intervenção
    intervencao_por         VARCHAR(200)  NOT NULL,
    matricula               VARCHAR(20)   NOT NULL,
    funcao                  VARCHAR(80)   NOT NULL,

    -- Preenchido SOMENTE quando o usuário marca "Outros" no checklist
    outros_descricao        VARCHAR(200),

    -- Relato
    descricao_observado     TEXT          NOT NULL,
    acoes_imediatas         TEXT          NOT NULL,

    -- A classificação deste reporte é de Alto Risco Potencial?
    alto_risco_potencial    BOOLEAN       NOT NULL,

    -- O gestor foi informado?
    gestor_informado        BOOLEAN       NOT NULL DEFAULT FALSE,

    -- Auditoria
    criado_em               TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_fato_comunicado_data           ON fato_comunicado (data_comunicado);
CREATE INDEX ix_fato_comunicado_filial         ON fato_comunicado (filial_id);
CREATE INDEX ix_fato_comunicado_area           ON fato_comunicado (area_id);
CREATE INDEX ix_fato_comunicado_setor          ON fato_comunicado (setor_id);
CREATE INDEX ix_fato_comunicado_classificacao  ON fato_comunicado (classificacao_id);


-- Ponte N:N — um comunicado pode marcar vários itens observados.
CREATE TABLE fato_comunicado_item_observado (
    comunicado_id       INT  NOT NULL REFERENCES fato_comunicado    (id) ON DELETE CASCADE,
    item_observado_id   INT  NOT NULL REFERENCES dim_item_observado (id),

    PRIMARY KEY (comunicado_id, item_observado_id)
);

CREATE INDEX ix_fato_comunicado_item_obs_item
    ON fato_comunicado_item_observado (item_observado_id);
