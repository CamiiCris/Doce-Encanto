'use strict';
(function () {
    const feedbackButton = document.querySelector('[data-section="avaliacoes"]');
    const refreshButton = document.getElementById('refresh-feedback');
    const summary = document.getElementById('feedback-summary');
    const items = document.getElementById('feedback-items');
    if (!feedbackButton || !refreshButton || !summary || !items)
        return;
    async function loadFeedback() {
        summary.textContent = 'Carregando avaliações...';
        items.replaceChildren();
        try {
            const response = await fetch('/api/admin/avaliacoes', { credentials: 'same-origin' });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.erro || 'Falha ao carregar avaliações.');
            const reviews = result.avaliacoes || [];
            if (!reviews.length) {
                summary.textContent = 'Nenhuma avaliação externa registrada ainda.';
                return;
            }
            const average = field => (reviews.reduce((sum, r) => sum + Number(r[field]), 0) / reviews.length).toFixed(1);
            summary.textContent = `${reviews.length} avaliação(ões). Navegação: ${average('nota_navegacao')}/5. Visual: ${average('nota_visual')}/5. Facilidade: ${average('nota_facilidade')}/5.`;
            for (const review of reviews) {
                const entry = document.createElement('article');
                entry.className = 'admin-feedback-entry';
                const title = document.createElement('h3');
                title.textContent = `#${review.id_avaliacao} - ${review.perfil_testado} - ${review.dispositivo}`;
                const rating = document.createElement('p');
                rating.textContent = `Notas: navegação ${review.nota_navegacao}, visual ${review.nota_visual}, facilidade ${review.nota_facilidade}. Tarefa concluída: ${review.concluiu_tarefa ? 'sim' : 'não'}.`;
                entry.append(title, rating);
                for (const [label, value] of [['Ponto positivo', review.ponto_positivo], ['Dificuldade', review.dificuldade], ['Sugestão', review.sugestao]]) {
                    if (!value)
                        continue;
                    const para = document.createElement('p');
                    const strong = document.createElement('strong');
                    strong.textContent = `${label}: `;
                    para.append(strong, document.createTextNode(value));
                    entry.append(para);
                }
                items.append(entry);
            }
        }
        catch (error) {
            summary.textContent = error.message;
        }
    }
    feedbackButton.addEventListener('click', loadFeedback);
    refreshButton.addEventListener('click', loadFeedback);
    if (location.hash === '#avaliacoes')
        setTimeout(loadFeedback, 700);
})();
