# Banco de dados — Comunicado de Intervenção

Scripts SQL (PostgreSQL) para sustentar o formulário da app.

## Estrutura

```
db/
└─ migrations/
   └─ 001_create_dim_classificacao.sql   dimensão da Etapa 1
```

## Rodando a migration

```bash
# via psql
psql "postgres://usuario:senha@host:5432/banco" \
     -f db/migrations/001_create_dim_classificacao.sql
```

```bash
# dentro de um container
docker exec -i postgres psql -U postgres -d comunicados \
     < db/migrations/001_create_dim_classificacao.sql
```

O script é **idempotente**: pode ser executado várias vezes sem duplicar
registros nem quebrar a estrutura (usa `CREATE IF NOT EXISTS`,
`ON CONFLICT ... DO UPDATE`, `CREATE OR REPLACE FUNCTION`,
`DROP TRIGGER IF EXISTS`).

## Tabela `safety.dim_classificacao`

| Coluna          | Tipo                | Observação                                |
|-----------------|---------------------|-------------------------------------------|
| `id`            | `SMALLSERIAL PK`    | chave técnica                             |
| `codigo`        | `VARCHAR(32)` UK    | chave de negócio (snake_case)             |
| `descricao`     | `VARCHAR(80)`       | rótulo exibido na UI                      |
| `ordem`         | `SMALLINT`          | ordem na lista                            |
| `ativo`         | `BOOLEAN`           | soft delete                               |
| `criado_em`     | `TIMESTAMPTZ`       | auditoria (default `NOW()`)               |
| `atualizado_em` | `TIMESTAMPTZ`       | atualizado por trigger em cada `UPDATE`   |

### Seeds aplicados

| codigo            | descricao              | ordem |
|-------------------|------------------------|:-----:|
| `comportamento`   | Comportamento Inseguro |   1   |
| `condicao`        | Condição Insegura      |   2   |
| `quase_acidente`  | Quase Acidente         |   3   |

## Consulta usada pela API

```sql
SELECT codigo    AS value,
       descricao AS label
  FROM safety.dim_classificacao
 WHERE ativo = TRUE
 ORDER BY ordem, descricao;
```

O resultado já sai no formato esperado pelo `RadioGroup` da tela:
`[{ value, label }, ...]`.
