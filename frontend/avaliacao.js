'use strict';

const feedbackForm = document.getElementById('feedback-form');
const today = new Date();
const localDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
const dateField = document.getElementById('data-teste');
dateField.value = localDate;
dateField.max = localDate;

for (const name of ['navegacao', 'visual', 'facilidade']) {
    const container = document.getElementById(`nota-${name}`);
    for (let grade = 1; grade <= 5; grade += 1) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = String(grade);
        input.required = true;
        label.append(input, document.createTextNode(String(grade)));
        container.append(label);
    }
}

feedbackForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.getElementById('enviar');
    const message = document.getElementById('message');
    const chosen = name => feedbackForm.querySelector(`input[name="${name}"]:checked`)?.value;
    const payload = {
        nomeColega: document.getElementById('nome-colega').value.trim(),
        dataTeste: dateField.value,
        perfilTestado: document.getElementById('perfil').value,
        dispositivo: document.getElementById('dispositivo').value,
        notaNavegacao: Number(chosen('navegacao')),
        notaVisual: Number(chosen('visual')),
        notaFacilidade: Number(chosen('facilidade')),
        concluiuTarefa: chosen('concluiu') === 'sim',
        pontoPositivo: document.getElementById('positivo').value.trim(),
        dificuldade: document.getElementById('dificuldade').value.trim(),
        sugestao: document.getElementById('sugestao').value.trim(),
        naoTestado: document.getElementById('nao-testado').value.trim()
    };
    message.hidden = true;
    button.disabled = true;
    button.textContent = 'Enviando...';
    try {
        const response = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.erro || 'Não foi possível registrar o teste.');
        message.textContent = result.mensagem || 'Resultado do teste registrado com sucesso.';
        message.dataset.type = 'success';
        message.hidden = false;
        feedbackForm.reset();
        dateField.value = localDate;
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        message.textContent = error.message || 'Falha ao enviar a avaliação.';
        message.dataset.type = 'error';
        message.hidden = false;
    } finally {
        button.disabled = false;
        button.textContent = 'Enviar resultado do teste';
    }
});
