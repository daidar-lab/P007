CREATE TABLE IF NOT EXISTS dim_email_workflow_regra (
    id SERIAL PRIMARY KEY,
    email_workflow_id INT NOT NULL REFERENCES dim_email_workflow(id) ON DELETE CASCADE,
    area_id INT NOT NULL REFERENCES dim_area(id) ON DELETE CASCADE,
    setor_id INT REFERENCES dim_setor(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing
INSERT INTO dim_email_workflow_regra (email_workflow_id, area_id, setor_id)
SELECT id, area_id, setor_id
FROM dim_email_workflow
WHERE area_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop old columns safely
ALTER TABLE dim_email_workflow DROP COLUMN IF EXISTS area_id;
ALTER TABLE dim_email_workflow DROP COLUMN IF EXISTS setor_id;
