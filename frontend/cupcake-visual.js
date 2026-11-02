
(() => {
    'use strict';
    const tint = {
        massa: {
            baunilha: ['#f2c382', '#ffe0a4', '#c88646'],
            chocolate: ['#78503c', '#b88566', '#4d2b27'],
            red: ['#b74356', '#e68183', '#832b42']
        },
        recheio: {
            'doce-leite': ['#bc6f32', '#fbd392', '#904b26'],
            brigadeiro: ['#4b2725', '#ba7761', '#29191a'],
            avela: ['#795039', '#c39168', '#492c23'],
            morango: ['#cf395d', '#ffa0ae', '#9b2449']
        },
        cobertura: {
            rosa: ['#e4a2b6', '#ffe5ea', '#b95f84'],
            pistache: ['#9aba75', '#e1e9b5', '#69824c'],
            chocolate: ['#785149', '#d4a092', '#4f312e'],
            tropical: ['#f0bd64', '#ffeab5', '#ca853b'],
            baunilha: ['#e6d9cd', '#fffaf1', '#b9a9a1'],
            blueberry: ['#a398cc', '#e5dfff', '#7866aa'],
            framboesa: ['#d86c8b', '#ffc1d1', '#a94570'],
            limao: ['#bbd779', '#f0f7c8', '#88ab55']
        }
    };
    const cache = new Map();
    function topping(id) {
        switch (id) {
            case 'pistache': return `<g transform="translate(273 123) rotate(-17)"><ellipse rx="18" ry="11" fill="#6e8942"/><ellipse cx="3" cy="-2" rx="12" ry="7" fill="#cbd68c"/><path d="M-8 5q13-10 23-5" stroke="#627e3b" stroke-width="2" fill="none"/></g><g fill="#5f803d"><ellipse cx="214" cy="230" rx="8" ry="4" transform="rotate(-30 214 230)"/><ellipse cx="321" cy="227" rx="6" ry="4"/></g>`;
            case 'chocolate': return `<g fill="#4e2926" stroke="#d8a080" stroke-width="2"><path d="M245 127q-25-17-8-35 22-16 30 2-14 2-12 15 14 0 19 15Z"/><path d="M285 148q29-29 36-8 5 18-27 19Z"/></g><g fill="#d4a087"><circle cx="216" cy="239" r="4"/><circle cx="328" cy="237" r="3"/></g>`;
            case 'rosa': return `<g transform="translate(265 123)"><path d="M-7 1q-33-20-20-33 14-14 27 9 6-31 26-22 22 15-14 40Z" fill="#e75573" stroke="#bc2f54" stroke-width="4"/><path d="M-3-25 8-13 M-19-29-5-15" stroke="#ffbdc7" stroke-width="4"/><path d="M5-24q14-27 30-26" stroke="#47864c" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
            case 'tropical': return `<g transform="translate(270 119)"><circle r="19" fill="#ffde69" stroke="#f6a42f" stroke-width="4"/><circle cx="-6" cy="-4" r="3.3" fill="#6c4638"/><circle cx="4" cy="-6" r="3" fill="#6c4638"/><circle cx="0" cy="5" r="3" fill="#6c4638"/><circle cx="9" cy="4" r="3" fill="#6c4638"/></g><g fill="#e69527"><circle cx="213" cy="225" r="4"/><circle cx="338" cy="244" r="3"/></g>`;
            case 'baunilha': return `<g transform="translate(272 124) rotate(-12)"><path d="M-22 0q23-31 45-12-5 31-45 12" fill="#fffefa" stroke="#dbd1ba" stroke-width="3"/><path d="M-10-3q17-13 27-9" stroke="#c8b5a6" stroke-width="2" fill="none"/></g><g fill="#fff9f5"><rect x="211" y="230" width="8" height="4" rx="2" transform="rotate(-20 211 230)"/><rect x="316" y="230" width="9" height="4" rx="2"/></g>`;
            case 'blueberry': return `<g transform="translate(273 121)"><circle cx="-12" cy="3" r="15" fill="#5467a0" stroke="#c5d3eb" stroke-width="2"/><circle cx="12" cy="-5" r="16" fill="#6974b3" stroke="#d7d8fa" stroke-width="2"/><circle cx="2" cy="-18" r="14" fill="#40477b"/><path d="m2-26 4 6 8 1-6 5 1 8-7-3-6 3 1-8-5-5 8-1Z" fill="#b6b6d5"/></g>`;
            case 'framboesa': return `<g transform="translate(272 120)" fill="#bf365f" stroke="#f79fba" stroke-width="2"><circle cx="-13" cy="-6" r="9"/><circle cx="0" cy="-14" r="9"/><circle cx="13" cy="-7" r="9"/><circle cx="-9" cy="6" r="10"/><circle cx="7" cy="6" r="10"/><path d="M0-25q13-13 20-5" stroke="#4d8c58" stroke-width="5" fill="none"/></g>`;
            case 'limao': return `<g transform="translate(272 122) rotate(-15)"><path d="M-24 10A28 28 0 0 1 24 10Z" fill="#eaf5ac" stroke="#83a653" stroke-width="4"/><path d="M0-15V9M-18 0 0 9M18 0 0 9" stroke="#fffbe6" stroke-width="3"/></g><g stroke="#62924f" stroke-width="3" fill="none"><path d="m215 240 11-3m88-2 9 4"/></g>`;
            default: return '';
        }
    }
    function sprinkles(id) {
        const colors = id === 'chocolate' ? ['#edc6a5', '#f6daba'] : id === 'pistache' ? ['#6b873d', '#e2e5a2'] : id === 'blueberry' ? ['#544f90', '#ded3f9'] : id === 'tropical' ? ['#e69b3b', '#fff3ad'] : ['#fff0ee', '#f3b4bc'];
        return [[190, 275, 3], [205, 257, 4], [238, 219, 3], [302, 202, 3], [326, 245, 4], [345, 272, 3], [275, 181, 3], [245, 170, 2], [294, 260, 2]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${colors[i % 2]}" opacity=".92"/>`).join('');
    }
    function svg(recipe) {
        const cake = tint.massa[recipe.massa] || tint.massa.baunilha;
        const filling = tint.recheio[recipe.recheio] || tint.recheio['doce-leite'];
        const frosting = tint.cobertura[recipe.cobertura] || tint.cobertura.rosa;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 540" role="img" aria-label="Cupcake personalizado em camadas">
    <defs>
      <linearGradient id="cake" x2="1" y2=".2"><stop stop-color="${cake[2]}"/><stop offset=".4" stop-color="${cake[0]}"/><stop offset=".78" stop-color="${cake[1]}"/><stop offset="1" stop-color="${cake[2]}"/></linearGradient>
      <linearGradient id="filling" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${filling[1]}"/><stop offset=".43" stop-color="${filling[0]}"/><stop offset="1" stop-color="${filling[2]}"/></linearGradient>
      <linearGradient id="frosting" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${frosting[1]}"/><stop offset=".42" stop-color="${frosting[0]}"/><stop offset=".92" stop-color="${frosting[2]}"/></linearGradient>
      <linearGradient id="wrapper"><stop stop-color="#c7798c"/><stop offset=".25" stop-color="#f8d4d5"/><stop offset=".55" stop-color="#f0b8c3"/><stop offset=".87" stop-color="#f8d5d8"/><stop offset="1" stop-color="#b96580"/></linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="11"/></filter>
    </defs>
    <ellipse cx="266" cy="458" rx="148" ry="22" fill="#7e4155" opacity=".16" filter="url(#soft)"/>
    <ellipse cx="270" cy="447" rx="163" ry="27" fill="#fefaf5" stroke="#e1b9bb" stroke-width="5"/>
    <ellipse cx="270" cy="451" rx="129" ry="14" fill="#f5e0dc"/>
    <path d="M158 282q18-29 112-28 95 0 112 28l-18 91q-26 23-94 26-69-3-93-26Z" fill="url(#cake)" stroke="${cake[2]}" stroke-width="5"/>
    <ellipse cx="270" cy="284" rx="112" ry="27" fill="${cake[1]}" stroke="${cake[2]}" stroke-width="4"/>
    <path d="M233 281q-8 19-9 54 3 29 44 35 50-7 51-36 2-36-13-53-19-15-37-15-24 0-36 15Z" fill="${cake[2]}" opacity=".7"/>
    <path d="M241 280q-10 31-8 57 10 23 36 24 31-1 41-26 3-27-10-56-28-18-59 1Z" fill="url(#filling)" stroke="${filling[2]}" stroke-width="5"/>
    <path d="M244 294q8-9 17-6 20 11 40-2M242 311q27-11 54 6" stroke="${filling[1]}" stroke-width="7" stroke-linecap="round" opacity=".6" fill="none"/>
    <g fill="${cake[2]}" opacity=".65"><circle cx="200" cy="308" r="3"/><circle cx="336" cy="305" r="3"/><circle cx="192" cy="329" r="4"/><circle cx="344" cy="329" r="4"/><circle cx="216" cy="347" r="3"/></g>
    <path d="M156 345q114 29 228 0l-30 99q-84 22-170 0Z" fill="url(#wrapper)" stroke="#c17a91" stroke-width="5"/>
    <ellipse cx="270" cy="347" rx="114" ry="15" fill="none" stroke="#ffe4e0" stroke-width="5"/>
    <g stroke="#fff4f2" stroke-width="4" opacity=".72" fill="none"><path d="M177 352 197 440M202 358l13 84M228 363l8 84M251 364l5 86M280 363l-3 85M305 362l-12 83M334 357l-19 86M362 352l-29 89"/></g>
    <g stroke="#b76d83" opacity=".44" stroke-width="3" fill="none"><path d="m191 355 19 83m44-76 3 85m69-89-13 83m44-88-25 87"/></g>
    <path d="M156 281q7-30 40-37-3-26 30-40-2-28 26-45 0-29 17-54 19 22 16 48 28 11 26 42 33 8 35 39 27 13 39 47-101 35-229 0Z" fill="url(#frosting)" stroke="${frosting[2]}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M175 275q57 27 93-8 43 38 96 6M191 240q42 23 80-12 43 25 79 10M226 206q34 20 62-6 24 11 39 4M254 160q16 13 35-1" stroke="${frosting[2]}" stroke-width="8" opacity=".38" fill="none" stroke-linecap="round"/>
    <path d="M184 272q55-24 78-9 22 20 65-12M208 232q34-26 64-20 22 5 45-22M249 180q18-19 39-13" stroke="${frosting[1]}" stroke-width="12" opacity=".75" fill="none" stroke-linecap="round"/>
    <path d="M270 108q-10 13-7 27" stroke="${frosting[1]}" stroke-width="7" opacity=".75" fill="none" stroke-linecap="round"/>
    ${sprinkles(recipe.cobertura)}
    ${topping(recipe.cobertura)}
    <g fill="#fffaf8" opacity=".85"><path d="m109 190 3 13 13 3-13 3-3 13-3-13-13-3 13-3Z"/><path d="m421 142 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z"/><circle cx="397" cy="315" r="3"/></g>
    </svg>`;
    }
    function src(recipe) {
        const clean = {
            massa: tint.massa[recipe?.massa] ? recipe.massa : 'baunilha',
            recheio: tint.recheio[recipe?.recheio] ? recipe.recheio : 'doce-leite',
            cobertura: tint.cobertura[recipe?.cobertura] ? recipe.cobertura : 'rosa'
        };
        const key = Object.values(clean).join(':');
        if (!cache.has(key))
            cache.set(key, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(clean)));
        return cache.get(key);
    }
    window.DoceCupcakeVisual = { src };
})();
