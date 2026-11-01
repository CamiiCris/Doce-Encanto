-- DOCE ENCANTO - V2: perfis, permissão e histórico para demonstração acadêmica.
-- Migração idempotente: mantém clientes, pedidos e receitas existentes.
BEGIN;
ALTER TABLE doce_encanto.cliente ADD COLUMN IF NOT EXISTS papel VARCHAR(10) NOT NULL DEFAULT 'CLIENTE';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_cliente_papel' AND conrelid='doce_encanto.cliente'::regclass) THEN
      ALTER TABLE doce_encanto.cliente ADD CONSTRAINT ck_cliente_papel CHECK (papel IN ('CLIENTE','ADMIN'));
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS doce_encanto.historico_pedido_admin (
  id_historico BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT NOT NULL REFERENCES doce_encanto.pedido(id_pedido) ON DELETE CASCADE,
  id_administrador BIGINT NOT NULL REFERENCES doce_encanto.cliente(id_cliente),
  status_anterior VARCHAR(20) NOT NULL,
  status_novo VARCHAR(20) NOT NULL,
  observacao VARCHAR(250),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_historico_admin_pedido ON doce_encanto.historico_pedido_admin (id_pedido,criado_em DESC);
COMMIT;
