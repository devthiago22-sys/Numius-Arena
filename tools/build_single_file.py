#!/usr/bin/env python3
"""Gera um ÚNICO arquivo HTML com tudo embutido (código, estilos, imagens e telas).

Serve para pré-visualizar o jogo dentro do claude.ai (artefatos), que não carrega
arquivos separados. Limite de publicação lá: 16 MB.

Uso:   python3 tools/build_single_file.py [saida.html]
Padrão: dist/numius-arena-single.html
"""
import base64, json, mimetypes, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'numius-arena-single.html')
MIME = {'.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml'}

def read(*p):
    with open(os.path.join(ROOT, *p), encoding='utf-8') as f:
        return f.read()

def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (MIME[ext], base64.b64encode(f.read()).decode())

index = read('index.html')
scripts = re.findall(r'<script src="(js/[^"]+)"></script>', index)
head = index[:index.index('<link rel="stylesheet"')]
head = head.replace('<head>', '<head>', 1)

# CSS: junta e troca os caminhos dos sprites por data URIs
css = read('css', 'sprites.css') + '\n' + read('css', 'style.css')
css = re.sub(r'url\(\.\./(assets/[^)]+)\)', lambda m: 'url(%s)' % data_uri(os.path.join(ROOT, m.group(1))), css)

# Telas: troca assets/screens/... por data URIs
screens = {}
for name in sorted(os.listdir(os.path.join(ROOT, 'screens'))):
    if not name.endswith('.html'):
        continue
    html = read('screens', name)
    html = re.sub(r'assets/screens/[A-Za-z0-9._-]+', lambda m: data_uri(os.path.join(ROOT, m.group(0))), html)
    screens[name[:-5]] = html
screens_json = json.dumps(screens, ensure_ascii=False).replace('</', '<\\/')

code = '\n'.join(read(*s.split('/')) for s in scripts)
code = code.replace('</script', '<\\/script')

out = head + '<style>\n' + css + '\n</style></head>\n<body><div id="app"></div>\n<script>window.__SCREENS=' + screens_json + ';</script>\n<script>\n' + code + '\n</script></body></html>\n'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(out)
size = os.path.getsize(OUT) / 1e6
print('Gerado %s (%.1f MB)' % (OUT, size))
if size > 16:
    print('ATENÇÃO: passa de 16 MB, o claude.ai não publica arquivos maiores que isso.')
