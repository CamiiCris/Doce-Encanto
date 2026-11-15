// Pequena atualização dos arquivos existentes, sem substituí-los inteiros.
// Execute na raiz do Doce Encanto: node APLICAR_AJUSTES_FORMULARIO.mjs
import fs from 'node:fs';

const targets = [
    {
        name: 'backend/src/setup.js',
        anchor: "await pool.query(fs.readFileSync(path.join(__dirname, '../sql/007_avaliacao.sql'), 'utf8'));",
        addition: "\n        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/008_teste_solucao.sql'), 'utf8'));"
    },
    {
        name: 'backend/src/admin.js',
        anchor: 'sugestao, criado_em FROM doce_encanto.avaliacao_usabilidade',
        replacement: 'sugestao, criado_em, nome_colega, data_teste, nao_testado FROM doce_encanto.avaliacao_usabilidade'
    }
];
const pending = [];
for (const { name, anchor, addition, replacement } of targets) {
    if (!fs.existsSync(name)) throw new Error(`Arquivo não encontrado: ${name}. Execute na pasta principal do Doce Encanto.`);
    const content = fs.readFileSync(name, 'utf8');
    const expected = replacement ?? addition.trim();
    if (content.includes(expected)) {
        console.log(`${name}: já atualizado.`);
        continue;
    }
    if (!content.includes(anchor)) {
        throw new Error(`Não encontrei o trecho esperado em ${name}; nenhum arquivo foi alterado. Envie esse arquivo para conferência.`);
    }
    const result = replacement ? content.replace(anchor, replacement) : content.replace(anchor, anchor + addition);
    pending.push({ name, result });
}
for (const {name, result} of pending) {
    fs.writeFileSync(name, result, 'utf8');
    console.log(`${name}: atualizado.`);
}
console.log('Arquivos auxiliares preparados. Falta executar a migração SQL no banco (Neon e/ou local).');
