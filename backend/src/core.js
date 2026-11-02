'use strict';
const { scrypt, randomBytes, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const scryptAsync = promisify(scrypt);
// Os preços são valores inteiros em centavos. NUNCA receber valores cobrados do navegador.
const options = Object.freeze({
    massa: { baunilha: 0, chocolate: 100, red: 200 },
    recheio: { 'doce-leite': 0, brigadeiro: 200, avela: 300, morango: 200 },
    cobertura: {
        rosa: 0,
        pistache: 300,
        chocolate: 200,
        tropical: 200,
        baunilha: 0,
        blueberry: 300,
        framboesa: 300,
        limao: 100
    }
});
function fail(message, status = 400) { const err = new Error(message); err.status = status; throw err; }
function cleanEmail(value) { return String(value || '').trim().toLowerCase(); }
function validateEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254; }
function sanitizeRecipe(recipe) {
    if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe))
        fail('Receita personalizada inválida.');
    const obj = {};
    for (const kind of Object.keys(options)) {
        if (typeof recipe[kind] !== 'string' || !Object.hasOwn(options[kind], recipe[kind]))
            fail(`Opção de ${kind} inválida.`);
        obj[kind] = recipe[kind];
    }
    return obj;
}
function customPrice(recipe) {
    const r = sanitizeRecipe(recipe);
    return 1490 + options.massa[r.massa] + options.recheio[r.recheio] + options.cobertura[r.cobertura];
}
function validateItems(items) {
    if (!Array.isArray(items) || items.length < 1 || items.length > 30)
        fail('Escolha de 1 a 30 itens diferentes.');
    let count = 0;
    return items.map(item => {
        if (!item || typeof item !== 'object')
            fail('Item inválido.');
        const qty = item.qty;
        if (!Number.isInteger(qty) || qty < 1 || qty > 99)
            fail('Quantidade inválida (1 a 99).');
        count += qty;
        if (count > 99)
            fail('O pedido pode conter no máximo 99 unidades.');
        if (item.custom === true)
            return { id: 'personalizado', custom: true, recipe: sanitizeRecipe(item.recipe), qty };
        if (typeof item.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(item.id) || item.id === 'personalizado')
            fail('Produto inválido.');
        return { id: item.id, custom: false, qty };
    });
}
function priceCart(items, catalog, coupon = null) {
    const normalized = validateItems(items);
    const lines = normalized.map(item => {
        const product = catalog.get(item.id);
        if (!product || !product.disponivel)
            fail('Um dos produtos não está disponível no momento.');
        const unitCents = item.custom ? customPrice(item.recipe) : product.priceCents;
        if (!Number.isInteger(unitCents) || unitCents <= 0)
            fail('Preço do produto inválido.');
        return { ...item, dbId: product.dbId, name: item.custom ? 'Meu cupcake especial' : product.name, unitCents, amountCents: unitCents * item.qty };
    });
    const subtotalCents = lines.reduce((s, line) => s + line.amountCents, 0);
    if (subtotalCents > 100000000)
        fail('Total do pedido acima do limite.');
    let discountCents = 0;
    if (coupon) {
        if (coupon.tipo_desconto === 'PERCENTUAL')
            discountCents = Math.round(subtotalCents * Number(coupon.valor) / 100);
        else
            discountCents = Math.round(Number(coupon.valor) * 100);
        discountCents = Math.min(subtotalCents, discountCents);
    }
    const deliveryCents = subtotalCents >= 8000 ? 0 : 790;
    const totalCents = subtotalCents - discountCents + deliveryCents;
    return { lines, subtotalCents, discountCents, deliveryCents, totalCents };
}
function validateAddress(body) {
    if (!body || typeof body !== 'object')
        fail('Endereço obrigatório.');

    const str = (key, max) =>
        String(body[key] || '').trim().slice(0, max + 1);

    const cepDigitado = String(body.cep || '').replace(/\D/g, '');

    const address = {
        logradouro: str('logradouro', 150),
        numero: str('numero', 15),
        complemento: str('complemento', 80),
        bairro: str('bairro', 80),
        cidade: str('cidade', 80) || 'Não informada',
        uf: str('uf', 2).toUpperCase() || 'NI',
        cep: cepDigitado.length === 8 ? cepDigitado : '00000000'
    };

    if (
        !address.logradouro ||
        !address.numero ||
        !address.bairro ||
        address.logradouro.length > 150 ||
        address.numero.length > 15 ||
        address.bairro.length > 80 ||
        address.complemento.length > 80
    ) {
        fail('Informe rua, número e bairro para registrar o pedido.');
    }

    return address;
}
const hashToken = token => createHash('sha256').update(token).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');
async function passwordHash(password) {
    if (typeof password !== 'string' || password.length < 10 || password.length > 128)
        fail('Escolha uma senha de 10 a 128 caracteres.');
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    return `scrypt$${salt}$${hash.toString('hex')}`;
}
async function passwordCheck(password, stored) {
    if (typeof password !== 'string' || password.length > 128 || typeof stored !== 'string')
        return false;
    const [algorithm, salt, expected] = stored.split('$');
    if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(expected || ''))
        return false;
    const actual = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    return timingSafeEqual(Buffer.from(expected, 'hex'), actual);
}
module.exports = { fail, cleanEmail, validateEmail, validateAddress, validateItems, priceCart, customPrice, hashToken, newToken, passwordHash, passwordCheck };
