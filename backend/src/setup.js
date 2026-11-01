'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('./db');
const { seed } = require('./seed');
(async () => {
    try {
        const result = await pool.query("SELECT to_regclass('doce_encanto.cliente') AS tabela");
        if (!result.rows[0].tabela) {
            await pool.query(fs.readFileSync(path.join(__dirname, '../sql/001_base.sql'), 'utf8'));
            console.log('Modelo físico original instalado.');
        }
        else
            console.log('Modelo físico existente detectado; preservando dados.');
        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/002_evolucao.sql'), 'utf8'));
        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/003_admin.sql'), 'utf8'));
        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/004_gestao.sql'), 'utf8'));
        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/005_conversas.sql'), 'utf8'));
        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/006_entrega_cliente.sql'), 'utf8'));
        await pool.query(fs.readFileSync(path.join(__dirname, '../sql/007_avaliacao.sql'), 'utf8'));
        await seed(pool);
        console.log('Banco atualizado: entrega confirmada pelo cliente e avaliações de usabilidade. Dados preservados.');
    }
    catch (error) {
        console.error('Erro ao preparar o banco:', error.message);
        process.exitCode = 1;
    }
    finally {
        await pool.end();
    }
})();
