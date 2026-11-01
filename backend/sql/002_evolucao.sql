-- Extensão do projeto físico original para autenticação e cupcakes personalizados.
BEGIN;
CREATE SCHEMA IF NOT EXISTS doce_encanto;
SET search_path TO doce_encanto;

-- A identificação pública do produto não muda se seu ID numérico mudar.
ALTER TABLE produto ADD COLUMN IF NOT EXISTS slug VARCHAR(80);
CREATE UNIQUE INDEX IF NOT EXISTS uq_produto_slug ON produto (slug);

-- Um pedido pode conter múltiplos cupcakes montados com receitas distintas.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'item_pedido_pkey' AND conrelid = 'doce_encanto.item_pedido'::regclass) THEN
    ALTER TABLE item_pedido DROP CONSTRAINT item_pedido_pkey;
  END IF;
END $$;
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS id_item_pedido BIGINT GENERATED ALWAYS AS IDENTITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pk_item_pedido' AND conrelid='doce_encanto.item_pedido'::regclass) THEN
    ALTER TABLE item_pedido ADD CONSTRAINT pk_item_pedido PRIMARY KEY (id_item_pedido);
  END IF;
END $$;
ALTER TABLE item_pedido ADD COLUMN IF NOT EXISTS configuracao JSONB;
CREATE INDEX IF NOT EXISTS ix_item_pedido_pedido ON item_pedido(id_pedido);

-- Tokens aleatórios nunca são salvos em texto puro; apenas hashes SHA-256.
CREATE TABLE IF NOT EXISTS sessao_cliente (
  id_sessao BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente BIGINT NOT NULL REFERENCES cliente(id_cliente) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL,
  revogado_em TIMESTAMPTZ,
  CONSTRAINT ck_sessao_validade CHECK (expira_em > criado_em)
);
CREATE INDEX IF NOT EXISTS ix_sessao_cliente ON sessao_cliente(id_cliente);
CREATE INDEX IF NOT EXISTS ix_sessao_expira ON sessao_cliente(expira_em);
COMMIT;
