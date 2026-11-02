(() => {
    'use strict';
    // Produtos iniciais mostrados na loja.
    let PRODUCTS = [
        {
            id: 'pistache',
            name: 'Pistache Encantado',
            description: 'Creme de pistache, pedacinhos crocantes e um sabor irresistível.',
            price: 2190,
            category: 'especiais',
            tag: 'MAIS AMADO',
            color: 'green',
            rating: '4,9'
        },
        {
            id: 'morango',
            name: 'Morango dos Sonhos',
            description: 'Cobertura rosinha, morango fresquinho e muita delicadeza.',
            price: 1990,
            category: 'frutados',
            tag: 'QUERIDINHO',
            color: 'pink',
            rating: '5,0'
        },
        {
            id: 'chocolate-belga',
            name: 'Chocolate Belga',
            description: 'Chocolate intenso com cobertura cremosa e pedacinhos de chocolate.',
            price: 2190,
            category: 'classicos',
            tag: 'ESPECIAL',
            color: 'brown',
            rating: '4,9'
        },
        {
            id: 'red-velvet',
            name: 'Red Velvet Dream',
            description: 'Massa red velvet, creme aveludado e um toque de confeitaria.',
            price: 1790,
            originalPrice: 1990,
            category: 'classicos',
            tag: 'MAIS PEDIDO',
            color: 'pink',
            rating: '5,0'
        },
        {
            id: 'limao',
            name: 'Doce Limão',
            description: 'Creme suave, toque cítrico e raspinhas de limão.',
            price: 1690,
            originalPrice: 1890,
            category: 'frutados',
            tag: 'PROMOÇÃO',
            color: 'green',
            rating: '4,8'
        },
        {
            id: 'mirtilo',
            name: 'Encanto de Mirtilo',
            description: 'Cobertura lilás cremosa, mirtilos e um toque de doçura.',
            price: 2290,
            category: 'frutados',
            tag: 'NOVIDADE',
            color: 'violet',
            rating: '4,9'
        },
        {
            id: 'cookies-cream',
            name: 'Cookies & Cream',
            description: 'Creme de baunilha e pedacinhos crocantes de biscoito.',
            price: 2190,
            category: 'especiais',
            tag: 'CROCANTE',
            color: 'cream',
            rating: '4,9'
        },
        {
            id: 'caramelo-biscoito',
            name: 'Caramelo Crocante',
            description: 'Caramelo dourado, creme delicado e biscoito crocante.',
            price: 1890,
            originalPrice: 2190,
            category: 'especiais',
            tag: 'PROMOÇÃO',
            color: 'orange',
            rating: '4,8'
        },
        {
            id: 'coco',
            name: 'Nuvem de Coco',
            description: 'Cobertura branquinha e coco ralado para adoçar o dia.',
            price: 1590,
            originalPrice: 1890,
            category: 'classicos',
            tag: 'PROMOÇÃO',
            color: 'cream',
            rating: '4,8'
        },
        {
            id: 'maracuja',
            name: 'Tropical de Maracujá',
            description: 'Creme tropical e maracujá para um sabor surpreendente.',
            price: 2090,
            category: 'frutados',
            tag: 'TROPICAL',
            color: 'orange',
            rating: '4,9'
        },
        {
            id: 'smores',
            name: 'S’mores dos Sonhos',
            description: 'Chocolate cremoso, marshmallow e farofinha de biscoito.',
            price: 2390,
            category: 'especiais',
            tag: 'NOVIDADE',
            color: 'brown',
            rating: '4,9'
        },
        {
            id: 'framboesa',
            name: 'Amor de Framboesa',
            description: 'Cobertura suave, framboesas e um lindo toque frutado.',
            price: 2290,
            category: 'frutados',
            tag: 'ROMÂNTICO',
            color: 'pink',
            rating: '4,9'
        }
    ];
    const CATEGORIES = [
        ['todos', 'Todos os sabores'],
        ['classicos', 'Clássicos'],
        ['especiais', 'Especiais'],
        ['frutados', 'Frutados']
    ];
    // Opções usadas para montar um cupcake.
    const BUILD = {
        massa: [
            { id: 'baunilha', name: 'Baunilha', extra: 0 },
            { id: 'chocolate', name: 'Chocolate', extra: 100 },
            { id: 'red', name: 'Red velvet',  extra: 200 }
        ],
        recheio: [
            { id: 'doce-leite', name: 'Doce de leite', extra: 0 },
            { id: 'brigadeiro', name: 'Brigadeiro',  extra: 200 },
            { id: 'avela', name: 'Creme de avelã',  extra: 300 },
            { id: 'morango', name: 'Morango',  extra: 200 }
        ],
        cobertura: [
            { id: 'rosa', name: 'Chantilly rosa', extra: 0, image: 'morango' },
            { id: 'pistache', name: 'Pistache', extra: 300, image: 'pistache' },
            { id: 'chocolate', name: 'Chocolate',  extra: 200, image: 'chocolate-belga' },
            { id: 'tropical', name: 'Maracujá',  extra: 200, image: 'maracuja' },
            { id: 'baunilha', name: 'Coco', extra: 0, image: 'coco' },
            { id: 'blueberry', name: 'Mirtilo', extra: 300, image: 'mirtilo' },
            { id: 'framboesa', name: 'Framboesa',  extra: 300, image: 'framboesa' },
            { id: 'limao', name: 'Limão', extra: 100, image: 'limao' }
        ]
    };
    // Etapas exibidas no acompanhamento do pedido.
    const STAGES = [
        { title: 'Pedido feito', detail: 'Pagamento de teste aprovado.', icon: 'i-check' },
        { title: 'Pedido aceito', detail: 'A confeitaria aceitou o pedido.', icon: 'i-heart' },
        {
            title: 'Em preparação',
            detail: 'Seus cupcakes estão sendo preparados.',
            icon: 'i-sparkle'
        },
        { title: 'Aguardando motoboy', detail: 'Encomenda pronta para retirada.', icon: 'i-clock' },
        {
            title: 'Indo até você',
            detail: 'O motoboy saiu para a entrega (simulação).',
            icon: 'i-truck'
        },
        {
            title: 'Recebimento confirmado',
            detail: 'Você confirmou que recebeu a encomenda.',
            icon: 'i-check'
        }
    ];
    const el = (id) => document.getElementById(id);
    const money = cents => (Math.max(0, Number(cents) || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const icon = (name) => `<svg aria-hidden="true"><use href="#${name}"/></svg>`;
    // Mapeia os IDs da V1 para as novas fotos, inclusive carrinhos antigos salvos no navegador.
    const LEGACY_IMAGES = {
        'kinder-bliss': 'chocolate-belga',
        'tropical': 'maracuja',
        'doce-de-leite': 'caramelo-biscoito',
        'chocolate': 'chocolate-belga',
        'blueberry': 'mirtilo',
        'baunilha': 'coco'
    };
    const imageOf = id => /^uploads\/cupcakes\/[0-9a-f-]{36}\.webp$/.test(String(id || '')) ? String(id) : `assets/cupcakes/${LEGACY_IMAGES[id] || id || 'morango'}.webp`;
    const itemImage = item => item && item.custom && item.recipe && window.DoceCupcakeVisual ? window.DoceCupcakeVisual.src(item.recipe) : imageOf(item?.image);
    const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // Lê os dados temporários salvos no navegador.
    const getStorage = (key, fallback) => {
        try {
            const value = localStorage.getItem('doce_encanto_' + key);
            return value ? JSON.parse(value) : fallback;
        }
        catch {
            return fallback;
        }
    };
    const setStorage = (key, value) => {
        try {
            localStorage.setItem('doce_encanto_' + key, JSON.stringify(value));
        }
        catch { /* modo privado/armazenamento bloqueado */ }
    };
    // Dados da compra e da navegação atual.
    let cart = Array.isArray(getStorage('cart', [])) ? getStorage('cart', []) : [];
    let orders = []; // A fonte de verdade é a API, não o armazenamento do navegador.
    let selectedOrderId = null;
    let pixOrderId = (() => {
        try {
            return sessionStorage.getItem('doce_encanto_pix_pedido');
        }
        catch {
            return null;
        }
    })();
    let pixBusy = false;
    let favorites = Array.isArray(getStorage('favorites', [])) ? getStorage('favorites', []) : [];
    let coupon = getStorage('coupon', '');
    let category = 'todos';
    let query = '';
    let sort = 'featured';
    let builder = { massa: 'baunilha', recheio: 'doce-leite', cobertura: 'rosa' };
    let toastTimeout;
    let activeDialog = null;
    let currentUser = null;
    let apiOnline = false;
    // Faz as requisições para a API do servidor.
    async function api(path, method = 'GET', body) {
        let response;
        try {
            response = await fetch('/api' + path, {
                method, credentials: 'same-origin', cache: 'no-store',
                headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
                body: body === undefined ? undefined : JSON.stringify(body)
            });
        }
        catch {
            throw new Error('Servidor indisponível. Abra o site pelo endereço http://localhost:3000 após iniciar o back-end.');
        }
        let data = {};
        try {
            data = await response.json();
        }
        catch {
            throw new Error('Resposta inválida do servidor.');
        }
        if (!response.ok)
            throw new Error(data.erro || 'A solicitação não pôde ser concluída.');
        return data;
    }
    const toServerItems = () => cart.map(x => x.custom ? { custom: true, qty: x.qty, recipe: { ...x.recipe } } : { id: x.id, qty: x.qty });
    // Avisos enviados pelo administrador, consultados pela API PostgreSQL.
    // Não são mensagens de um atendente online; o chat continua com respostas automáticas.
    // Conversas de pedidos persistidas no PostgreSQL; cada cliente acessa somente seus pedidos.
    let chatOrderId = null;
    let chatFetchSeq = 0;
    // Exibe as conversas relacionadas aos pedidos do cliente.
    function renderChatOrderSelect() {
        const block = el('customer-conversation-block'), selector = el('chat-order-select');
        if (!block || !selector)
            return;
        block.hidden = !(currentUser?.papel === 'CLIENTE' && orders.length);
        if (block.hidden) {
            chatOrderId = null;
            el('chat-conversation').innerHTML = '';
            return;
        }
        if (!orders.some(o => o.id === chatOrderId))
            chatOrderId = orders[0].id;
        selector.innerHTML = orders.map(o => `<option value="${escapeHtml(o.id)}" ${o.id === chatOrderId ? 'selected' : ''}>Pedido #${escapeHtml(o.id)}</option>`).join('');
    }
    async function loadCustomerConversation() {
        renderChatOrderSelect();
        if (!chatOrderId || location.hash !== '#mensagens')
            return;
        const order = chatOrderId, seq = ++chatFetchSeq;
        const holder = el('chat-conversation');
        holder.textContent = 'Consultando mensagens do pedido...';
        try {
            const data = await api(`/pedidos/${encodeURIComponent(order)}/conversa`);
            if (seq !== chatFetchSeq || order !== chatOrderId)
                return;
            holder.innerHTML = data.mensagens.length ? data.mensagens.map(m => {
                const label = m.origem === 'CLIENTE' ? 'Você' : m.classe === 'AVISO' ? 'Aviso da confeitaria' : 'Confeitaria';
                const title = m.classe === 'AVISO' && m.tipo ? ` · ${noticeLabels[m.tipo] || 'Comunicado'}` : '';
                return `<article class="conversation-message ${m.origem === 'CLIENTE' ? 'mine' : ''}"><strong>${escapeHtml(label + title)}</strong><p>${escapeHtml(m.mensagem)}</p><small>${dateOf(m.criadoEm)}</small></article>`;
            }).join('') : '<p class="empty-notices">Nenhuma mensagem neste pedido. Você pode escrever a primeira!</p>';
            holder.scrollTop = holder.scrollHeight;
        }
        catch (error) {
            holder.textContent = error.message;
        }
    }
    async function sendCustomerMessage(event) {
        event.preventDefault();
        if (!chatOrderId || !currentUser)
            return;
        const field = el('chat-reply-text'), message = field.value.trim();
        if (message.length < 2 || message.length > 1000) {
            toast('Escreva de 2 a 1000 caracteres.');
            return;
        }
        const button = event.currentTarget.querySelector('button[type=submit]');
        button.disabled = true;
        try {
            await api(`/pedidos/${encodeURIComponent(chatOrderId)}/mensagens`, 'POST', { mensagem: message });
            field.value = '';
            await loadCustomerConversation();
            toast('Resposta enviada à confeitaria!');
        }
        catch (error) {
            toast(error.message);
        }
        finally {
            button.disabled = false;
        }
    }
    const noticeLabels = {
        ATRASO: '⏳ Atraso na encomenda',
        FALTA_PRODUTO: '⚠️ Produto em falta',
        CANCELAMENTO: '✕ Pedido cancelado',
        PROPOSTA_TROCA: '🔄 Proposta de troca'
    };
    const readKey = () => `doce_encanto_avisos_lidos_${currentUser?.id || 'anonimo'}`;
    function allCustomerNotices() {
        return orders.flatMap(order => (order.avisos || []).map(aviso => ({
            ...aviso, pedido: order.id,
            chave: JSON.stringify([order.id, aviso.tipo, aviso.mensagem, aviso.criadoEm])
        }))).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 30);
    }
    function loadSeenNotices() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(readKey()) || '[]');
            return new Set(Array.isArray(saved) ? saved : []);
        }
        catch {
            return new Set();
        }
    }
    function markNoticesAsRead() {
        if (!currentUser || currentUser.papel !== 'CLIENTE')
            return;
        try {
            sessionStorage.setItem(readKey(), JSON.stringify(allCustomerNotices().map(n => n.chave)));
        }
        catch { }
    }
    function renderChatNotices() {
        renderChatOrderSelect();
        const holder = el('chat-order-notices');
        const badge = el('chat-notice-badge');
        if (!holder || !badge)
            return;
        if (!currentUser || currentUser.papel !== 'CLIENTE') {
            holder.innerHTML = '<p class="empty-notices">Entre com uma conta de cliente para receber aqui os avisos da confeitaria sobre seus pedidos.</p>';
            badge.hidden = true;
            return;
        }
        const notices = allCustomerNotices();
        holder.innerHTML = notices.length ? `<p class="notice-digest">Você tem ${notices.length} comunicado(s) da confeitaria. Escolha um pedido abaixo para ver a conversa completa.</p>`
            : '<p class="empty-notices">Ainda não há recados da confeitaria. Se um pedido atrasar ou precisar de alteração, o aviso aparecerá aqui.</p>';
        if (location.hash === '#mensagens') {
            markNoticesAsRead();
            badge.hidden = true;
        }
        else
            badge.hidden = !notices.some(n => !loadSeenNotices().has(n.chave));
    }
    async function refreshOrders() {
        if (!currentUser) {
            orders = [];
            renderAccount();
            renderTracking();
            renderChatNotices();
            return;
        }
        if (currentUser.papel === 'ADMIN') {
            orders = [];
            renderAccount();
            renderTracking();
            renderChatNotices();
            return;
        }
        const data = await api('/pedidos');
        orders = data.pedidos.map(p => ({ id: p.id, createdAt: p.createdAt, status: p.status, real: true, total: p.totalCents, stage: 0, items: [{ qty: p.unidades }], avisos: p.avisos || [], metodoPagamento: p.metodoPagamento }));
        renderAccount();
        renderTracking();
        renderCheckout();
        renderChatNotices();
        if (location.hash === '#mensagens')
            loadCustomerConversation();
    }
    async function initializeBackend() {
        try {
            const [auth, products] = await Promise.all([api('/auth/eu?perfil=CLIENTE'), api('/produtos')]);
            apiOnline = true;
            currentUser = auth.usuario;
            const updated = new Map(products.produtos.map(p => [p.id, p]));
            PRODUCTS = PRODUCTS.filter(p => updated.get(p.id)?.disponivel).map(p => {
                const d = updated.get(p.id);
                return { ...p, name: d.nome, description: d.descricao, price: d.precoCentavos, imageId: d.imagem?.startsWith('uploads/') ? d.imagem : d.imagem?.split('/').pop()?.replace('.webp', '') || p.id };
            });
            // Produtos cadastrados pelo administrador aparecem automaticamente no cardápio.
            for (const d of products.produtos) {
                if (!d.disponivel || PRODUCTS.some(p => p.id === d.id))
                    continue;
                const categoryId = ({ 'Clássicos': 'classicos', 'Especiais': 'especiais', 'Frutados': 'frutados' })[d.categoria] || 'especiais';
                PRODUCTS.push({ id: d.id, name: d.nome, description: d.descricao, price: d.precoCentavos, category: categoryId, tag: 'NOVIDADE', color: 'pink', rating: '—', imageId: d.imagem?.startsWith('uploads/') ? d.imagem : d.imagem?.split('/').pop()?.replace('.webp', '') || 'morango' });
            }
            // Atualiza os preços do carrinho conforme o servidor, sem confiar em preços antigos.
            cart = cart.filter(i => i.custom || PRODUCTS.some(p => p.id === i.id)).map(i => {
                if (i.custom) {
                    const extra = Object.fromEntries(Object.keys(BUILD).map(k => [k, BUILD[k].find(x => x.id === i.recipe?.[k])?.extra || 0]));
                    return { ...i, price: 1490 + extra.massa + extra.recheio + extra.cobertura };
                }
                const product = PRODUCTS.find(p => p.id === i.id);
                return { ...i, name: product.name, price: product.price, image: product.imageId || product.id };
            });
            saveCart();
            renderCart();
            renderCheckout();
            renderProducts();
            await refreshOrders();
            renderAccount();
        }
        catch (error) {
            apiOnline = false;
            toast(error.message);
            el('account-description').textContent = 'Não foi possível acessar o banco de dados. Execute o servidor conforme o README.';
        }
    }
    const clampQty = q => Math.max(1, Math.min(99, Number(q) || 1));
    const cartCount = () => cart.reduce((n, item) => n + (Number(item.qty) || 0), 0);
    const subtotal = () => cart.reduce((n, item) => n + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
    const discount = () => coupon === 'DOCE10' && currentUser && orders.length === 0 ? Math.round(subtotal() * .1) : 0;
    const deliveryFee = () => subtotal() >= 8000 || subtotal() === 0 ? 0 : 790;
    const total = () => Math.max(0, subtotal() - discount() + deliveryFee());
    const saveCart = () => setStorage('cart', cart);
    const saveOrders = () => { }; // Pedidos são salvos exclusivamente no servidor.
    const productCard = (p) => `
    <article class="product-card">
      <div class="product-visual ${p.color}">
        <span class="product-tag">${escapeHtml(p.tag)}</span>
        <button class="product-fav ${favorites.includes(p.id) ? 'is-favorite' : ''}" data-favorite="${p.id}" aria-label="${favorites.includes(p.id) ? 'Remover dos' : 'Adicionar aos'} favoritos: ${escapeHtml(p.name)}" aria-pressed="${favorites.includes(p.id)}">${icon('i-heart')}</button>
        <img src="${imageOf(p.imageId || p.id)}" alt="Cupcake ${escapeHtml(p.name)}" loading="lazy" data-detail="${p.id}" tabindex="0" role="button" aria-label="Ver detalhes do ${escapeHtml(p.name)}" />
      </div>
      <div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><div class="product-rating">★★★★★ <span>(${p.rating})</span></div><div class="product-bottom"><div class="card-price">${p.originalPrice ? `<small class="old-price">${money(p.originalPrice)}</small>` : ''}<strong>${money(p.price)}</strong></div><button class="product-add" data-add="${p.id}" aria-label="Adicionar ${escapeHtml(p.name)} ao carrinho" title="Adicionar ao carrinho">${icon('i-plus')}</button></div></div>
    </article>`;
    function renderProducts() {
        const select = ids => ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean).map(productCard).join('');
        el('home-populares').innerHTML = select(['pistache', 'morango', 'red-velvet', 'chocolate-belga']);
        el('home-novidades').innerHTML = select(['mirtilo', 'smores', 'framboesa', 'cookies-cream']);
        el('home-baratinhos').innerHTML = select(['coco', 'limao', 'red-velvet', 'morango']);
        el('home-promocoes').innerHTML = select(['coco', 'limao', 'red-velvet', 'caramelo-biscoito']);
        let results = PRODUCTS.filter(p => (category === 'todos' || p.category === category) && (!query || `${p.name} ${p.description}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))));
        if (sort === 'price-asc')
            results.sort((a, b) => a.price - b.price);
        if (sort === 'price-desc')
            results.sort((a, b) => b.price - a.price);
        if (sort === 'name')
            results.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        el('catalog-products').innerHTML = results.map(productCard).join('');
        el('catalog-empty').classList.toggle('hidden', results.length > 0);
        el('product-result-count').textContent = `${results.length} ${results.length === 1 ? 'delícia encontrada' : 'delícias encontradas'}`;
        el('category-filters').innerHTML = CATEGORIES.map(([id, label]) => `<button data-category="${id}" class="${category === id ? 'active' : ''}" aria-pressed="${category === id}">${label} ${category === id ? icon('i-check') : ''}</button>`).join('');
    }
    function itemDescription(item) { return item.custom ? `Massa ${item.massa} · ${item.recheio} · ${item.cobertura}` : 'Cupcake artesanal'; }
    function addProduct(product) {
        if (!product)
            return;
        const key = product.key || product.id;
        const old = cart.find(i => i.key === key);
        if (old)
            old.qty = clampQty(old.qty + 1);
        else
            cart.push({ ...product, key, qty: 1 });
        saveCart();
        renderCart();
        toast('♡ Cupcake adicionado ao seu carrinho!');
    }
    function addProductById(id) {
        const p = PRODUCTS.find(x => x.id === id);
        if (p)
            addProduct({ key: p.id, id: p.id, name: p.name, price: p.price, image: p.imageId || p.id, custom: false });
    }
    function changeQuantity(key, delta) {
        const item = cart.find(i => i.key === key);
        if (!item)
            return;
        item.qty += delta;
        if (item.qty <= 0)
            cart = cart.filter(i => i.key !== key);
        else
            item.qty = clampQty(item.qty);
        saveCart();
        renderCart();
        renderCheckout();
    }
    function removeItem(key) { cart = cart.filter(i => i.key !== key); saveCart(); renderCart(); renderCheckout(); toast('Item removido do carrinho.'); }
    function renderCart() {
        const count = cartCount();
        el('cart-count').textContent = count > 99 ? '99+' : count;
        el('cart-count').hidden = count === 0;
        el('cart-subtotal').textContent = money(subtotal());
        el('go-checkout').disabled = cart.length === 0;
        el('cart-items').innerHTML = cart.length ? cart.map(i => `<article class="cart-row"><img src="${itemImage(i)}" alt=""/><div class="cart-row-main"><h3>${escapeHtml(i.name)}</h3><p>${escapeHtml(itemDescription(i))}</p><strong>${money(i.price)}</strong><div class="qty-controls"><button data-qty="minus" data-key="${escapeHtml(i.key)}" aria-label="Diminuir quantidade de ${escapeHtml(i.name)}">${icon('i-minus')}</button><b>${i.qty}</b><button data-qty="plus" data-key="${escapeHtml(i.key)}" aria-label="Aumentar quantidade de ${escapeHtml(i.name)}">${icon('i-plus')}</button></div></div><button class="cart-remove" data-remove="${escapeHtml(i.key)}" aria-label="Remover ${escapeHtml(i.name)}">${icon('i-trash')}</button></article>`).join('') : `<div class="cart-empty"><span>🧁</span><h3>Seu carrinho está vazio</h3><p>Que tal escolher uma doçura para alegrar o dia?</p><button class="button button-primary" data-action="browse">Explorar cupcakes ${icon('i-arrow')}</button></div>`;
    }
    function openCart() { closeProduct(); el('drawer-overlay').hidden = false; el('cart-drawer').classList.add('open'); el('cart-drawer').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; activeDialog = 'cart'; el('cart-drawer').focus(); }
    function closeCart() {
        el('drawer-overlay').hidden = true;
        el('cart-drawer').classList.remove('open');
        el('cart-drawer').setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (activeDialog === 'cart')
            activeDialog = null;
    }
    function openProduct(id) {
        const p = PRODUCTS.find(x => x.id === id);
        if (!p)
            return;
        closeCart();
        el('product-modal-body').innerHTML = `<div class="modal-inner"><div class="modal-art"><img src="${imageOf(p.imageId || p.id)}" alt="Cupcake ${escapeHtml(p.name)}" /></div><div class="modal-details"><span class="section-kicker">DOCE ENCANTO · ${escapeHtml(p.tag)}</span><h2>${escapeHtml(p.name)}</h2><div class="review-stars">★★★★★ <span style="color:#9e8990;font:11px 'DM Sans',sans-serif">${p.rating} de 5</span></div><p>${escapeHtml(p.description)} Produzido artesanalmente para deixar seu dia ainda mais especial.</p><p class="modal-price">${money(p.price)}</p><button class="button button-primary" data-add="${p.id}">Adicionar ao carrinho ${icon('i-bag')}</button></div></div>`;
        el('product-modal-overlay').hidden = false;
        document.body.style.overflow = 'hidden';
        activeDialog = 'product';
        el('product-modal-overlay').querySelector('.modal-close').focus();
    }
    function closeProduct() {
        el('product-modal-overlay').hidden = true;
        if (activeDialog === 'product') {
            document.body.style.overflow = '';
            activeDialog = null;
        }
    }
    function toast(message) { const node = el('toast'); node.textContent = message; node.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => node.classList.remove('show'), 2700); }
    function renderBuilder() {
        Object.keys(BUILD).forEach(key => {
            el('choice-' + key).innerHTML = BUILD[key].map(item => `<button class="choice ${builder[key] === item.id ? 'selected' : ''}" data-build-key="${key}" data-build-value="${item.id}" aria-pressed="${builder[key] === item.id}"><span class="choice-emoji">${item.emoji}</span><strong>${escapeHtml(item.name)}</strong><small>${item.extra ? '+ ' + money(item.extra) : 'Incluso'}</small></button>`).join('');
        });
        const selected = Object.fromEntries(Object.keys(BUILD).map(key => [key, BUILD[key].find(x => x.id === builder[key])]));
        const price = 1490 + selected.massa.extra + selected.recheio.extra + selected.cobertura.extra;
        el('builder-image').src = window.DoceCupcakeVisual.src(builder);
        el('builder-image').alt = `Ilustração em camadas: massa ${selected.massa.name}, recheio ${selected.recheio.name} e cobertura ${selected.cobertura.name}`;
        el('builder-price').textContent = money(price);
        el('builder-summary').innerHTML = `<div><span>Massa</span><strong>${selected.massa.name}</strong></div><div><span>Recheio</span><strong>${selected.recheio.name}</strong></div><div><span>Cobertura</span><strong>${selected.cobertura.name}</strong></div>`;
    }
    function addCustom() {
        const selected = Object.fromEntries(Object.keys(BUILD).map(key => [key, BUILD[key].find(x => x.id === builder[key])]));
        const key = `personalizado:${builder.massa}:${builder.recheio}:${builder.cobertura}`;
        addProduct({ key, id: 'personalizado', name: 'Meu cupcake especial', price: 1490 + selected.massa.extra + selected.recheio.extra + selected.cobertura.extra, image: selected.cobertura.image, recipe: { ...builder }, custom: true, massa: selected.massa.name, recheio: selected.recheio.name, cobertura: selected.cobertura.name });
        openCart();
    }
    function renderCheckout() {
        if (!el('checkout-items'))
            return;
        el('checkout-items').innerHTML = cart.length ? cart.map(i => `<div class="summary-item"><img src="${itemImage(i)}" alt=""/><div><strong>${escapeHtml(i.name)}</strong><small>${i.qty} × ${money(i.price)}</small></div><span>${money(i.price * i.qty)}</span></div>`).join('') : `<p style="color:var(--muted);line-height:1.8;font-size:12px">Seu carrinho está vazio. <a href="#catalogo" data-nav="catalogo" style="text-decoration:underline;color:var(--rose)">Conheça os sabores</a>.</p>`;
        el('checkout-totals').innerHTML = `<div class="totals-list"><div><span>Subtotal</span><span>${money(subtotal())}</span></div>${discount() > 0 ? `<div><span>Desconto DOCE10</span><span>- ${money(discount())}</span></div>` : ''}<div><span>Entrega ilustrativa</span><span>${deliveryFee() === 0 ? 'Grátis' : money(deliveryFee())}</span></div><div class="total-final"><span>Total</span><strong>${money(total())}</strong></div></div>`;
        el('coupon-code').value = coupon;
        el('coupon-feedback').textContent = coupon ? (currentUser && orders.length === 0 ? 'Cupom DOCE10 selecionado; será validado no servidor.' : 'Entre na conta para usar o cupom DOCE10.') : '';
        el('coupon-feedback').style.color = coupon ? '#518352' : '';
    }
    async function applyCoupon() {
        const code = el('coupon-code').value.trim().toUpperCase();
        if (!code) {
            coupon = '';
            setStorage('coupon', '');
            renderCheckout();
            toast('Cupom removido.');
            return;
        }
        try {
            const data = await api('/checkout/cotacao', 'POST', { items: toServerItems(), cupom: code });
            coupon = code;
            setStorage('coupon', code);
            renderCheckout();
            toast(`Cupom validado pela confeitaria! Desconto: ${money(data.cotacao.discountCents)}.`);
        }
        catch (error) {
            coupon = '';
            setStorage('coupon', '');
            renderCheckout();
            el('coupon-feedback').textContent = error.message;
            el('coupon-feedback').style.color = '#b45259';
        }
    }
    async function checkout(event) {
        event.preventDefault();
        const form = el('checkout-form'), error = el('checkout-error');
        error.hidden = true;
        if (currentUser?.papel === 'ADMIN') {
            error.textContent = 'A conta administrativa não faz compras. Entre como cliente.';
            error.hidden = false;
            return;
        }
        if (!currentUser) {
            error.textContent = 'Entre ou crie sua conta antes de registrar um pedido.';
            error.hidden = false;
            toast('Faça login na aba Minha conta para finalizar.');
            location.hash = '#conta';
            return;
        }
        if (!cart.length) {
            error.textContent = 'Escolha pelo menos um cupcake antes de confirmar o pedido.';
            error.hidden = false;
            return;
        }
        if (!form.checkValidity()) {
            error.textContent = 'Preencha todos os campos obrigatórios com informações válidas.';
            error.hidden = false;
            form.reportValidity();
            return;
        }
        const d = new FormData(form);
        const endereco = {
            logradouro: String(d.get('rua') || ''),
            numero: String(d.get('numero') || ''),
            complemento: String(d.get('complemento') || ''),
            bairro: String(d.get('bairro') || ''),
            cidade: String(d.get('cidade') || ''),
            uf: String(d.get('uf') || ''),
            cep: String(d.get('cep') || '')
        };
        const button = form.querySelector('.checkout-submit');
        button.disabled = true;
        button.textContent = 'Registrando pedido...';
        try {
            const response = await api('/pedidos', 'POST', { items: toServerItems(), cupom: coupon, telefone: String(d.get('telefone') || ''), endereco, metodoPagamento: String(d.get('pagamento') || 'PIX') });
            cart = [];
            coupon = '';
            saveCart();
            setStorage('coupon', '');
            await refreshOrders().catch(() => toast('Pedido salvo. Atualize o histórico se necessário.'));
            renderCart();
            renderCheckout();
            form.reset();
            el('confirmed-number').textContent = `Pedido #${response.pedido.id}`;
            const paymentMethod = String(d.get('pagamento') || 'PIX');
            if (paymentMethod === 'PIX') {
                pixOrderId = response.pedido.idNumerico;
                try {
                    sessionStorage.setItem('doce_encanto_pix_pedido', pixOrderId);
                }
                catch { }
                location.hash = '#pix';
            }
            else {
                location.hash = '#confirmacao';
                toast('Pedido registrado. Cartão não está integrado; pagamento pendente.');
            }
        }
        catch (e) {
            error.textContent = e.message;
            error.hidden = false;
            toast('Não foi possível registrar o pedido.');
        }
        finally {
            button.disabled = false;
            button.innerHTML = `Registrar meu pedido ${icon('i-arrow')}`;
        }
    }
    async function showDemoPix() {
        if (!pixOrderId) {
            el('pix-qr-frame').innerHTML = '<div class="pix-loading">Escolha um pedido pendente para visualizar o Pix.</div>';
            el('pix-confirm-button').disabled = true;
            return;
        }
        el('pix-confirm-button').disabled = true;
        el('pix-copy-button').disabled = true;
        el('pix-copy-text').value = '';
        el('pix-message').textContent = 'Carregando QR Code de demonstração…';
        try {
            const result = await api(`/pagamentos/pix-demo/${encodeURIComponent(pixOrderId)}`);
            const data = result.pix;
            if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data.qrDataUrl))
                throw new Error('Imagem de QR Code inválida.');
            const qr = document.createElement('img');
            qr.src = data.qrDataUrl;
            qr.alt = 'QR Code ilustrativo contendo apenas um código DEMO não pagável';
            qr.width = 320;
            qr.height = 320;
            const frame = el('pix-qr-frame');
            frame.replaceChildren(qr);
            el('pix-amount').textContent = money(data.valorCentavos);
            el('pix-order-label').textContent = `Pedido #${data.pedido}`;
            el('pix-copy-text').value = data.codigo;
            el('pix-confirm-button').disabled = false;
            el('pix-copy-button').disabled = false;
            el('pix-message').textContent = '✅ QR Code de demonstração gerado. Nenhuma cobrança real.';
        }
        catch (error) {
            el('pix-qr-frame').innerHTML = '<div class="pix-loading">QR Code indisponível.</div>';
            el('pix-message').textContent = error.message;
        }
    }
    async function confirmDemoPix() {
        if (pixBusy || !pixOrderId)
            return;
        pixBusy = true;
        const button = el('pix-confirm-button');
        button.disabled = true;
        button.textContent = 'Simulando confirmação…';
        try {
            const response = await api(`/pagamentos/pix-demo/${encodeURIComponent(pixOrderId)}/confirmar`, 'POST', {});
            selectedOrderId = `DE-${String(pixOrderId).padStart(6, '0')}`;
            try {
                sessionStorage.removeItem('doce_encanto_pix_pedido');
            }
            catch { }
            await refreshOrders();
            el('confirmed-number').textContent = `Pedido #${selectedOrderId}`;
            location.hash = '#confirmacao';
            toast(response.mensagem);
        }
        catch (error) {
            el('pix-message').textContent = error.message;
            toast('A simulação não foi concluída.');
            button.disabled = false;
        }
        finally {
            pixBusy = false;
            button.textContent = '✓ Simular pagamento aprovado';
        }
    }
    async function copyDemoPix() {
        const field = el('pix-copy-text');
        if (!field.value)
            return;
        try {
            await navigator.clipboard.writeText(field.value);
            toast('Código de teste copiado!');
        }
        catch {
            field.focus();
            field.select();
            toast('Código selecionado. Pressione Ctrl + C para copiar.');
        }
    }
    function reopenDemoPix(orderId) {
        pixOrderId = String(orderId).replace(/^DE-/i, '');
        try {
            sessionStorage.setItem('doce_encanto_pix_pedido', pixOrderId);
        }
        catch { }
        location.hash = '#pix';
        showDemoPix();
    }
    const dateOf = s => {
        try {
            return new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        }
        catch {
            return '—';
        }
    };
    function mapSvg() { return `<svg viewBox="0 0 720 225" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa ilustrativo do percurso da entrega"><rect width="720" height="225" fill="#f2ece3"/><path d="M0 18 720 181M-18 97 735 80M42 0 170 225M218 0 345 225M390 0 520 225M590 0 718 225" stroke="#fffdfa" stroke-width="24" fill="none"/><path d="M0 18 720 181M-18 97 735 80M42 0 170 225M218 0 345 225M390 0 520 225M590 0 718 225" stroke="#e5d7ce" stroke-width="1.6" fill="none"/><g fill="#d7e4d1"><rect x="32" y="128" width="90" height="74" rx="10"/><rect x="324" y="15" width="93" height="48" rx="10"/><rect x="515" y="120" width="80" height="56" rx="10"/></g><path d="M112 165 215 127 313 156 388 108 483 122 562 65" stroke="#b66d83" stroke-width="6" stroke-dasharray="8 9" fill="none" stroke-linecap="round"/><circle cx="112" cy="165" r="12" fill="#fff" stroke="#b66d83" stroke-width="5"/><path d="M552 45c0-18 25-18 25 0 0 12-12.5 25-12.5 25S552 57 552 45Z" fill="#8f4d62"/><circle cx="564.5" cy="43" r="5" fill="#fff"/></svg>`; }
    function renderTracking() {
        const order = orders.find(o => o.id === selectedOrderId) || orders[0];
        el('tracking-number').textContent = order ? `Pedido #${order.id}` : 'Ainda não há pedidos';
        const statusBadge = el('tracking-number').closest('.tracking-top').querySelector('.demo-label');
        if (statusBadge) {
            statusBadge.textContent = !order ? 'Sem pedidos' : order.status === 'AGUARDANDO_PAGAMENTO' ? 'Pagamento pendente' : order.status === 'ENTREGUE' ? 'Recebimento confirmado' : order.status === 'CANCELADO' ? 'Cancelado' : 'Pedido em andamento';
        }
        if (!order) {
            el('tracking-body').innerHTML = `<div class="tracking-empty"><span>🧁</span><h3>Seu primeiro encanto está por vir!</h3><p>Faça um pedido de demonstração para visualizar as etapas da encomenda.</p><a href="#catalogo" data-nav="catalogo" class="button button-primary">Escolher meus cupcakes ${icon('i-arrow')}</a></div>`;
            return;
        }
        if (order.real) {
            const statuses = {
                AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
                CONFIRMADO: 'Pedido feito',
                ACEITO: 'Pedido aceito',
                PREPARANDO: 'Em preparação',
                PRONTO_RETIRADA: 'Aguardando motoboy',
                EM_ENTREGA: 'Indo até você',
                ENTREGUE: 'Recebimento confirmado',
                CANCELADO: 'Cancelado'
            };
            const current = statuses[order.status] || order.status;
            const index = ({ AGUARDANDO_PAGAMENTO: -1, CONFIRMADO: 0, ACEITO: 1, PREPARANDO: 2, PRONTO_RETIRADA: 3, EM_ENTREGA: 4, ENTREGUE: 5 })[order.status] ?? -1;
            const hasNotices = Boolean(order.avisos?.length);
            const steps = order.status === 'CANCELADO' ? `<div class="tracking-info">Encomenda cancelada pela confeitaria. Confira o aviso e o motivo abaixo.</div>` :
                `<div class="tracking-stages">${STAGES.map((s, i) => `<div class="tracking-stage ${i <= index ? 'completed' : ''}"><div class="stage-dot">${icon(i <= index ? 'i-check' : s.icon)}</div><strong>${s.title}</strong><small>${i <= index ? 'Etapa registrada' : 'Aguardando'}</small></div>`).join('')}</div>`;
            el('tracking-body').innerHTML = `<div class="tracking-info" style="margin:24px 0"><strong>${escapeHtml(current)} ♡</strong><br>Este status foi consultado diretamente no PostgreSQL. ${order.status === 'AGUARDANDO_PAGAMENTO' ? 'Aguardando confirmação do pagamento de demonstração.' : 'A confeitaria atualiza o preparo e o envio; apenas você confirma o recebimento.'}<br><small>Criado em ${dateOf(order.createdAt)} · total ${money(order.total)}</small></div>${steps}${hasNotices ? `<p class="tracking-info">A confeitaria enviou um comunicado. <button type="button" class="button button-outline" data-conversa-pedido="${escapeHtml(order.id)}">Ler e responder nas Mensagens</button></p>` : ''}<div class="tracking-actions"><p>Projeto acadêmico: Pix de demonstração, sem transferência bancária. Entrega e mapa não são reais.</p>${order.status === 'EM_ENTREGA' ? `<button type="button" class="button button-primary" data-confirm-receipt="${escapeHtml(order.id)}">Confirmar que recebi meu pedido</button>` : ''}${order.status === 'AGUARDANDO_PAGAMENTO' && order.metodoPagamento === 'PIX' ? `<button type="button" class="button button-outline" data-pix-order="${escapeHtml(order.id)}">◆ Ver Pix de teste</button>` : ''}<button type="button" id="refresh-tracking" class="button button-primary">↻ Atualizar andamento</button></div>`;
            return;
        }
        const index = Math.max(0, Math.min(5, order.stage));
        el('tracking-body').innerHTML = `<div class="tracking-map">${mapSvg()}<span class="map-marker">${STAGES[index].title}</span><span class="map-badge">Mapa ilustrativo · sem localização real</span></div><div class="tracking-stages">${STAGES.map((s, i) => `<div class="tracking-stage ${i <= index ? 'completed' : ''}"><div class="stage-dot">${icon(i <= index ? 'i-check' : s.icon)}</div><strong>${s.title}</strong><small>${i <= index ? 'Etapa concluída' : 'Aguardando'}</small></div>`).join('')}</div><div class="tracking-info"><strong>${STAGES[index].title} ♡</strong><br>${STAGES[index].detail}<br><small>Pedido criado em ${dateOf(order.createdAt)} · valor ${money(order.total)}</small></div><div class="tracking-actions"><p>Experimente o fluxo: avance o status manualmente para estudar o comportamento da interface.</p>${index < 5 ? `<button class="button button-primary" id="advance-stage">Simular próxima etapa ${icon('i-arrow')}</button>` : `<span class="demo-label">Simulação concluída ✓</span>`}</div>`;
    }
    setInterval(() => {
        if (currentUser?.papel === 'CLIENTE' && ['#conta', '#acompanhar', '#mensagens'].includes(location.hash))
            refreshOrders().catch(() => { });
    }, 30000);
    function advanceStage() {
        if (orders.length && !orders[0].real && orders[0].stage < 5) {
            orders[0].stage++;
            saveOrders();
            renderTracking();
            renderAccount();
            toast('Status da demonstração atualizado!');
        }
    }
    let accountMode = 'cadastro';
    function renderAccount() {
        el('account-greeting').textContent = currentUser ? `Olá, ${currentUser.nome}!` : 'Olá, visitante!';
        el('account-description').textContent = currentUser ? (currentUser.papel === 'ADMIN' ? 'Perfil de administração conectado ao PostgreSQL.' : 'Sua conta de cliente está conectada ao servidor PostgreSQL.') : 'Cadastre-se ou entre para salvar suas encomendas com segurança.';
        el('account-demo-form').hidden = Boolean(currentUser);
        el('account-demo-profile').hidden = !currentUser;
        el('account-simulated-email').textContent = currentUser ? currentUser.email : '';
        el('admin-profile-link').hidden = !(currentUser?.papel === 'ADMIN');
        el('account-orders').innerHTML = currentUser?.papel === 'ADMIN' ? `<div class="empty-orders">📋<p>Você está conectado como administrador. A gestão de todos os pedidos fica em uma área separada.</p><a class="button button-primary" href="/admin.html">Abrir painel administrativo →</a></div>` : orders.length ? orders.map((o, i) => `<div class="order-mini"><div><strong>#${escapeHtml(o.id)}</strong><small>${dateOf(o.createdAt)} · ${o.items.reduce((s, x) => s + x.qty, 0)} cupcake(s) · ${escapeHtml(({ CONFIRMADO: 'Pedido feito', ACEITO: 'Pedido aceito', PREPARANDO: 'Em preparação', PRONTO_RETIRADA: 'Aguardando motoboy', EM_ENTREGA: 'Indo até você', ENTREGUE: 'Recebido', CANCELADO: 'Cancelado' })[o.status] || o.status)}</small>${o.avisos?.length ? `<small class="notice-label">💌 ${escapeHtml(({ ATRASO: 'Aviso de atraso', FALTA_PRODUTO: 'Produto em falta', CANCELAMENTO: 'Pedido cancelado', PROPOSTA_TROCA: 'Proposta de troca' })[o.avisos[0].tipo] || 'Novo recado')} — clique em Ver andamento</small>` : ''}</div><div><p>${money(o.total)}</p>${o.status === 'AGUARDANDO_PAGAMENTO' && o.metodoPagamento === 'PIX' ? `<button data-pix-order="${escapeHtml(o.id)}">Pagar (simulação) ◆</button>` : ''}<button data-view-order="${i}">Ver andamento →</button></div></div>`).join('') : `<div class="empty-orders">🧁<p>${currentUser ? 'Você ainda não possui pedidos registrados.' : 'Entre na conta para acompanhar seus pedidos.'}</p><a href="#catalogo" data-nav="catalogo" class="button button-outline">Explorar cardápio</a></div>`;
    }
    function route() {
        const route = location.hash.replace(/^#/, '') || 'inicio';
        const valid = ['inicio', 'catalogo', 'monte', 'checkout', 'pix', 'confirmacao', 'acompanhar', 'conta', 'mensagens'];
        const name = valid.includes(route) ? route : 'inicio';
        document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === `page-${name}`));
        document.querySelectorAll('.nav [data-nav]').forEach(a => {
            const active = a.dataset.nav === name;
            a.classList.toggle('active', active);
            if (active)
                a.setAttribute('aria-current', 'page');
            else
                a.removeAttribute('aria-current');
        });
        el('main-nav').classList.remove('open');
        el('mobile-menu-button').setAttribute('aria-expanded', 'false');
        closeCart();
        closeProduct();
        if (name === 'checkout') {
            renderCheckout();
            if (currentUser) {
                const f = el('checkout-form');
                f.querySelector('[name=nome]').value ||= currentUser.nome;
                f.querySelector('[name=email]').value ||= currentUser.email;
            }
        }
        if (name === 'acompanhar') {
            renderTracking();
            if (currentUser?.papel === 'CLIENTE')
                refreshOrders().catch(error => toast(error.message));
        }
        if (name === 'conta')
            renderAccount();
        if (name === 'mensagens') {
            renderChatNotices();
            if (currentUser?.papel === 'CLIENTE')
                refreshOrders().catch(error => toast(error.message));
            loadCustomerConversation();
        }
        if (name === 'pix')
            showDemoPix();
        if (name === 'confirmacao' && orders[0])
            el('confirmed-number').textContent = `Pedido #${orders[0].id}`;
        document.title = (name === 'inicio' ? 'Doce Encanto' : `${({ catalogo: 'Catálogo', monte: 'Monte seu cupcake', checkout: 'Checkout', pix: 'Pix demonstrativo', confirmacao: 'Pedido confirmado', acompanhar: 'Acompanhar pedido', conta: 'Meu cantinho', mensagens: 'Mensagens' })[name]} · Doce Encanto`);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    async function confirmReceipt(orderId) {
        if (!currentUser || currentUser.papel !== 'CLIENTE') {
            toast('Entre na sua conta de cliente.');
            return;
        }
        if (!confirm('Você já recebeu sua encomenda? Confirme somente após o recebimento.'))
            return;
        try {
            const result = await api(`/pedidos/${encodeURIComponent(orderId)}/confirmar-entrega`, 'POST', {});
            toast(result.mensagem);
            await refreshOrders();
        }
        catch (error) {
            toast(error.message);
        }
    }
    function chatToggle() { location.hash = '#mensagens'; }
    function answerChat(key) {
        const responses = {
            pedido: ['Onde está meu pedido?', 'Para testar o acompanhamento, clique em “Acompanhar pedido” no menu. Lá você pode simular cada etapa. '],
            sabores: ['Quais são os sabores?', 'Temos Pistachoco, Red Velvet, Kinder Bliss e muitos outros. Veja o catálogo e encontre o seu favorito! '],
            cupom: ['Tem algum cupom?', 'Sim! Use DOCE10 na primeira compra demonstrativa para ganhar 10% de desconto. ']
        };
        const pair = responses[key];
        if (!pair)
            return;
        const box = el('chat-messages');
        box.insertAdjacentHTML('beforeend', `<p class="chat-bubble from-user">${escapeHtml(pair[0])}</p><p class="chat-bubble from-shop">${escapeHtml(pair[1])}</p>`);
        box.scrollTop = box.scrollHeight;
    }
    function setAccountTab(mode) {
        accountMode = mode;
        document.querySelectorAll('[data-account-tab]').forEach(btn => { let selected = btn.dataset.accountTab === mode; btn.classList.toggle('is-active', selected); btn.setAttribute('aria-selected', String(selected)); });
        el('account-name-label').hidden = mode === 'entrar';
        el('account-name').required = mode === 'cadastro';
        el('account-password').minLength = mode === 'cadastro' ? 10 : 1;
        el('account-password').setAttribute('autocomplete', mode === 'cadastro' ? 'new-password' : 'current-password');
        el('account-submit').textContent = mode === 'cadastro' ? 'Criar minha conta' : 'Entrar na minha conta';
        el('account-auth-error').hidden = true;
    }
    async function showAccountPreview(event) {
        event.preventDefault();
        const form = el('account-preview-form');
        if (!form.reportValidity())
            return;
        const name = el('account-name').value.trim();
        const email = el('account-email').value.trim();
        const senha = el('account-password').value;
        const error = el('account-auth-error');
        error.hidden = true;
        const button = el('account-submit');
        button.disabled = true;
        try {
            const path = accountMode === 'cadastro' ? '/auth/cadastrar' : '/auth/entrar';
            const result = await api(path, 'POST', accountMode === 'cadastro' ? { nome: name, email, senha } : { email, senha, perfil: 'CLIENTE' });
            currentUser = result.usuario;
            form.reset();
            // Mantém o carrinho que o visitante montou antes de criar a conta.
            // Ao sair de uma conta, o carrinho é limpo para não misturar usuários.
            renderCart();
            await refreshOrders();
            renderAccount();
            if (currentUser?.papel === 'ADMIN') {
                window.location.assign('/admin.html');
                return;
            }
            toast('Conta conectada com sucesso! ♡');
        }
        catch (e) {
            error.textContent = e.message;
            error.hidden = false;
            toast('Não foi possível entrar na conta.');
        }
        finally {
            button.disabled = false;
        }
    }
    // Carrossel manual
    let currentSlide = 0;
    const slides = [...document.querySelectorAll('.carousel-slide')];
    const carouselDots = el('carousel-dots');
    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            const active = i === currentSlide;
            slide.hidden = !active;
            slide.classList.toggle('is-active', active);
        });
        [...carouselDots.querySelectorAll('button')].forEach((dot, i) => {
            dot.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
            dot.classList.toggle('is-active', i === currentSlide);
        });
        el('carousel-status').textContent = `Destaque ${currentSlide + 1} de ${slides.length}`;
    }
    carouselDots.innerHTML = slides.map((slide, i) => `<button type="button" class="carousel-dot" data-slide="${i}" aria-label="Ver destaque ${i + 1}: ${escapeHtml(slide.dataset.title)}" aria-current="false"></button>`).join('');
    el('carousel-prev').addEventListener('click', () => showSlide(currentSlide - 1));
    el('carousel-next').addEventListener('click', () => showSlide(currentSlide + 1));
    carouselDots.addEventListener('click', event => {
        const button = event.target.closest('[data-slide]');
        if (button)
            showSlide(Number(button.dataset.slide));
    });
    el('home-carousel').addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showSlide(currentSlide - 1);
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            showSlide(currentSlide + 1);
        }
    });
    showSlide(0);
    document.querySelectorAll('.home-collection-pills a').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        const section = document.querySelector(link.getAttribute('href'));
        if (section) {
            if (location.hash !== '#inicio')
                history.replaceState(null, '', '#inicio');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }));
    document.addEventListener('click', event => {
        const add = event.target.closest('[data-add]');
        if (add) {
            addProductById(add.dataset.add);
            if (!el('product-modal-overlay').hidden) {
                closeProduct();
                openCart();
            }
            return;
        }
        const fav = event.target.closest('[data-favorite]');
        if (fav) {
            const id = fav.dataset.favorite;
            favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
            setStorage('favorites', favorites);
            renderProducts();
            toast(favorites.includes(id) ? 'Adicionado aos favoritos ♡' : 'Removido dos favoritos.');
            return;
        }
        const detail = event.target.closest('[data-detail]');
        if (detail) {
            openProduct(detail.dataset.detail);
            return;
        }
        const filter = event.target.closest('[data-category]');
        if (filter) {
            category = filter.dataset.category;
            renderProducts();
            return;
        }
        const choice = event.target.closest('[data-build-key]');
        if (choice) {
            builder[choice.dataset.buildKey] = choice.dataset.buildValue;
            renderBuilder();
            return;
        }
        const qty = event.target.closest('[data-qty]');
        if (qty) {
            changeQuantity(qty.dataset.key, qty.dataset.qty === 'plus' ? 1 : -1);
            return;
        }
        const rm = event.target.closest('[data-remove]');
        if (rm) {
            removeItem(rm.dataset.remove);
            return;
        }
        const receipt = event.target.closest('[data-confirm-receipt]');
        if (receipt) {
            confirmReceipt(receipt.dataset.confirmReceipt);
            return;
        }
        const orderButton = event.target.closest('[data-view-order]');
        if (orderButton) {
            const idx = Number(orderButton.dataset.viewOrder);
            if (orders[idx])
                selectedOrderId = orders[idx].id;
            location.hash = '#acompanhar';
            renderTracking();
            return;
        }
        const action = event.target.closest('[data-action]');
        if (action) {
            switch (action.dataset.action) {
                case 'cart':
                    openCart();
                    return;
                case 'close-cart':
                    closeCart();
                    return;
                case 'close-product':
                    closeProduct();
                    return;
                case 'browse':
                    closeCart();
                    location.hash = '#catalogo';
                    return;
                case 'account':
                    location.hash = '#conta';
                    return;
                case 'chat':
                    chatToggle();
                    return;
            }
        }
        const chat = event.target.closest('[data-chat-question]');
        if (chat) {
            answerChat(chat.dataset.chatQuestion);
            return;
        }
        const openConversation = event.target.closest('[data-conversa-pedido]');
        if (openConversation) {
            chatOrderId = openConversation.dataset.conversaPedido;
            location.hash = '#mensagens';
            renderChatNotices();
            loadCustomerConversation();
            return;
        }
        if (event.target.id === 'advance-stage') {
            advanceStage();
            return;
        }
        if (event.target.id === 'refresh-tracking') {
            refreshOrders().then(() => toast('Andamento consultado no banco de dados.')).catch(error => toast(error.message));
            return;
        }
        if (event.target.id === 'clear-filters') {
            category = 'todos';
            query = '';
            el('catalog-search').value = '';
            renderProducts();
            return;
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeCart();
            closeProduct();
        }
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-detail]')) {
            event.preventDefault();
            openProduct(event.target.dataset.detail);
        }
    });
    el('drawer-overlay').addEventListener('click', closeCart);
    el('product-modal-overlay').addEventListener('click', event => {
        if (event.target.id === 'product-modal-overlay')
            closeProduct();
    });
    el('catalog-search').addEventListener('input', event => { query = event.target.value.trim(); renderProducts(); });
    el('sort-select').addEventListener('change', event => { sort = event.target.value; renderProducts(); });
    el('search-trigger').addEventListener('click', () => { location.hash = '#catalogo'; setTimeout(() => el('catalog-search').focus(), 50); });
    el('mobile-menu-button').addEventListener('click', () => { const opened = el('main-nav').classList.toggle('open'); el('mobile-menu-button').setAttribute('aria-expanded', String(opened)); });
    document.querySelectorAll('[data-account-tab]').forEach(btn => btn.addEventListener('click', () => setAccountTab(btn.dataset.accountTab)));
    el('account-preview-form').addEventListener('submit', showAccountPreview);
    el('chat-order-select').addEventListener('change', event => { chatOrderId = event.target.value; loadCustomerConversation(); });
    el('chat-reply-form').addEventListener('submit', sendCustomerMessage);
    el('account-signout').addEventListener('click', async () => {
        try {
            await api('/auth/sair', 'POST', { perfil: 'CLIENTE' });
        }
        catch (e) {
            toast(e.message);
            return;
        }
        currentUser = null;
        orders = [];
        cart = [];
        coupon = '';
        pixOrderId = null;
        try {
            sessionStorage.removeItem('doce_encanto_pix_pedido');
        }
        catch { }
        saveCart();
        setStorage('coupon', '');
        chatOrderId = null;
        chatFetchSeq++;
        el('account-preview-form').reset();
        renderAccount();
        renderCart();
        renderCheckout();
        renderTracking();
        renderChatNotices();
        toast('Você saiu da sua conta.');
    });
    el('copy-coupon').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText('DOCE10');
            toast('Cupom DOCE10 copiado!');
        }
        catch {
            toast('Cupom da primeira compra: DOCE10');
        }
    });
    el('builder-add').addEventListener('click', addCustom);
    el('go-checkout').addEventListener('click', () => {
        if (cart.length)
            location.hash = '#checkout';
    });
    el('apply-coupon').addEventListener('click', applyCoupon);
    el('checkout-form').addEventListener('submit', checkout);
    el('pix-copy-button').addEventListener('click', copyDemoPix);
    el('pix-confirm-button').addEventListener('click', confirmDemoPix);
    document.addEventListener('click', event => {
        const btn = event.target.closest('[data-pix-order]');
        if (btn) {
            event.preventDefault();
            reopenDemoPix(btn.dataset.pixOrder);
        }
    });
    el('coupon-code').addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyCoupon();
        }
    });
    window.addEventListener('hashchange', route);
        const yearElement = el('current-year');

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    renderProducts();
    renderBuilder();
    renderCart();
    renderCheckout();
    renderTracking();
    renderAccount();
    renderChatNotices();
    route();
    initializeBackend();
    // Atualiza avisos sem exigir F5; somente com o site visível e a conta cliente ativa.
    setInterval(() => {
        if (document.visibilityState === 'visible' && currentUser?.papel === 'CLIENTE' && apiOnline)
            refreshOrders().catch(() => { });
    }, 20000);
})();
