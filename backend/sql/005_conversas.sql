-- V4.3: mensagens bidirecionais por pedido, sem alterar registros anteriores.
BEGIN;
ALTER TABLE doce_encanto.aviso_pedido DROP CONSTRAINT IF EXISTS aviso_pedido_tipo_check;
ALTER TABLE doce_encanto.aviso_pedido ADD CONSTRAINT aviso_pedido_tipo_check CHECK (tipo IN ('ATRASO','FALTA_PRODUTO','CANCELAMENTO','PROPOSTA_TROCA'));
CREATE TABLE IF NOT EXISTS doce_encanto.mensagem_pedido (
  id_mensagem BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT NOT NULL REFERENCES doce_encanto.pedido(id_pedido) ON DELETE CASCADE,
  id_remetente BIGINT NOT NULL REFERENCES doce_encanto.cliente(id_cliente),
  origem VARCHAR(10) NOT NULL CHECK (origem IN ('CLIENTE','ADMIN')),
  mensagem VARCHAR(1000) NOT NULL CHECK (length(trim(mensagem)) BETWEEN 2 AND 1000),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_mensagem_pedido_data
  ON doce_encanto.mensagem_pedido (id_pedido, criado_em ASC, id_mensagem ASC);
COMMIT;
