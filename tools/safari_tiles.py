#!/usr/bin/env python3
"""Tileset da Zona Safari, 16x16, estilo Pokémon de Game Boy / GBA.

Cada tile é uma grade de 16 letras x 16 linhas; a letra é um índice de cor que o jogo
troca por região (grama do campo, da floresta, do lago, cinza do vulcão). O script
desenha uma cena de exemplo em PNG para conferir, e exporta as grades em JSON para
`screens/safari.html`.

Uso:  python3 tools/safari_tiles.py preview.png [tiles.json]
"""
from PIL import Image
import sys

N = 16


def g(txt):
    r = [x for x in txt.strip('\n').split('\n')]
    assert len(r) == N, 'esperava %d linhas, veio %d' % (N, len(r))
    for i, x in enumerate(r):
        assert len(x) == N, 'linha %d tem %d colunas' % (i, len(x))
    return r


# ---------------------------------------------------------------- chão
# a = base, b = escuro, c = claro
GRASS = g("""
aaaaaaaaaaaaaaaa
aaaaabaaaaaaaaaa
aaaab.baaaacaaaa
aaaaaaaaaaaaaaaa
aacaaaaaaaaaaaba
aaaaaaaabaab.baa
aaaaaaab.baaaaaa
aaaaaaaaaaaaaaaa
aaaaaaaaaaaacaaa
abaaaaaaaaaaaaaa
b.baaaacaaaaabaa
aaaaaaaaaaaab.ba
aaaaaaaaaaaaaaaa
aaaaabaaaaaaaaaa
aaaab.baaacaaaaa
aaaaaaaaaaaaaaaa
""".replace('.', 'a'))

# grama alta: dois quadros (as folhas trocam de lado)
TALL0 = g("""
bbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbb
bcbbbbcbbbcbbbbc
bccbbcccbccbbccc
bbccccbbccccbbcc
bbbccbbbbccbbbbc
bbbbbbbbbbbbbbbb
cbbbbcbbbbcbbbbb
ccbbcccbbcccbbbc
bccccbbccccbbccc
bbccbbbbccbbbbcc
bbbbbbbbbbbbbbbb
bbbcbbbbcbbbbcbb
bbcccbbcccbbcccb
bccbbcccbbcccbbc
bbbbbbbbbbbbbbbb
""")
TALL1 = g("""
bbbbbbbbbbbbbbbb
bbbbbbbbbbbbbbbb
cbbbbcbbbcbbbbcb
cccbbccbbccbbccb
bccccbbccccbbccb
cbbccbbbbccbbbbb
bbbbbbbbbbbbbbbb
bcbbbbcbbbbcbbbb
cccbbcccbbcccbbb
bbccccbbccccbbcc
bbbccbbbbccbbbbc
bbbbbbbbbbbbbbbb
bbbbcbbbbcbbbbcb
bbbcccbbcccbbccc
bbccbbcccbbcccbb
bbbbbbbbbbbbbbbb
""")

# água: a base, b escuro, c espuma
WATER0 = g("""
aaaaaaaaaaaaaaaa
aaabbaaaaaaaaaaa
aabaabaaaaabbaaa
aaaaaaaaaabaabaa
aaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaa
aaaaaaabbaaaaaaa
aaaaaabaabaaaaaa
aaaaaaaaaaaaaaaa
aabbaaaaaaaaaaaa
abaabaaaaaaabbaa
aaaaaaaaaaabaaba
aaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaa
aaaaabbaaaaaaaaa
aaaabaabaaaaaaaa
""")
WATER1 = g("""
aaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaa
aaaabbaaaaaaabba
aaabaabaaaaabaab
aaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaa
aaaaaaaabbaaaaaa
aaaaaaabaabaaaaa
aaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaa
aaabbaaaaaaaabba
aabaabaaaaaabaab
aaaaaaaaaaaaaaaa
aaaaaaaaaaaaaaaa
aaaaaabbaaaaaaaa
aaaaabaabaaaaaaa
""")

SAND = g("""
aaaaaaaaaaaaaaaa
aaaaabaaaaaaaaaa
aaaaaaaaaaaacaaa
aacaaaaaaaaaaaaa
aaaaaaaaabaaaaaa
aaaaaaaaaaaaaaaa
abaaaaaaaaaaacaa
aaaaaaacaaaaaaaa
aaaaaaaaaaaaaaba
aaaacaaaaaaaaaaa
aaaaaaaaaabaaaaa
abaaaaaaaaaaaaaa
aaaaaaaaaaaacaaa
aaaaacaaaaaaaaaa
aaaaaaaaabaaaaaa
aaaaaaaaaaaaaaaa
""")

PATH = g("""
aaaaaaaaaaaaaaaa
aabaaaaaaaaabaaa
aaaaaaaacaaaaaaa
aaaaabaaaaaaaaba
acaaaaaaaaaaaaaa
aaaaaaaaabaaaaaa
aaaaaaaaaaaaacaa
aabaaacaaaaaaaaa
aaaaaaaaaaabaaaa
aaaaaaaaaaaaaaaa
acaaaaaaabaaaaca
aaaaabaaaaaaaaaa
aaaaaaaaaaaaaaaa
aabaaaaacaaaaaba
aaaaaaaaaaaaaaaa
aaaacaaaaaaaaaaa
""")

# lava: a base, b escuro (crosta), c brilho
LAVA0 = g("""
aaaabaaaaaaaaaaa
aaabbbaaaaaacaaa
aaaabaaaaaaaaaaa
aaaaaaaaaaabaaaa
caaaaaaaaabbbaaa
aaaaaaaaaaabaaaa
aaaaaaaaaaaaaaaa
aaaaacaaaaaaaaca
aaaaaaaaaaaaaaaa
aabaaaaaaaaaaaaa
abbbaaaacaaaaaaa
aabaaaaaaaaabaaa
aaaaaaaaaaabbbaa
aaaacaaaaaaabaaa
aaaaaaaaaaaaaaaa
aaaaaaaacaaaaaaa
""")
LAVA1 = g("""
aaaaaaaaaaaaaaaa
aaaacaaaaaaabaaa
aaaaaaaaaaabbbaa
aabaaaaaaaaabaaa
abbbaaaacaaaaaaa
aabaaaaaaaaaaaaa
aaaaaaaaaaaaaaca
aaaaaaaaaaaaaaaa
aaaaacaaaaabaaaa
aaaaaaaaaabbbaaa
aaaaaaaaaaabaaaa
caaaaaaaaaaaaaaa
aaaabaaaaaaaacaa
aaabbbaaaaaaaaaa
aaaabaaaaaaaaaaa
aaaaaaaacaaaaaaa
""")

# flores por cima da grama (fundo transparente): d borda, p pétala, y miolo
FLOWER = g("""
................
................
...ddd..........
..dpppd.........
..dpypd.....ddd.
..dpppd....dpppd
...ddd.....dpypd
...........dpppd
............ddd.
................
...ddd..........
..dpppd.........
..dpypd.........
..dpppd.........
...ddd..........
................
""")

# ---------------------------------------------------------------- objetos
# árvore 32x32 (2x2 tiles). n/m/N copa, r/R tronco, s sombra, . transparente
TREE = """
.......sssssssssssssssss........
.....ssnnnnnnnnnnnnnnnnnss......
...ssnnnnnnnnnnnnnnnnnnnnnss....
..snnnnnnmmmmmmmmmmmnnnnnnnns...
.snnnnmmmmmmmmmmmmmmmmmmmnnnns..
.snnnmmmmmNNNNNmmmmmmmmmmmmnnns.
snnnmmmmNNNNNNNNNmmmmmmmmmmmnnns
snnmmmmNNNNNNNNNNNmmmmmmmmmmmnns
snnmmmNNNNNNNNNNNNNmmmmmmmmmmnns
snmmmmNNNNNNNNNNNNNmmmmmmmmmmmns
snmmmmNNNNNNNNNNNNmmmmmmmmmmmmns
snmmmmmNNNNNNNNNmmmmmmmmmmmmmmns
snmmmmmmNNNNNNmmmmmmmmmmmmmmmmns
snmmmmmmmmmmmmmmmmmmmmmmmmmmmmns
snnmmmmmmmmmmmmmmmmmmmmmmmmmmnns
snnmmmmmmmmmmmmmmmmmmmmmmmmmmnns
.snnmmmmmmmmmmmmmmmmmmmmmmmmnns.
.snnnmmmmmmmmmmmmmmmmmmmmmmnnns.
..snnnnmmmmmmmmmmmmmmmmmmnnnns..
...ssnnnnnmmmmmmmmmmmmnnnnnss...
.....ssnnnnnnnnnnnnnnnnnnss.....
.......sssnnnnnnnnnnnsss........
..........sRRRRRRRRs............
..........sRRrrrrRRs............
..........sRRrrrrRRs............
..........sRRrrrrRRs............
.......SSSsRRrrrrRRsSSS.........
.....SSSSSSSRRrrrrRSSSSSSS......
....SSSSSSSSSSSSSSSSSSSSSS......
.....SSSSSSSSSSSSSSSSSSSS.......
.......SSSSSSSSSSSSSSSS.........
..........SSSSSSSSSS............
"""

ROCK = """
................
................
................
.....ssssss.....
...sslllllss....
..slllllllmms...
.sllllllmmmmms..
.sllllmmmmmmms..
.slllmmmmmmmdms.
.smmmmmmmmdddms.
.ssmmmmmdddddss.
..sssdddddddss..
....ssssssss....
................
................
................
"""

FENCE = """
................
................
.rr..........rr.
.rr..........rr.
.rrrrrrrrrrrrrr.
.rrrrrrrrrrrrrr.
.rr..........rr.
.rr..........rr.
.rrrrrrrrrrrrrr.
.rrrrrrrrrrrrrr.
.rr..........rr.
.rr..........rr.
.ss..........ss.
................
................
................
"""

PALS = {
    'campo':    dict(a='#6cc24a', b='#43963a', c='#97dd6a'),
    'lago':     dict(a='#73c86a', b='#45a05e', c='#a4e58c'),
    'floresta': dict(a='#4da443', b='#2f7a33', c='#73c45c'),
    'vulcao':   dict(a='#7a6860', b='#514440', c='#9a877c'),
}
TALLP = {
    'campo':    dict(b='#2f8a35', c='#5fc24a'),
    'lago':     dict(b='#2d8a52', c='#5fc97e'),
    'floresta': dict(b='#1f6b2c', c='#44a243'),
    'vulcao':   dict(b='#6a5a34', c='#b8a254'),
}
WATERP = dict(a='#2f6fd0', b='#2353a8', c='#bfe4ff')
SANDP = dict(a='#efd79b', b='#d6b776', c='#fdf0c2')
PATHP = dict(a='#dcbd82', b='#bb9557', c='#f0dcae')
LAVAP = dict(a='#f2651a', b='#8f2a0c', c='#ffd25a')
FLOWP = dict(d='#c0396a', p='#ff8ab4', y='#ffe27a')
TREEP = {
    'campo':    dict(n='#1f6b2c', m='#3a9a3c', N='#63c552', r='#7a4a22', R='#9d6530', s='#16341c', S='#1b3a22'),
    'lago':     dict(n='#1f7a46', m='#3aa55c', N='#6fd08a', r='#7a4a22', R='#9d6530', s='#143a26', S='#17382a'),
    'floresta': dict(n='#14521f', m='#2a7a2c', N='#49a33f', r='#5f3a1b', R='#7e5126', s='#0f2a16', S='#102a18'),
    'vulcao':   dict(n='#4a3a32', m='#6a5447', N='#8a6f5c', r='#3f2c22', R='#5a4030', s='#241a14', S='#1e1612'),
}
ROCKP = {
    'campo': dict(l='#d9dbe4', m='#a3a7b6', d='#73788c', s='#3c4152'),
    'vulcao': dict(l='#8a7b74', m='#5e514c', d='#3e3431', s='#241c1a'),
}
FENCEP = dict(r='#b07a3c', s='#6b4420')


def paint(grid, pal, zoom=1, bg=None):
    h, w = len(grid), len(grid[0])
    im = Image.new('RGBA', (w * zoom, h * zoom), bg or (0, 0, 0, 0))
    p = im.load()
    for y, line in enumerate(grid):
        for x, ch in enumerate(line):
            if ch == '.' or ch not in pal:
                continue
            c = pal[ch]
            rgb = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
            for a in range(zoom):
                for b in range(zoom):
                    p[x * zoom + a, y * zoom + b] = rgb
    return im


def blk(txt):
    r = [l for l in txt.strip('\n').split('\n')]
    w = len(r[0])
    for i, l in enumerate(r):
        assert len(l) == w, 'linha %d: %d != %d' % (i, len(l), w)
    return r


def scene(zoom=3):
    """Cena de exemplo: grama, grama alta, lago com borda, flores, árvores e pedra."""
    W, H = 20, 13
    im = Image.new('RGBA', (W * N * zoom, H * N * zoom))
    reg = 'campo'
    gp = PALS[reg]
    gr = paint(GRASS, gp, zoom)
    tp = dict(gp); tp.update(TALLP[reg])
    tg = paint(TALL0, tp, zoom)
    wa = paint(WATER0, WATERP, zoom)
    fl = paint(FLOWER, FLOWP, zoom)
    water = {(x, y) for x in range(9, 17) for y in range(4, 11)} | {(x, y) for x in range(6, 9) for y in range(4, 7)}
    for y in range(H):
        for x in range(W):
            im.paste(gr, (x * N * zoom, y * N * zoom))
    for y in range(H):
        for x in range(W):
            if (x, y) in water:
                im.paste(wa, (x * N * zoom, y * N * zoom))
    # borda da água (2px claros no lado virado para a terra)
    d = im.load()
    edge = tuple(int(WATERP['c'][i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    for (x, y) in water:
        for (dx, dy) in ((0, -1), (0, 1), (-1, 0), (1, 0)):
            if (x + dx, y + dy) in water:
                continue
            for k in range(2 * zoom):
                for t in range(N * zoom):
                    px = x * N * zoom + (t if dx == 0 else (k if dx < 0 else N * zoom - 1 - k))
                    py = y * N * zoom + (t if dy == 0 else (k if dy < 0 else N * zoom - 1 - k))
                    d[px, py] = edge
    for x in range(1, 6):
        for y in range(7, 11):
            im.alpha_composite(tg, (x * N * zoom, y * N * zoom))
    for (x, y) in ((1, 2), (2, 3), (4, 1), (17, 11)):
        im.alpha_composite(fl, (x * N * zoom, y * N * zoom))
    tr = paint(blk(TREE), TREEP[reg], zoom)
    for (x, y) in ((2, 0), (5, 0), (16, 1), (13, 11)):
        im.alpha_composite(tr, (x * N * zoom, (y - 1) * N * zoom + 2 * zoom))
    rk = paint(blk(ROCK), ROCKP['campo'], zoom)
    im.alpha_composite(rk, (7 * N * zoom, 11 * N * zoom))
    return im


TILES = {'GRASS': GRASS, 'TALL0': TALL0, 'TALL1': TALL1, 'WATER0': WATER0, 'WATER1': WATER1,
         'SAND': SAND, 'PATH': PATH, 'LAVA0': LAVA0, 'LAVA1': LAVA1, 'FLOWER': FLOWER,
         'TREE': blk(TREE), 'ROCK': blk(ROCK), 'FENCE': blk(FENCE)}

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'tiles.png'
    scene().save(out)
    if len(sys.argv) > 2:
        import json
        json.dump({'t': {k: ''.join(v) for k, v in TILES.items()},
                   'w': {k: len(v[0]) for k, v in TILES.items()},
                   'pal': {'g': PALS, 'tg': TALLP, 'wa': WATERP, 'sa': SANDP, 'pa': PATHP,
                           'lv': LAVAP, 'fl': FLOWP, 'tr': TREEP, 'ro': ROCKP, 'fe': FENCEP}},
                  open(sys.argv[2], 'w'))
    print('ok')
