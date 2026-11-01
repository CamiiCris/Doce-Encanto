-- Avaliação voluntária e anônima do protótipo, sem coleta de identidade.
CREATE TABLE IF NOT EXISTS doce_encanto.avaliacao_usabilidade (
    id_avaliacao BIGSERIAL PRIMARY KEY,
    perfil_testado VARCHAR(12) NOT NULL CHECK (perfil_testado IN ('CLIENTE', 'ADMIN', 'AMBOS')),
    dispositivo VARCHAR(12) NOT NULL CHECK (dispositivo IN ('CELULAR', 'COMPUTADOR', 'TABLET')),
    nota_navegacao SMALLINT NOT NULL CHECK (nota_navegacao BETWEEN 1 AND 5),
    nota_visual SMALLINT NOT NULL CHECK (nota_visual BETWEEN 1 AND 5),
    nota_facilidade SMALLINT NOT NULL CHECK (nota_facilidade BETWEEN 1 AND 5),
    concluiu_tarefa BOOLEAN NOT NULL,
    ponto_positivo VARCHAR(700) NOT NULL,
    dificuldade VARCHAR(700) NOT NULL DEFAULT '',
    sugestao VARCHAR(700) NOT NULL DEFAULT '',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_avaliacao_usabilidade_data ON doce_encanto.avaliacao_usabilidade(criado_em DESC);
