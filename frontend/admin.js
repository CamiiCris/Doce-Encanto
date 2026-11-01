(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = cents => (Number(cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const date = v => new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    // Nomes das etapas usados no painel.
    const labels = {
        AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
        CONFIRMADO: 'Pedido feito',
        ACEITO: 'Pedido aceito',
        PREPARANDO: 'Preparando',
        PRONTO_RETIRADA: 'Aguardando motoboy',
        EM_ENTREGA: 'Indo até você',
        ENTREGUE: 'Entregue',
        CANCELADO: 'Cancelado'
    };
    // Nomes dos ingredientes dos cupcakes personalizados.
    const recipes = {
        massa: { baunilha: 'Baunilha', chocolate: 'Chocolate', red: 'Red Velvet' },
        recheio: { 'doce-leite': 'Doce de leite', brigadeiro: 'Brigadeiro', avela: 'Creme de avelã', morango: 'Morango' },
        cobertura: { rosa: 'Chantilly rosa', pistache: 'Pistache', chocolate: 'Chocolate', tropical: 'Maracujá', baunilha: 'Coco', blueberry: 'Mirtilo', framboesa: 'Framboesa', limao: 'Limão' }
    };
    const categories = [['classicos', 'Clássicos'], ['especiais', 'Especiais'], ['frutados', 'Frutados']];
    let currentUser = null, orders = [], products = [], demo = false, section = 'inicio', shownOrder = null;
    let activeChatOrderId = null;
    async function api(path, method = 'GET', body) {
        let res;
        try {
            res = await fetch('/api' + path, { method, credentials: 'same-origin', cache: 'no-store', headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
        }
        catch {
            throw new Error('Servidor indisponível. Inicie o Node.js em http://localhost:3000.');
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok)
            throw new Error(data.erro || 'Não foi possível concluir sua solicitação.');
        return data;
    }
    function flash(text, error = false) { const el = $('flash'); el.hidden = false; el.classList.toggle('error', error); el.textContent = text; window.clearTimeout(flash.timer); flash.timer = setTimeout(() => el.hidden = true, 8500); }
    function setSession(user) {
        currentUser = user;
        const valid = user?.papel === 'ADMIN';
        $('admin-view').hidden = !valid;
        $('login-view').hidden = valid;
        if (valid) {
            $('admin-name').textContent = user.nome;
            showSection(section);
        }
        else {
            $('login-error').hidden = true;
            $('reset-session').hidden = !user;
        }
    }
    async function bootstrap() {
        try {
            const { usuario } = await api('/auth/eu?perfil=ADMIN');
            setSession(usuario);
            if (usuario?.papel === 'ADMIN')
                await reload();
        }
        catch (error) {
            setSession(null);
            $('login-error').hidden = false;
            $('login-error').textContent = error.message;
        }
    }
    const badge = status => `<span class="pill ${esc(status)}">${esc(labels[status] || status || '—')}</span>`;
    function ordersTable(data) {
        if (!data.length)
            return `<div class="empty">🧁 Ainda não há encomendas nessa seleção. Entre como Cliente no site e faça um pedido de teste!</div>`;
        return `<table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Situação</th><th></th></tr></thead><tbody>${data.map(o => `<tr><td><strong>#${esc(o.id)}</strong></td><td>${esc(o.cliente)}<small>${esc(o.email)}</small>${o.temResposta ? '<small class="client-replied">💬 Cliente enviou mensagem</small>' : ''}</td><td>${date(o.criadoEm)}</td><td><strong>${fmt(o.totalCentavos)}</strong></td><td>${badge(o.status)}</td><td><button class="table-link" data-order-id="${esc(o.idNumerico)}">Detalhes →</button></td></tr>`).join('')}</tbody></table>`;
    }
    function renderStats(summary) {
        demo = summary.modo_demonstracao === true;
        const cards = [['Encomendas', summary.total, '🛍️'], ['Aguardando pagamento', summary.aguardando, '⏳'], ['Aguardando entregador', summary.aguardando_entregador, '🚚'], ['Pedidos (não é receita real)', fmt(summary.valor_pedidos_centavos), '💗']];
        $('stats').innerHTML = cards.map(([label, value, emoji]) => `<article class="stat"><i aria-hidden="true">${emoji}</i><strong>${esc(value)}</strong><span>${esc(label)}</span></article>`).join('');
    }
    function renderOrders() {
        const filter = $('order-filter').value;
        $('all-orders').innerHTML = ordersTable(orders.filter(o => filter === 'TODOS' || o.status === filter));
        $('recent-orders').innerHTML = ordersTable(orders.slice(0, 5));
    }
    function renderProducts() {
        $('all-products').innerHTML = products.length ? products.map(p => `<article class="product-entry"><img src="${esc(p.imagem || 'assets/cupcakes/morango.webp')}" alt="Cupcake ${esc(p.nome)}" /><div><strong>${esc(p.nome)}</strong><small>${esc(p.categoria)} • ${esc(p.descricao)}</small></div><span class="product-price">${fmt(p.precoCentavos)}</span><span class="pill ${p.disponivel ? 'CONFIRMADO' : 'CANCELADO'}">${p.disponivel ? 'Disponível' : 'Indisponível'}</span><button class="table-link" data-product-id="${esc(p.id)}">Editar →</button></article>`).join('') : '<p class="empty">Nenhum cupcake encontrado.</p>';
    }
    async function reload() {
        try {
            const [sum, orderData, productData] = await Promise.all([api('/admin/resumo'), api('/admin/pedidos'), api('/admin/produtos')]);
            orders = orderData.pedidos;
            products = productData.produtos;
            renderStats(sum.resumo);
            renderOrders();
            renderProducts();
            renderChatOrderList();
        }
        catch (error) {
            flash(error.message, true);
            if (/Acesso exclusivo|Entre na sua conta/.test(error.message))
                setSession(null);
        }
    }
    const headings = {
        inicio: ['Visão geral', 'Bom dia, confeitaria! ♡'],
        pedidos: ['Encomendas', 'Cada pedido, um encanto ♡'],
        mensagens: ['Mensagens', 'Atendimento aos clientes ♡'],
        produtos: ['Cupcakes e preços', 'Nossa vitrine de sabores ♡'],
        avaliacoes: ['Avaliações', 'O que os avaliadores acharam ♡']
    };
    function showSection(next) {
        if (!headings[next])
            next = 'inicio';
        section = next;
        document.querySelectorAll('.panel-section').forEach(e => e.hidden = e.id !== `section-${next}`);
        document.querySelectorAll('[data-section]').forEach(e => e.classList.toggle('active', e.dataset.section === next));
        $('breadcrumb').textContent = headings[next][0];
        $('page-heading').textContent = headings[next][1];
        location.hash = next;
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    function openDrawer(overline, title, html) { $('drawer-overline').textContent = overline; $('drawer-title').textContent = title; $('drawer-content').innerHTML = html; $('drawer-backdrop').hidden = false; $('detail-drawer').classList.add('open'); $('detail-drawer').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('close-drawer').focus(); }
    function closeDrawer() { $('drawer-backdrop').hidden = true; $('detail-drawer').classList.remove('open'); $('detail-drawer').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; shownOrder = null; }
    function description(recipe) {
        if (!recipe || typeof recipe !== 'object')
            return 'Cupcake do catálogo';
        return `Massa: ${esc(recipes.massa[recipe.massa] || recipe.massa || '?')}<br />Recheio: ${esc(recipes.recheio[recipe.recheio] || recipe.recheio || '?')}<br />Cobertura: ${esc(recipes.cobertura[recipe.cobertura] || recipe.cobertura || '?')}`;
    }
    const transitions = {
        AGUARDANDO_PAGAMENTO: ['CANCELADO'],
        CONFIRMADO: ['ACEITO', 'CANCELADO'],
        ACEITO: ['PREPARANDO', 'CANCELADO'],
        PREPARANDO: ['PRONTO_RETIRADA', 'CANCELADO'],
        PRONTO_RETIRADA: ['EM_ENTREGA', 'CANCELADO'],
        EM_ENTREGA: []
    };
    const buttonText = {
        ACEITO: 'Aceitar pedido',
        PREPARANDO: 'Iniciar preparação',
        PRONTO_RETIRADA: 'Pronto: aguardando motoboy',
        EM_ENTREGA: 'Motoboy saiu: indo até você',
        CANCELADO: 'Cancelar pedido'
    };
    function renderChatOrderList() {
        const holder = $('admin-chat-orders');
        if (!holder)
            return;
        holder.innerHTML = orders.length ? orders.map(order => `<button type="button" class="admin-chat-order ${order.idNumerico === activeChatOrderId ? 'selected' : ''}" data-admin-chat-order="${esc(order.idNumerico)}"><strong>${esc(order.id)} · ${esc(order.cliente)}</strong><small>${esc(labels[order.status] || order.status)}</small>${order.temResposta ? '<span>Mensagem do cliente</span>' : ''}</button>`).join('') : '<p class="loading">Nenhum pedido cadastrado.</p>';
    }
    async function openAdminChat(id) {
        activeChatOrderId = String(id);
        closeDrawer();
        showSection('mensagens');
        renderChatOrderList();
        const order = orders.find(item => item.idNumerico === activeChatOrderId);
        $('admin-chat-title').textContent = order ? `Conversa do pedido ${order.id} · ${order.cliente}` : `Conversa do pedido #${id}`;
        $('admin-message-form').hidden = false;
        $('notice-form').hidden = Boolean(order && ['ENTREGUE', 'CANCELADO'].includes(order.status));
        await loadAdminConversation(id);
    }
    async function loadAdminConversation(id = activeChatOrderId) {
        const holder = $('admin-conversation');
        if (!holder || !id)
            return;
        holder.textContent = 'Buscando mensagens...';
        try {
            const data = await api(`/admin/pedidos/${id}/conversa`);
            if (String(id) !== activeChatOrderId)
                return;
            holder.innerHTML = data.mensagens.length ? data.mensagens.map(m => `<article class="admin-chat-entry ${m.origem === 'CLIENTE' ? 'from-customer' : ''}"><strong>${m.origem === 'CLIENTE' ? 'Cliente' : m.classe === 'AVISO' ? 'Aviso enviado' : 'Confeitaria'}</strong>${m.tipo ? `<small>${esc(m.tipo)}</small>` : ''}<p>${esc(m.mensagem)}</p><time>${date(m.criadoEm)}</time></article>`).join('') : '<p class="loading">Ainda não há mensagens.</p>';
            holder.scrollTop = holder.scrollHeight;
        }
        catch (error) {
            holder.textContent = error.message;
        }
    }
    async function sendAdminMessage(event) {
        event.preventDefault();
        if (!activeChatOrderId)
            return;
        const id = activeChatOrderId, field = $('admin-message-input');
        const message = field.value.trim();
        if (message.length < 2 || message.length > 1000) {
            flash('Mensagem deve ter de 2 a 1000 caracteres.', true);
            return;
        }
        const button = event.currentTarget.querySelector('[type=submit]');
        button.disabled = true;
        try {
            await api(`/admin/pedidos/${id}/mensagens`, 'POST', { mensagem: message });
            field.value = '';
            await loadAdminConversation(id);
            flash('Resposta enviada ao cliente.');
        }
        catch (error) {
            flash(error.message, true);
        }
        finally {
            button.disabled = false;
        }
    }
    async function detailOrder(id) {
        try {
            const { pedido: p } = await api(`/admin/pedidos/${id}`);
            shownOrder = p;
            let actions = '';
            if (p.status === 'AGUARDANDO_PAGAMENTO' && demo) {
                actions += '<button class="btn primary" data-simulate-pay="1">✓ Simular pagamento aprovado (teste)</button><p class="demo-disclaimer">⚠️ Somente para apresentação acadêmica: NÃO cobra Pix/cartão nem comprova pagamento.</p>';
            }
            else if (p.status === 'AGUARDANDO_PAGAMENTO') {
                actions += '<p class="demo-disclaimer">Aguardando pagamento. Simulação desativada: configure DEMO_MODE=true apenas localmente.</p>';
            }
            for (const status of transitions[p.status] || []) {
                actions += `<button class="btn ${status === 'CANCELADO' ? 'danger' : 'primary'}" data-change-status="${status}">${buttonText[status]}</button>`;
            }
            if (!actions)
                actions = '<p class="demo-disclaimer">Pedido finalizado. Não há novas etapas disponíveis.</p>';
            const productsHtml = p.itens.map(i => {
                let photo = 'assets/cupcakes/morango.webp';
                if (i.configuracao) {
                    photo = window.DoceCupcakeVisual?.src(i.configuracao) || photo;
                }
                else {
                    const product = products.find(x => x.nome === i.nome);
                    photo = product?.imagem || 'assets/cupcakes/morango.webp';
                }
                return `<div class="item-row"><img src="${esc(photo)}" alt="" /><div><strong>${esc(i.nome)}</strong><small>${description(i.configuracao)}</small><small>Quantidade: ${i.quantidade}</small></div><span class="item-meta">${fmt(i.precoCentavos * i.quantidade)}</span></div>`;
            }).join('');
            const addr = [p.endereco.logradouro, p.endereco.numero, p.endereco.complemento, p.endereco.bairro, `${p.endereco.cidade}/${p.endereco.uf}`, p.endereco.cep].filter(Boolean).map(esc).join(', ');
            const history = p.historico.length ? p.historico.map(h => `<div class="step"><div><strong>${esc(labels[h.status_novo] || h.status_novo)}</strong><time>${date(h.criado_em)} · ${esc(h.administrador)}</time><small>${esc(h.observacao || '')}</small></div></div>`).join('') : '<p class="loading">O histórico começa na primeira atualização administrativa.</p>';
            openDrawer('DETALHES DA ENCOMENDA', p.id, `<section class="drawer-section"><div class="drawer-kv"><span>Situação</span>${badge(p.status)}</div>${p.recebimentoConfirmadoEm ? `<div class="drawer-kv"><span>Recebido pelo cliente em</span><strong>${date(p.recebimentoConfirmadoEm)}</strong></div>` : ''}<div class="drawer-kv"><span>Pagamento</span><strong>${esc(p.pagamento || '—')}${p.pagamento === 'APROVADO' ? ' (simulado)' : ''}</strong></div><div class="drawer-kv"><span>Data</span><strong>${date(p.criadoEm)}</strong></div></section>
     <section class="drawer-section"><h3>Cliente e entrega</h3><div class="drawer-kv"><span>Cliente</span><strong>${esc(p.cliente.nome)}</strong></div><div class="drawer-kv"><span>E-mail</span><strong>${esc(p.cliente.email)}</strong></div><div class="drawer-kv"><span>Telefone</span><strong>${esc(p.cliente.telefone || '—')}</strong></div><p style="font-size:12px;color:#8d6976">📍 ${addr}</p></section>
     <section class="drawer-section"><h3>O que foi pedido?</h3>${productsHtml}<div class="drawer-kv"><span>Subtotal</span><strong>${fmt(p.subtotalCentavos)}</strong></div><div class="drawer-kv"><span>Desconto</span><strong>- ${fmt(p.descontoCentavos)}</strong></div><div class="drawer-kv"><span>Entrega</span><strong>${fmt(p.freteCentavos)}</strong></div><div class="drawer-kv"><span>Total</span><strong>${fmt(p.totalCentavos)}</strong></div></section>
     <section class="drawer-section"><h3>Próxima etapa</h3><div class="action-stack">${actions}</div></section>
     <section class="drawer-section"><h3>Atendimento</h3><p class="conversation-help">Os avisos e as mensagens ficam na seção Mensagens, separada das etapas do pedido.</p><button class="btn outline" type="button" data-admin-chat="${esc(p.idNumerico)}">Abrir conversa com o cliente</button></section>
     <section class="drawer-section"><h3>Histórico da confeitaria</h3><div class="steps">${history}</div></section>`);
        }
        catch (error) {
            flash(error.message, true);
        }
    }
    async function perform(action, status) {
        if (!shownOrder)
            return;
        const id = shownOrder.idNumerico;
        if (action === 'simulate' && !confirm('Confirmar pagamento SIMULADO? Nenhum valor será cobrado; é apenas um teste acadêmico.'))
            return;
        let motivo = '';
        if (action === 'status' && status === 'CANCELADO') {
            motivo = prompt('Por que este pedido será cancelado? O cliente verá esta explicação. (mínimo de 8 caracteres)') || '';
            if (!motivo)
                return;
            if (motivo.trim().length < 8 || motivo.trim().length > 240) {
                flash('Informe um motivo entre 8 e 240 caracteres.', true);
                return;
            }
            if (!confirm('Confirmar cancelamento? A ação não estorna pagamentos reais.'))
                return;
        }
        try {
            const response = action === 'simulate' ? await api(`/admin/pedidos/${id}/pagamento-simulado`, 'POST', {}) : await api(`/admin/pedidos/${id}/status`, 'PATCH', { status, motivo });
            flash(response.mensagem);
            await reload();
            await detailOrder(id);
        }
        catch (error) {
            flash(error.message, true);
        }
    }
    async function sendNotice(event) {
        event.preventDefault();
        if (!activeChatOrderId)
            return;
        const form = event.currentTarget;
        if (!form.reportValidity())
            return;
        const data = new FormData(form);
        const payload = { tipo: String(data.get('tipo')), mensagem: String(data.get('mensagem') || '').trim() };
        if (payload.tipo === 'ATRASO' && data.get('novaPrevisao')) {
            const value = new Date(data.get('novaPrevisao'));
            if (!Number.isFinite(value.getTime())) {
                flash('A previsão informada não é uma data válida.', true);
                return;
            }
            payload.novaPrevisao = value.toISOString();
        }
        const button = form.querySelector('button[type=submit]');
        button.disabled = true;
        const id = activeChatOrderId;
        try {
            const response = await api(`/admin/pedidos/${id}/avisos`, 'POST', payload);
            flash(response.mensagem);
            form.reset();
            await loadAdminConversation(id);
        }
        catch (error) {
            flash(error.message, true);
        }
        finally {
            button.disabled = false;
        }
    }
    async function uploadImage(file) {
        if (!file)
            return null;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 6 * 1024 * 1024)
            throw new Error('Escolha foto JPG, PNG ou WebP de até 6 MB.');
        const body = new FormData();
        body.append('foto', file);
        const response = await fetch('/api/admin/uploads/foto', { method: 'POST', body, credentials: 'same-origin' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
            throw new Error(payload.erro || 'Não foi possível enviar a imagem.');
        return payload.imagemUrl;
    }
    function productForm(p = null) {
        const editing = Boolean(p), picture = p?.imagem || 'assets/cupcakes/pistache.webp';
        const categoryMarkup = categories.map(([key, label]) => `<option value="${key}">${label}</option>`).join('');
        openDrawer('NOSSO CARDÁPIO', editing ? 'Editar cupcake' : 'Novo cupcake', `<form id="admin-product-form" class="form-grid" data-product-id="${editing ? esc(p.id) : ''}">
    <label>Nome do cupcake<input name="nome" required minlength="2" maxlength="120" value="${esc(p?.nome || '')}" placeholder="Ex: Encanto de Baunilha" /></label>
    <label>Descrição<textarea name="descricao" required minlength="2" maxlength="500" placeholder="Um sabor cheio de encanto...">${esc(p?.descricao || '')}</textarea></label>
    <label>Preço em reais (R$)<input name="preco" type="number" min="1" max="10000" step="0.01" required value="${editing ? (p.precoCentavos / 100).toFixed(2) : '19.90'}" /></label>
    ${editing ? '' : `<label>Categoria<select name="categoria">${categoryMarkup}</select></label>`}
    <label>Foto do cupcake — da sua galeria ${editing ? '(opcional)' : '(obrigatória)'}<input type="file" name="foto" id="photo-file" accept="image/jpeg,image/png,image/webp" ${editing ? '' : 'required'} /></label>
    <img id="product-thumbnail" class="product-thumbnail" src="${esc(picture)}" alt="Prévia da imagem escolhida" />
    ${editing ? `<label class="checkbox"><input type="checkbox" name="disponivel" ${p.disponivel ? 'checked' : ''} /> Disponível para venda</label>` : ''}
    <button class="btn primary" type="submit" id="save-product">${editing ? 'Salvar alterações' : 'Cadastrar novo cupcake'} →</button>
    <p class="demo-disclaimer">Escolha uma foto JPG, PNG ou WebP do computador, até 6 MB. A foto será otimizada em WebP e aparecerá no catálogo. Não é necessário usar fotos prontas da biblioteca.</p>
    </form>`);
        $('admin-product-form').addEventListener('submit', saveProduct);
        $('photo-file').addEventListener('change', event => {
            const file = event.target.files?.[0];
            if (!file)
                return;
            const target = $('product-thumbnail');
            if (target.dataset.blob)
                URL.revokeObjectURL(target.dataset.blob);
            target.dataset.blob = URL.createObjectURL(file);
            target.src = target.dataset.blob;
        });
    }
    async function saveProduct(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity())
            return;
        const data = new FormData(form), id = form.dataset.productId;
        const precoCentavos = Math.round(Number(data.get('preco')) * 100);
        if (!Number.isSafeInteger(precoCentavos) || precoCentavos < 100) {
            flash('Informe um preço válido.', true);
            return;
        }
        const payload = { nome: String(data.get('nome') || '').trim(), descricao: String(data.get('descricao') || '').trim(), precoCentavos };
        if (id) {
            payload.disponivel = data.get('disponivel') === 'on';
        }
        else
            payload.categoria = String(data.get('categoria'));
        const button = $('save-product');
        button.disabled = true;
        try {
            const newImage = await uploadImage(form.querySelector('#photo-file').files?.[0]);
            if (newImage)
                payload.imagemUrl = newImage;
            const result = id ? await api(`/admin/produtos/${id}`, 'PATCH', payload) : await api('/admin/produtos', 'POST', payload);
            closeDrawer();
            await reload();
            flash(result.mensagem);
        }
        catch (error) {
            flash(error.message, true);
        }
        finally {
            button.disabled = false;
        }
    }
    $('admin-login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = $('login-submit');
        button.disabled = true;
        $('login-error').hidden = true;
        try {
            const data = await api('/auth/entrar', 'POST', { email: $('login-email').value.trim(), senha: $('login-password').value, perfil: 'ADMIN' });
            $('login-password').value = '';
            if (data.usuario.papel !== 'ADMIN')
                throw new Error('Esta conta é de CLIENTE. Entre com a conta de ADMIN para acessar o painel.');
            setSession(data.usuario);
            await reload();
        }
        catch (error) {
            $('login-error').textContent = error.message;
            $('login-error').hidden = false;
        }
        finally {
            button.disabled = false;
        }
    });
    async function signout() {
        try {
            await api('/auth/sair', 'POST', { perfil: 'ADMIN' });
            closeDrawer();
            setSession(null);
            $('login-email').value = '';
            $('login-password').value = '';
        }
        catch (error) {
            flash(error.message, true);
        }
    }
    $('admin-signout').addEventListener('click', signout);
    $('reset-session').addEventListener('click', signout);
    document.querySelectorAll('[data-section]').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));
    document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.goto)));
    $('order-filter').addEventListener('change', renderOrders);
    $('refresh-orders').addEventListener('click', reload);
    $('refresh-messages').addEventListener('click', async () => {
        await reload();
        if (activeChatOrderId)
            await loadAdminConversation();
    });
    $('admin-message-form').addEventListener('submit', sendAdminMessage);
    $('notice-form').addEventListener('submit', sendNotice);
    $('new-product').addEventListener('click', () => productForm());
    $('close-drawer').addEventListener('click', closeDrawer);
    $('drawer-backdrop').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape')
            closeDrawer();
    });
    document.addEventListener('click', event => {
        const chat = event.target.closest('[data-admin-chat],[data-admin-chat-order]');
        if (chat) {
            openAdminChat(chat.dataset.adminChat || chat.dataset.adminChatOrder);
            return;
        }
        const order = event.target.closest('[data-order-id]');
        if (order) {
            detailOrder(order.dataset.orderId);
            return;
        }
        const product = event.target.closest('[data-product-id]');
        if (product) {
            const p = products.find(x => x.id === product.dataset.productId);
            if (p)
                productForm(p);
            return;
        }
        const simulate = event.target.closest('[data-simulate-pay]');
        if (simulate) {
            perform('simulate');
            return;
        }
        const status = event.target.closest('[data-change-status]');
        if (status) {
            perform('status', status.dataset.changeStatus);
        }
    });
    const requested = location.hash.replace('#', '');
    section = ['inicio', 'pedidos', 'mensagens', 'produtos', 'avaliacoes'].includes(requested) ? requested : 'inicio';
    bootstrap();
    // Atualiza a conversa aberta sem modificar o rascunho.
    setInterval(() => {
        if (document.visibilityState === 'visible' && section === 'mensagens' && activeChatOrderId)
            loadAdminConversation();
    }, 15000);
})();
