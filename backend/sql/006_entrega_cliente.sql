-- V4.4: new accepted status and customer-only receipt confirmation.
-- This migration preserves previous orders and is safe to run again.
BEGIN;

ALTER TABLE doce_encanto.pedido
    DROP CONSTRAINT IF EXISTS pedido_status_check;
ALTER TABLE doce_encanto.pedido
    ADD CONSTRAINT pedido_status_check CHECK (
    status IN (
      'AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'ACEITO', 'PREPARANDO',
      'PRONTO_RETIRADA', 'EM_ENTREGA', 'ENTREGUE', 'CANCELADO'
    )
    );

CREATE TABLE IF NOT EXISTS doce_encanto.confirmacao_recebimento (
    id_pedido BIGINT PRIMARY KEY REFERENCES doce_encanto.pedido(id_pedido) ON DELETE CASCADE,
    id_cliente BIGINT NOT NULL REFERENCES doce_encanto.cliente(id_cliente),
    confirmado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
