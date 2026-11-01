-- DOCE ENCANTO | Projeto fisico PostgreSQL 15+
-- Execute em uma base de dados vazia. Valores monetarios em BRL.
BEGIN;
CREATE SCHEMA IF NOT EXISTS doce_encanto;
SET search_path TO doce_encanto;

CREATE TABLE cliente (
  id_cliente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT ck_cliente_nome CHECK (length(trim(nome)) > 0)
);
CREATE UNIQUE INDEX uq_cliente_email_lower ON cliente (lower(email));

CREATE TABLE endereco (
  id_endereco BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente BIGINT NOT NULL REFERENCES cliente(id_cliente) ON DELETE CASCADE,
  apelido VARCHAR(40),
  logradouro VARCHAR(150) NOT NULL,
  numero VARCHAR(15) NOT NULL,
  complemento VARCHAR(80),
  bairro VARCHAR(80) NOT NULL,
  cidade VARCHAR(80) NOT NULL,
  uf CHAR(2) NOT NULL,
  cep CHAR(8) NOT NULL,
  principal BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT ck_endereco_cep CHECK (cep ~ '^[0-9]{8}$'),
  CONSTRAINT ck_endereco_uf CHECK (uf ~ '^[A-Z]{2}$')
);
CREATE INDEX ix_endereco_cliente ON endereco(id_cliente);
CREATE UNIQUE INDEX uq_endereco_principal ON endereco(id_cliente) WHERE principal;

CREATE TABLE categoria (
  id_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao TEXT
);
CREATE TABLE produto (
  id_produto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_categoria BIGINT NOT NULL REFERENCES categoria(id_categoria),
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  imagem_url TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_produto_categoria ON produto(id_categoria);
CREATE INDEX ix_produto_disponivel ON produto(disponivel) WHERE disponivel;

CREATE TABLE carrinho (
  id_carrinho BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente BIGINT NOT NULL UNIQUE REFERENCES cliente(id_cliente) ON DELETE CASCADE,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE item_carrinho (
  id_carrinho BIGINT NOT NULL REFERENCES carrinho(id_carrinho) ON DELETE CASCADE,
  id_produto BIGINT NOT NULL REFERENCES produto(id_produto),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  PRIMARY KEY (id_carrinho,id_produto)
);

CREATE TABLE cupom (
  id_cupom BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  tipo_desconto VARCHAR(12) NOT NULL CHECK (tipo_desconto IN ('PERCENTUAL','VALOR_FIXO')),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  valido_de TIMESTAMPTZ NOT NULL,
  valido_ate TIMESTAMPTZ NOT NULL,
  limite_usos INTEGER CHECK (limite_usos IS NULL OR limite_usos > 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (valido_ate > valido_de),
  CHECK (tipo_desconto <> 'PERCENTUAL' OR valor <= 100)
);

CREATE TABLE pedido (
  id_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente BIGINT NOT NULL REFERENCES cliente(id_cliente),
  id_endereco BIGINT NOT NULL REFERENCES endereco(id_endereco),
  id_cupom BIGINT REFERENCES cupom(id_cupom),
  realizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO'
      CHECK (status IN ('AGUARDANDO_PAGAMENTO','CONFIRMADO','PREPARANDO','EM_ENTREGA','ENTREGUE','CANCELADO')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  desconto NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (desconto >= 0),
  taxa_entrega NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (taxa_entrega >= 0),
  total NUMERIC(10,2) GENERATED ALWAYS AS (subtotal - desconto + taxa_entrega) STORED,
  observacao TEXT,
  CHECK (desconto <= subtotal)
);
CREATE INDEX ix_pedido_cliente_data ON pedido(id_cliente, realizado_em DESC);
CREATE INDEX ix_pedido_status ON pedido(status);

CREATE TABLE item_pedido (
  id_pedido BIGINT NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  id_produto BIGINT NOT NULL REFERENCES produto(id_produto),
  nome_produto VARCHAR(120) NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),
  PRIMARY KEY (id_pedido,id_produto)
);

CREATE TABLE pagamento (
  id_pagamento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT NOT NULL REFERENCES pedido(id_pedido),
  metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('PIX','CARTAO','CARTEIRA_DIGITAL')),
  status VARCHAR(16) NOT NULL DEFAULT 'PENDENTE'
      CHECK (status IN ('PENDENTE','APROVADO','RECUSADO','ESTORNADO')),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  referencia_externa VARCHAR(120),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  processado_em TIMESTAMPTZ
);
CREATE INDEX ix_pagamento_pedido ON pagamento(id_pedido);
CREATE UNIQUE INDEX uq_pagamento_referencia ON pagamento(referencia_externa) WHERE referencia_externa IS NOT NULL;

CREATE TABLE entrega (
  id_entrega BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT NOT NULL UNIQUE REFERENCES pedido(id_pedido),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
      CHECK (status IN ('PENDENTE','PREPARANDO','A_CAMINHO','ENTREGUE','CANCELADA')),
  previsao_entrega TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  codigo_rastreio VARCHAR(60) UNIQUE
);
CREATE TABLE evento_rastreio (
  id_evento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_entrega BIGINT NOT NULL REFERENCES entrega(id_entrega) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PEDIDO_RECEBIDO','PREPARANDO','A_CAMINHO','ENTREGUE','OCORRENCIA')),
  descricao VARCHAR(250),
  latitude NUMERIC(9,6) CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(9,6) CHECK (longitude BETWEEN -180 AND 180),
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL))
);
CREATE INDEX ix_evento_entrega_data ON evento_rastreio(id_entrega, registrado_em DESC);

CREATE TABLE mensagem_chat (
  id_mensagem BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pedido BIGINT NOT NULL REFERENCES pedido(id_pedido),
  id_cliente BIGINT REFERENCES cliente(id_cliente),
  origem VARCHAR(12) NOT NULL CHECK (origem IN ('CLIENTE','ATENDENTE','SISTEMA')),
  texto TEXT NOT NULL CHECK (length(trim(texto)) > 0),
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((origem = 'CLIENTE' AND id_cliente IS NOT NULL) OR origem <> 'CLIENTE')
);
CREATE INDEX ix_chat_pedido_data ON mensagem_chat(id_pedido, enviado_em);
COMMIT;

-- Regras adicionais a implementar na camada de aplicacao ou com triggers:
-- (1) pedido.id_endereco deve pertencer ao mesmo cliente de pedido.id_cliente;
-- (2) mensagem_chat.id_cliente deve ser o cliente do pedido quando origem = CLIENTE;
-- (3) subtotal e desconto devem corresponder aos itens e ao cupom na criacao do pedido;
-- (4) impedir finalizacao com item indisponivel e verificar limites/validade do cupom;
-- (5) confirmar pedido somente apos pagamento aprovado e controlar transicoes de status;
-- (6) autorizar consultas de pedidos e dados pessoais pelo usuario autenticado;
-- (7) rastreamento 'em tempo real' exige integracao externa, nao apenas o banco.
