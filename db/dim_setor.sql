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

-- Semeia os setores em todas as filiais.
-- O JOIN por descricao da área replica cada setor para cada instância
-- da sua área em dim_area (uma por filial).
INSERT INTO dim_setor (descricao, area_id)
SELECT s.descricao, a.id
  FROM (VALUES
          ('ASSESSORIA COMERCIAL',         'ADMINISTRATIVO'),
          ('DIRETORIA',                    'ADMINISTRATIVO'),
          ('ADMINISTRATIVO',               'ADMINISTRATIVO'),
          ('CONTROLADORIA',                'ADMINISTRATIVO'),
          ('CONTABILIDADE',                'ADMINISTRATIVO'),
          ('FISCAL',                       'ADMINISTRATIVO'),
          ('FINANCEIRO',                   'ADMINISTRATIVO'),
          ('JURIDICO',                     'ADMINISTRATIVO'),
          ('PRICING',                      'ADMINISTRATIVO'),
          ('RECURSOS HUMANOS',             'ADMINISTRATIVO'),
          ('SAUDE OCUPACIONAL',            'ADMINISTRATIVO'),
          ('SEGURANÇA DO TRABALHO',        'ADMINISTRATIVO'),
          ('SEGURANÇA PATRIMONIAL',        'ADMINISTRATIVO'),
          ('MEIO AMBIENTE',                'ADMINISTRATIVO'),
          ('FACILITIES',                   'ADMINISTRATIVO'),
          ('CEATEC',                       'ADMINISTRATIVO'),
          ('SSMA',                         'ADMINISTRATIVO'),
          ('T.I',                          'ADMINISTRATIVO'),
          ('ASSESSORIA ADMINISTRATIVA',    'ADMINISTRATIVO'),
          ('COMPRAS',                      'ADMINISTRATIVO'),
          ('FROTA',                        'ADMINISTRATIVO'),
          ('ENGENHARIA CIVIL',             'ENGENHARIA'),
          ('ENGENHARIA ELETROMECANICA',    'ENGENHARIA'),
          ('ENVASE',                       'INDUSTRIAL'),
          ('ADM INDUSTRIAL',               'INDUSTRIAL'),
          ('CENTRAL DE GESTÃO INDUSTRIAL', 'INDUSTRIAL'),
          ('PROCESSO',                     'INDUSTRIAL'),
          ('CONTROLE DE QUALIDADE',        'INDUSTRIAL'),
          ('MANUTENÇÃO',                   'INDUSTRIAL'),
          ('UTILIDADES',                   'INDUSTRIAL'),
          ('ALMOXARIFADO',                 'LOGISTICA'),
          ('ARMAZEM',                      'LOGISTICA'),
          ('PLANEJAMENTO',                 'LOGISTICA')
       ) AS s(descricao, area_descricao)
  JOIN dim_area a
    ON a.descricao = s.area_descricao
   AND a.ativo = TRUE;
