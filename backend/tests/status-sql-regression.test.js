'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
test('administração não pode finalizar pedidos nem registrar a entrega', () => {
    const source = read('../src/admin.js');
    const update = source.match(/UPDATE doce_encanto\.entrega[\s\S]*?SET status=\$2[\s\S]*?WHERE id_pedido=\$1/);
    assert.ok(update, 'admin atualiza somente o status de entrega com dois parâmetros');
    assert.match(source, /\[id,\s*deliveryStatus\[nextStatus\]\]/);
    assert.doesNotMatch(update[0], /entregue_em/);
    assert.doesNotMatch(source, /ENTREGUE:'Entrega marcada como concluída pela administração/);
});
test('confirmação de recebimento exige cliente autenticado e propriedade do pedido', () => {
    const source = read('../src/app.js');
    assert.match(source, /app\.post\('\/api\/pedidos\/:id\/confirmar-entrega',\s*requireAuth,\s*requireClient/);
    assert.match(source, /WHERE id_pedido=\$1 AND id_cliente=\$2 FOR UPDATE/);
    assert.match(source, /clientMayConfirmReceipt\(rows\[0\]\.status\)/);
    assert.match(source, /INSERT INTO doce_encanto\.confirmacao_recebimento/);
    assert.match(source, /UPDATE doce_encanto\.pedido SET status='ENTREGUE'/);
});
test('nova etapa e confirmação do cliente constam das migrações', () => {
    const migration = read('../sql/006_entrega_cliente.sql');
    assert.match(migration, /ACEITO/);
    assert.match(migration, /confirmacao_recebimento/);
    assert.match(read('../src/setup.js'), /006_entrega_cliente\.sql/);
});
