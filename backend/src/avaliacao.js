'use strict';
const validProfiles = new Set(['CLIENTE', 'ADMIN', 'AMBOS']);
const validDevices = new Set(['CELULAR', 'COMPUTADOR', 'TABLET']);
function validateFeedback(body) {
    if (!body || !validProfiles.has(body.perfilTestado) || !validDevices.has(body.dispositivo)) {
        throw new Error('Selecione o perfil testado e o dispositivo.');
    }
    const grades = ['notaNavegacao', 'notaVisual', 'notaFacilidade'];
    if (grades.some(field => !Number.isInteger(body[field]) || body[field] < 1 || body[field] > 5)) {
        throw new Error('As notas devem ser números inteiros entre 1 e 5.');
    }
    if (typeof body.concluiuTarefa !== 'boolean') {
        throw new Error('Informe se conseguiu concluir a tarefa.');
    }
    const strings = ['pontoPositivo', 'dificuldade', 'sugestao'];
    if (strings.some(field => typeof body[field] !== 'string' || body[field].trim().length > 700)) {
        throw new Error('Respostas inválidas: até 700 caracteres por campo.');
    }
    if (body.pontoPositivo.trim().length < 4) {
        throw new Error('Conte um ponto positivo com ao menos quatro caracteres.');
    }
    // Campos da atividade: nome, data e funcionalidade que não foi testada.
    // A ausência dos três campos preserva compatibilidade com formulários antigos.
    const identified = body.nomeColega !== undefined || body.dataTeste !== undefined || body.naoTestado !== undefined;
    let nomeColega = null;
    let dataTeste = null;
    let naoTestado = '';
    if (identified) {
        if (typeof body.nomeColega !== 'string' || body.nomeColega.trim().length < 2 || body.nomeColega.trim().length > 100) {
            throw new Error('Informe o nome do participante (2 a 100 caracteres).');
        }
        const date = body.dataTeste;
        const dateOk = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
            && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date
            && date <= new Date().toISOString().slice(0, 10);
        if (!dateOk) throw new Error('Informe uma data de teste válida, sem data futura.');
        if (typeof body.naoTestado !== 'string' || body.naoTestado.trim().length < 3 || body.naoTestado.trim().length > 700) {
            throw new Error('Informe as funcionalidades não testadas (ou escreva Nenhuma).');
        }
        if (body.dificuldade.trim().length < 3 || body.sugestao.trim().length < 3) {
            throw new Error('Descreva o que não funcionou e o que deve ser corrigido (ou escreva Nenhuma).');
        }
        nomeColega = body.nomeColega.trim();
        dataTeste = date;
        naoTestado = body.naoTestado.trim();
    }
    return {
        nomeColega,
        dataTeste,
        naoTestado,
        perfilTestado: body.perfilTestado,
        dispositivo: body.dispositivo,
        notaNavegacao: body.notaNavegacao,
        notaVisual: body.notaVisual,
        notaFacilidade: body.notaFacilidade,
        concluiuTarefa: body.concluiuTarefa,
        pontoPositivo: body.pontoPositivo.trim(),
        dificuldade: body.dificuldade.trim(),
        sugestao: body.sugestao.trim()
    };
}
function createFeedbackRouter({ query }) {
    const express = require('express');
    const router = express.Router();
    const attempts = new Map();
    router.post('/', async (req, res, next) => {
        try {
            const data = validateFeedback(req.body);
            const now = Date.now();
            if (attempts.size > 5000)
                attempts.clear();
            const key = req.ip || 'nao-identificado';
            const recent = (attempts.get(key) || []).filter(t => t > now - 60 * 60 * 1000);
            if (recent.length >= 10)
                return res.status(429).json({ erro: 'Limite de avaliações atingido. Tente mais tarde.' });
            const result = await query(`INSERT INTO doce_encanto.avaliacao_usabilidade
                (perfil_testado, dispositivo, nota_navegacao, nota_visual, nota_facilidade, concluiu_tarefa, ponto_positivo, dificuldade, sugestao,
                 nome_colega, data_teste, nao_testado)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id_avaliacao`, [data.perfilTestado, data.dispositivo, data.notaNavegacao, data.notaVisual,
                data.notaFacilidade, data.concluiuTarefa, data.pontoPositivo, data.dificuldade, data.sugestao,
                data.nomeColega, data.dataTeste, data.naoTestado]);
            recent.push(now);
            attempts.set(key, recent);
            res.status(201).json({ mensagem: 'Avaliação recebida. Obrigada por participar!', id: String(result.rows[0].id_avaliacao) });
        }
        catch (error) {
            if (error instanceof Error && /^(Selecione|As notas|Informe|Descreva|Respostas|Conte)/.test(error.message)) {
                return res.status(400).json({ erro: error.message });
            }
            next(error);
        }
    });
    return router;
}
module.exports = { validateFeedback, createFeedbackRouter };
