'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { customPrice, priceCart, validateItems, validateAddress, passwordHash, passwordCheck, hashToken, newToken } = require('../src/core');
const map = new Map([
    ['red-velvet', { dbId: 1, name: 'Red Velvet Dream', priceCents: 1790, disponivel: true }],
    ['personalizado', { dbId: 2, name: 'Meu cupcake especial', priceCents: 1490, disponivel: true }]
]);
const recipe = { massa: 'chocolate', recheio: 'brigadeiro', cobertura: 'pistache' };
test('preço exato de receita = 14,90 + 1 + 2 + 3', () => assert.equal(customPrice(recipe), 2090));
test('recusa receita desconhecida', () => assert.throws(() => customPrice({ ...recipe, massa: 'inventada' }), /massa inválida/));
test('desconsidera preços falsificados pelo navegador', () => {
    const cart = priceCart([{ id: 'red-velvet', qty: 2, price: -100000 }], map);
    assert.equal(cart.subtotalCents, 3580);
    assert.equal(cart.deliveryCents, 790);
    assert.equal(cart.totalCents, 4370);
});
test('calcula frete grátis a partir de R$ 80,00', () => {
    const cart = priceCart([{ id: 'red-velvet', qty: 5 }], map);
    assert.equal(cart.deliveryCents, 0);
    assert.equal(cart.totalCents, 8950);
});
test('cupom percentual calculado no servidor', () => {
    const cart = priceCart([{ id: 'red-velvet', qty: 2 }], map, { tipo_desconto: 'PERCENTUAL', valor: '10' });
    assert.equal(cart.discountCents, 358);
    assert.equal(cart.totalCents, 4012);
});
test('cupom de valor fixo não reduz abaixo de zero', () => {
    const cart = priceCart([{ id: 'red-velvet', qty: 1 }], map, { tipo_desconto: 'VALOR_FIXO', valor: '1000' });
    assert.equal(cart.discountCents, 1790);
    assert.equal(cart.totalCents, 790);
});
test('dois cupcakes personalizados podem ter combinações diferentes', () => {
    const a = priceCart([
        { custom: true, qty: 1, recipe },
        {
            custom: true,
            qty: 1,
            recipe: { massa: 'baunilha', recheio: 'doce-leite', cobertura: 'rosa' }
        }
    ], map);
    assert.equal(a.lines.length, 2);
    assert.equal(a.subtotalCents, 3580);
});
test('recusa quantidade decimal, negativa e itens em excesso', () => {
    assert.throws(() => validateItems([{ id: 'red-velvet', qty: 1.5 }]), /Quantidade inválida/);
    assert.throws(() => validateItems([{ id: 'red-velvet', qty: -1 }]), /Quantidade inválida/);
    assert.throws(() => validateItems(Array.from({ length: 31 }, () => ({ id: 'red-velvet', qty: 1 }))), /1 a 30/);
});
test('endereço mantém CEP de 8 dígitos e UF maiúscula', () => {
    const addr = validateAddress({ logradouro: 'Rua das Flores', numero: '10', bairro: 'Centro', cidade: 'Curitiba', uf: 'pr', cep: '80000-000' });
    assert.equal(addr.cep, '80000000');
    assert.equal(addr.uf, 'PR');
});
test('senha é protegida com scrypt e confere corretamente', async () => {
    const stored = await passwordHash('senha-de-teste-somente');
    assert.match(stored, /^scrypt\$/);
    assert.equal(await passwordCheck('senha-de-teste-somente', stored), true);
    assert.equal(await passwordCheck('senha-errada', stored), false);
});
test('sessões usam token forte e somente hash persistido', () => {
    const token = newToken();
    assert.equal(token.length, 43);
    assert.match(hashToken(token), /^[a-f0-9]{64}$/);
    assert.notEqual(hashToken(token), token);
});
