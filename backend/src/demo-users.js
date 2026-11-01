'use strict';
// Preparação explícita para apresentação acadêmica. Não roda automaticamente no setup.
require('dotenv').config();
const { randomBytes } = require('node:crypto');
const { pool } = require('./db');
const { passwordHash } = require('./core');
async function main() {
    if (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production') {
        throw new Error('Defina DEMO_MODE=true e NODE_ENV=development no .env antes de criar contas de teste.');
    }
    const users = [
        { name: 'Administração Doce Encanto', email: 'admin.demo@doceencanto.test', role: 'ADMIN' },
        { name: 'Cliente de Demonstração', email: 'cliente.demo@doceencanto.test', role: 'CLIENTE' }
    ];
    for (const user of users) {
        const password = randomBytes(18).toString('base64url');
        const hash = await passwordHash(password);
        // Não altera cadastros pessoais nem outros e-mails: apenas as contas especiais de teste.
        await pool.query(`INSERT INTO doce_encanto.cliente(nome,email,senha_hash,papel,ativo)
     VALUES($1,$2,$3,$4,TRUE)
     ON CONFLICT DO NOTHING`, [user.name, user.email, hash, user.role]);
        const { rows } = await pool.query(`UPDATE doce_encanto.cliente SET nome=$2,senha_hash=$3,papel=$4,ativo=TRUE
       WHERE lower(email)=$1 RETURNING id_cliente`, [user.email, user.name, hash, user.role]);
        if (rows.length !== 1)
            throw new Error('Não foi possível preparar a conta ' + user.role);
        await pool.query('UPDATE doce_encanto.sessao_cliente SET revogado_em=now() WHERE id_cliente=$1 AND revogado_em IS NULL', [rows[0].id_cliente]);
        console.log(`\n${user.role} | e-mail: ${user.email}\nSenha de teste gerada: ${password}`);
    }
    console.log('\nATENÇÃO: anote as senhas acima. Elas não são salvas em texto puro e serão trocadas se executar demo:users novamente.\nContas de teste: apenas em ambiente local. Não publique credenciais nem exponha este servidor à internet.');
}
main().catch(e => { console.error('Falha ao criar usuários de teste:', e.message); process.exitCode = 1; }).finally(() => pool.end());
