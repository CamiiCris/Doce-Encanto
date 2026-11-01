'use strict';
const express = require('express');
const QRCode = require('qrcode');
const { paymentDemoAllowed } = require('./admin-policy');
const { fail } = require('./core');
const { demoPixCode, idValue } = require('./pix-demo-core');
// Atenção: NÃO é código EMV Pix BR Code. Bancos não podem pagar este código.
function createPixDemoRouter({ query, transaction, requireAuth, requireClient }) {
    const router = express.Router();
    function available(_req, res, next) {
        if (!paymentDemoAllowed(process.env))
            return res.status(403).json({ erro: 'Pix demonstrativo indisponível fora do modo de testes. Não há cobrança real.' });
        next();
    }
    const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    // Retorna apenas dados do próprio cliente. QR Code codifica SOMENTE o texto DEMO.
    router.get('/:id', requireAuth, requireClient, available, asyncRoute(async (req, res) => {
        const id = idValue(req.params.id);
        const { rows } = await query(`SELECT p.id_pedido,p.status,p.total,pg.metodo,pg.status AS pagamento_status
      FROM doce_encanto.pedido p
      LEFT JOIN LATERAL (SELECT metodo,status FROM doce_encanto.pagamento
        WHERE id_pedido=p.id_pedido ORDER BY criado_em DESC,id_pagamento DESC LIMIT 1) pg ON TRUE
      WHERE p.id_pedido=$1 AND p.id_cliente=$2`, [id, req.user.id_cliente]);
        if (!rows[0])
            fail('Pedido não encontrado para esta conta.', 404);
        const order = rows[0];
        if (order.metodo !== 'PIX')
            fail('Este pedido não escolheu Pix.', 409);
        if (order.status !== 'AGUARDANDO_PAGAMENTO' || order.pagamento_status !== 'PENDENTE')
            fail('Este pedido não está aguardando Pix.', 409);
        const cents = Math.round(Number(order.total) * 100);
        const code = demoPixCode(id, cents);
        const qrDataUrl = await QRCode.toDataURL(code, { errorCorrectionLevel: 'M', margin: 3, width: 320, color: { dark: '#593847', light: '#FFFFFFFF' } });
        res.json({
            pix: {
                pedido: `DE-${String(id).padStart(6, '0')}`, codigo: code, qrDataUrl, valorCentavos: cents,
                aviso: 'APENAS SIMULAÇÃO: este QR Code e o código não fazem pagamentos no banco.', pagamentoReal: false
            }
        });
    }));
    router.post('/:id/confirmar', requireAuth, requireClient, available, asyncRoute(async (req, res) => {
        const id = idValue(req.params.id);
        await transaction(async (conn) => {
            const result = await conn.query('SELECT id_pedido,status FROM doce_encanto.pedido WHERE id_pedido=$1 AND id_cliente=$2 FOR UPDATE', [id, req.user.id_cliente]);
            const order = result.rows[0];
            if (!order)
                fail('Pedido não encontrado para esta conta.', 404);
            if (order.status !== 'AGUARDANDO_PAGAMENTO')
                fail('O pedido não aguarda pagamento.', 409);
            const payment = await conn.query(`SELECT id_pagamento,metodo,status FROM doce_encanto.pagamento
        WHERE id_pedido=$1 ORDER BY criado_em DESC,id_pagamento DESC LIMIT 1 FOR UPDATE`, [id]);
            if (!payment.rows[0] || payment.rows[0].metodo !== 'PIX' || payment.rows[0].status !== 'PENDENTE')
                fail('Este pedido não tem Pix pendente.', 409);
            const update = await conn.query(`UPDATE doce_encanto.pagamento SET status='APROVADO',processado_em=now(),referencia_externa=$2
        WHERE id_pagamento=$1 AND status='PENDENTE' RETURNING id_pagamento`, [payment.rows[0].id_pagamento, `DEMO-CLIENTE-PIX-${id}`]);
            if (!update.rows.length)
                fail('Pagamento demonstrativo já confirmado.', 409);
            await conn.query("UPDATE doce_encanto.pedido SET status='CONFIRMADO' WHERE id_pedido=$1", [id]);
            const delivery = await conn.query('SELECT id_entrega FROM doce_encanto.entrega WHERE id_pedido=$1', [id]);
            if (delivery.rows[0])
                await conn.query(`INSERT INTO doce_encanto.evento_rastreio(id_entrega,status,descricao)
        VALUES($1,'PEDIDO_RECEBIDO','Pagamento Pix SIMULADO pelo cliente. Nenhum valor financeiro transferido.')`, [delivery.rows[0].id_entrega]);
        });
        res.json({ status: 'CONFIRMADO', mensagem: 'Pagamento de demonstração aprovado! Nenhum dinheiro foi movimentado.' });
    }));
    return router;
}
module.exports = { createPixDemoRouter };
