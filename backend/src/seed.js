'use strict';
const catalog = require('./catalog.json');
async function seed(pool) {
    const categories = { classicos: 'Clássicos', especiais: 'Especiais', frutados: 'Frutados' };
    const ids = {};
    for (const [slug, name] of Object.entries({ ...categories, personalizados: 'Personalizados' })) {
        const { rows } = await pool.query('INSERT INTO doce_encanto.categoria(nome) VALUES($1) ON CONFLICT(nome) DO UPDATE SET nome=excluded.nome RETURNING id_categoria', [name]);
        ids[slug] = rows[0].id_categoria;
    }
    for (const p of catalog) {
        await pool.query(`INSERT INTO doce_encanto.produto (id_categoria,slug,nome,descricao,preco,imagem_url,disponivel)
      VALUES($1,$2,$3,$4,$5,$6,TRUE)
      ON CONFLICT(slug) DO NOTHING`, [ids[p.category], p.id, p.name, p.description, (p.price / 100).toFixed(2), `assets/cupcakes/${p.id}.webp`]);
    }
    await pool.query(`INSERT INTO doce_encanto.produto(id_categoria,slug,nome,descricao,preco,disponivel)
    VALUES($1,'personalizado','Meu cupcake especial','Massa + recheio + cobertura',14.90,TRUE)
    ON CONFLICT(slug) DO NOTHING`, [ids.personalizados]);
    await pool.query(`INSERT INTO doce_encanto.cupom(codigo,tipo_desconto,valor,valido_de,valido_ate,limite_usos,ativo)
    VALUES('DOCE10','PERCENTUAL',10,'2025-01-01','2099-12-31',NULL,TRUE)
    ON CONFLICT(codigo) DO NOTHING`);
}
module.exports = { seed };
