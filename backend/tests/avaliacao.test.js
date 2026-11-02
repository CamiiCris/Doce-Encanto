'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateFeedback } = require('../src/avaliacao');
const valid = () => ({
    perfilTestado: 'CLIENTE', dispositivo: 'CELULAR',
    notaNavegacao: 5, notaVisual: 4, notaFacilidade: 5,
    concluiuTarefa: true, pontoPositivo: 'Fácil de navegar',
    dificuldade: '', sugestao: 'Melhorar o tamanho dos botões'
});
test('avaliação válida mantém campos anônimos', () => {
    assert.equal(validateFeedback(valid()).notaVisual, 4);
    assert.equal(Object.hasOwn(validateFeedback(valid()), 'email'), false);
});
test('avaliação recusa notas fora de 1 a 5', () => {
    assert.throws(() => validateFeedback({ ...valid(), notaVisual: 0 }), /notas/);
    assert.throws(() => validateFeedback({ ...valid(), notaVisual: 6 }), /notas/);
    assert.throws(() => validateFeedback({ ...valid(), notaVisual: '5' }), /notas/);
});
test('avaliação recusa perfil e dispositivo desconhecidos', () => {
    assert.throws(() => validateFeedback({ ...valid(), perfilTestado: 'ROOT' }), /perfil/);
    assert.throws(() => validateFeedback({ ...valid(), dispositivo: 'TV' }), /perfil/);
});
test('avaliação limita texto e exige tarefa preenchida', () => {
    assert.throws(() => validateFeedback({ ...valid(), sugestao: 'a'.repeat(701) }), /700/);
    assert.throws(() => validateFeedback({ ...valid(), concluiuTarefa: null }), /tarefa/);
});

test('formulário acadêmico guarda nome, data e funcionalidade não testada', () => {
    const data = validateFeedback({
        ...valid(), nomeColega: 'Pessoa Exemplo', dataTeste: '2026-10-25',
        dificuldade: 'Nenhuma falha', sugestao: 'Nenhuma correção', naoTestado: 'Área administrativa'
    });
    assert.equal(data.nomeColega, 'Pessoa Exemplo');
    assert.equal(data.dataTeste, '2026-10-25');
    assert.equal(data.naoTestado, 'Área administrativa');
});
test('formulário acadêmico exige identificação e respostas', () => {
    const candidate = {
        ...valid(), nomeColega: 'Pessoa Exemplo', dataTeste: '2026-10-25',
        dificuldade: 'Nenhuma falha', sugestao: 'Nenhuma correção', naoTestado: 'Área administrativa'
    };
    assert.throws(() => validateFeedback({ ...candidate, nomeColega: '' }), /nome/);
    assert.throws(() => validateFeedback({ ...candidate, dataTeste: 'not-a-date' }), /data/);
    assert.throws(() => validateFeedback({ ...candidate, naoTestado: '' }), /não testadas/);
    assert.throws(() => validateFeedback({ ...candidate, sugestao: '' }), /corrigido/);
});
