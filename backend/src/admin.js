'use strict';
const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const sharp = require('sharp');
const { fail } = require('./core');
const {
    nextStatusAllowed,
    paymentDemoAllowed,
    deliveryStatus,
    trackingStatus,
    validateNotice
} = require('./admin-policy');
const { listConversation, sendMessage } = require('./conversas');
// Valida os identificadores recebidos nas rotas.
const integerId = value => {
    const n = Number(value);
    if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(n) || n < 1)
        fail('Identificador inválido.');
    return n;
};
const moneyCents = value => Math.round(Number(value) * 100);
const formatId = id => `DE-${String(id).padStart(6, '0')}`;
const cleanText = (value, max, label) => {
    if (typeof value !== 'string')
        fail(`${label} deve ser texto.`);
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > max)
        fail(`${label} deve ter de 2 a ${max} caracteres.`);
    return trimmed;
};
const validPrice = value => {
    if (!Number.isSafeInteger(value) || value < 100 || value > 1000000)
        fail('Preço deve estar entre R$ 1,00 e R$ 10.000,00 (em centavos).');
    return (value / 100).toFixed(2);
};
const categories = new Map([['classicos', 'Clássicos'], ['especiais', 'Especiais'], ['frutados', 'Frutados']]);
const uploadedFolder = path.resolve(__dirname, '../../frontend/uploads/cupcakes');
const isUploadedUrl = url => /^uploads\/cupcakes\/[0-9a-f-]{36}\.webp$/.test(String(url));
const fileUploader = multer({
    storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
}).single('foto');
const safeSlug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 75);
function createAdminRouter({ query, transaction, requireAuth }) {
    const router = express.Router();
    router.use(requireAuth);
    router.use((req, res, next) => req.user.papel === 'ADMIN' ? next() : res.status(403).json({ erro: 'Acesso exclusivo de administradores.' }));
    const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    // A rota de upload não é pública: autenticação ADMIN ocorre antes.
    router.post('/uploads/foto', (req, res, next) => {
        fileUploader(req, res, error => error ? res.status(400).json({ erro: error.code === 'LIMIT_FILE_SIZE' ? 'Imagem deve ter até 6 MB.' : 'Falha no envio da imagem.' }) : next());
    }, asyncRoute(async (req, res) => {
        if (!req.file)
            fail('Escolha uma imagem JPG, PNG ou WebP de até 6 MB.');
        const image = sharp(req.file.buffer, { limitInputPixels: 25000000, failOn: 'error' });
        const metadata = await image.metadata().catch(() => null);
        if (!metadata || !['jpeg', 'png', 'webp'].includes(metadata.format) || !metadata.width || !metadata.height || metadata.width > 5000 || metadata.height > 5000)
            fail('Imagem inválida ou muito grande: máximo 5000 × 5000 pixels.');
        const name = crypto.randomUUID() + '.webp';
        await fs.mkdir(uploadedFolder, { recursive: true });
        await image.rotate().resize({ width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toFile(path.join(uploadedFolder, name));
        res.status(201).json({ imagemUrl: `uploads/cupcakes/${name}`, mensagem: 'Foto carregada e otimizada.' });
    }));
    async function productImage(body, original = null) {
        if (body.imagemUrl !== undefined) {
            const url = String(body.imagemUrl || '');
            if (!isUploadedUrl(url))
                fail('Imagem enviada inválida. Escolha uma foto na galeria do computador.');
            try {
                await fs.access(path.join(uploadedFolder, path.basename(url)));
            }
            catch {
                fail('Arquivo de imagem não encontrado. Envie novamente.');
            }
            return url;
        }
        if (original)
            return original;
        fail('Selecione uma imagem na galeria para o novo cupcake.');
    }
    router.get('/avaliacoes', asyncRoute(async (_req, res) => {
        const { rows } = await query(`SELECT id_avaliacao, perfil_testado, dispositivo, nota_navegacao,
            nota_visual, nota_facilidade, concluiu_tarefa, ponto_positivo, dificuldade,
            sugestao, criado_em FROM doce_encanto.avaliacao_usabilidade
            ORDER BY criado_em DESC LIMIT 100`);
        res.json({ avaliacoes: rows });
    }));
    // Indicadores apresentados no painel administrativo.
    router.get('/resumo', asyncRoute(async (_req, res) => {
        const { rows } = await query(`SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status='AGUARDANDO_PAGAMENTO')::int AS aguardando,
      count(*) FILTER (WHERE status='CONFIRMADO')::int AS confirmados,
      count(*) FILTER (WHERE status='ACEITO')::int AS aceitos,
      count(*) FILTER (WHERE status='PREPARANDO')::int AS preparando,
      count(*) FILTER (WHERE status='PRONTO_RETIRADA')::int AS aguardando_entregador,
      count(*) FILTER (WHERE status='EM_ENTREGA')::int AS em_entrega,
      count(*) FILTER (WHERE status='ENTREGUE')::int AS entregues,
      coalesce(sum(total) FILTER (WHERE status<>'CANCELADO'),0) AS valor_pedidos
    FROM doce_encanto.pedido`);
        const { rows: products } = await query("SELECT count(*)::int AS total FROM doce_encanto.produto WHERE disponivel AND slug<>'personalizado'");
        const r = rows[0];
        res.json({ resumo: { ...r, modo_demonstracao: paymentDemoAllowed(process.env), valor_pedidos_centavos: moneyCents(r.valor_pedidos), produtos_ativos: products[0].total, observacao: 'Valor de pedidos de demonstração, NÃO faturamento nem pagamentos reais.' } });
    }));
    // Consulta dos pedidos da confeitaria.
    router.get('/pedidos', asyncRoute(async (req, res) => {
        const status = String(req.query.status || 'TODOS');
        const allowed = ['TODOS', 'AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'ACEITO', 'PREPARANDO', 'PRONTO_RETIRADA', 'EM_ENTREGA', 'ENTREGUE', 'CANCELADO'];
        if (!allowed.includes(status))
            fail('Filtro de status inválido.');
        const { rows } = await query(`SELECT p.id_pedido,p.realizado_em,p.status,p.subtotal,p.desconto,p.taxa_entrega,p.total,
    c.nome AS cliente_nome,c.email AS cliente_email,pg.status AS pagamento_status,
    e.status AS entrega_status,
    EXISTS(SELECT 1 FROM doce_encanto.mensagem_pedido m WHERE m.id_pedido=p.id_pedido AND m.origem='CLIENTE') AS tem_resposta
    FROM doce_encanto.pedido p
    JOIN doce_encanto.cliente c ON c.id_cliente=p.id_cliente
    LEFT JOIN doce_encanto.entrega e ON e.id_pedido=p.id_pedido
    LEFT JOIN doce_encanto.confirmacao_recebimento cr ON cr.id_pedido=p.id_pedido
    LEFT JOIN LATERAL (SELECT status FROM doce_encanto.pagamento WHERE id_pedido=p.id_pedido ORDER BY criado_em DESC LIMIT 1) pg ON TRUE
    WHERE ($1='TODOS' OR p.status=$1)
    ORDER BY p.realizado_em DESC,p.id_pedido DESC LIMIT 100`, [status]);
        res.json({
            pedidos: rows.map(r => ({
                id: formatId(r.id_pedido), idNumerico: String(r.id_pedido), cliente: r.cliente_nome, email: r.cliente_email,
                criadoEm: r.realizado_em, status: r.status, pagamento: r.pagamento_status, entrega: r.entrega_status, recebimentoConfirmadoEm: r.recebimento_confirmado_em,
                totalCentavos: moneyCents(r.total), temResposta: r.tem_resposta
            }))
        });
    }));
    router.get('/pedidos/:id', asyncRoute(async (req, res) => {
        const id = integerId(req.params.id);
        const { rows } = await query(`SELECT p.*,c.nome AS cliente_nome,c.email AS cliente_email,c.telefone,
     e.status AS entrega_status,pg.status AS pagamento_status,
     cr.confirmado_em AS recebimento_confirmado_em,
     en.logradouro,en.numero,en.complemento,en.bairro,en.cidade,en.uf,en.cep
    FROM doce_encanto.pedido p
    JOIN doce_encanto.cliente c ON c.id_cliente=p.id_cliente
    JOIN doce_encanto.endereco en ON en.id_endereco=p.id_endereco
    LEFT JOIN doce_encanto.entrega e ON e.id_pedido=p.id_pedido
    LEFT JOIN doce_encanto.confirmacao_recebimento cr ON cr.id_pedido=p.id_pedido
    LEFT JOIN LATERAL (SELECT status FROM doce_encanto.pagamento WHERE id_pedido=p.id_pedido ORDER BY criado_em DESC LIMIT 1) pg ON TRUE
    WHERE p.id_pedido=$1`, [id]);
        if (!rows[0])
            fail('Pedido não encontrado.', 404);
        const [itemResult, historyResult, noticesResult] = await Promise.all([
            query('SELECT id_item_pedido,nome_produto,quantidade,preco_unitario,configuracao FROM doce_encanto.item_pedido WHERE id_pedido=$1 ORDER BY id_item_pedido', [id]),
            query(`SELECT h.status_anterior,h.status_novo,h.observacao,h.criado_em,c.nome AS administrador FROM doce_encanto.historico_pedido_admin h
      JOIN doce_encanto.cliente c ON c.id_cliente=h.id_administrador WHERE id_pedido=$1 ORDER BY h.criado_em DESC`, [id]),
            query('SELECT tipo,mensagem,criado_em FROM doce_encanto.aviso_pedido WHERE id_pedido=$1 ORDER BY criado_em DESC LIMIT 25', [id])
        ]);
        const r = rows[0];
        res.json({
            pedido: {
                id: formatId(id), idNumerico: String(id), criadoEm: r.realizado_em, status: r.status,
                cliente: { nome: r.cliente_nome, email: r.cliente_email, telefone: r.telefone },
                endereco: {
                    logradouro: r.logradouro,
                    numero: r.numero,
                    complemento: r.complemento,
                    bairro: r.bairro,
                    cidade: r.cidade,
                    uf: r.uf,
                    cep: r.cep
                },
                pagamento: r.pagamento_status, entrega: r.entrega_status, recebimentoConfirmadoEm: r.recebimento_confirmado_em,
                subtotalCentavos: moneyCents(r.subtotal), descontoCentavos: moneyCents(r.desconto), freteCentavos: moneyCents(r.taxa_entrega), totalCentavos: moneyCents(r.total),
                itens: itemResult.rows.map(i => ({ id: String(i.id_item_pedido), nome: i.nome_produto, quantidade: i.quantidade, precoCentavos: moneyCents(i.preco_unitario), configuracao: i.configuracao })),
                historico: historyResult.rows, avisos: noticesResult.rows
            }
        });
    }));
    router.post('/pedidos/:id/pagamento-simulado', asyncRoute(async (req, res) => {
        if (!paymentDemoAllowed(process.env))
            return res.status(403).json({ erro: 'Simulação desativada. A aprovação real exige gateway de pagamentos.' });
        const id = integerId(req.params.id);
        await transaction(async (conn) => {
            const { rows } = await conn.query('SELECT status FROM doce_encanto.pedido WHERE id_pedido=$1 FOR UPDATE', [id]);
            if (!rows[0])
                fail('Pedido não encontrado.', 404);
            if (rows[0].status !== 'AGUARDANDO_PAGAMENTO')
                fail('Este pedido não está aguardando pagamento.', 409);
            const result = await conn.query(`UPDATE doce_encanto.pagamento SET status='APROVADO',processado_em=now(),referencia_externa=$2
     WHERE id_pagamento=(SELECT id_pagamento FROM doce_encanto.pagamento WHERE id_pedido=$1 ORDER BY criado_em DESC LIMIT 1)
     AND status='PENDENTE' RETURNING id_pagamento`, [id, `DEMO-${id}`]);
            if (!result.rows[0])
                fail('Pagamento pendente não encontrado.', 409);
            await conn.query("UPDATE doce_encanto.pedido SET status='CONFIRMADO' WHERE id_pedido=$1", [id]);
            await conn.query(`INSERT INTO doce_encanto.historico_pedido_admin(id_pedido,id_administrador,status_anterior,status_novo,observacao)
     VALUES($1,$2,'AGUARDANDO_PAGAMENTO','CONFIRMADO','APROVAÇÃO SIMULADA — nenhum pagamento real foi realizado.')`, [id, req.user.id_cliente]);
            const { rows: delivery } = await conn.query('SELECT id_entrega FROM doce_encanto.entrega WHERE id_pedido=$1', [id]);
            if (delivery[0])
                await conn.query(`INSERT INTO doce_encanto.evento_rastreio(id_entrega,status,descricao) VALUES($1,'PEDIDO_RECEBIDO',$2)`, [delivery[0].id_entrega, 'Pagamento SIMULADO para apresentação acadêmica.']);
        });
        res.json({ mensagem: 'Pagamento simulado aprovado. Nenhuma cobrança real foi realizada.', status: 'CONFIRMADO' });
    }));
    // Atualiza a etapa do pedido e registra o histórico.
    router.patch('/pedidos/:id/status', asyncRoute(async (req, res) => {
        const id = integerId(req.params.id), nextStatus = String(req.body?.status || '');
        const reason = typeof req.body?.motivo === 'string' ? req.body.motivo.trim() : '';
        if (nextStatus === 'CANCELADO' && (reason.length < 8 || reason.length > 240))
            fail('Descreva o motivo do cancelamento (8 a 240 caracteres).');
        const explanations = {
            ACEITO: 'A confeitaria aceitou o pedido e iniciará a produção.',
            PREPARANDO: 'A confeitaria começou a preparar os cupcakes.',
            PRONTO_RETIRADA: 'Cupcakes prontos. Aguardando retirada pelo entregador.',
            EM_ENTREGA: 'A encomenda foi marcada como a caminho (sem GPS real).',
            CANCELADO: `Pedido cancelado. Motivo: ${reason}`
        };
        if (!Object.hasOwn(explanations, nextStatus))
            fail('Situação de pedido inválida.');
        await transaction(async (conn) => {
            const { rows } = await conn.query('SELECT status FROM doce_encanto.pedido WHERE id_pedido=$1 FOR UPDATE', [id]);
            if (!rows[0])
                fail('Pedido não encontrado.', 404);
            const old = rows[0].status;
            if (!nextStatusAllowed(old, nextStatus))
                fail(`Mudança não permitida: ${old} → ${nextStatus}.`, 409);
            await conn.query('UPDATE doce_encanto.pedido SET status=$2 WHERE id_pedido=$1', [id, nextStatus]);
            await conn.query(`UPDATE doce_encanto.entrega
     SET status=$2
     WHERE id_pedido=$1`, [id, deliveryStatus[nextStatus]]);
            const delivery = await conn.query('SELECT id_entrega FROM doce_encanto.entrega WHERE id_pedido=$1', [id]);
            if (delivery.rows[0])
                await conn.query('INSERT INTO doce_encanto.evento_rastreio(id_entrega,status,descricao) VALUES($1,$2,$3)', [delivery.rows[0].id_entrega, trackingStatus[nextStatus], explanations[nextStatus]]);
            await conn.query(`INSERT INTO doce_encanto.historico_pedido_admin(id_pedido,id_administrador,status_anterior,status_novo,observacao)
     VALUES($1,$2,$3,$4,$5)`, [id, req.user.id_cliente, old, nextStatus, explanations[nextStatus]]);
            if (nextStatus === 'CANCELADO')
                await conn.query(`INSERT INTO doce_encanto.aviso_pedido(id_pedido,id_administrador,tipo,mensagem)
     VALUES($1,$2,'CANCELAMENTO',$3)`, [id, req.user.id_cliente, explanations[nextStatus]]);
        });
        res.json({ mensagem: 'Etapa atualizada e registrada no histórico.', status: nextStatus });
    }));
    router.get('/pedidos/:id/conversa', asyncRoute(async (req, res) => {
        const mensagens = await listConversation(query, integerId(req.params.id));
        res.json({ mensagens });
    }));
    router.post('/pedidos/:id/mensagens', asyncRoute(async (req, res) => {
        const mensagem = await sendMessage(query, integerId(req.params.id), req.user.id_cliente, 'ADMIN', req.body?.mensagem);
        res.status(201).json({ mensagem });
    }));
    // Salva os recados enviados pela confeitaria.
    router.post('/pedidos/:id/avisos', asyncRoute(async (req, res) => {
        const id = integerId(req.params.id);
        const tipo = String(req.body?.tipo || ''), mensagem = req.body?.mensagem;
        const validation = validateNotice(tipo, mensagem);
        if (validation)
            fail(validation);
        await transaction(async (conn) => {
            const result = await conn.query('SELECT status FROM doce_encanto.pedido WHERE id_pedido=$1 FOR UPDATE', [id]);
            if (!result.rows[0])
                fail('Pedido não encontrado.', 404);
            if (['ENTREGUE', 'CANCELADO'].includes(result.rows[0].status))
                fail('Não é possível enviar esse aviso após a finalização do pedido.', 409);
            await conn.query(`INSERT INTO doce_encanto.aviso_pedido(id_pedido,id_administrador,tipo,mensagem) VALUES($1,$2,$3,$4)`, [id, req.user.id_cliente, tipo, mensagem.trim()]);
            if (tipo === 'ATRASO') {
                const target = req.body?.novaPrevisao;
                if (target) {
                    const dt = new Date(target);
                    if (!Number.isFinite(dt.getTime()) || dt.getTime() <= Date.now() || dt.getTime() > Date.now() + 30 * 864e5)
                        fail('Informe uma nova previsão futura em até 30 dias.');
                    await conn.query('UPDATE doce_encanto.entrega SET previsao_entrega=$2 WHERE id_pedido=$1', [id, dt.toISOString()]);
                }
            }
            const d = await conn.query('SELECT id_entrega FROM doce_encanto.entrega WHERE id_pedido=$1', [id]);
            if (d.rows[0])
                await conn.query("INSERT INTO doce_encanto.evento_rastreio(id_entrega,status,descricao) VALUES ($1,'OCORRENCIA',$2)", [d.rows[0].id_entrega, mensagem.trim().slice(0, 250)]);
        });
        res.status(201).json({ mensagem: 'Aviso salvo. O cliente verá a mensagem ao consultar o pedido no site.' });
    }));
    router.get('/produtos', asyncRoute(async (_req, res) => {
        const { rows } = await query(`SELECT p.id_produto,p.slug,p.nome,p.descricao,p.preco,p.imagem_url,p.disponivel,c.nome AS categoria
   FROM doce_encanto.produto p JOIN doce_encanto.categoria c ON c.id_categoria=p.id_categoria
   WHERE p.slug<>'personalizado' ORDER BY p.nome`);
        res.json({ produtos: rows.map(r => ({ id: String(r.id_produto), slug: r.slug, nome: r.nome, descricao: r.descricao, precoCentavos: moneyCents(r.preco), imagem: r.imagem_url, disponivel: r.disponivel, categoria: r.categoria })) });
    }));
    router.patch('/produtos/:id', asyncRoute(async (req, res) => {
        const id = integerId(req.params.id), data = req.body || {};
        const { rows } = await query("SELECT id_produto,nome,descricao,preco,disponivel,imagem_url FROM doce_encanto.produto WHERE id_produto=$1 AND slug<>'personalizado'", [id]);
        if (!rows[0])
            fail('Produto não encontrado.', 404);
        const previous = rows[0];
        const nome = data.nome === undefined ? previous.nome : cleanText(data.nome, 120, 'Nome');
        const descricao = data.descricao === undefined ? previous.descricao : cleanText(data.descricao, 500, 'Descrição');
        const preco = data.precoCentavos === undefined ? previous.preco : validPrice(data.precoCentavos);
        if (data.disponivel !== undefined && typeof data.disponivel !== 'boolean')
            fail('Disponibilidade inválida.');
        const disponivel = data.disponivel === undefined ? previous.disponivel : data.disponivel;
        const imagem = await productImage(data, previous.imagem_url);
        await query('UPDATE doce_encanto.produto SET nome=$2,descricao=$3,preco=$4,disponivel=$5,imagem_url=$6 WHERE id_produto=$1', [id, nome, descricao, preco, disponivel, imagem]);
        res.json({ mensagem: 'Produto atualizado com sucesso.' });
    }));
    router.post('/produtos', asyncRoute(async (req, res) => {
        const body = req.body || {}, nome = cleanText(body.nome, 120, 'Nome'), descricao = cleanText(body.descricao, 500, 'Descrição');
        const preco = validPrice(body.precoCentavos), category = categories.get(body.categoria);
        if (!category)
            fail('Selecione uma categoria válida.');
        const imagem = await productImage(body);
        const slug = safeSlug(nome);
        if (slug.length < 3 || slug === 'personalizado')
            fail('Nome inválido para o endereço do produto.');
        try {
            const { rows } = await query(`INSERT INTO doce_encanto.produto(id_categoria,slug,nome,descricao,preco,imagem_url,disponivel)
     SELECT id_categoria,$2,$3,$4,$5,$6,TRUE FROM doce_encanto.categoria WHERE nome=$1 RETURNING id_produto`, [category, slug, nome, descricao, preco, imagem]);
            if (!rows[0])
                fail('Categoria não encontrada. Execute db:setup.', 400);
            res.status(201).json({ mensagem: 'Novo cupcake cadastrado.', id: String(rows[0].id_produto), slug });
        }
        catch (error) {
            if (error.code === '23505')
                fail('Já existe produto com este nome ou identificador.', 409);
            throw error;
        }
    }));
    return router;
}
module.exports = { createAdminRouter };
