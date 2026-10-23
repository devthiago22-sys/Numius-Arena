#!/usr/bin/env python3
"""Sprites do personagem no mapa, estilo GBA (Pokémon Emerald). 16x22, 3 quadros por direção."""
from PIL import Image
import sys

W, H = 16, 24
# O contorno | H h L cabelo | S s pele | E olho W brilho | J j casaco | K painel | G alça
# P p calça/perna | B b bota | A braço (= casaco) | N mão (pele)

HEAD_D = """
.....OOOOOO.....
...OOHHHHHHOO...
..OHHLLHHHHHHO..
.OHHHLHHHHHHHHO.
.OHHSSSSSSSSHHO.
.OHSSSSSSSSSSHO.
.OHSEESSSSEESHO.
.OHSEWSSSSEWSHO.
.OHSSSSssSSSSHO.
..OOSsssssSOO...
"""
HEAD_U = """
.....OOOOOO.....
...OOHHHHHHOO...
..OHHHHHHHHHHO..
.OHHHHHLLHHHHHO.
.OHHHHHLHHHHHHO.
.OHHHHHHHHHHHHO.
.OHHhHHHHHHhHHO.
.OHhHHHHHHHHhHO.
.OhhHHHHHHHHhhO.
..OOhhhhhhhOO...
"""
HEAD_S = """
....OOOOOO......
..OOHHHHHHOO....
..OHHLLHHHHHO...
.OHHHLHHHHHHHO..
.OHHSSSSSHHHHHO.
.OHSSSSSSSHHHHO.
.OSSEESSSSHHHHO.
.OSSEWSSSSHHHHO.
.OHSSSSSSSHHHHO.
..OSsssSSHHHHO..
"""
BODY_D = """
..OJJJJJJJJJJO..
.OAJJGJKJJJJJAO.
.OAJJJGKJJJJJAO.
.OAJJJJKGJJJJAO.
.ONJkkkkkkkkJNO.
..OOJJJJJJJJOO..
"""
BODY_U = """
..OJJJJJJJJJJO..
.OAJJOGGGGOJJAO.
.OAJJOGGGGOJJAO.
.OAJJOGGGGOJJAO.
.ONJkOOGGOOkJNO.
..OOJJJJJJJJOO..
"""
BODY_S = """
...OJJJJJJJJO...
..OAJJGJJJJJO...
..OAJJGJJJJJO...
..OAJJJJJJJJO...
..ONJkkkkkkJO...
...OOJJJJJJOO...
"""
# pernas: 4 blocos de 5 linhas (17..21), '.' = vazio
LEGS_D0 = """
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OBBBOOBBBO...
...OBBBOOBBBO...
...OOOO..OOOO...
"""
LEGS_D1 = """
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOBBBO...
...OBBBOOBBBO...
...OBBBOOOOO....
...OOOO.........
"""
LEGS_D2 = """
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OPPPOOPPPO...
...OBBBOOPPPO...
...OBBBOOBBBO...
....OOOOOBBBO...
.........OOOO...
"""
LEGS_S0 = """
....OPPPPPO.....
....OPPPPPO.....
....OPPPPPO.....
....OPPPPPO.....
....OPPPPPO.....
....OBBBBBO.....
....OBBBBBO.....
....OOOOOOO.....
"""
LEGS_S1 = """
...OPPPPPPO.....
...OPPPOPPO.....
...OPPO.OPPO....
..OPPO..OPPO....
..OPPO..OPPO....
..OBBO..OBBO....
..OBBO..OBBO....
..OOOO..OOOO....
"""
LEGS_S2 = """
....OPPPPPO.....
....OPPPPPO.....
...OPPPPPPO.....
...OPPOPPPO.....
...OPPOPPO......
...OBBOBBO......
...OBBOBBO......
...OOOOOOO......
"""


def rows(txt, n=None):
    r = [x for x in txt.strip('\n').split('\n')]
    for i, x in enumerate(r):
        assert len(x) == W, 'linha %d: %d col %r' % (i, len(x), x)
    if n:
        assert len(r) == n, 'esperava %d linhas, veio %d' % (n, len(r))
    return r


def frame(head, body, legs, up=0):
    g = [['.'] * W for _ in range(H)]
    def blit(src, y0):
        for j, line in enumerate(src):
            for x, ch in enumerate(line):
                if ch != '.' and 0 <= y0 + j < H:
                    g[y0 + j][x] = ch
    blit(head, 0 - up)
    blit(body, 10 - up)
    blit(legs, 16)
    return g


BODY_DF = """
..OJJJJJJJJJJO..
.OAJJJJKJJJJJAO.
.OAJJJJKJJJJJAO.
.OAJJJJKJJJJJAO.
.ONJGGGGGGGGJNO.
..OOkkkkkkkkOO..
"""
BODY_UF = """
..OJJJJJJJJJJO..
.OAJJOGGGGOJJAO.
.OAJJOGGGGOJJAO.
.OAJJOGGGGOJJAO.
.ONJJOOGGOOJJNO.
..OOkkkkkkkkOO..
"""
BODY_SF = """
...OJJJJJJJJO...
..OAJJJKJJJJO...
..OAJJJKJJJJO...
..OAJJJJJJJJO...
..ONJGGGGGGJO...
...OOkkkkkkOO...
"""
PAL_M = dict(O='#17141f', H='#6b4423', h='#4a2d16', L='#8f6136', S='#f2cfa4', s='#d9a877',
             E='#2a1f1a', W='#ffffff', J='#f07a1e', j='#c25a10', K='#2a2a36', k='#20202c', A='#e06a12',
             G='#3fa34d', N='#f2cfa4', P='#4a4a63', p='#30304a', B='#e8701a', b='#a8480c')
PAL_F = dict(PAL_M, H='#e8c84a', h='#b89a22', L='#fbe886', J='#d8322f', j='#9f1f1d',
             A='#c02a28', G='#2b2b3a', K='#8f1e1c', P='#f2cfa4', p='#d9a877', B='#2e2e3e', b='#1a1a26')


def hair(frames, g, v):
    """cabelo por variação: comprido / chanel / rabo de cavalo (f) e topete (m)"""
    out = [[r[:] for r in f] for f in frames]
    def P(f, y, x, ch):
        if 0 <= y < H and 0 <= x < W:
            f[y][x] = ch
    for i, f in enumerate(out):
        d = 'down' if i < 3 else 'up' if i < 6 else 'side'
        if g == 'f':
            to = [15, 16, 12, 10][v]
            if d == 'up':
                for y in range(10, to + 1):
                    for x in range(2, 14):
                        P(f, y, x, 'h' if x in (2, 3, 12, 13) else ('L' if x in (7, 8) and y < 13 else 'H'))
                    P(f, y, 1, 'O'); P(f, y, 14, 'O')
                for x in range(2, 14):
                    P(f, to + 1, x, 'O')
            else:
                cols = ([1, 2, 13, 14] if v < 2 else [1, 2, 13, 14] if v == 2 else [12, 13, 14])
                for y in range(5, to + 1):
                    for x in cols:
                        wav = (v == 0 and (y % 3 == 2)) or x in (1, 14)
                        P(f, y, x, 'h' if wav else 'H')
                    if 1 in cols: P(f, y, 0, 'O')
                    P(f, y, 15, 'O')
                for x in cols:
                    P(f, to + 1, x, 'O')
                if v == 3 and d == 'side':
                    for y in range(5, to + 1):
                        for x in (10, 11):
                            P(f, y, x, 'H')
        else:
            if v in (0, 3):
                for x, y in ((4, 0), (11, 0), (3, 1), (12, 1)):
                    P(f, y, x, 'H')
                for x, y in ((4, -1), (11, -1)):
                    pass
                P(f, 0, 3, 'O'); P(f, 0, 12, 'O')
    return out


def render(frames, pal, path, zoom=7, bg=(108, 192, 74)):
    im = Image.new('RGB', (W * len(frames) * zoom, H * zoom), bg)
    px = im.load()
    for i, g in enumerate(frames):
        for y in range(H):
            for x in range(W):
                ch = g[y][x]
                if ch == '.':
                    continue
                c = pal.get(ch, '#ff00ff')
                rgb = tuple(int(c[k:k + 2], 16) for k in (1, 3, 5))
                for a in range(zoom):
                    for b in range(zoom):
                        px[(i * W + x) * zoom + a, y * zoom + b] = rgb
    im.save(path)


def build(g='m'):
    hd, hu, hs = rows(HEAD_D, 10), rows(HEAD_U, 10), rows(HEAD_S, 10)
    if g == 'f':
        bd, bu, bs = rows(BODY_DF, 6), rows(BODY_UF, 6), rows(BODY_SF, 6)
    else:
        bd, bu, bs = rows(BODY_D, 6), rows(BODY_U, 6), rows(BODY_S, 6)
    L = [rows(x, 8) for x in (LEGS_D0, LEGS_D1, LEGS_D2, LEGS_S0, LEGS_S1, LEGS_S2)]
    return [frame(hd, bd, L[0]), frame(hd, bd, L[1], 1), frame(hd, bd, L[2], 1),
            frame(hu, bu, L[0]), frame(hu, bu, L[1], 1), frame(hu, bu, L[2], 1),
            frame(hs, bs, L[3]), frame(hs, bs, L[4], 1), frame(hs, bs, L[5], 1)]


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'gba'
    render(build('m'), PAL_M, out + '_m.png')
    render(build('f'), PAL_F, out + '_f.png')
    if len(sys.argv) > 2:
        import json
        json.dump({g + str(v): [''.join(''.join(r) for r in f) for f in hair(build(g), g, v)] for g in 'mf' for v in range(4)}, open(sys.argv[2], 'w'))
    print('ok')
