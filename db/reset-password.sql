-- ============================================================
-- Redefinir a senha de um usuário direto no banco
-- ============================================================
-- Requer a extensão pgcrypto (já incluída na maioria das distros
-- do PostgreSQL). O hash gerado pelo crypt('senha', gen_salt('bf'))
-- é compatível com o bcryptjs usado pelo servidor.
--
-- USO:
--   1. Edite as duas linhas marcadas com "TODO" abaixo.
--   2. Execute:  psql "postgres://usuario:senha@host:5432/comunicados" \
--                     -f db/reset-password.sql
--
-- A nova senha deve atender à mesma política de complexidade
-- exigida pela app (mínimo 8 chars, com letra maiúscula, minúscula,
-- número e caractere especial).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_usuario      TEXT := 'admin';                 -- TODO: troque pelo login
    v_senha        TEXT := 'TrocaEstaSenha@2026';   -- TODO: troque pela nova senha
    v_rows_updated INT;
BEGIN
    -- ---------- validação de complexidade ----------
    IF length(v_senha) < 8 THEN
        RAISE EXCEPTION 'Senha muito curta — mínimo 8 caracteres';
    END IF;
    IF v_senha !~ '[a-z]' THEN
        RAISE EXCEPTION 'Senha precisa conter ao menos uma letra minúscula';
    END IF;
    IF v_senha !~ '[A-Z]' THEN
        RAISE EXCEPTION 'Senha precisa conter ao menos uma letra maiúscula';
    END IF;
    IF v_senha !~ '[0-9]' THEN
        RAISE EXCEPTION 'Senha precisa conter ao menos um número';
    END IF;
    IF v_senha !~ '[^A-Za-z0-9]' THEN
        RAISE EXCEPTION 'Senha precisa conter ao menos um caractere especial';
    END IF;

    -- ---------- atualização ----------
    UPDATE dim_usuario
       SET senha_hash = crypt(v_senha, gen_salt('bf', 10))
     WHERE usuario = LOWER(TRIM(v_usuario));

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated = 0 THEN
        RAISE EXCEPTION 'Usuário "%" não encontrado na dim_usuario', v_usuario;
    END IF;

    RAISE NOTICE 'Senha de "%" redefinida com sucesso', v_usuario;
END$$;

-- ============================================================
-- Alternativa "one-liner" (sem validação de complexidade).
-- Descomente e ajuste se preferir não usar o bloco DO acima:
--
--   UPDATE dim_usuario
--      SET senha_hash = crypt('NovaSenha@123', gen_salt('bf', 10))
--    WHERE usuario = 'admin';
-- ============================================================
