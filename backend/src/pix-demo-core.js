'use strict';
const { fail } = require('./core');
function demoPixCode(orderId, totalCents) {
    if (!Number.isSafeInteger(orderId) || orderId < 1)
        throw new TypeError('Pedido inválido.');
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0)
        throw new TypeError('Valor inválido.');
    return `DEMO-SEM-VALOR-FINANCEIRO|DOCE-ENCANTO|PEDIDO=DE-${String(orderId).padStart(6, '0')}|VALOR=${(totalCents / 100).toFixed(2)}|NAO-PAGAVEL`;
}
function idValue(raw) {
    if (!/^(?:DE-)?\d{1,15}$/i.test(String(raw)))
        fail('Número de pedido inválido.');
    const id = Number(String(raw).replace(/^DE-/i, ''));
    if (!Number.isSafeInteger(id) || id <= 0)
        fail('Número de pedido inválido.');
    return id;
}
module.exports = { demoPixCode, idValue };
