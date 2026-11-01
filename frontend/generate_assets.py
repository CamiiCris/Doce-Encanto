from pathlib import Path
import random
p=Path(__file__).parent/'assets'
p.mkdir(exist_ok=True)
flavors=[
('pistache','#91a45f','#607a36','#bed08a','#cfab63','pistachio'),
('red-velvet','#f0a2ad','#c74f73','#ffd6dc','#e95467','cherry'),
('kinder-bliss','#e9ceaa','#a96a52','#fff3da','#754938','chocolate'),
('tropical','#ffd38e','#ef965e','#ffe5b8','#d7763b','orange'),
('doce-de-leite','#e7b980','#b97d4d','#f8deb8','#a7683e','caramel'),
('chocolate','#79524d','#4f333b','#b88b7d','#57312c','chocolate'),
('blueberry','#b6a0d4','#816ba8','#e3d7f5','#574b8c','berry'),
('baunilha','#f3dce2','#e6abbc','#fff1e9','#da789c','cherry'),
]
for name, base, shade, light, accent, top in flavors:
    rnd=random.Random(name)
    toppings=''
    if top=='pistachio':
        for i in range(16):
            x=rnd.randrange(133,233); y=rnd.randrange(188,303)
            toppings+=f'<ellipse cx="{x}" cy="{y}" rx="{rnd.randrange(3,7)}" ry="{rnd.randrange(2,4)}" transform="rotate({rnd.randrange(-80,81)} {x} {y})" fill="{rnd.choice(["#6d813f","#d4bd74","#476237"])}" opacity=".9"/>'
        toppings+='<path d="M172 137q14 -17 25 -4q-11 24 -25 4z" fill="#6a8244"/>'
    if top=='cherry':
        toppings+='''<path d="M183 146q2-28 18-35" fill="none" stroke="#577d48" stroke-width="4" stroke-linecap="round"/><path d="M199 115q-16-10-24-1q8 14 24 1" fill="#6c9d53"/><circle cx="182" cy="151" r="17" fill="#c84764"/><circle cx="174" cy="145" r="6" fill="#ff8997" opacity=".7"/>'''
    if top=='chocolate':
        for i in range(11):
            x=rnd.randrange(124,237);y=rnd.randrange(178,305)
            toppings+=f'<rect x="{x}" y="{y}" width="{rnd.randrange(7,15)}" height="{rnd.randrange(4,9)}" rx="2" transform="rotate({rnd.randrange(-45,46)} {x} {y})" fill="{rnd.choice(["#5b372e","#88604a","#f5e1bc"])}"/>'
        toppings+='<path d="M161 161l21-23 17 12-17 23z" fill="#7f5846" stroke="#f0dcc0" stroke-width="3"/><path d="M184 136l19-20 16 14-18 20z" fill="#a77d59" stroke="#f8e9d7" stroke-width="3"/>'
    if top=='orange':
        toppings+='''<path d="M193 135 A29 29 0 0 1 236 177 L192 164 Z" fill="#ffb54c" stroke="#fff1c1" stroke-width="5"/><path d="M193 164l33-3M193 164l19-23" stroke="#fff1c1" stroke-width="2"/><path d="M163 154q20-18 30 1q-16 22-30-1" fill="#639558"/>'''
    if top=='caramel':
        toppings+='''<path d="M124 251q14 5 23 1t23 2t22-2t27 4t32-1" stroke="#a86c3c" stroke-width="10" opacity=".72" fill="none" stroke-linecap="round"/><path d="M157 152q16-10 30 0" stroke="#fdf0cb" stroke-width="8" stroke-linecap="round" fill="none"/>'''
    if top=='berry':
        for x,y,r in [(181,143,13),(202,159,11),(162,167,10)]:
            toppings+=f'<circle cx="{x}" cy="{y}" r="{r}" fill="#67528e"/><circle cx="{x-4}" cy="{y-4}" r="4" fill="#b2a3d4"/>'
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="520" viewBox="0 0 360 450" role="img" aria-label="Cupcake de {name}">
<defs>
 <linearGradient id="cream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{light}"/><stop offset=".50" stop-color="{base}"/><stop offset="1" stop-color="{shade}"/></linearGradient>
 <linearGradient id="cup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5c9ae"/><stop offset=".45" stop-color="#d99e84"/><stop offset="1" stop-color="#be776b"/></linearGradient>
 <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
 </defs>
 <ellipse cx="184" cy="414" rx="106" ry="17" fill="#b7897d" opacity=".19" filter="url(#shadow)"/>
 <path d="M118 291L248 291L231 399Q185 423 138 399Z" fill="url(#cup)" stroke="#c88f7f" stroke-width="2"/>
 <path d="M125 305L243 305" stroke="#fff2e3" stroke-width="6" stroke-linecap="round" opacity=".7"/>
 <path d="M138 313l14 91M155 311l10 99M175 309l4 106M196 310l-4 104M218 311l-11 100M235 310l-18 95" stroke="#fff3e5" stroke-width="4" opacity=".40"/>
 <path d="M127 301Q96 291 104 265Q110 250 130 246Q95 241 106 216Q113 196 146 197Q128 182 145 168Q159 152 170 149Q158 137 170 123Q184 106 187 91Q195 117 208 128Q224 140 214 160Q243 164 237 193Q266 202 258 228Q276 248 252 267Q267 288 242 303Z" fill="url(#cream)" stroke="{shade}" stroke-width="3" stroke-linejoin="round"/>
 <path d="M127 271Q179 298 247 269M114 235Q182 267 256 234M139 198Q194 224 238 196M168 163Q197 177 219 160" fill="none" stroke="{shade}" stroke-width="12" opacity=".52" stroke-linecap="round"/>
 <path d="M126 261Q172 284 231 262M123 223Q186 244 241 221M154 185Q196 204 224 184M176 145Q193 156 208 143" stroke="{light}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".87"/>
 <path d="M120 267q12 25 33 31M118 218q8-11 22-12M166 166q-7 9-8 17M187 113q-11 17-5 29" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".43"/>
 {toppings}
 </svg>'''
    (p/f'{name}.svg').write_text(svg,encoding='utf8')
# decorative brand stamp
(p/'brand-sparkle.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M40 5Q45 35 75 40Q45 45 40 75Q35 45 5 40Q35 35 40 5Z" fill="#c77886"/></svg>''')
print('Created',len(flavors),'SVG cupcake illustrations')
