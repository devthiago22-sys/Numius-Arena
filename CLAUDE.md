# Guia para o Claude Code: Numius Arena

Jogo de navegador em HTML/CSS/JS puro. Idioma da interface: português do Brasil. Leia este arquivo antes de
alterar qualquer coisa: o projeto tem armadilhas que não são óbvias.

## Comandos
- `npm start`: servidor local em http://localhost:8000 (obrigatório; `file://` não funciona).
- `npm test`: teste de fumaça com Playwright. **Rode antes de todo commit.**
- `python3 tools/build_single_file.py`: gera `dist/numius-arena-single.html` (arquivo único, para
  pré-visualizar no claude.ai, limite de 16 MB). `npm run test:single` gera e testa.

## Scripts em `js/` (scripts clássicos, escopo global compartilhado)
Carregados por `index.html` **nesta ordem**; não use `import/export`:
1. `loader.js`: `loadScreens()`, mapa `SCREENS` (HTML das telas).
2. `data.js`: `FAM` (famílias/espécies), `S` (espécies), tipos e tabela de eficácia, `MOVES`, aprendizado
   por nível (`LS`, `initMoves`), `GY` (ginásios).
3. `state.js`: `G` (estado), `save/load` (conta em `localStorage`), `calc`, `form`, `evo`, `mk`, `moves`.
4. `battle.js`: `hit` (dano, emite eventos de animação com `evp`), habilidades passivas, IA (`eTurn`), `turn`, XP,
   aprendizado, `tac`, `vstart`, atributos (`calc`, `sx`).
5. `auth.js`: `submitAuth`, `enter`, `guest`, `logout`.
6. `arena-fx.js`: arena antiga em HTML (reserva), `sfx`.
7. `audio.js`: música (WebAudio), ponte do Centro de Cura, volume.
8. `pvp.js`: PvP em tempo real.
9. `screens-core.js`: `dec`, `iw` (iframe pré-carregado), telas Starter e Hero.
10. `pixel-scene.js`: cenário pixel art do menu antigo (reserva).
11. `screens-bridge.js`: pontes com as telas em iframe (login, menu, equipe, ginásios, mostruário, PvP,
    táticas, **arena de batalha** `btMount/btData/btSend`) e `authCore`.
12. `render.js`: `R()` (renderizador principal), personagem, configurações, cura, `pick`.
13. `main.js`: `boot()`.

Regras:
- **Nunca reordene** os scripts nem chame, no nível superior de um arquivo, funções definidas em arquivos
  posteriores (funções só ficam "içadas" dentro do próprio arquivo).
- Funções e variáveis são globais de propósito: os atributos `onclick="..."` do HTML gerado em `R()`
  chamam funções globais (`turn(0)`, `G.screen='map';R()`...).
- Todo estado vive em `G`. Mudou algo visível? Chame `R()`.

## Telas em iframe (`screens/*.html`)
Login, hero, starter, menu, tactical, heal, team, gyms, dex, pvp e battle são páginas React já compiladas (minificadas),
abertas em `<iframe srcdoc>`. O jogo e a tela conversam por `postMessage` com objetos `{numius:1, k:'...'}`:

| Iframe | O jogo escuta (k) | O jogo envia (k) |
|---|---|---|
| `lgf` login | `ready`, `login`, `signup`, `guest` | `err` |
| `hf` hero | `ready`, `hero` | |
| `sf` starter | `ready`, `pick` | `imgs` |
| `mnf` menu | `ready`, `nav` (to: gyms, tac, team, numios, dex, pvp, train, heal, cfg, exit) | `data` |
| `tbf` táticas | `ready`, `nav`, `tac` | `data` |
| `hcf` cura | `ready`, `healed`, `back`, `music` | dados em `window.NXT` (injetado no srcdoc) |
| `eqf` equipe | `ready`, `mv`, `nav`, `cfg` | `team` |
| `gyf` ginásios | `ready`, `gym`, `nav` | `gyms` |
| `dxf` mostruário | `ready`, `nav` | `dex` |
| `btf` arena de batalha | `ready`, `bact` (`move`,`swap`,`swapTo`,`cap`,`flee`,`leave`,`end`) | `bimgs`, `bstate` (`seq`,`st`,`evs`) |
| `pvf` PvP | `ready`, `challenge`, `accept`, `decline`, `cancel`, `search`, `room`, `nav`, `cfg` | `pvp` |

Pontos importantes:
- Cada tela tem uma função `xxMount/xxSend/xxToggle` em `screens-bridge.js` (ou `screens-core.js`) e um
  temporizador de reserva: se a tela não responder `ready`, o jogo usa a versão simples em HTML.
- `dec(X)` devolve o HTML da tela (`SCREENS[X.n]`). Se mudar uma tela, edite o `.html` em `screens/`.
- As imagens das telas ficam em `assets/screens/` e são citadas como `assets/screens/arquivo.webp`
  (caminho a partir da raiz, **sem `../`**, porque o iframe usa `srcdoc` e herda a URL do `index.html`).
- Os sprites dos númios são classes CSS `.fN` (frente) e `.bN` (costas) em `css/sprites.css`. As telas
  recebem a URL lendo o `background-image` calculado (`spUrl`, `hcImg`, `sImgs`).
- Um bundle React minificado é difícil de editar à mão. Prefira trocar textos/valores com cuidado e testar;
  para mudanças grandes de layout, peça a tela nova pronta e substitua o arquivo.

## Dados e salvamento
- Espécies: `S[i]` (índice = posição). Famílias em `FAM`: 3 linhas evolutivas (Hydrake, Blazleo, Byron), 9 formas. Atributos reais com IV/EV em `calc`.
- Conta e progresso: `localStorage` (`mon-users`, `mon-session`), senha com PBKDF2. Formato salvo em
  `save()` (campo `v`). Ao mudar o formato, aumente `v` e trate a migração em `load()` (hoje, versão
  diferente zera o progresso e mostra um aviso).
- Golpes: cada númio sabe até 4; aprende por nível (`LS`/`initMoves`); `cc` = usos (PP), restaurados no
  Centro de cura.

## PvP (determinismo)
O duelo é calculado nos dois aparelhos e precisa dar o **mesmo resultado**. Por isso `hit()` usa `RR()`
(gerador com semente), nunca `Math.random()`. Qualquer função chamada por `pvpResolve` deve ser
determinística e não pode depender do estado local de um só jogador. A sala usa `claude.use('room')`,
que só existe dentro do claude.ai.

## Pré-visualização no claude.ai
Gere o arquivo único (`tools/build_single_file.py`) e publique-o. Se passar de 16 MB, reduza imagens
(WebP, tamanho menor) em vez de remover recursos. Dentro do claude.ai, `claude.use('room')` habilita o PvP.

## Convenções
- Textos em português; manter emojis e `aria-label` nos botões.
- Respeitar `prefers-reduced-motion` em animações novas.
- Ao criar uma tela nova: adicione o HTML em `screens/`, o nome em `SCREEN_NAMES` (`loader.js`), a ponte
  em `screens-bridge.js`, e uma verificação em `tests/smoke.js`.

## Arena de batalha (`screens/battle.html`)
O jogo não desenha a batalha: `hit()`, `applyStatus`, `turnFx` etc. empilham eventos (`evp`: `move`, `buff`, `status`,
`dot`, `tsunami`, `recoil`, `shield`, `faint`, `send`, `evolve`, `lvup`, `cap`) em `B.ev`; `btSend()` envia o estado
com esses eventos e a arena toca as animações (uma por golpe, aura para buffs, fogo/tom laranja para queimadura).
Se a arena não responder `ready` em 12 s, `G.btfb` ativa a batalha antiga em HTML.

## Fluxo de trabalho
Edite os arquivos em `js/`, `css/`, `screens/`, rode o teste, gere o arquivo único e publique-o no claude.ai.
Não commite `dist/`. Não guarde imagens em base64 no código: use `assets/`.
