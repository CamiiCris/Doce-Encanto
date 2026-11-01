'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { demoPixCode, idValue } = require('../src/pix-demo-core');
const { paymentDemoAllowed } = require('../src/admin-policy');
test('QR de teste deve indicar explicitamente que não é pagável', () => {
    const code = demoPixCode(7, 4190);
    assert.match(code, /DEMO-SEM-VALOR-FINANCEIRO/);
    assert.match(code, /PEDIDO=DE-000007/);
    assert.match(code, /VALOR=41\.90/);
    assert.match(code, /NAO-PAGAVEL/);
    assert.equal(code.startsWith('000201'), false);
});
test('valores e IDs inválidos não podem gerar dados de QR', () => {
    assert.throws(() => demoPixCode(1, -200), /Valor inválido/);
    assert.throws(() => demoPixCode(0, 100), /Pedido inválido/);
    assert.throws(() => demoPixCode(1, 1.5), /Valor inválido/);
    assert.equal(idValue('DE-000007'), 7);
    assert.throws(() => idValue('1 OR 1=1'), /Número de pedido inválido/);
});
test('simulação nunca fica habilitada em produção', () => {
    assert.equal(paymentDemoAllowed({ DEMO_MODE: 'true', NODE_ENV: 'production' }), false);
    assert.equal(paymentDemoAllowed({ DEMO_MODE: 'true', NODE_ENV: 'development' }), true);
    assert.equal(paymentDemoAllowed({ DEMO_MODE: 'false', NODE_ENV: 'development' }), false);
});
