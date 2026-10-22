#!/usr/bin/env python3
"""Gera os sprites do personagem no mapa (Zona Safari) a partir da arte do criador de personagem.

Entrada: assets/screens/trainer-m.webp e trainer-f.webp (4 variações de cabelo, de frente).
Saída:   assets/screens/ow-m.webp e ow-f.webp (pixel art, sem perda).
Layout de cada folha: 4 linhas (variação de cabelo) x 12 colunas:
  baixo (parado, passo 1, passo 2), cima (3), esquerda (3), direita (3).
O tom de pele é aplicado no jogo com o mesmo filtro do criador de personagem.
Uso: python3 tools/make_overworld.py
"""
import os
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = 44            # altura do boneco em pixels
FW, FH = 34, 48   # tamanho de cada quadro na folha
OUT = (28, 24, 32, 255)


def base_sprite(fr):
    bb = fr.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox()
    fr = fr.crop(bb)
    W = round(fr.width * H / fr.height)
    sm = fr.resize((W, H), Image.BOX)
    a = sm.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    rgb = ImageEnhance.Contrast(ImageEnhance.Color(sm.convert('RGB')).enhance(1.25)).enhance(1.12)
    q = rgb.quantize(colors=18, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGBA')
    q.putalpha(a)
    return q


def px(im):
    return [[im.getpixel((x, y)) for x in range(im.width)] for y in range(im.height)]


def to_img(P):
    h, w = len(P), len(P[0])
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            if P[y][x][3]:
                im.putpixel((x, y), P[y][x])
    return im


def blank(w, h):
    return [[(0, 0, 0, 0)] * w for _ in range(h)]


def outline(P):
    h, w = len(P), len(P[0])
    Q = [r[:] for r in P]
    for y in range(h):
        for x in range(w):
            if P[y][x][3]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and P[yy][xx][3] and P[yy][xx] != OUT:
                    Q[y][x] = OUT
                    break
    return Q


def is_skin(c):
    r, g, b, a = c
    return bool(a) and r > 150 and r > g + 12 and g > b + 8 and r - b > 40 and b > 95 and g - b < 75


def lum(c):
    return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]


def hair_palette(P):
    """Cores do cabelo (escura, média, clara), tiradas do alto da cabeça."""
    h = len(P)
    cnt = {}
    for y in range(1, max(4, int(h * 0.2))):
        for c in P[y]:
            if c[3] and c != OUT and not is_skin(c):
                cnt[c] = cnt.get(c, 0) + 1
    top = sorted(cnt, key=lambda c: -cnt[c])[:6]
    if not top:
        return [(60, 40, 30, 255)] * 3
    L = max(lum(c) for c in top)
    keep = [c for c in top if lum(c) >= L * 0.5][:3] or top[:1]
    keep = sorted(keep, key=lum)
    while len(keep) < 3:
        keep.append(keep[-1])
    mid = keep[len(keep) // 2]
    dark = tuple(max(0, int(v * 0.72)) for v in mid[:3]) + (255,)
    light = keep[-1] if lum(keep[-1]) > lum(mid) + 8 else tuple(min(255, int(v * 1.18) + 10) for v in mid[:3]) + (255,)
    return [dark, mid, light]


def fill_hair(Q, mask, hp, bottom):
    """Preenche a máscara com os fios das laterais do cabelo (o pixel de cabelo mais próximo na mesma linha);
    sem cabelo na linha, copia de cima. Escurece um pouco a parte de baixo."""
    h, w = len(Q), len(Q[0])
    ok = lambda c: c[3] and c != OUT and not is_skin(c) and c != (0, 0, 0, 1)
    src = [r[:] for r in Q]
    for y in range(h):
        for x in range(w):
            if not mask[y][x]:
                continue
            c = None
            for d in range(1, w):
                for xx in (x - d, x + d):
                    if 0 <= xx < w and not mask[y][xx] and ok(src[y][xx]):
                        c = src[y][xx]
                        break
                if c:
                    break
            if not c:
                for yy in range(y - 1, -1, -1):
                    if ok(Q[yy][x]):
                        c = Q[yy][x]
                        break
            c = c or hp[1]
            if y >= bottom - 2:
                c = tuple(int(v * 0.8) for v in c[:3]) + (255,)
            Q[y][x] = c


def fill_hair_down(Q, mask, bottom):
    """Costas: cada pixel do rosto recebe o fio de cabelo logo acima, na mesma coluna."""
    h, w = len(Q), len(Q[0])
    ok = lambda c: c[3] and c != OUT and not is_skin(c) and lum(c) > 0
    for y in range(h):
        for x in range(w):
            if not mask[y][x]:
                continue
            c = None
            for yy in range(y - 1, -1, -1):
                if not mask[yy][x] and ok(Q[yy][x]):
                    c = Q[yy][x]
                    break
                if mask[yy][x]:
                    c = Q[yy][x]
                    break
            if c:
                if y >= bottom - 2:
                    c = tuple(int(v * 0.82) for v in c[:3]) + (255,)
                Q[y][x] = c


def legs_split(P):
    """Linha onde as pernas começam e a coluna do meio entre elas."""
    h, w = len(P), len(P[0])
    y0 = int(h * 0.78)
    xs = [x for x in range(w) if P[h - 2][x][3]]
    mid = (min(xs) + max(xs)) // 2 if xs else w // 2
    return y0, mid


def walk_front(P, which):
    """Passo: o corpo sobe 1px, uma perna fica plantada e a outra levanta."""
    h, w = len(P), len(P[0])
    y0, mid = legs_split(P)
    Q = blank(w, h)
    for y in range(h):
        for x in range(w):
            c = P[y][x]
            if not c[3]:
                continue
            if y < y0:
                ny = y - 1
            else:
                lifted = (x <= mid) if which == 1 else (x > mid)
                ny = y - 2 if lifted else y
            if 0 <= ny < h:
                Q[ny][x] = c
    # a perna plantada cobre o vão deixado pelo corpo que subiu
    for x in range(w):
        planted = (x > mid) if which == 1 else (x <= mid)
        if planted and P[y0][x][3] and not Q[y0 - 1][x][3]:
            Q[y0 - 1][x] = P[y0][x]
    return Q


def back_view(P):
    """Costas: o rosto vira cabelo (com sombreado) e somem os detalhes da frente da cabeça."""
    h, w = len(P), len(P[0])
    hp = hair_palette(P)
    head_bottom = int(h * 0.42)
    Q = [r[:] for r in P]
    skin = [[is_skin(P[y][x]) for x in range(w)] for y in range(h)]
    mask = [[False] * w for _ in range(h)]
    for y in range(head_bottom):
        for x in range(w):
            near = any(0 <= x + dx < w and 0 <= y + dy < h and skin[y + dy][x + dx]
                       for dx in (-1, 0, 1) for dy in (-1, 0, 1))
            mask[y][x] = bool(P[y][x][3] and P[y][x] != OUT and near)
    fill_hair_down(Q, mask, head_bottom)
    return outline(Q)


def side_view(P, step):
    """Lado (olhando para a esquerda), vista 3/4: corpo um pouco mais estreito, rosto virado para a frente
    (os traços do rosto andam 2px e a nuca vira cabelo) e passada das pernas."""
    h, w = len(P), len(P[0])
    hp = hair_palette(P)
    y0, mid = legs_split(P)
    nw = max(10, round(w * 0.86))
    S = blank(w, h)
    off = (w - nw) // 2
    for y in range(h):
        for x in range(nw):
            sx = min(w - 1, int((x + 0.5) * w / nw))
            S[y][x + off] = P[y][sx]
    head_bottom = int(h * 0.42)
    Q = [r[:] for r in S]
    face = [[S[y][x][3] and S[y][x] != OUT and (is_skin(S[y][x]) or (any(0 <= x + dx < w and is_skin(S[y][x + dx]) for dx in (-1, 1)) and lum(S[y][x]) < 90)) for x in range(w)] for y in range(h)]
    hole = [[False] * w for _ in range(h)]
    for y in range(head_bottom):
        xs = [x for x in range(w) if face[y][x]]
        if not xs:
            continue
        for x in xs:
            hole[y][x] = True
        for x in xs:
            nx = x - 2
            if 0 <= nx < w:
                Q[y][nx] = S[y][x]
                hole[y][nx] = False
    for y in range(h):
        for x in range(w):
            if hole[y][x]:
                Q[y][x] = (0, 0, 0, 1)
    fill_hair(Q, hole, hp, head_bottom)
    # passada: perna da frente para a esquerda, a de trás para a direita
    if step:
        R = blank(w, h)
        for y in range(h):
            for x in range(w):
                c = Q[y][x]
                if not c[3]:
                    continue
                if y >= y0:
                    t = (y - y0 + 1) / (h - y0)
                    d = round(2 * t) if step == 1 else round(1 * t)
                    nx = x - d if x <= mid else x + d
                    ny = y
                else:
                    nx, ny = x, y - 1
                if 0 <= nx < w and 0 <= ny < h:
                    R[ny][nx] = c
        Q = R
    return outline(Q)


def place(sheet, P, col, row):
    im = to_img(P)
    x = col * FW + (FW - im.width) // 2
    y = row * FH + (FH - im.height)
    sheet.alpha_composite(im, (x, y))


def main():
    for g in ('m', 'f'):
        src = Image.open(os.path.join(ROOT, 'assets', 'screens', f'trainer-{g}.webp')).convert('RGBA')
        fw = src.width // 4
        sheet = Image.new('RGBA', (FW * 12, FH * 4), (0, 0, 0, 0))
        for v in range(4):
            base = px(base_sprite(src.crop((v * fw, 0, (v + 1) * fw, src.height))))
            front = outline(base)
            frames = [front, outline(walk_front(base, 1)), outline(walk_front(base, 2))]
            back = back_view(base)
            bpx = [[c if c != OUT else (0, 0, 0, 0) for c in r] for r in back]
            frames += [back, outline(walk_front(bpx, 1)), outline(walk_front(bpx, 2))]
            left = [side_view(base, 0), side_view(base, 1), side_view(base, 2)]
            frames += left
            frames += [[r[::-1] for r in f] for f in left]
            for i, f in enumerate(frames):
                place(sheet, f, i, v)
        out = os.path.join(ROOT, 'assets', 'screens', f'ow-{g}.webp')
        sheet.save(out, lossless=True)
        print(out, sheet.size, os.path.getsize(out), 'bytes')


if __name__ == '__main__':
    main()
