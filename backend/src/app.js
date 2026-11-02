'use strict';
const path = require('node:path');
const express = require('express');
const { query, transaction } = require('./db');
const {
    fail,
    cleanEmail,
    validateEmail,
    validateAddress,
    priceCart,
    validateItems,
    hashToken,
    newToken,
    passwordHash,
    passwordCheck
} = require('./core');
const catalogReference = require('./catalog.json');
const { createAdminRouter } = require('./admin');
const { createPixDemoRouter } = require('./pix-demo');
const { createFeedbackRouter } = require('./avaliacao');
const { orderId, listConversation, sendMessage } = require('./conversas');
const { clientMayConfirmReceipt, paymentDemoAllowed } = require('./admin-policy');
// Configuração inicial da API.
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '60kb' }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    if (req.path.startsWith('/api/'))
        res.setHeader('Cache-Control', 'no-store');
    // CSRF: a API é same-origin, sem CORS; cookies SameSite=Lax.
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        const origin = req.get('origin');
        if (origin && new URL(origin).host !== req.get('host'))
            return res.status(403).json({ erro: 'Origem da solicitação não permitida.' });
    }
    next();
});
function asyncRoute(callback) {
    return (req, res, next) => {
        return Promise.resolve(callback(req, res, next)).catch(next);
    };
}
const secure = process.env.NODE_ENV === 'production';
// Cada perfil utiliza sua própria sessão.
const cookieNames = Object.freeze({
    CLIENTE: secure ? '__Host-doce_cliente' : 'doce_cliente',
    ADMIN: secure ? '__Host-doce_admin' : 'doce_admin'
});
const cookieParams = `Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure; ' : ''}`;
const parseCookie = (req, name) => {
    const raw = (req.headers.cookie || '').split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
    return raw ? decodeURIComponent(raw.slice(name.length + 1)) : null;
};
const storeCookie = (res, token, papel) => res.setHeader('Set-Cookie', `${cookieNames[papel]}=${encodeURIComponent(token)}; ${cookieParams}Max-Age=604800`);
const clearCookie = (res, papel) => res.setHeader('Set-Cookie', `${cookieNames[papel]}=; ${cookieParams}Max-Age=0`);
const roleForRequest = req => req.originalUrl.startsWith('/api/admin/') ? 'ADMIN' : 'CLIENTE';
// Limitador de desenvolvimento (memória por processo); use Redis/WAF em produção.
// Controle simples de tentativas de acesso.
const accessAttempts = new Map();
function rateLimit(req, res, next) {
    const key = `${req.path}|${req.ip}`, now = Date.now();
    if (accessAttempts.size > 10000)
        accessAttempts.clear();
    const existing = (accessAttempts.get(key) || []).filter(t => t > now - 15 * 60 * 1000);
    if (existing.length >= 8)
        return res.status(429).json({ erro: 'Muitas tentativas. Tente novamente em 15 minutos.' });
    existing.push(now);
    accessAttempts.set(key, existing);
    next();
}
// Busca a conta associada à sessão atual.
async function findUser(req, papel = roleForRequest(req)) {
    const token = parseCookie(req, cookieNames[papel]);
    if (!token || !/^[a-zA-Z0-9_-]{40,80}$/.test(token))
        return null;
    const { rows } = await query(`SELECT c.id_cliente,c.nome,c.email,c.telefone,c.papel
  FROM doce_encanto.sessao_cliente s JOIN doce_encanto.cliente c ON c.id_cliente=s.id_cliente
  WHERE s.token_hash=$1 AND c.papel=$2 AND s.revogado_em IS NULL AND s.expira_em>now() AND c.ativo`, [hashToken(token), papel]);
    return rows[0] || null;
}
async function requireAuth(req, res, next) {
    try {
        req.user = await findUser(req);
        if (!req.user)
            return res.status(401).json({ erro: 'Entre na sua conta para continuar.' });
        next();
    }
    catch (error) {
        next(error);
    }
}
function requireClient(req, res, next) {
    if (req.user.papel !== 'CLIENTE')
        return res.status(403).json({ erro: 'Entre com uma conta de cliente para realizar compras.' });
    next();
}
async function startSession(res, userId, papel) {
    const token = newToken();
    await query('INSERT INTO doce_encanto.sessao_cliente(id_cliente,token_hash,expira_em) VALUES ($1,$2,now()+interval \'7 days\')', [userId, hashToken(token)]);
    storeCookie(res, token, papel);
}
app.get('/api/saude', asyncRoute(async (_req, res) => {
    await query('SELECT 1');

    res.json({
        status: 'ok',
        banco: 'conectado',
        pagamentos: 'apenas_simulacao',
        pix_demo: paymentDemoAllowed(process.env)
    });
}));
// Cadastro de novos clientes.
app.post('/api/auth/cadastrar', rateLimit, asyncRoute(async (req, res) => {
    const name = String(req.body?.nome || '').trim();
    const email = cleanEmail(req.body?.email);
    if (name.length < 2 || name.length > 120)
        fail('Informe um nome com 2 a 120 caracteres.');
    if (!validateEmail(email))
        fail('E-mail inválido.');
    const pass = await passwordHash(req.body?.senha);
    try {
        const { rows } = await query('INSERT INTO doce_encanto.cliente(nome,email,senha_hash) VALUES ($1,$2,$3) RETURNING id_cliente,nome,email,papel', [name, email, pass]);
        await startSession(res, rows[0].id_cliente, 'CLIENTE');
        res.status(201).json({ usuario: { id: String(rows[0].id_cliente), nome: rows[0].nome, email: rows[0].email, papel: rows[0].papel } });
    }
    catch (error) {
        if (error.code === '23505')
            fail('Esse e-mail já possui cadastro.', 409);
        throw error;
    }
}));
// Entrada nas contas de cliente e administrador.
app.post('/api/auth/entrar', rateLimit, asyncRoute(async (req, res) => {
    const email = cleanEmail(req.body?.email), senha = req.body?.senha;
    if (!validateEmail(email) || typeof senha !== 'string' || senha.length > 128)
        fail('E-mail ou senha inválidos.', 401);
    const { rows } = await query('SELECT id_cliente,nome,email,papel,senha_hash FROM doce_encanto.cliente WHERE lower(email)=$1 AND ativo=TRUE', [email]);
    if (!rows[0] || !await passwordCheck(senha, rows[0].senha_hash))
        fail('E-mail ou senha inválidos.', 401);
    if (req.body?.perfil && req.body.perfil !== rows[0].papel)
        fail('Este usuário não pertence ao perfil selecionado.', 403);
    await startSession(res, rows[0].id_cliente, rows[0].papel);
    res.json({ usuario: { id: String(rows[0].id_cliente), nome: rows[0].nome, email: rows[0].email, papel: rows[0].papel } });
}));
app.post('/api/auth/sair', asyncRoute(async (req, res) => {
    const papel = req.body?.perfil === 'ADMIN' ? 'ADMIN' : 'CLIENTE';
    const token = parseCookie(req, cookieNames[papel]);
    if (token && /^[a-zA-Z0-9_-]{40,80}$/.test(token))
        await query('UPDATE doce_encanto.sessao_cliente SET revogado_em=now() WHERE token_hash=$1', [hashToken(token)]);
    clearCookie(res, papel);
    res.json({ mensagem: 'Sessão encerrada.' });
}));
app.get('/api/auth/eu', asyncRoute(async (req, res) => {
    const papel = req.query.perfil === 'ADMIN' ? 'ADMIN' : 'CLIENTE';
    const user = await findUser(req, papel);
    res.json({ usuario: user ? { id: String(user.id_cliente), nome: user.nome, email: user.email, papel: user.papel } : null });
}));
app.get('/api/produtos', asyncRoute(async (_req, res) => {
    const { rows } = await query(`SELECT p.id_produto,p.slug,p.nome,p.descricao,p.preco,p.imagem_url,p.disponivel,c.nome AS categoria
 FROM doce_encanto.produto p JOIN doce_encanto.categoria c ON c.id_categoria=p.id_categoria
 WHERE p.slug <> 'personalizado' ORDER BY p.id_produto`);
    res.json({ produtos: rows.map(r => ({ id: r.slug, nome: r.nome, descricao: r.descricao, precoCentavos: Math.round(Number(r.preco) * 100), imagem: r.imagem_url, categoria: r.categoria, disponivel: r.disponivel })) });
}));
async function loadProducts(conn, items, locking = false) {
    const ids = [...new Set(validateItems(items).map(x => x.id))];
    const { rows } = await conn.query(`SELECT id_produto,slug,nome,preco,disponivel FROM doce_encanto.produto WHERE slug = ANY($1::text[]) ${locking ? 'FOR SHARE' : ''}`, [ids]);
    return new Map(rows.map(r => [r.slug, { dbId: r.id_produto, name: r.nome, priceCents: Math.round(Number(r.preco) * 100), disponivel: r.disponivel }]));
}
async function findCoupon(conn, code, customerId, locking = false) {
    if (!code)
        return null;
    if (typeof code !== 'string' || code.length > 40 || !/^[A-Z0-9_-]+$/.test(code.toUpperCase()))
        fail('Código de cupom inválido.');
    if (!customerId)
        fail('Entre na sua conta para usar um cupom de primeira compra.', 401);
    const { rows } = await conn.query(`SELECT * FROM doce_encanto.cupom WHERE codigo=$1 ${locking ? 'FOR UPDATE' : ''}`, [code.toUpperCase()]);
    const coupon = rows[0];
    if (!coupon || !coupon.ativo || new Date(coupon.valido_de) > new Date() || new Date(coupon.valido_ate) < new Date())
        fail('Cupom inválido ou expirado.');
    const count = await conn.query('SELECT count(*)::int AS total FROM doce_encanto.pedido WHERE id_cliente=$1', [customerId]);
    if (Number(count.rows[0].total) > 0)
        fail('O cupom DOCE10 é válido somente no primeiro pedido.');
    if (coupon.limite_usos !== null) {
        const uses = await conn.query('SELECT count(*)::int AS total FROM doce_encanto.pedido WHERE id_cupom=$1', [coupon.id_cupom]);
        if (uses.rows[0].total >= coupon.limite_usos)
            fail('Limite de utilizações deste cupom atingido.');
    }
    return coupon;
}
app.post('/api/checkout/cotacao', asyncRoute(async (req, res) => {
    const user = await findUser(req);
    if (user?.papel === 'ADMIN')
        fail('A conta administrativa não realiza compras.', 403);
    const items = validateItems(req.body?.items);
    const cat = await loadProducts({ query }, items);
    const coupon = await findCoupon({ query }, String(req.body?.cupom || '').trim(), user?.id_cliente);
    const { subtotalCents, discountCents, deliveryCents, totalCents, lines } = priceCart(items, cat, coupon);
    res.json({ cotacao: { subtotalCents, discountCents, deliveryCents, totalCents, items: lines.map(l => ({ id: l.id, qty: l.qty, unitCents: l.unitCents, custom: l.custom, recipe: l.recipe || null })) } });
}));
app.post('/api/pedidos', requireAuth, requireClient, asyncRoute(async (req, res) => {
    const items = validateItems(req.body?.items);
    const address = validateAddress(req.body?.endereco);
    const phone = String(req.body?.telefone || '')
        .replace(/\D/g, '')
        .slice(0, 20);
    const method = req.body?.metodoPagamento;
    if (!['PIX', 'CARTAO'].includes(method))
        fail('Selecione Pix ou cartão para registrar a intenção de pagamento.');
    const code = String(req.body?.cupom || '').trim().toUpperCase();
    const id = await transaction(async (conn) => {
        // Impede dois pedidos simultâneos de usarem o benefício de primeira compra.
        const locked = await conn.query('SELECT id_cliente FROM doce_encanto.cliente WHERE id_cliente=$1 AND ativo=TRUE FOR UPDATE', [req.user.id_cliente]);
        if (!locked.rows[0])
            fail('Conta indisponível.', 401);
        await conn.query('UPDATE doce_encanto.cliente SET telefone=$1 WHERE id_cliente=$2', [phone, req.user.id_cliente]);
        const coupon = await findCoupon(conn, code, req.user.id_cliente, true);
        const cat = await loadProducts(conn, items, true);
        const totals = priceCart(items, cat, coupon);
        const dest = (await conn.query(`INSERT INTO doce_encanto.endereco(id_cliente,logradouro,numero,complemento,bairro,cidade,uf,cep)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_endereco`, [req.user.id_cliente, address.logradouro, address.numero, address.complemento || null, address.bairro, address.cidade, address.uf, address.cep])).rows[0];
        const order = (await conn.query(`INSERT INTO doce_encanto.pedido(id_cliente,id_endereco,id_cupom,subtotal,desconto,taxa_entrega,status)
     VALUES($1,$2,$3,$4,$5,$6,'AGUARDANDO_PAGAMENTO') RETURNING id_pedido`, [req.user.id_cliente, dest.id_endereco, coupon?.id_cupom || null, (totals.subtotalCents / 100).toFixed(2), (totals.discountCents / 100).toFixed(2), (totals.deliveryCents / 100).toFixed(2)])).rows[0];
        for (const line of totals.lines) {
            await conn.query(`INSERT INTO doce_encanto.item_pedido(id_pedido,id_produto,nome_produto,quantidade,preco_unitario,configuracao)
       VALUES($1,$2,$3,$4,$5,$6)`, [order.id_pedido, line.dbId, line.name, line.qty, (line.unitCents / 100).toFixed(2), line.recipe ? JSON.stringify(line.recipe) : null]);
        }
        await conn.query(`INSERT INTO doce_encanto.pagamento(id_pedido,metodo,status,valor) VALUES($1,$2,'PENDENTE',$3)`, [order.id_pedido, method, (totals.totalCents / 100).toFixed(2)]);
        const delivery = (await conn.query(`INSERT INTO doce_encanto.entrega(id_pedido,status,codigo_rastreio) VALUES($1,'PENDENTE',$2) RETURNING id_entrega`, [order.id_pedido, `DE-${String(order.id_pedido).padStart(6, '0')}`])).rows[0];
        await conn.query(`INSERT INTO doce_encanto.evento_rastreio(id_entrega,status,descricao) VALUES($1,'PEDIDO_RECEBIDO','Pedido recebido; aguardando pagamento DEMONSTRATIVO. Nenhum valor real foi transferido.')`, [delivery.id_entrega]);
        return order.id_pedido;
    });
    res.status(201).json({ pedido: { id: `DE-${String(id).padStart(6, '0')}`, idNumerico: String(id), status: 'AGUARDANDO_PAGAMENTO', aviso: 'Pedido registrado no banco, mas NÃO foi pago nem encaminhado à produção. Não há cobrança real.' } });
}));
app.get('/api/pedidos', requireAuth, requireClient, asyncRoute(async (req, res) => {
    const { rows } = await query(`SELECT p.id_pedido,p.realizado_em,p.status,p.total,
   (SELECT metodo FROM doce_encanto.pagamento WHERE id_pedido=p.id_pedido ORDER BY criado_em DESC,id_pagamento DESC LIMIT 1) AS metodo_pagamento,
   coalesce(sum(i.quantidade),0)::int AS unidades,
   (SELECT coalesce(jsonb_agg(jsonb_build_object('tipo',a.tipo,'mensagem',a.mensagem,'criadoEm',a.criado_em) ORDER BY a.criado_em DESC),'[]'::jsonb)
    FROM (SELECT tipo,mensagem,criado_em FROM doce_encanto.aviso_pedido WHERE id_pedido=p.id_pedido ORDER BY criado_em DESC LIMIT 10) a) AS avisos
   FROM doce_encanto.pedido p LEFT JOIN doce_encanto.item_pedido i ON i.id_pedido=p.id_pedido
   WHERE p.id_cliente=$1 GROUP BY p.id_pedido ORDER BY p.realizado_em DESC LIMIT 50`, [req.user.id_cliente]);
    res.json({ pedidos: rows.map(r => ({ id: `DE-${String(r.id_pedido).padStart(6, '0')}`, createdAt: r.realizado_em, status: r.status, totalCents: Math.round(Number(r.total) * 100), unidades: r.unidades, metodoPagamento: r.metodo_pagamento, avisos: r.avisos || [] })) });
}));
app.get('/api/pedidos/:id', requireAuth, requireClient, asyncRoute(async (req, res) => {
    const id = Number(req.params.id.replace(/^DE-/i, ''));
    if (!Number.isSafeInteger(id) || id < 1)
        fail('Número de pedido inválido.');
    const { rows } = await query(`SELECT p.id_pedido,p.realizado_em,p.status,p.total,pg.status as pagamento_status,e.status AS entrega_status
 FROM doce_encanto.pedido p LEFT JOIN LATERAL (SELECT status FROM doce_encanto.pagamento WHERE id_pedido=p.id_pedido ORDER BY criado_em DESC LIMIT 1) pg ON TRUE
 LEFT JOIN doce_encanto.entrega e ON e.id_pedido=p.id_pedido WHERE p.id_pedido=$1 AND p.id_cliente=$2`, [id, req.user.id_cliente]);
    if (!rows[0])
        fail('Pedido não encontrado.', 404);
    const items = await query('SELECT nome_produto,quantidade,preco_unitario,configuracao FROM doce_encanto.item_pedido WHERE id_pedido=$1 ORDER BY id_item_pedido', [id]);
    const avisos = await query('SELECT tipo,mensagem,criado_em FROM doce_encanto.aviso_pedido WHERE id_pedido=$1 ORDER BY criado_em DESC', [id]);
    res.json({ pedido: { id: `DE-${String(id).padStart(6, '0')}`, status: rows[0].status, createdAt: rows[0].realizado_em, totalCents: Math.round(Number(rows[0].total) * 100), pagamento: rows[0].pagamento_status, entrega: rows[0].entrega_status, items: items.rows, avisos: avisos.rows } });
}));
// Only the customer who owns the order can confirm receipt after dispatch.
app.post('/api/pedidos/:id/confirmar-entrega', requireAuth, requireClient, asyncRoute(async (req, res) => {
    const id = orderId(req.params.id);
    const result = await transaction(async (conn) => {
        const { rows } = await conn.query('SELECT status FROM doce_encanto.pedido WHERE id_pedido=$1 AND id_cliente=$2 FOR UPDATE', [id, req.user.id_cliente]);
        if (!rows[0])
            fail('Pedido não encontrado ou não pertence a você.', 404);
        if (!clientMayConfirmReceipt(rows[0].status)) {
            fail('O recebimento só pode ser confirmado quando o pedido estiver a caminho.', 409);
        }
        await conn.query("UPDATE doce_encanto.pedido SET status='ENTREGUE' WHERE id_pedido=$1", [id]);
        await conn.query("UPDATE doce_encanto.entrega SET status='ENTREGUE',entregue_em=now() WHERE id_pedido=$1", [id]);
        await conn.query(`INSERT INTO doce_encanto.confirmacao_recebimento(id_pedido,id_cliente)
    VALUES($1,$2)`, [id, req.user.id_cliente]);
        const delivery = await conn.query('SELECT id_entrega FROM doce_encanto.entrega WHERE id_pedido=$1', [id]);
        if (delivery.rows[0]) {
            await conn.query(`INSERT INTO doce_encanto.evento_rastreio(id_entrega,status,descricao)
     VALUES($1,'ENTREGUE',$2)`, [delivery.rows[0].id_entrega, 'Recebimento confirmado pelo próprio cliente no site (demonstração).']);
        }
        return id;
    });
    res.json({ id: `DE-${String(result).padStart(6, '0')}`, status: 'ENTREGUE', mensagem: 'Recebimento confirmado! Obrigado por avisar a confeitaria.' });
}));
app.get('/api/pedidos/:id/conversa', requireAuth, requireClient, asyncRoute(async (req, res) => {
    const mensagens = await listConversation(query, orderId(req.params.id), req.user.id_cliente);
    res.json({ mensagens });
}));
app.post('/api/pedidos/:id/mensagens', requireAuth, requireClient, asyncRoute(async (req, res) => {
    const mensagem = await sendMessage(query, orderId(req.params.id), req.user.id_cliente, 'CLIENTE', req.body?.mensagem, req.user.id_cliente);
    res.status(201).json({ mensagem });
}));
app.use('/api/pagamentos/pix-demo', createPixDemoRouter({ query, transaction, requireAuth, requireClient }));
app.use('/api/admin', createAdminRouter({ query, transaction, requireAuth }));
app.use('/api/avaliacoes', createFeedbackRouter({ query }));
app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
const publicDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(publicDir, { index: 'index.html', dotfiles: 'deny', extensions: ['html'] }));
app.use((err, _req, res, _next) => {
    const status = err.status || ((err.type === 'entity.too.large' || err.type === 'entity.parse.failed') ? 400 : 500);
    if (status === 500) {
        console.error('Erro interno:', err);
    }
    res.status(status).json({ erro: status === 500 ? 'Erro interno do servidor.' : err.message });
});
module.exports = { app };
