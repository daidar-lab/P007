-- Dimensão: dim_item_observado
-- Alimenta o checklist "O que observei?" (Etapa 4 do Comunicado de Intervenção).
-- Cada reporte referencia N itens desta dimensão (relação N:N no fato).

CREATE TABLE dim_item_observado (
    id          SERIAL        PRIMARY KEY,
    descricao   VARCHAR(120)  NOT NULL,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE
);

INSERT INTO dim_item_observado (descricao) VALUES
    ('Condição estrutural do local ou equipamento'),
    ('Permissão de Trabalho e/ou procedimentos'),
    ('Elevação e Movimentação de Cargas'),
    ('Espaço Confinado'),
    ('LOTO — Bloqueio de Energias Perigosas (Lock Out / Tag Out)'),
    ('Serviço em eletricidade'),
    ('Trabalho à Quente'),
    ('Trabalho em Altura'),
    ('Uso de EPI''s / EPC''s'),
    ('Produtos Químicos'),
    ('Escavação / Perfuração / Demolição'),
    ('Meio Ambiente'),
    ('Outros');
