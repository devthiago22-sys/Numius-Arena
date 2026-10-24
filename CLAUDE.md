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
    táticas, **arena de batalha** `btMount/btData/btSend`, **treinamento** `trMount/trData/trSend`,
    **torre de gelo** `twMount/twData/twSend`) e `authCore`.
12. `boss.js`: **Boss semanal** (raid): chefes `BOSSES`, simulação `bsNew/bsTurn`, recompensas, ovos, ponte `bsMount/bsData/bsSend`.
13. `legend.js`: **lendários invocáveis** (`LEG`, `lgCast`, `lgEnd`, `tyOf`, barra `lgBarSync`, animação `lgFx`) e ponte da **Mochila** (`bgMount/bgData/bgSend`).
14. `safari.js`: **Zona Safari** (sorteio `sfSpin`, cruzamento `sfBreed`, ponte `sfMount/sfData/sfSend`).
15. `missions.js`: **Missões** (tabela `MIS`, `msAdd`, `msClaim`, ponte `msMount/msData/msSend`) e a Moeda Safari.
16. `trade.js`: **Troca de Numius** online (sala peer-to-peer, `XC`, `xcOpen/xcOnPeers`, ponte `xcMount/xcData/xcSend`).
17. `render.js`: `R()` (renderizador principal), personagem, configurações, cura, `pick`.
18. `main.js`: `boot()`.

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
| `mnf` menu | `ready`, `nav` (to: gyms, tac, team, dex, pvp, train, tower, trade, heal, cfg, exit) | `data` |
| `tbf` táticas | `ready`, `nav`, `tac` | `data` |
| `hcf` cura | `ready`, `healed`, `back`, `music` | dados em `window.NXT` (injetado no srcdoc) |
| `eqf` equipe | `ready`, `mv`, `nav`, `cfg`, `leg` (`id` ou `null`) | `team` (inclui `legs`) |
| `gyf` ginásios | `ready`, `gym`, `nav` | `gyms` |
| `dxf` mostruário | `ready`, `nav` | `dex` |
| `btf` arena de batalha | `ready`, `bact` (`move`,`swap`,`swapTo`,`cap`,`flee`,`leave`,`end`) | `bimgs`, `bstate` (`seq`,`st`,`evs`) |
| `bsf` boss semanal | `ready`, `nav`, `start` (`pick`), `turn` (`a`: `{k:'mv',i}` ou `{k:'def'}`), `hatch` | `bsdata`, `bsstart`, `bsturn`, `bshatch` |
| `bgf` mochila | `ready`, `nav` (map, boss), `unlock` (`id`), `hatch` | `bgdata`, `bgunlock`, `bghatch` |
| `sff` zona safari | `ready`, `nav`, `spin` (`z`), `breed` (`a`,`b`), `take` (`u`), `release` (`u`) | `sfdata`, `sfspin`, `sfbreed`, `sftake`, `sfrelease` |
| `msf` missões | `ready`, `nav`, `claim` (`id`) | `msdata`, `msclaim` |
| `trf` treinamento | `ready`, `nav`, `ev` (`i`,`s`), `iv` (`i`,`s`), `fight` (`n`) | `trdata` |
| `twf` torre de gelo | `ready`, `nav`, `fight` (`n`) | `twdata` |
| `xcf` troca de numius | `ready`, `nav`, `offer` (`i`), `search`, `cancel`, `confirm`, `room` (`op`:create/join/leave, `code`) | `xcdata` |
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
- Tela em HTML/JS puro (não é bundle React). Mostra o mapa `assets/screens/safari-map.webp` com **4 zonas
  clicáveis** e o **laboratório no meio do lago** (`assets/screens/safari-lab.webp`).
- **O jogo faz os sorteios, a tela só mostra.** Tudo vive em `G.sf` (salvo como `sf` no `save()`, sem mudar `v`):
  `mo` Moedas Safari, `lab` estoque do laboratório, `u` próximo id.
- Zona -> família (`SFZ`): GELO = Hydrake, FOGO = Blazleo, PLANTA = Byron, DESERTO = mista. Clicar numa zona abre
  o **altar de invocação** (`openZone`): 5 cartas viradas para baixo e o botão INVOCAR. Cada invocação **custa
  `MSSUM` (20) Moedas Safari**, chama `sfSpin` — que sorteia 5 Numius (estágio 1/2/3 em 72/23/5%, nível conforme o
  estágio) e guarda no laboratório (limite `SFLAB` 60) — e a tela vira as cartas **uma a uma** (`reveal`). Nada
  aparece antes de a pessoa invocar. Invocar **não paga moeda**: a moeda vem das missões.
- Cruzamento (`sfBreed`): mesma espécie, sexos diferentes, custa `SFCOST` (50) moedas. O filhote **nasce e fica
  no laboratório**, nível (a+b)/2 + 0 a 5, com a marca `nb` (NOVO). Dois cliques num card chamam `sfTake`, que
  cria o Numiu de verdade (`mk`) e põe na equipe (máx. 6).
- Mensagens: veja a tabela de iframes. Toda resposta traz `sf` atualizado — se mexer em `G.sf` por fora (teste,
  console), chame `sfSend()` para a tela ver.
- No menu principal a Safari **não tem ilha própria**: a ilha que era o Porto Avelar (`id:"porto"`, arte `menu-4.webp`)
  virou "SAFARI ZONE" com `nav:"safari"` — o pedido foi não acrescentar ilha nova ao mapa. O PvP continua na lista
  lateral. A barrinha dessa ilha mostra as Moedas Safari em relação ao orçamento do dia (`isl.porto` em `mnData`).

## Missões e Moeda Safari (`js/missions.js` + `screens/missions.html`)
- Três listas na tabela **`MIS`**: `d` diárias (zeram à meia-noite), `w` semanais (zeram junto com o Boss, usam
  `bsWeek()`) e `g` do jogo (permanentes). **Para trocar as missões mexa só nessa tabela** — o resto do motor não
  liga para o conteúdo.
- Cada missão é `{id, n, d, g (meta), r (moedas), ev}` — conta chamadas de `msAdd('ev')` — ou `{..., f:()=>número}`,
  que lê o estado do jogo na hora (insígnias, mostruário, nível…). O `id` precisa ser único e começar com `d_`,
  `w_` ou `g_`; trocar o `id` zera o progresso daquela missão.
- `msAdd(ev,n)` é chamado em: `foeDown` (`win`, e `tac` quando é batalha tática), insígnia nova (`gym`), `pvpResolve`
  (`win`), Centro de Cura (`heal`), `sfSpin` (`sum`), `sfBreed` (`breed`) e `bsNew` (`boss`). Para uma missão nova
  que precise de um evento que ainda não existe, acrescente a chamada no ponto certo do jogo.
- Estado salvo em `G.ms` (campo `ms` do `save()`, sem mudar `v`): `d` dia, `w` semana, `p` progresso por id,
  `c` já resgatadas. `msClaim(id)` soma a recompensa em `sfState().mo`.
- **Moeda Safari** é a mesma moeda das invocações. `MSSUM` (20) é o custo de uma invocação e `MSDAY` (= 20×5×4 = 400)
  é o que as diárias juntas pagam: 5 invocações em cada uma das 4 regiões. Mudou `MSSUM`? Reveja as recompensas das
  diárias para a conta continuar fechando (o teste de fumaça confere isso).
- No menu a aba **MISSÕES** fica na lista lateral, logo abaixo de BATALHAS TÁTICAS, com a contagem de missões
  prontas para resgate (`cnt.missoes` em `mnData`, de `msCount()`).

## Treinamento (`screens/train.html` + ponte em `screens-bridge.js`)
- Tela em HTML/JS puro (não é bundle React), acessada pela ilha "VALE ANCESTRAL" e pelo item **TREINAMENTO**
  da lista lateral do menu (`nav:"train"`), e pela tela de reserva do mapa. Substituiu as três telas antigas
  em HTML inline (`train`, `vir`, `trainiv` em `render.js`) por um único iframe com três visões internas
  (hub, IV/EV, Batalha Virtuosa) — o jogo só conhece `G.screen==='train'`.
- **IV e EV**: `trEV(i,s)`/`trIV(i,s)` (em `js/battle.js`) já existiam e não mudaram — gastam `G.vc` (Moedas
  Virtuosas) para subir EV (+8, custa 2, máx. 252) ou IV (+4, custa 6, máx. 31) de um Numiu da equipe. A tela
  manda `{k:'ev',i,s}`/`{k:'iv',i,s}` (`i` = índice na equipe, `s` = `h`/`a`/`sa`/`d`/`sd`/`sp`); o jogo chama
  a função, que já termina com `R()`, e isso reenvia `trdata` sozinho (mesmo padrão de `mv` na tela de equipe).
- **Batalha Virtuosa**: a tabela **`VPH`** (`js/data.js`, logo depois de `GY`) tem as 10 fases com nome, rival,
  emoji, tática, número de númios e recompensa em moedas. `vstart(n)` (em `battle.js`) usa `VPH[n-1]` para o
  número de rivais e a recompensa quando `n<=10`; além da fase 10 cai de volta na fórmula genérica antiga
  (`cnt` cresce a cada 2 fases, recompensa `2+n`). O **nível** dos rivais continua vindo da fórmula baseada no
  nível do seu primeiro Numiu (`pl+2*(n-1)`) — os textos "Nv 5+", "Nv 8+"... da tabela são só decorativos.
  Fases além da `G.vbest+1` aparecem bloqueadas (`locked`) e não podem ser lutadas.
- A luta em si **não é simulada na tela**: o botão "LUTAR" manda `{k:'fight',n}` e o jogo chama `vstart(n)`,
  que abre a arena de batalha de verdade (`G.screen='battle'`). Ao vencer, `end()` (em `battle.js`) volta para
  `G.screen='train'` (antes voltava para a extinta tela `vir`) com `G.vc`/`G.vbest`/`G.vsel` já atualizados.
- Estado salvo não mudou: `G.vc` (moedas), `G.vbest` (melhor fase), `G.vn`/`G.vsel` (fase atual/selecionada).

## Torre de Gelo (`screens/tower.html` + ponte em `screens-bridge.js`)
- Tela em HTML/JS puro, acessada **só** pela ilha "PICOS DE CRISTAL" (`nav:"tower"` em `screens/menu.html`,
  mesma posição/cor/ícone de antes — só o texto e o destino mudaram). A aba **GINÁSIOS** da lista lateral do
  menu continua existindo e aponta para a tela antiga de ginásios (`G.screen==='gyms'`, insígnias, Campeão da
  Liga) — são dois sistemas separados; a Torre **não** usa `G.badges`.
- 30 andares em 4 níveis (tabela `TWN` e `twFloor(n)` em `js/data.js`): Iniciante (1-5), Veterano (6-15),
  Elite (16-25), Mestre (26-30) — cada nível tem seu ícone, cor neon e um banco de nomes de treinadores
  (`(n-1) % nomes.length`, cíclico). Andares 1-4/5-9/10-19/20-29/30 têm 2/3/4/5/6 rivais.
  O andar 30 põe uma forma final (estágio 3) mais forte no último rival (`boss` em `twFloor`).
- Cada andar também tem um "númio principal" só decorativo (`twMain(n)` em `js/data.js`): cicla pelas 3
  famílias (`(n-1)%3`) e sobe de estágio junto com o nível (Iniciante/Veterano/Elite+Mestre = estágio 1/2/3).
  Fica igual pra quem olha a torre, mas **não** é o time sorteado de verdade na luta (isso continua aleatório
  em `twStart`). `twFloor(n)` devolve `spi`/`spn` (índice e nome da espécie); o sprite de verdade (`f`+índice)
  vem de `btImgs()`, enviado em `imgs` no primeiro `twdata` e cacheado pela tela (`IMGS` em `tower.html`).
- **Visual**: tela escura em tons de gelo (fontes Outfit + Space Grotesk, não as pixeladas do resto do jogo),
  com neve caindo, cristais e névoa decorativos no fundo. Os andares aparecem como uma **torre vertical de
  verdade** (`#grid` em `tower.html`): uma coluna rolável com uma linha ligando os andares, andar 30 no topo e
  andar 1 embaixo — o jogador sobe a torre rolando pra cima. Cada andar mostra o número, o sprite do númio
  principal, o nome do treinador e a recompensa; andares bloqueados ficam acinzentados com um cadeado. Ao
  carregar, a tela rola até o andar selecionado (`scrolled` em `tower.html`, só na primeira renderização).
- A luta acontece na arena de batalha de verdade: a tela manda `{k:'fight',n}`, o jogo chama `twStart(n)`
  (em `js/battle.js`), que monta o time rival com Numius de verdade (`BASE`, nível ≈ `5+n*1.5` + bônus depois
  do andar 25) e abre `G.screen='battle'`. Ao vencer, `end()` volta para `G.screen='tower'`.
- Recompensa (`n*12+10` moedas, `G.coins`) só é paga **a primeira vez** que o andar é vencido — a checagem é
  `B.tw===(G.twBest||0)+1` em `foeDown()` (`js/battle.js`); senão só avisa que já foi vencido antes. Andares
  além de `G.twBest+1` aparecem bloqueados; andares já vencidos continuam jogáveis (sem recompensa de novo).
- Estado salvo: só `G.twBest` (campo `tw` do `save()`, sem mudar `v`).

## Troca de Numius (`js/trade.js` + `screens/trade.html`)
- Ilha "CIDADE NEXUS" (antigo "Canion de Brasa"), `nav:"trade"` em `screens/menu.html` — mesma posição/arte
  da ilha de antes, só recolorida (`filter:"hue-rotate(255deg)..."` no `<img>` do card, campo `c.filter` em
  `screens/menu.html`) pra puxar pro roxo/magenta/ciano em vez do laranja de lava. **Não há arte nova**: este
  ambiente não tem uma ferramenta de geração de imagem, só pode recolorir a arte existente por CSS. Se quiser
  uma ilustração de cidade futurista de verdade, me mande o arquivo (`assets/screens/menu-3.webp` é o que
  seria trocado) do mesmo jeito que mandou as telas de Treinamento/Torre de Gelo. A aba **BATALHAS TÁTICAS**
  da lista lateral do menu continua existindo e aponta pra arena tática de sempre (`G.screen==='tac'`) — só a
  ilha mudou de destino, igual já tinha acontecido com Ginásios → Torre de Gelo.
- Reaproveita a **mesma sala peer-to-peer do PvP** (`ensureRoom()` em `js/pvp.js`, `claude.use('room')`, só
  funciona dentro do claude.ai com conta logada) com campos de presença próprios, prefixo `xc`, que convivem
  na mesma presença sem atrapalhar o pareamento do PvP (`PV.room`/`PV.peers` são compartilhados).
- Fluxo: escolhe um Numiu da equipe pra oferecer (`G.xcSel`) → `xcSearch()` entra em busca (`xcSt:'search'`
  na presença) → `xcOnPeers()` pareia dois treinadores buscando (mesma lógica de desafio/aceite do PvP,
  `xcChallenge`/`xcAcceptFrom`, pra evitar duas pessoas se pareando com alvos diferentes ao mesmo tempo) →
  os dois veem a oferta um do outro e confirmam (`xcConfirm`, grava `xcOk`) → quando os dois aparelhos veem
  `xcOk` batendo com o mesmo `xcId` dos dois lados, cada um aplica a troca **sozinho e localmente**
  (`pvpBuild` monta o Numiu recebido a partir do `xcOff` do outro lado) — não precisa de servidor de verdade
  porque o resultado não depende de sorte (sem `RR()`), só dos dois lados concordarem.
- Exige equipe com **2+ Numius** pra poder oferecer um (não dá pra ficar com 0). Fora do claude.ai (sem sala),
  a tela avisa que a troca online não está disponível, igual o PvP.
- **Sala de amigos**: mesmo truque do `PV.rm` do PvP (`pvOthers` em `screens-bridge.js`), só que com `XC.rm`
  e o campo de presença `xcRm`. Sem sala (`XC.rm===null`), `xcOthers()` só pareia com quem também está sem
  sala (pool público); com um código criado (`xcRoom('create',...)`, formato `XXXX-XXXX` aleatório) ou
  digitado (`xcRoom('join',code)`), só pareia com quem tiver o mesmo código — é como se fosse outro pool
  isolado. A tela mostra o código grande pra copiar/compartilhar (`#roomBox` em `screens/trade.html`) e um
  campo pra entrar com o código de um amigo. `xcRoom('leave',...)` volta pro pool público. Trocar de sala
  cancela qualquer busca/pareamento em andamento (mesmo reset que `xcCancel`), mas fica bloqueado
  (`disabled`) enquanto já está pareado (`xcSt==='paired'`) pra não interromper uma troca em andamento.
- Contador `G.xcDone` (campo `xd` do `save()`, sem mudar `v`) soma a cada troca concluída; a barrinha da ilha
  no mapa (`isl.canion` em `mnData()`) mostra o progresso até 10 trocas.
