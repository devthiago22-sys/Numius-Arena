#!/usr/bin/env python3
"""Sprite do personagem no mapa do Safari: 20x28, estilo Pokémon de GBA/NDS.

Desenhado por formas (elipses e retângulos) em vez de ASCII: assim a cabeça sai
redonda e o contorno escuro sai certinho de uma vez. Cada letra é um índice de cor
que o jogo troca por gênero, cabelo e tom de pele.

  O contorno   H/h/L cabelo (meio/sombra/luz)   S/s pele   E/W olho
  J/j/I casaco   A/a braço   N mão   G/g detalhe   K cinto   P/p perna   B/b bota

Uso:  python3 tools/hero_sprite.py preview.png [hero.json]
"""
from PIL import Image
import sys

W, H = 20, 28


def mk():
    return [['.'] * W for _ in range(H)]


def ell(g, cx, cy, rx, ry, ch, y0=-99, y1=99, only=None):
    for y in range(max(0, y0), min(H, y1 + 1)):
        for x in range(W):
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1.0:
                if only is None or g[y][x] in only:
                    g[y][x] = ch


def rect(g, x0, y0, x1, y1, ch, only=None):
    for y in range(max(0, y0), min(H, y1 + 1)):
        for x in range(max(0, x0), min(W, x1 + 1)):
            if only is None or g[y][x] in only:
                g[y][x] = ch


def outline(g):
    out = [r[:] for r in g]
    for y in range(H):
        for x in range(W):
            if g[y][x] != '.':
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < W and 0 <= yy < H and g[yy][xx] != '.':
                    out[y][x] = 'O'
                    break
    return out


def shade_edges(g, mid, dark, side='r'):
    """escurece a borda de uma cor (sombra do lado direito/baixo)"""
    for y in range(H):
        for x in range(W):
            if g[y][x] != mid:
                continue
            nx = x + 1 if side == 'r' else x - 1
            edge = not (0 <= nx < W) or g[y][nx] in ('.', 'O')
            if edge:
                g[y][x] = dark


# ------------------------------------------------------------------ cabeça
def head(g, d, up):
    """d: 'down' | 'up' | 'side'. up = sobe tudo 1 pixel no passo."""
    cx = 10 if d != 'side' else 9.2
    ell(g, cx, 5.2 - up, 6.1, 5.4, 'H')                       # cabelo (volume)
    if d != 'up':
        fx = cx if d != 'side' else cx - 1.0
        ell(g, fx, 7.0 - up, 4.9, 4.2, 'S', y0=4 - up)        # rosto
        if d == 'side':
            rect(g, 11, 0, 16, 11 - up, 'H', only='S')        # de lado o cabelo cobre a nuca
        for x in (5, 6, 9, 13, 14) if d != 'side' else (4, 5, 8):
            y = 4 - up
            if 0 <= y < H and g[y][x] == 'S':
                g[y][x] = 'H'
        if d == 'side':                                       # olho e boca de perfil
            rect(g, 5, 7 - up, 6, 8 - up, 'E')
            g[7 - up][5] = 'W'
            rect(g, 6, 10 - up, 7, 10 - up, 's')
        else:
            rect(g, 6, 7 - up, 7, 8 - up, 'E')
            rect(g, 12, 7 - up, 13, 8 - up, 'E')
            g[7 - up][6] = 'W'
            g[7 - up][12] = 'W'
            rect(g, 9, 10 - up, 10, 10 - up, 's')
    # luz no cabelo: uma mecha, não um xadrez
    for y in range(1 - up, 4 - up):
        for x in range(5, 9):
            if 0 <= y < H and g[y][x] == 'H':
                g[y][x] = 'L'
    # sombra nas laterais do cabelo
    for y in range(6 - up, 11 - up):
        for x in range(W):
            if 0 <= y < H and g[y][x] == 'H' and (x < 5 or x > 14):
                g[y][x] = 'h'


# ------------------------------------------------------------------ tronco
def body(g, d, up, fem, arm):
    """arm: -1/0/1 = braço recuado / parado / adiantado"""
    y0 = 11 - up
    if d == 'side':
        ell(g, 9.7, y0 + 3.5, 4.6, 4.0, 'J', y0=y0)
        off = int(round(arm))
        ell(g, 12.6, y0 + 3.5 + arm * .9, 1.9, 3.0, 'A', y0=y0)
        rect(g, 11, y0 + 6 + off, 13, y0 + 7 + off, 'N')
        rect(g, 7, y0 + 1, 8, y0 + 6, 'G', only='J')
    else:
        ell(g, 10, y0 + 3.5, 5.4, 4.0, 'J', y0=y0)
        for s_, ax in ((-1, 4.4), (1, 15.6)):
            off = int(round(arm * s_))
            ell(g, ax, y0 + 3.5 + arm * s_ * .9, 1.9, 3.0, 'A', y0=y0)
            rect(g, int(ax - 1), y0 + 6 + off, int(ax + 1), y0 + 7 + off, 'N')
        if d == 'up':
            rect(g, 7, y0 + 1, 8, y0 + 6, 'G', only='J')
            rect(g, 11, y0 + 1, 12, y0 + 6, 'G', only='J')
            rect(g, 7, y0 + 5, 12, y0 + 6, 'g', only='JG')
        elif fem:
            rect(g, 6, y0 + 1, 13, y0 + 2, 'G', only='J')
        else:
            for i in range(5):
                rect(g, 7 + i, y0 + 1 + i // 2, 8 + i, y0 + 2 + i // 2, 'G', only='J')
    rect(g, 5, y0 + 6, 14, y0 + 6, 'K', only='J')              # cinto
    shade_edges(g, 'J', 'j')
    shade_edges(g, 'A', 'a')
    for x in range(6, 10):                                     # luz no ombro
        if 0 <= y0 < H and g[y0][x] == 'J':
            g[y0][x] = 'I'


# ------------------------------------------------------------------ pernas
def legs(g, d, k):
    """k: 0 parado, 1 perna esquerda à frente, 2 perna direita à frente"""
    y0 = 18
    P5, P6, P7 = y0 + 5, y0 + 6, y0 + 7
    if d == 'side':
        if k == 0:
            rect(g, 8, y0, 11, P5, 'P'); rect(g, 8, P6, 11, P7, 'B')
        elif k == 1:
            rect(g, 6, y0, 8, y0 + 4, 'P'); rect(g, 5, P5, 8, P6, 'B')
            rect(g, 10, y0, 12, P5, 'p'); rect(g, 10, P6, 13, P7, 'b')
        else:
            rect(g, 9, y0, 11, P5, 'P'); rect(g, 9, P6, 12, P7, 'B')
            rect(g, 7, y0, 9, y0 + 4, 'p'); rect(g, 6, P5, 9, P6, 'b')
    else:
        L, R = (6, 9), (10, 13)
        if k == 0:
            rect(g, L[0], y0, L[1], P5, 'P'); rect(g, L[0], P6, L[1], P7, 'B')
            rect(g, R[0], y0, R[1], P5, 'P'); rect(g, R[0], P6, R[1], P7, 'B')
        elif k == 1:
            rect(g, L[0], y0, L[1], y0 + 4, 'P'); rect(g, L[0] - 1, P5, L[1], P6, 'B')
            rect(g, R[0], y0, R[1], P5, 'p'); rect(g, R[0], P6, R[1] + 1, P7, 'b')
        else:
            rect(g, L[0], y0, L[1], P5, 'p'); rect(g, L[0] - 1, P6, L[1], P7, 'b')
            rect(g, R[0], y0, R[1], y0 + 4, 'P'); rect(g, R[0], P5, R[1] + 1, P6, 'B')


def hair(frames, gen, v):
    """variações de cabelo: comprido / chanel / rabo de cavalo (f), mecha (m)"""
    out = [[r[:] for r in f] for f in frames]
    def P(f, y, x, ch):
        if 0 <= y < H and 0 <= x < W:
            f[y][x] = ch
    for i, f in enumerate(out):
        d = 'down' if i < 3 else 'up' if i < 6 else 'side'
        if gen == 'f':
            to = [18, 19, 13, 14][v]
            if d == 'up':
                for y in range(10, to + 1):
                    for x in range(4, 16):
                        P(f, y, x, 'h' if x in (4, 5, 14, 15) else ('L' if x in (9, 10) and y < 14 else 'H'))
                    P(f, y, 3, 'O'); P(f, y, 16, 'O')
                for x in range(3, 17):
                    P(f, to + 1, x, 'O')
            else:
                side = (d == 'side')
                cols = ([13, 14, 15, 16] if v < 3 else [14, 15, 16]) if side else \
                       ([3, 4, 15, 16] if v < 3 else [15, 16])
                for y in range(4, to + 1):
                    for x in cols:
                        wav = (v == 0 and y % 3 == 2) or (not side and x in (3, 16))
                        P(f, y, x, 'h' if wav else 'H')
                    if y >= 11:
                        if not side:
                            P(f, y, 2, 'O')
                        P(f, y, 17, 'O')
                for x in cols:
                    P(f, to + 1, x, 'O')
        else:
            if v in (0, 3):                     # topete
                for x in (5, 6, 13, 14):
                    P(f, 0 if i < 3 or i >= 6 else 0, 0, f[0][0])
                for x, y in ((5, 0), (6, 0), (13, 0), (14, 0)):
                    if f[y][x] == 'O':
                        P(f, y, x, 'H')
                for x in (4, 15):
                    if f[1][x] == 'O':
                        P(f, 1, x, 'H')
    return out


def frame(d, k, fem):
    g = mk()
    up = 1 if k else 0
    arm = 0 if k == 0 else (1 if k == 1 else -1)
    legs(g, d, k)
    body(g, d, up, fem, arm)
    head(g, d, up)
    g = outline(g)
    if d == 'side':                      # de lado o sprite fica um pouco mais estreito
        pass
    return g


def build(fem=False):
    return [frame(d, k, fem) for d in ('down', 'up', 'side') for k in (0, 1, 2)]


HAIR = {'m': ['#1c1c22', '#7a4a22', '#3b6fd1', '#e5e7eb'],
        'f': ['#e8c84a', '#1c1c22', '#8b5a2b', '#4a8acc']}
SKIN = [('#f6d5ab', '#d8a877'), ('#e8b98a', '#c08f5e'), ('#b5784b', '#8e5a33'), ('#7d4c2e', '#5a3420')]


def sh(h, k):
    n = int(h[1:], 16)
    r, g_, b = n >> 16, n >> 8 & 255, n & 255
    f = lambda v: max(0, min(255, int(v * (1 + k)) if k < 0 else int(v + (255 - v) * k)))
    return '#%02x%02x%02x' % (f(r), f(g_), f(b))


def palette(gen, hi, sk):
    hc = HAIR[gen][hi]
    s0, s1 = SKIN[sk]
    if gen == 'm':
        J, G, P, B = '#f07a1e', '#3fa34d', '#4a4a63', '#e8701a'
    else:
        J, G, P, B = '#d8322f', '#2b2b3a', s0, '#2e2e3e'
    p = {'O': '#14121c', 'H': hc, 'h': sh(hc, -.38), 'L': sh(hc, .3),
         'S': s0, 's': s1, 'N': s0, 'E': '#2a1f1a', 'W': '#ffffff',
         'J': J, 'j': sh(J, -.28), 'I': sh(J, .22), 'A': sh(J, -.1), 'a': sh(J, -.38),
         'G': G, 'g': sh(G, -.3), 'K': sh(G, -.5),
         'P': P, 'p': sh(P, -.25), 'B': B, 'b': sh(B, -.35)}
    return p


def render(frames, pal, path, zoom=5, bg=(108, 192, 74)):
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
    return im


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'hero.png'
    rows = []
    for gen in 'mf':
        for hi in range(4):
            im = render(hair(build(gen == 'f'), gen, hi), palette(gen, hi, hi), '/tmp/_h.png')
            rows.append(im)
    big = Image.new('RGB', (rows[0].width, rows[0].height * len(rows)))
    for i, r in enumerate(rows):
        big.paste(r, (0, i * r.height))
    big.save(out)
    if len(sys.argv) > 2:
        import json
        json.dump({g + str(v): [''.join(''.join(r) for r in f) for f in hair(build(g == 'f'), g, v)]
                   for g in 'mf' for v in range(4)}, open(sys.argv[2], 'w'))
    print('ok')
