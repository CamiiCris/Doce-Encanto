'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { nextStatusAllowed, paymentDemoAllowed, deliveryStatus, trackingStatus, validateNotice, clientMayConfirmReceipt } = require('../src/admin-policy');
test('sem pagamento não pode preparar nem entregar', () => {
    assert.equal(nextStatusAllowed('AGUARDANDO_PAGAMENTO', 'PREPARANDO'), false);
    assert.equal(nextStatusAllowed('AGUARDANDO_PAGAMENTO', 'PRONTO_RETIRADA'), false);
});
test('fluxo completo inclui aguardando entregador', () => {
    assert.equal(nextStatusAllowed('CONFIRMADO', 'ACEITO'), true);
    assert.equal(nextStatusAllowed('ACEITO', 'PREPARANDO'), true);
    assert.equal(nextStatusAllowed('CONFIRMADO', 'PREPARANDO'), false);
    assert.equal(nextStatusAllowed('PREPARANDO', 'PRONTO_RETIRADA'), true);
    assert.equal(nextStatusAllowed('PRONTO_RETIRADA', 'EM_ENTREGA'), true);
    assert.equal(nextStatusAllowed('EM_ENTREGA', 'ENTREGUE'), false);
    assert.equal(nextStatusAllowed('PREPARANDO', 'EM_ENTREGA'), false);
});
test('cancelamento antes da saída para entrega e sem regressões', () => {
    for (const s of ['AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'ACEITO', 'PREPARANDO', 'PRONTO_RETIRADA'])
        assert.equal(nextStatusAllowed(s, 'CANCELADO'), true);
    for (const s of ['EM_ENTREGA', 'ENTREGUE', 'CANCELADO'])
        assert.equal(nextStatusAllowed(s, 'CANCELADO'), false);
    assert.equal(nextStatusAllowed('ENTREGUE', 'PREPARANDO'), false);
});
test('mapeamento de etapas do banco', () => {
    assert.equal(deliveryStatus.PRONTO_RETIRADA, 'AGUARDANDO_COLETA');
    assert.equal(trackingStatus.PRONTO_RETIRADA, 'PRONTO_RETIRADA');
});
test('valida avisos e mensagens', () => {
    assert.equal(validateNotice('ATRASO', 'Pedido vai atrasar um pouco.'), null);
    assert.equal(validateNotice('FALTA_PRODUTO', 'Não temos pistache hoje.'), null);
    assert.match(validateNotice('OUTRO', 'Texto válido'), /inválido/);
    assert.match(validateNotice('ATRASO', 'oi'), /8 e 500/);
});
test('modo de pagamento demonstrativo não roda em produção', () => {
    assert.equal(paymentDemoAllowed({ DEMO_MODE: 'true', NODE_ENV: 'production' }), false);
    assert.equal(paymentDemoAllowed({ DEMO_MODE: 'true', NODE_ENV: 'development' }), true);
});
test('somente o cliente confirma o recebimento quando o motoboy está a caminho', () => {
    assert.equal(clientMayConfirmReceipt('EM_ENTREGA'), true);
    for (const status of ['AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'ACEITO', 'PREPARANDO', 'PRONTO_RETIRADA', 'ENTREGUE', 'CANCELADO']) {
        assert.equal(clientMayConfirmReceipt(status), false);
    }
});
