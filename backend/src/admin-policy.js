'use strict';
const transitions = Object.freeze({
    AGUARDANDO_PAGAMENTO: ['CANCELADO'],
    CONFIRMADO: ['ACEITO', 'CANCELADO'],
    ACEITO: ['PREPARANDO', 'CANCELADO'],
    PREPARANDO: ['PRONTO_RETIRADA', 'CANCELADO'],
    PRONTO_RETIRADA: ['EM_ENTREGA', 'CANCELADO'],
    EM_ENTREGA: [],
    ENTREGUE: [], CANCELADO: []
});
const paymentDemoAllowed = env => env.DEMO_MODE === 'true' && env.NODE_ENV !== 'production';
const nextStatusAllowed = (current, next) => Object.hasOwn(transitions, current) && transitions[current].includes(next);
const deliveryStatus = Object.freeze({
    CANCELADO: 'CANCELADA', ACEITO: 'PENDENTE', PREPARANDO: 'PREPARANDO', PRONTO_RETIRADA: 'AGUARDANDO_COLETA', EM_ENTREGA: 'A_CAMINHO', ENTREGUE: 'ENTREGUE'
});
const trackingStatus = Object.freeze({
    ACEITO: 'PEDIDO_RECEBIDO', PREPARANDO: 'PREPARANDO', PRONTO_RETIRADA: 'PRONTO_RETIRADA', EM_ENTREGA: 'A_CAMINHO', ENTREGUE: 'ENTREGUE', CANCELADO: 'OCORRENCIA'
});
const allowedNoticeTypes = new Set(['ATRASO', 'FALTA_PRODUTO', 'PROPOSTA_TROCA']);
const clientMayConfirmReceipt = status => status === 'EM_ENTREGA';
function validateNotice(tipo, mensagem) {
    if (!allowedNoticeTypes.has(tipo))
        return 'Tipo de aviso inválido.';
    if (typeof mensagem !== 'string' || mensagem.trim().length < 8 || mensagem.trim().length > 500)
        return 'A mensagem precisa ter entre 8 e 500 caracteres.';
    return null;
}
module.exports = { transitions, nextStatusAllowed, paymentDemoAllowed, deliveryStatus, trackingStatus, validateNotice, clientMayConfirmReceipt };
