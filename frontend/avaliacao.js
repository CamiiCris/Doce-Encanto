'use strict';
const feedbackForm = document.getElementById('feedback-form');
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
feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('enviar');
    const message = document.getElementById('message');
    const chosen = name => feedbackForm.querySelector(`input[name="${name}"]:checked`)?.value;
    const payload = {
        perfilTestado: document.getElementById('perfil').value,
        dispositivo: document.getElementById('dispositivo').value,
        notaNavegacao: Number(chosen('navegacao')),
        notaVisual: Number(chosen('visual')),
        notaFacilidade: Number(chosen('facilidade')),
        concluiuTarefa: chosen('concluiu') === 'sim',
        pontoPositivo: document.getElementById('positivo').value,
        dificuldade: document.getElementById('dificuldade').value,
        sugestao: document.getElementById('sugestao').value
    };
    button.disabled = true;
    try {
        const response = await fetch('/api/avaliacoes', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok)
            throw new Error(result.erro || 'Não foi possível registrar.');
        message.textContent = result.mensagem;
        message.hidden = false;
        message.style.backgroundColor = '#e6f7eb';
        feedbackForm.reset();
    }
    catch (error) {
        message.textContent = error.message;
        message.hidden = false;
        message.style.backgroundColor = '#fff0f0';
    }
    finally {
        button.disabled = false;
    }
});
