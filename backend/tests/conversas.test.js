'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { orderId, messageText, listConversation, sendMessage } = require('../src/conversas');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
test('identificadores de pedidos e texto têm validação', () => {
    assert.equal(orderId('DE-000001'), 1);
    assert.equal(orderId('23'), 23);
    for (const x of ['../1', '-1', '0', '1.2'])
        assert.throws(() => orderId(x), /inválido/);
    assert.equal(messageText('  Troco por morango?  '), 'Troco por morango?');
    assert.throws(() => messageText('a'), /2 e 1000/);
    assert.throws(() => messageText('a'.repeat(1001)), /2 e 1000/);
});
test('cliente só pode visualizar mensagens de seus próprios pedidos', async () => {
    const fake = async (sql, params) => {
        if (sql.includes('SELECT id_pedido'))
            return { rows: params[1] === 10 ? [{ id_pedido: 5 }] : [] };
        return { rows: [] };
    };
    await assert.rejects(listConversation(fake, 5, 9), /sem permissão/);
    assert.deepEqual(await listConversation(fake, 5, 10), []);
});
test('ao responder, valida titularidade antes de inserir', async () => {
    let wrote = false;
    const fake = async (sql) => {
        if (sql.startsWith('SELECT id_pedido'))
            return { rows: [] };
        wrote = true;
        return { rows: [] };
    };
    await assert.rejects(sendMessage(fake, 7, 10, 'CLIENTE', 'Quero trocar', 10), /sem permissão/);
    assert.equal(wrote, false);
});
test('mensagens usam parâmetros SQL e não concatenam texto', async () => {
    const calls = [];
    const fake = async (sql, args) => {
        calls.push([sql, args]);
        if (sql.startsWith('SELECT id_pedido'))
            return { rows: [{ id_pedido: 1 }] };
        return { rows: [{ id: '2', mensagem: 'Troca, por favor' }] };
    };
    await sendMessage(fake, 1, 9, 'CLIENTE', 'Troca, por favor', 9);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1][1], [1, 9, 'CLIENTE', 'Troca, por favor']);
    assert.match(calls[1][0], /VALUES \(\$1,\$2,\$3,\$4\)/);
});
test('cada perfil usa cookie independente para cliente e admin', () => {
    const src = readFileSync(join(__dirname, '../src/app.js'), 'utf8');
    assert.match(src, /__Host-doce_cliente/);
    assert.match(src, /__Host-doce_admin/);
    assert.match(src, /findUser\(req,\s*papel\s*=\s*roleForRequest\(req\)\)/);
    assert.match(src, /c\.papel=\$2/);
    assert.match(src, /clearCookie\(res,\s*papel\)/);
});
