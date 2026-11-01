'use strict';
const { fail } = require('./core');
function orderId(raw) {
    const text = String(raw).replace(/^DE-/i, '');
    const id = Number(text);
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(id) || id < 1)
        fail('Número de pedido inválido.');
    return id;
}
function messageText(input) {
    if (typeof input !== 'string')
        fail('Escreva uma mensagem de texto.');
    const text = input.trim();
    if (text.length < 2 || text.length > 1000)
        fail('Sua mensagem deve ter entre 2 e 1000 caracteres.');
    return text;
}
async function assertAccess(query, id, clienteId) {
    const params = clienteId === null ? [id] : [id, clienteId];
    const sql = 'SELECT id_pedido FROM doce_encanto.pedido WHERE id_pedido=$1' + (clienteId === null ? '' : ' AND id_cliente=$2');
    const { rows } = await query(sql, params);
    if (!rows[0])
        fail('Pedido não encontrado ou sem permissão.', 404);
}
async function listConversation(query, id, clienteId = null) {
    await assertAccess(query, id, clienteId);
    const [notices, messages] = await Promise.all([
        query(`SELECT id_aviso::text AS id,'AVISO' AS classe,'ADMIN' AS origem,
    tipo,mensagem,criado_em AS "criadoEm" FROM doce_encanto.aviso_pedido
    WHERE id_pedido=$1 ORDER BY criado_em ASC,id_aviso ASC LIMIT 150`, [id]),
        query(`SELECT id_mensagem::text AS id,'MENSAGEM' AS classe,origem,
    NULL::text AS tipo,mensagem,criado_em AS "criadoEm" FROM doce_encanto.mensagem_pedido
    WHERE id_pedido=$1 ORDER BY criado_em ASC,id_mensagem ASC LIMIT 200`, [id])
    ]);
    return [...notices.rows, ...messages.rows].sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
}
async function sendMessage(query, id, userId, origin, input, clienteId = null) {
    const mensagem = messageText(input);
    await assertAccess(query, id, clienteId);
    const { rows } = await query(`INSERT INTO doce_encanto.mensagem_pedido
  (id_pedido,id_remetente,origem,mensagem) VALUES ($1,$2,$3,$4)
  RETURNING id_mensagem::text AS id,origem,mensagem,criado_em AS "criadoEm"`, [id, userId, origin, mensagem]);
    return rows[0];
}
module.exports = { orderId, messageText, listConversation, sendMessage };
