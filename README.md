# Numius Arena

Jogo de monstrinhos (númios) para navegador: escolha seu parceiro, vença 8 ginásios, enfrente treinadores
táticos, treine IV/EV na Batalha Virtuosa e duele com amigos no PvP online. Feito em HTML, CSS e JavaScript
puros, sem etapa de build e sem dependências para jogar.

## Como rodar

O jogo carrega suas telas com `fetch`, então precisa de um servidor web (abrir o `index.html` direto do
disco não funciona). Qualquer um serve:

```bash
npm start                 # servidor simples em http://localhost:8000 (precisa só do Node)
# ou
python3 -m http.server 8000
```

## Publicar no GitHub Pages (grátis)

1. Crie o repositório e envie esta pasta (`git init`, `git add .`, `git commit`, `git push`).
2. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. O jogo fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Os mapas, imagens dos númios e telas são arquivos normais da pasta, sem o limite de 16 MB do claude.ai.

## Estrutura

```
index.html              página única; carrega css/ e js/ nesta ordem
css/style.css           estilos do jogo
css/sprites.css         classes .f0, .f1... (frente) e .b0, .b1... (costas) apontando para assets/sprites
js/                     código do jogo, em scripts clássicos (a ORDEM de carregamento importa, veja CLAUDE.md)
screens/*.html          telas desenhadas à parte, abertas em iframes (login, hero, starter, menu,
                        tactical, heal, team, gyms, dex, pvp)
assets/sprites/         arte dos númios (frente e costas)
assets/screens/         imagens usadas pelas telas em iframe
tools/serve.js          servidor local
tools/build_single_file.py   junta tudo em UM html (para pré-visualizar no claude.ai)
tests/smoke.js          teste automático (Playwright)
CLAUDE.md               guia para o Claude Code trabalhar neste projeto sem quebrar nada
```

## Testes

```bash
npm install                       # instala o Playwright
npx playwright install chromium   # baixa o navegador de teste
npm test                          # abre o jogo e passa por login, menu, telas, cura e batalha
```

## Pré-visualizar no claude.ai

O claude.ai só publica arquivos únicos de até 16 MB. Para gerar um:

```bash
python3 tools/build_single_file.py          # cria dist/numius-arena-single.html
npm run test:single                         # gera e testa o arquivo único
```

## Limites conhecidos

- **PvP online:** usa o recurso `room` do próprio claude.ai (`claude.use('room')`). Fora do claude.ai o
  jogo funciona normalmente, mas o PvP mostra "indisponível". Para ter PvP em hospedagem própria é preciso
  trocar a camada de sala em `js/pvp.js` por um serviço de tempo real (Firebase, Supabase, WebSocket...),
  mantendo a mesma interface (`presence`, `onPeers`).
- **Contas:** ficam no navegador de cada pessoa (`localStorage`), com senha embaralhada (PBKDF2). Não há
  servidor, então não existe recuperação de senha nem acesso de outro aparelho.
