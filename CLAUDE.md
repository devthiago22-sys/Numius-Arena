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
12. `boss.js`: **Boss semanal** (raid): chefes `BOSSES`, simulação `bsNew/bsTurn`, recompensas, ovos, ponte `bsMount/bsData/bsSend`.
13. `legend.js`: **lendários invocáveis** (`LEG`, `lgCast`, `lgEnd`, `tyOf`, barra `lgBarSync`, animação `lgFx`) e ponte da **Mochila** (`bgMount/bgData/bgSend`).
14. `safari.js`: ponte da **Zona Safari** (`sfMount/sfData/sfSend`, `sfCatch` grava o Numiu do vínculo).
15. `render.js`: `R()` (renderizador principal), personagem, configurações, cura, `pick`.
16. `main.js`: `boot()`.

Regras:
- **Nunca reordene** os scripts nem chame, no nível superior de um arquivo, funções definidas em arquivos
  posteriores (funções só ficam "içadas" dentro do próprio arquivo).
- Funções e variáveis são globais de propósito: os atributos `onclick="..."` do HTML gerado em `R()`
  chamam funções globais (`turn(0)`, `G.screen='map';R()`...).
- Todo estado vive em `G`. Mudou algo visível? Chame `R()`.

## Telas em iframe (`screens/*.html`)
Login, hero, starter, menu, tactical, heal, team, gyms, dex, pvp, battle e boss são páginas React já compiladas (minificadas),
abertas em `<iframe srcdoc>`. O jogo e a tela conversam por `postMessage` com objetos `{numius:1, k:'...'}`:

| Iframe | O jogo escuta (k) | O jogo envia (k) |
|---|---|---|
| `lgf` login | `ready`, `login`, `signup`, `guest` | `err` |
| `hf` hero | `ready`, `hero` | |
| `sf` starter | `ready`, `pick` | `imgs` |
| `mnf` menu | `ready`, `nav` (to: gyms, tac, team, numios, dex, pvp, train, heal, cfg, exit) | `data` |
| `tbf` táticas | `ready`, `nav`, `tac` | `data` |
| `hcf` cura | `ready`, `healed`, `back`, `music` | dados em `window.NXT` (injetado no srcdoc) |
| `eqf` equipe | `ready`, `mv`, `nav`, `cfg`, `leg` (`id` ou `null`) | `team` (inclui `legs`) |
| `gyf` ginásios | `ready`, `gym`, `nav` | `gyms` |
| `dxf` mostruário | `ready`, `nav` | `dex` |
| `btf` arena de batalha | `ready`, `bact` (`move`,`swap`,`swapTo`,`cap`,`flee`,`leave`,`end`) | `bimgs`, `bstate` (`seq`,`st`,`evs`) |
| `bsf` boss semanal | `ready`, `nav`, `start` (`pick`), `turn` (`a`: `{k:'mv',i}` ou `{k:'def'}`), `hatch` | `bsdata`, `bsstart`, `bsturn`, `bshatch` |
| `bgf` mochila | `ready`, `nav` (map, boss), `unlock` (`id`), `hatch` | `bgdata`, `bgunlock`, `bghatch` |
| `sff` zona safari | `ready`, `nav`, `catch` (`i`, `l`) | `sfdata`, `sfcaught` |
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

## Boss semanal (`js/boss.js` + `screens/boss.html`)
- A semana e o dragão da vez saem da mesma conta do menu: `bsWeek()`; ordem AURELION, NYXAR, CHRONOS. Mudou a conta no
  menu (`bossInfo` em `screens/menu.html`)? Mude em `bsNow()` também.
- Raid de 5 treinadores: o jogador + 4 aliados controlados por IA (`bsPick`). Co-op com humanos e ranking mundial
  **precisam de servidor**: `BSRANK` (hoje só local) e a simulação determinística (`bsRng` com semente) já estão
  prontos para isso; as jogadas de cada humano entrariam no lugar de `bsPick`.
- Combate (`bsTurn`) devolve eventos (`atk`, `sync`, `def`, `tele`, `bs`, `baoe`, `phase`, `st`, `faint`, `end`...) que a
  tela anima. Mecânicas: Sincronia (3+ atacantes), Proteger (intercepta golpe focado), Barreira Conjunta (2 protetores
  na ultimate), fases em 66% e 33% (escudo de cristal / vazio / congelamento).
- Equilíbrio em `BSX` (nível do chefe, HP, ataque, defesa), `BSR` (recompensa), `BSTOP` (top 3), `EGG` (raridades).
  Hoje o chefe é fixo no nível 50: a vitória exige equipe ~Nv 45+.
- Salvo em `save()`: `bs` (semana, melhor dano, recebeu?), `fr` (fragmentos por dragão), `eg` (ovos). Sem mudar `v`.
- Tipos dos dragões: AURELION = Luz, NYXAR = Trevas, CHRONOS = Cósmico (tipos novos em `SE`/`NV` de `data.js`, usados só
  pelo Boss por enquanto). Luz é fraco a Trevas e Dragão; Trevas a Luz e Fogo; Cósmico a Trevas e Pedra.
- Os fragmentos liberam o lendário na Mochila (60 por dragão; veja a seção abaixo).

## Lendários invocáveis e Mochila (`js/legend.js` + `screens/bag.html`)
- Liberados na Mochila gastando `LGC` (60) fragmentos do dragão (`G.frag`) -> `G.leg[id]=1` (salvo como `lg`).
- Na aba Equipe (`screens/team.html`, componente `LegSup` = seção "SUPORTE DE PARTIDA", abaixo de EQUIPE ATUAL) o jogador
  toca num lendário liberado e em "ADICIONAR À EQUIPE":
  `G.legSel` (salvo como `ls`, mensagem `leg` da tela, dados em `eqData().legs`). Só o escolhido (`lgSel()`) aparece na arena.
- Na arena aparece uma coluna `#lgbar` (DOM do jogo, por cima do iframe `btf`). O jogador invoca **um único lendário por
  partida** (escolhe entre os liberados; os outros ficam bloqueados), como ação livre (não gasta o turno). Partida comum: `lgUse` -> `lgCast` na hora. PvP: a invocação
  vai junto com a jogada (`a.lg`) e é aplicada no começo de `pvpResolve`, nos dois aparelhos (determinístico, sem `RR()`).
- Estado em `G.battle.lg`: `u` (usados por lado), `lux` (campo de Luz), `ecl` (Eclipse, turnos), `frz` (Paradoxo, turnos).
  Lados: `'p'` = `G.team`, `'e'` = oponente. `lgEnd(B)` roda no fim de cada turno (cura da Luz e contagem dos turnos).
- Reencarnação Pura: seus Numius viram tipo Luz (`tyOf`, usado por `effv`) e curam 30% + status no fim do turno até o fim
  da partida; desfaz se o oponente invocar um lendário ou entrar em campo com habilidade de campo (`LGF`: rei, tsunami).
- Eclipse das Trevas: golpes do lado afetado com −25% por 2 turnos (`hit`). Paradoxo Temporal: o lado afetado não age por
  3 turnos (`eTurn` e `pvpResolve`).
- Imagens dos lendários fora dos iframes: classes `.lgimg-*` em `style.css` (o build embute `url(../assets/...)` do CSS).

## Zona Safari (`js/safari.js` + `screens/safari.html`)
- Mapa explorável 64×48 (semente fixa), desenhado em **tiles de pixel art 16×16** no estilo Game Boy / GBA.
  `TGR` guarda as grades de letras de cada tile (grama, capim alto em 2 quadros, água em 2 quadros, areia, trilha,
  lava, flores, árvore 32×32, pedra, cerca) e `TPAL` as paletas por região; `tile(nome,regiao)` pinta e guarda em
  cache. `buildTerrain()` pinta o mapa inteiro **uma vez** numa tela de 1024×768 (16 px por casa) e `draw()` recorta
  essa tela com `imageSmoothingEnabled=false`. As grades vêm de `tools/safari_tiles.py` (gerador com
  pré-visualização em PNG) — edite lá, rode e cole a saída.
- A escala é inteira: `PS` (2 a 7) é o tamanho do pixel e `TSZ = 16*PS`. A câmera é arredondada para múltiplos de
  `PS`, senão o pixel art treme ao andar. Água, lava e capim alto animam trocando de quadro; o capim da casa do
  jogador troca de quadro sozinho (parece que mexeu) e é redesenhado **depois** do jogador, cobrindo as pernas.
- 4 regiões: Lago Espelhado (linha Hydrake), Campo Vulcânico (Blazleo), Floresta Antiga (Byron) e Campina Central
  (qualquer). Encontros no capim alto (13% por passo).
- Encontro: cenário pintado por região (`drawScene`), Numiu animado pelo mesmo motor de sprites vivos do Boss
  (`Live`), entrada pulando do capim e reações a cada ação. O direcional só aparece em telas de toque.
- O personagem anda com setas/WASD ou o direcional. No mapa ele é um **sprite 20×28 em pixel art** (estilo Pokémon
  de GBA/NDS): `GBA` guarda 8 variantes (2 gêneros × 4 cabelos), cada uma com 9 quadros de 560 letras (parado +
  2 passos, para baixo, cima e lado; a direita é o lado espelhado). As letras são índices de cor (`O` contorno,
  `H/h/L` cabelo, `S/s` pele, `E/W` olho, `J/j/I` casaco, `A/a` braço, `N` mão, `G/g` detalhe, `K` cinto,
  `P/p` perna, `B/b` bota) e `heroSheet(S)` pinta os 9 quadros num canvas ampliado, trocando cabelo por
  `HAIR[g][hair]` e pele por `SKIN[skin]`; no feminino o comprimento do cabelo também muda. `drawHero` escolhe o
  quadro pela direção e alterna o pé a cada casa (`pl.par`). As grades vêm de `tools/hero_sprite.py`, que desenha
  por formas (elipses e retângulos) e fecha o contorno sozinho. O retrato do encontro continua usando
  `assets/screens/trainer-m|f.webp` (4 cabelos, filtro de pele).
- Captura sem bola, o **Laço de Sintonia**: VÍNCULO (0-100) e AGITAÇÃO. Ações: Sintonizar (4 batidas no ritmo da aura:
  Perfeito/Bom/Fora), Fruta calmante (10 por visita), Observar (revela o temperamento) e Sair. Agitação alta = chance de fuga.
  Vínculo 100 -> `catch` -> `sfCatch` (equipe máx. 6). Visita: 500 passos. Raridade: estágio 1/2/3 = 72/23/5%.
