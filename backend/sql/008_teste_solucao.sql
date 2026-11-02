-- Complemento do formulário "Testes da Solução".
-- Migração compatível com as avaliações antigas.
ALTER TABLE doce_encanto.avaliacao_usabilidade
    ADD COLUMN IF NOT EXISTS nome_colega VARCHAR(100),
    ADD COLUMN IF NOT EXISTS data_teste DATE,
    ADD COLUMN IF NOT EXISTS nao_testado VARCHAR(700) NOT NULL DEFAULT '';
