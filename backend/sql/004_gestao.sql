-- Doce Encanto V3: novas etapas e comunicados. Idempotente e preserva pedidos existentes.
BEGIN;
-- Os nomes aqui são os gerados pelas declarações CHECK do modelo original.
ALTER TABLE doce_encanto.pedido DROP CONSTRAINT IF EXISTS pedido_status_check;
ALTER TABLE doce_encanto.pedido ADD CONSTRAINT pedido_status_check CHECK
  (status IN ('AGUARDANDO_PAGAMENTO','CONFIRMADO','ACEITO','PREPARANDO','PRONTO_RETIRADA','EM_ENTREGA','ENTREGUE','CANCELADO'));
ALTER TABLE doce_encanto.entrega DROP CONSTRAINT IF EXISTS entrega_status_check;
ALTER TABLE doce_encanto.entrega ADD CONSTRAINT entrega_status_check CHECK
  (status IN ('PENDENTE','PREPARANDO','AGUARDANDO_COLETA','A_CAMINHO','ENTREGUE','CANCELADA'));
ALTER TABLE doce_encanto.evento_rastreio DROP CONSTRAINT IF EXISTS evento_rastreio_status_check;
ALTER TABLE doce_encanto.evento_rastreio ADD CONSTRAINT evento_rastreio_status_check CHECK
  (status IN ('PEDIDO_RECEBIDO','PREPARANDO','PRONTO_RETIRADA','A_CAMINHO','ENTREGUE','OCORRENCIA'));
CREATE TABLE IF NOT EXISTS doce_encanto.aviso_pedido (
  id_aviso BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT NOT NULL REFERENCES doce_encanto.pedido(id_pedido) ON DELETE CASCADE,
  id_administrador BIGINT NOT NULL REFERENCES doce_encanto.cliente(id_cliente),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ATRASO','FALTA_PRODUTO','CANCELAMENTO')),
  mensagem VARCHAR(500) NOT NULL CHECK (length(trim(mensagem)) >= 8),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_aviso_pedido_data ON doce_encanto.aviso_pedido(id_pedido,criado_em DESC);
COMMIT;
