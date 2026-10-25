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
5. `supabase.js`: cliente Supabase (`SB`, Fase 1 do backend) e `cacheAcct` — ver seção "Back-end" abaixo.
6. `auth.js`: `submitAuth`, `enter`, `guest`, `logout`.
7. `arena-fx.js`: arena antiga em HTML (reserva), `sfx`.
8. `audio.js`: música (WebAudio), ponte do Centro de Cura, volume.
9. `pvp.js`: PvP em tempo real.
10. `screens-core.js`: `dec`, `iw` (iframe pré-carregado), telas Starter e Hero.
11. `pixel-scene.js`: cenário pixel art do menu antigo (reserva).
12. `screens-bridge.js`: pontes com as telas em iframe (login, menu, equipe, ginásios, mostruário, PvP,
    táticas, **arena de batalha** `btMount/btData/btSend`, **treinamento** `trMount/trData/trSend`,
    **torre de gelo** `twMount/twData/twSend`) e `authCore`/`authCoreLocal`.
13. `boss.js`: **Boss semanal** (raid): chefes `BOSSES`, simulação `bsNew/bsTurn`, recompensas, ovos, ponte `bsMount/bsData/bsSend`.
14. `legend.js`: **lendários invocáveis** (`LEG`, `lgCast`, `lgEnd`, `tyOf`, barra `lgBarSync`, animação `lgFx`) e ponte da **Mochila** (`bgMount/bgData/bgSend`).
15. `safari.js`: **Zona Safari** (sorteio `sfSpin`, cruzamento `sfBreed`, ponte `sfMount/sfData/sfSend`).
16. `missions.js`: **Missões** (tabela `MIS`, `msAdd`, `msClaim`, ponte `msMount/msData/msSend`) e a Moeda Safari.
17. `trade.js`: **Troca de Numius** online (sala peer-to-peer, `XC`, `xcOpen/xcOnPeers`, ponte `xcMount/xcData/xcSend`).
18. `render.js`: `R()` (renderizador principal), personagem, configurações, cura, `pick`.
19. `main.js`: `boot()`.

Regras:
- **Nunca reordene** os scripts nem chame, no nível superior de um arquivo, funções definidas em arquivos
  posteriores (funções só ficam "içadas" dentro do próprio arquivo).
- Funções e variáveis são globais de propósito: os atributos `onclick="..."` do HTML gerado em `R()`
  chamam funções globais (`turn(0)`, `G.screen='map';R()`...).
- Todo estado vive em `G`. Mudou algo visível? Chame `R()`.

## Telas em iframe (`screens/*.html`)
Login, hero, starter, menu, heal, team, gyms, dex, pvp, battle e boss são páginas React já compiladas (minificadas);
tactical, train, tower, trade e as demais telas novas (safari, missions) são HTML/JS puro. Todas abrem em
`<iframe srcdoc>`. O jogo e a tela conversam por `postMessage` com objetos `{numius:1, k:'...'}`:

| Iframe | O jogo escuta (k) | O jogo envia (k) |
|---|---|---|
| `lgf` login | `ready`, `login`, `signup`, `guest` | `err` |
| `hf` hero | `ready`, `hero` | |
| `sf` starter | `ready`, `pick` | `imgs` |
| `mnf` menu | `ready`, `nav` (to: gyms, tac, team, dex, pvp, train, tower, trade, heal, cfg, exit) | `data` |
| `tbf` táticas | `ready`, `nav`, `tac` (`t`, `lvl`) | `data` |
| `hcf` cura | `ready`, `healed`, `back`, `music` | dados em `window.NXT` (injetado no srcdoc) |
| `eqf` equipe | `ready`, `mv`, `nav`, `cfg`, `leg` (`id` ou `null`) | `team` (inclui `legs`) |
| `gyf` ginásios | `ready`, `gym`, `nav` | `gyms` |
| `dxf` mostruário | `ready`, `nav` | `dex` |
| `btf` arena de batalha | `ready`, `bact` (`move`,`swap`,`swapTo`,`cap`,`flee`,`leave`,`end`) | `bimgs`, `bstate` (`seq`,`st`,`evs`) |
| `bsf` boss semanal | `ready`, `nav`, `start` (`pick`), `turn` (`a`: `{k:'mv',i}` ou `{k:'def'}`), `hatch`, `leave`, **raid co-op:** `gmode` (`v`:solo/grp), `gpick` (`i`), `gcreate`, `gjoin` (`host`), `gleave`, `groom` (`op`,`code`), `gstart` | `bsdata` (campo `grp`), `bsstart`, `bsturn`, `bshatch` |
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

### Schema do save (hoje só em `localStorage`, versão `v:5`)
Documentado a partir de `save()`/`load()` em `js/state.js` — é o "contrato" a seguir pra desenhar as tabelas
do banco na Fase 2 do backend. Dois registros hoje, os dois em `localStorage`:

**Conta** (`mon-users`, objeto `{[id]: {...}}` em `U()`/`setU()`):
| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `email` | string | sim | minúsculo, é a chave de login |
| `salt` | string (base64) | sim | gerado no cadastro |
| `hash` | string (base64) | sim | PBKDF2(senha, salt, 100k iterações, SHA-256) — **hoje calculado só no navegador**, a Fase 1 precisa mover isso pro servidor |
| `data` | objeto | não (`null` até o primeiro save) | é o save abaixo |

**Save** (`data`, campo salvo por `save()`, chave de versão `v`):
| Campo | Tipo | Obrigatório | Default no `load()` | O que é |
|---|---|---|---|---|
| `v` | number | sim | — | versão do formato; `load()` zera o progresso se vier diferente de 5 (migração ainda é "tudo ou nada") |
| `team` | Numiu[] | sim | — | equipe atual (máx. 6), ver shape do Numiu abaixo |
| `badges` | number[] | sim | — | insígnias de ginásio conquistadas |
| `coins` | number | não | `0` | moedas comuns |
| `hero` | `{g,skin,col,name}` \| null | não | `null` | personagem (gênero, skin, cor, nome) |
| `dex` | number[] | não | `[]` | espécies já registradas no mostruário |
| `tac` | `{[tipo]: {w,best,q?}}` | não | `{}` | progresso da Arena Tática por tipo (vitórias, melhor nível da escada batido) |
| `pv` | objeto \| null | não | `null` | estado do PvP (`G.pvp`) |
| `vc`/`vn`/`vbest` | number | não | `0`/`1`/`0` | Moedas Virtuosas, fase atual/selecionada e melhor fase da Batalha Virtuosa (Treinamento) |
| `bs` | objeto \| null | não | `null` | Boss semanal: semana, melhor dano, recompensa recebida |
| `fr` | `{aurelion,nyxar,chronos}` | não | zerado | fragmentos de dragão |
| `eg` | number | não | `0` | ovos no inventário |
| `lg` | `{[id]:1}` | não | `{}` | lendários liberados na Mochila |
| `ls` | id \| null | não | `null` | lendário selecionado pra arena |
| `sc`/`sf` | number / objeto | não | `0`/`null` | contador de Moeda Safari e estado da Zona Safari (`G.sf`: moedas, laboratório, próximo id) |
| `ms` | objeto \| null | não | `null` | missões: dia/semana atual, progresso por id, resgatadas |
| `tw` | number | não | `0` | melhor andar vencido na Torre de Gelo |
| `xd` | number | não | `0` | trocas concluídas na Troca de Numius |

**Numiu** (item de `team`, moldado por `mk()`/`calc()` em `js/state.js`):
| Campo | Tipo | O que é |
|---|---|---|
| `i` | number | índice da espécie em `S` (já reflete a forma evoluída atual) |
| `l` | number | nível |
| `xp` | number | XP acumulado no nível atual |
| `iv` | `{h,a,sa,d,sd,sp}` 0-31 | IVs por atributo (vida, ataque, atq.especial, defesa, def.especial, velocidade) |
| `ev` | `{h,a,sa,d,sd,sp}` 0-252 | EVs por atributo |
| `hp`/`max` | number | vida atual / máxima (derivados de `calc`, não persistidos separado do resto) |
| `mv` | number[] (≤4) | índices em `MOVES` dos golpes conhecidos |
| `pp` | number[] | usos restantes de cada golpe em `mv` |

Isso cobre tudo que **um usuário** salva hoje. Não documentei estruturas efêmeras (estado de uma partida de
PvP em andamento, presença de sala) porque elas não são persistidas — nascem e morrem dentro da sessão.

## PvP (determinismo)
O duelo é calculado nos dois aparelhos e precisa dar o **mesmo resultado**. Por isso `hit()` usa `RR()`
(gerador com semente), nunca `Math.random()`. Qualquer função chamada por `pvpResolve` deve ser
determinística e não pode depender do estado local de um só jogador.

### A sala (pareamento online de PvP e Troca de Numius)
`ensureRoom()` (`js/pvp.js`) tenta dois caminhos, nessa ordem, e os dois preenchem o mesmo contrato
(`PV.room.presence(patch)`, `PV.ok`, `PV.peers` no formato `{peer,presence,sameTab,kind}`) — o resto do
jogo (`pvpOnPeers`, `xcOnPeers`, desafiar/aceitar...) não sabe qual dos dois está em uso:
1. `claude.use('room')` — só existe dentro do **preview do claude.ai**, e só funciona se a Artifact tiver
   declarado a capability `room` ao publicar (`capabilities:{room:{}}` na chamada do Artifact tool — ver
   seção de pré-visualização mais abaixo; **ficou sem declarar por várias publicações até 2026-10-24**).
2. Se isso não existir (fora do claude.ai — o site de verdade, GitHub Pages) **e** o Supabase estiver
   disponível (`SB`), cai pra um **canal de Presence do Supabase Realtime** (`rtJoin()`, mesmo arquivo):
   canal público (`SB.channel('numius-room',{config:{presence:{key}}})`, sem `private:true`) — funciona
   com a chave `anon` normal, sem precisar de login nem de policy de RLS extra (canal público é assim por
   design do Realtime), então serve tanto pra conta Supabase quanto pra convidado/conta local. A chave de
   presença (`PV.rtKey`) é um id aleatório por aba (`rb()`, de `js/battle.js`), não a conta — então duas
   abas da mesma conta aparecem como dois pares distintos, igual ao `sameTab` do `claude.use('room')`.
3. Se nenhum dos dois der: `PV.ok=false`, a tela avisa que o online não está disponível (comportamento
   de sempre, sem mudança).
Isso resolve a antiga limitação ("PvP só funciona dentro do claude.ai"): agora também funciona no site
publicado de verdade, onde vivem as contas Supabase — ou seja, **agora sim existe um caminho onde conta
Supabase e PvP/Troca coexistem** (via Realtime), diferente do que valia antes dessa mudança.

## Back-end (Supabase)
Projeto: **numius-arena** (region `sa-east-1`), org `devthiago22-sys's Org`, project ref
`nrkfxlmjztjtpgcrprsv`, URL `https://nrkfxlmjztjtpgcrprsv.supabase.co`. **A chave `service_role` nunca
deve ir pro front nem pro repositório** — só é usada do lado do servidor/Edge Functions. A chave
publicável está em `js/supabase.js` (`SB_URL`/`SB_KEY`) — é a chave **"legacy anon" (JWT clássico)**,
não a "publishable" nova (`sb_publishable_...`): a nova deu erro de verdade no cadastro ("Não foi
possível verificar o nome") fora deste sandbox, provavelmente por incompatibilidade com a versão do
`supabase-js` carregada via CDN. Se um dia trocar pra chave nova, teste cadastro/login de verdade (fora
daqui, com internet) antes de assumir que funciona — esse bug não aparece testando só com SQL direto.

**Fase 1 — autenticação (implementada)**: `js/supabase.js` cria o cliente `SB` (null se a CDN do
SDK, carregada em `index.html`, não carregar — offline ou bloqueada). `authCore(up,id,pw,em,p2)`
(`js/screens-bridge.js`, chamada tanto pela tela de login em iframe quanto por `submitAuth()` em
`auth.js`, a versão de reserva em HTML) faz cadastro/login de verdade pelo Supabase Auth quando `SB`
existe:
- A Auth do Supabase é por **e-mail**, mas o jogo loga por **nome de treinador**. Duas funções no
  banco resolvem isso: `username_available(u)` (checa se o nome já existe, cadastro) e
  `email_for_username(u)` (acha o e-mail dono do nome, login) — ambas `security definer`, só leitura
  mínima, únicas funções com `EXECUTE` liberado pra `anon`/`authenticated` de propósito.
- Cadastro (`SB.auth.signUp`) manda o nome de treinador em `options.data.username`; a trigger
  `on_auth_user_created` em `auth.users` cria a linha em `public.profiles` (`user_id`, `username`)
  sozinha no banco (`handle_new_user`, sem `EXECUTE` público — só roda via trigger).
- **E-mail é sintético, não digitado pela pessoa**: a tela de login (`screens/login.html`, bundle
  React) só pede nome de treinador + senha — ela mesma gera um e-mail tipo `nome@numius.game` pra
  mandar em `signup` (ver tabela de iframes, `k:'signup'` manda `id,pw,em,p2`). Por isso a pessoa
  **nunca** consegue clicar num link de confirmação: esse e-mail não existe de verdade. Pra não travar
  o cadastro pra sempre (era exatamente o bug: só dava pra jogar como convidado), a migração
  `auto_confirm_synthetic_email_signups` faz `handle_new_user` confirmar esse e-mail sozinho no banco
  (`update auth.users set email_confirmed_at = now()`), e `authCore` (`js/screens-bridge.js`), se
  `signUp` não devolver sessão na hora (comum quando "Confirm email" está ligado no projeto, mesmo já
  confirmado no banco pela trigger — o retorno do `signUp` não reflete isso), tenta
  `signInWithPassword` em seguida, numa chamada separada que já lê o e-mail confirmado.
- Login sem Supabase, ou nome de treinador não encontrado lá (contas de antes da Fase 1): cai pra
  `authCoreLocal` (a lógica antiga, local, intacta — `mon-users`/PBKDF2 em `js/state.js`). Isso
  também é a reserva natural se o Supabase cair.
- Depois de logar pelo Supabase, `ME` passa a ser o **uuid** da conta (não mais o nome de treinador),
  e `cacheAcct()` (`js/supabase.js`) espelha isso num registro local em `mon-users` (sem hash de
  senha, quem autentica é o Supabase) — assim `save()`/`load()`/`enter()` continuam funcionando sem
  mudar nada. `logout()` também chama `SB.auth.signOut()`.
- `ME` virar um uuid também significa que não dá pra mostrar `ME` direto na tela (feio, e o jogador
  não reconhece). Use `meName()` (`js/supabase.js`): devolve o nome de treinador guardado por
  `cacheAcct()` pra conta Supabase, ou o próprio `ME` pra conta local antiga (onde `ME` já é o nome).
  Usado em `js/render.js` (tela do mapa, Configurações, tela de "Até logo") e em `mnData()`
  (`js/screens-bridge.js`, nome mostrado no menu).

**Fase 2 — save sincronizado (implementada)**: tabela `public.saves` (migração `create_saves_table`),
uma linha por jogador (`user_id` referenciando `auth.users`, é a chave primária), espelhando o schema
documentado acima (seção "Schema do save") quase campo a campo — `jsonb` pras estruturas aninhadas
(`team`, `tac`, `hero`, etc.), `updated_at` atualizado sozinho por trigger. RLS ligado: cada jogador só
lê/escreve a própria linha (`auth.uid() = user_id`), sem policy de `delete` por enquanto.
- `isSbId(id)` (`js/supabase.js`) distingue conta Supabase (uuid, tem hífen) de conta local antiga (nome
  de treinador, nunca tem hífen) — sem precisar de uma flag separada.
- `save()` (`js/state.js`) continua gravando em `localStorage` toda vez (rápido, síncrono, like sempre)
  e também chama `cloudSaveQ(d)` — pra conta Supabase, isso agenda um `upsert` na tabela `saves` com
  **debounce de 1.5s** (pra não martelar a API a cada XP/golpe/etc., que chamam `save()` várias vezes
  por minuto); pra conta local, `cloudSaveQ` não faz nada (`isSbId` falha). `cloudSaveFlushNow()`
  pula o debounce e salva na hora — usado em `logout()` pra não perder os últimos segundos antes de
  sair.
- `load()` (`js/state.js`) virou assíncrona e, pra conta Supabase, busca a nuvem **primeiro**: achou a
  linha em `saves`? usa ela. Não achou mas tem cache local (conta Supabase de antes da Fase 2 migrando
  pra cima)? usa o cache local E manda pra nuvem (`cloudSaveQ`). Não tem nenhum dos dois? personagem
  novo (`G.screen='hero'`). O corpo antigo de `load()` virou `applyData(d)`, reaproveitado nos três
  casos. Pra conta local, nada mudou (lê só do `localStorage`, como sempre).
- `enter()` (`js/auth.js`) também ficou assíncrona: pra conta Supabase, chama `load()` (que decide tudo
  acima) **mesmo que o cache local deste navegador esteja vazio** — é o que faz o progresso aparecer
  num aparelho/navegador novo que nunca viu essa conta. Pra conta local, decide pelo cache como sempre.
- Testar isso **não dá pra fazer no preview do claude.ai** (mesma limitação do Supabase em geral, ver
  seção abaixo) — use o GitHub Pages, de preferência logando com a mesma conta em dois navegadores/
  aparelhos diferentes pra confirmar que o progresso realmente sincroniza.
- **Bug real encontrado e corrigido (2026-10-25), achado só testando de verdade no GitHub Pages**: toda
  gravação na nuvem estava falhando (HTTP 400, erro Postgres `23502`, "null value in column \"lg\"") pra
  praticamente qualquer conta — o `localStorage` continuava salvando normal (mascarando o problema, sem
  erro visível pro jogador), só aparecia no console do navegador. Causa: a coluna `lg` de `public.saves`
  é `NOT NULL DEFAULT '{}'::jsonb`, mas `save()` mandava `lg:G.leg||null` — um `null` explícito **não**
  cai no default da coluna (só um campo omitido cairia), então violava a constraint sempre que
  `G.leg` estivesse vazio (ex.: personagem recém-criado, antes de liberar qualquer lendário — ou seja, a
  maioria das contas). Corrigido pra `lg:G.leg||{}`. Conferido por SQL que nenhuma outra coluna tem esse
  mesmo descasamento (todas as outras `NOT NULL` já recebem valor não-nulo do cliente; todas as
  `NULLABLE` já usam `||null` sem problema). `npm test` voltou a passar depois do fix.

**Fase 3 — validação de PvP no servidor (implementada, escopo deliberadamente limitado)**: Edge
Function `pvp-report` (`supabase/functions/pvp-report/index.ts`), chamada por `pvpEnd()` (`js/pvp.js`)
só pra conta Supabase (`SB&&isSbId(ME)`). **Não é um replay completo da batalha** — portar
`hit()`/`pvpResolve`/`legend.js` pro Deno seria um trabalho grande e arriscado de manter sincronizado
com o motor do jogo (toda mudança de balanceamento teria que ser replicada nos dois lados). Em vez
disso, o cliente ainda decide quem venceu, mas o servidor:
- confirma a identidade de quem chama pelo JWT (nunca confia num `user_id` vindo do corpo);
- recusa um delta de LP fora do que a fórmula de `pvpEnd()` poderia produzir (vitória: 15 a 40; derrota:
  −20 a −10 — os mesmos limites de `25+clamp(-10,15,...)` / `-(15+clamp(-5,5,...))` que já existem no
  cliente);
- recusa reportar o mesmo `bid` (id da partida) duas vezes, e limita a frequência de chamadas por conta
  (mín. 5s entre reports) — contra o ataque trivial de dar LP infinito a si mesmo chamando repetido;
- aplica o resultado de forma atômica (`public.pvp_apply_result`, `security definer`, só a
  `service_role` executa — um único `UPDATE ... RETURNING`, sem race de ler-e-escrever) no `pv` (jsonb)
  da linha de `public.saves`, com o LP sempre entre 0 e 3500;
- grava cada report em `public.pvp_matches` (RLS: cada jogador só lê os próprios) pra auditoria futura.
O cliente usa o LP que a função devolve (sobrescreve o calculado localmente); se a chamada falhar (sem
rede, rate limit, etc.) o jogo já salvou o cálculo local antes de tentar — nunca trava a partida.
Pra fechar essa lacuna de verdade (confirmar quem realmente venceu, não só limitar o estrago), o próximo
passo seria portar o motor determinístico de verdade — avaliado e descartado por ora pelo custo/risco.

**Fase 4 — recompensa do Boss semanal no servidor (implementada)**: Edge Function `boss-claim`
(`supabase/functions/boss-claim/index.ts`), chamada por `bsFinish(Z,win)` (`js/boss.js`) só pra conta
Supabase, e só quando `win` é verdadeiro. Mais simples que o PvP porque aqui a recompensa é um **valor
fixo** (`BSR`: +5 fragmentos, +500 moedas, +1 ovo) e a semana/dragão da vez saem só do **relógio do
servidor** (mesmas contas de `bsWeek()`/`bsNow()`, nunca de algo que o cliente manda) — então, em vez de
limites aproximados, dá pra garantir **exatamente** "no máximo 1 resgate por conta por semana":
- a trava é um `unique(user_id, week)` em `public.boss_claims` — a Edge Function tenta inserir a linha
  **antes** de aplicar a recompensa, e se o insert falhar por conflito (`23505`), é porque essa conta já
  resgatou essa semana (`claimed:false, reason:'already_claimed'`), sem race condition possível;
- `public.boss_apply_claim` (`security definer`, só `service_role`) soma a recompensa fixa no `fr`
  (fragmentos por dragão, jsonb), `coins` e `eg` de `public.saves`, atômico;
- o cliente ainda decide se venceu (`win`) — **não é replay do combate**, mesma ressalva da Fase 3.
O cliente usa o `fr`/`coins`/`eg` que a função devolve (sobrescreve o já creditado localmente); falha de
rede não desfaz o crédito local, só deixa de sincronizar com a nuvem dessa vez.

**Fase 5 — auditoria leve da Troca de Numius (implementada, escolhida deliberadamente mais fraca que
PvP/Boss)**: Edge Function `trade-report` (`supabase/functions/trade-report/index.ts`), chamada por
`xcOnPeers()` (`js/trade.js`), logo depois que a troca já foi aplicada local nos dois aparelhos (por
acordo direto via Realtime, ver seção "A sala" mais acima). A troca é um acordo entre **duas contas
diferentes**, sem relógio nem recompensa fixa pra se apoiar (depende do que cada lado oferece) — dar ao
servidor autoridade de verdade sobre o resultado exigiria reescrever o fluxo pra os dois lados esperarem
a aprovação dele antes de aplicar (um "escrow" de verdade), em vez do acordo P2P direto de hoje. Optou-se
por **não** fazer isso agora (mudança bem maior, e troca com amigos já é baixo risco: precisa dos dois
lados concordarem) — em vez disso, cada lado só **audita** depois do fato:
- confirma a identidade de quem chama pelo JWT;
- confere se o Numiu que essa conta diz ter **dado** (`gave`, no formato `xc1()`: espécie + os 6 IVs,
  que não mudam com XP/nível — uma assinatura estável) realmente existia no save dela na **nuvem**
  (não bloqueia a troca, só sinaliza: `verified:false` quer dizer que a troca não bate com o que a
  nuvem tinha, sinal de cliente adulterado nessa conta);
- grava tudo em `public.trade_log` (RLS: cada jogador só lê os próprios) — hoje é só rastro pra
  investigar depois (ex.: um script futuro que lista `verified:false`), nada reage a isso automaticamente.
Se um dia a troca precisar de garantia de verdade (o servidor decidindo, não só auditando), o caminho é
reescrever pra um escrow: os dois lados mandam a oferta pro servidor com um `tradeId` em comum, e só
quando as duas chegam e conferem é que ele aplica a troca nos dois `saves.team` de uma vez (atômico).

## Pré-visualização no claude.ai
Gere o arquivo único (`tools/build_single_file.py`) e publique-o. Se passar de 16 MB, reduza imagens
(WebP, tamanho menor) em vez de remover recursos. Dentro do claude.ai, `claude.use('room')` habilita o PvP.

**O preview (artifact do claude.ai) não serve pra testar o Supabase (Fase 1 do backend).** Páginas
publicadas como artifact rodam numa sandbox que só permite rede pra um conjunto bem específico de
coisas (CDNs de bibliotecas, capabilities declaradas) — chamada direta de `fetch`/`supabase-js` pra uma
API externa qualquer (como `nrkfxlmjztjtpgcrprsv.supabase.co`) **não é permitida**, mesmo a biblioteca
tendo carregado normal via CDN. Sintoma: toda chamada ao Supabase (RPC, auth) volta com erro genérico,
igual em qualquer navegador, trocar chave/projeto não muda nada — foi exatamente isso que aconteceu e
custou um tempo até perceber que não era bug de configuração. Pra testar cadastro/login de verdade,
use o site publicado (GitHub Pages: `https://devthiago22-sys.github.io/Numius-Arena/`, branch `main`,
pasta raiz — já configurado), nunca o link do artifact. Confirmado funcionando no GitHub Pages em
2026-10-24.

**Pra `claude.use('room')` funcionar no preview (PvP e Troca de Numius), a Artifact precisa declarar a
capability `room`** (`capabilities:{room:{}}` na chamada do Artifact tool) — sem isso `claude.use('room')`
devolve `null` mesmo dentro do claude.ai e o jogo mostra "online não está disponível", igual se estivesse
fora do claude.ai. Isso ficou sem declarar por várias publicações (só foi notado e corrigido em
2026-10-24, versão 45) — **ao publicar este artifact pela primeira vez numa sessão nova** (sem reaproveitar
a mesma `url`), lembre de declarar de novo; reaproveitando a mesma `url` a declaração anterior persiste
(só se perde se um publish mandar `capabilities:{}` por engano).
**Atualização (mesmo dia, depois da versão 45)**: a limitação do parágrafo acima ("Supabase e sala de
PvP/Troca nunca coexistem") foi resolvida — `ensureRoom()` (`js/pvp.js`) agora cai pra um canal de
Presence do Supabase Realtime quando `claude.use('room')` não existe (fora do claude.ai). Ver a seção
"A sala" em "## PvP (determinismo)", mais acima, pros detalhes. Isso significa que as Fases 3 e 4
(validação de PvP/Boss no servidor) **agora sim podem disparar de verdade**, no GitHub Pages, com conta
Supabase jogando PvP/Boss por ali.

## Convenções
- Textos em português; manter emojis e `aria-label` nos botões.
- Respeitar `prefers-reduced-motion` em animações novas.
- Ao criar uma tela nova: adicione o HTML em `screens/`, o nome em `SCREEN_NAMES` (`loader.js`), a ponte
  em `screens-bridge.js`, e uma verificação em `tests/smoke.js`.

## Menu principal (`screens/menu.html`) — layout responsivo das ilhas
As 4 ilhas ficam em posições fixas por porcentagem (`left`/`top` no array `d`, dentro do bundle React:
vale 18%/20%, cristal 72%/20%, canion 18%/62%, porto 72%/62%) enquanto o card do **Boss Semanal**
(`.boss-island`, `boss-island-wrap`) fica sempre centrado (`left:50%,top:50%`) com **tamanho fixo em
px**, não em porcentagem. Isso quebra em larguras intermediárias: a posição das ilhas encolhe
proporcionalmente à largura da tela, mas o card do boss não — então ele passa por cima das ilhas
(reportado: cobria a ilha VALE ANCESTRAL quase inteira). A correção são media queries em cascata no
`<style>` do próprio `menu.html` que reposicionam as ilhas pros cantos (`left`/`top` menores) e encolhem
tanto `.island-img` quanto `.boss-island` em pixels fixos conforme a largura cai: `max-width:1200px` →
`max-width:900px` → `max-width:650px` (a última é a faixa de celular; nenhuma delas resolve larguras
abaixo de ~600px de verdade, porque a barra lateral do menu sozinha já ocupa boa parte da tela — não é
o caso reportado). Mudou o tamanho/posição de alguma ilha ou do card do boss? Teste em pelo menos
768px, 960px, 1024px, 1145px e 1280px de largura (foi assim que o buraco entre 640 e 1200px foi achado
— nenhum desses media queries existia nessa faixa antes).

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
- Raid de 5 treinadores: o jogador + 4 aliados. Por padrão os 4 são controlados por IA (`bsPick`), mas dá pra jogar
  com até 4 jogadores reais no lugar deles — ver "Raid co-op" logo abaixo. Ranking mundial (`BSRANK.world`)
  continua só local (`BSRANK` hoje não manda nada pro servidor) — fora de escopo por ora.

### Raid co-op (jogar o Boss com outros jogadores, não só bots)
Implementado em `js/boss.js` (seção "Raid co-op" no arquivo, logo depois de `bsHatch`) + a aba RAID de
`screens/boss.html`. Reaproveita a **mesma sala de presença do PvP/Troca de Numius** (`ensureRoom()` em
`js/pvp.js` — ver "A sala" em "## PvP (determinismo)"), com um prefixo próprio de campos (`br*`, de "boss
raid") pra não colidir com os campos `xc*`/`pv*` já usados ali. **Cuidado**: o objeto global `BG` e as
funções `bgMount/bgData/bgSend/bgToggle` já pertencem à Mochila (`js/legend.js`) — por isso o raid co-op
usa `BR`/`br*`, nunca `bg*` fora do campo de presença genérico `bg:1` (só uma flag "estou na tela do
Boss buscando/num grupo", não colide porque é chave de objeto, não identificador global).

**Modelo: o anfitrião é a autoridade.** Quem cria o grupo roda a simulação de verdade (`bsTurn`, a mesma
do solo) e manda o resultado de cada turno pros outros pela própria presença (`brLive`). Os convidados
**nunca simulam**: só mandam a própria jogada (`brTurn`/`brAct`, o número do turno que estão respondendo
+ a ação) e espelham o que o anfitrião manda, alimentando a mesma tela de batalha (`bsstart`/`bsturn`)
que o solo já usa — a tela (`screens/boss.html`) não sabe se está em raid solo, hospedando ou
convidada, só recebe as mesmas mensagens de sempre. Isso evitou ter que portar o motor de combate pra
rodar igual em 5 aparelhos ao mesmo tempo (determinismo de verdade entre 5 pontas seria bem mais frágil).
- **`bsTurn(Z,pa)` foi generalizado** pra aceitar `pa` em dois formatos: uma ação única `{k,i}` (solo,
  sempre pro único membro com `.me===true`) ou um mapa `{id:ação}` com uma ação por `id` de membro humano
  (raid). A checagem interna trocou de `m.me` pra `m.ai` (bot ou não) — `m.me` continua existindo, mas
  agora é só "esse é o MEU próprio membro" (pra UI/placar), não mais o que decide quem é controlado por
  jogada externa.
- **`bsInit(bi,seed)`** foi extraído de dentro do antigo `bsNew` (monta só `Z.s`/`Z.b`, o chefe) — reusado
  tanto por `bsNew` (solo) quanto por `bsNewGroup(bi,human)` (raid), que monta `Z.p` a partir de até 5
  humanos reais (`human:[{peer,nm,pick}]`, `pick` no formato compacto de `xc1()`/`pvpBuild` — reaproveita
  o `pvpBuild` já existente, que já sanitiza IV/EV/nível/golpes de um peer não confiável) e preenche o
  resto do grupo de 5 com aliados IA, igual ao `mk2` do solo.
- **Pareamento**: pool público (mesma sala, sem código) + sala de amigos opcional com código `XXXX-XXXX`
  (mesmo truque do `XC.rm` da Troca de Numius, campo de presença `brRm`). Criar o grupo (`brCreate`)
  marca a presença como `brSt:'open'`; outros que estão só navegando (`brOthersOpen()`, filtra por
  `brSt==='open'` e mesma `brRm`) veem a lista de grupos abertos e entram (`brJoin`) sem precisar de
  aceite do anfitrião (risco baixo — é cooperativo, não PvP). O anfitrião vê quem entrou computando
  direto dos peers (`brMembersOf(meuPeer)`, filtra por `brWith===meuPeer`), sem precisar de um passo de
  confirmação. `npm run test` cobre só a simulação (`bsNewGroup`+`bsTurn` com ações de 2 humanos até o
  fim) — o pareamento em si (sala, presença) só foi verificado manualmente, igual o PvP (ver "Fase 3" e
  a nota sobre teste em dois navegadores).
- **Turno por turno**: cada humano manda a própria jogada marcada com o número do turno que está
  respondendo (`brTurn`); o anfitrião só resolve (`brTryResolve`) quando tem a jogada de todos os
  membros humanos pro turno esperado — quem não respondeu em ~22s leva "Proteger" por padrão (nunca
  trava o raid esperando um convidado que sumiu). O resultado (eventos, HP, dano de cada humano por
  turno) vai de volta pela presença (`brLive`); cada convidado aplica isso na própria tela e mantém um
  "espelho" leve do próprio placar (`BR.view`, só `{bi,n,me:{dm},over}` — o bastante pra chamar
  `bsFinish`/`bossReport` no fim, **cada jogador resgata a própria recompensa na própria conta** — a
  Fase 4 (`boss-claim`) não precisou mudar nada, roda igual em cada cliente com o `ME`/`SB` local).
- **Limitação conhecida, documentada e não escondida da pessoa**: sem troca de anfitrião. Se o
  ANFITRIÃO cair no meio do raid, os convidados detectam (mesmo "gone" de ~8s do PvP/Troca) e encerram a
  própria tentativa como derrota, sem recompensa — igual a sair manualmente. Se for um CONVIDADO que
  cai, o raid continua (o anfitrião preenche a jogada dele com "Proteger" depois do timeout); o convidado
  que caiu, ao voltar, só vê o grupo como se nunca tivesse saído (não há reconexão no meio de um raid).
- UI: a aba RAID de `screens/boss.html` ganhou um alternador SOZINHO/COM JOGADORES. Em "com jogadores",
  mostra os grupos abertos (ou o próprio grupo, se já criou/entrou) e troca o botão "INICIAR RAID" por
  "aguardando o anfitrião" quando a pessoa é convidada (só o anfitrião inicia). Os golpes de outros
  jogadores reais na arena de batalha aparecem com o nome deles (sem a etiqueta "IA", que agora só
  aparece pra aliados de verdade controlados por IA — antes qualquer membro que não fosse "você" ganhava
  essa etiqueta, o que ficaria errado com jogadores reais no grupo).
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
- Tela em HTML/JS puro (não é bundle React), acessada **só** pela ilha "VALE ANCESTRAL" (`nav:"train"` em
  `screens/menu.html`) — não tem mais item próprio na lista lateral do menu (removido por já estar na ilha;
  `cnt.train` também saiu de `mnData()` em `js/screens-bridge.js`, era só o contador desse item). Substituiu as três telas antigas
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
  da lista lateral do menu continua existindo e aponta pra Arena Tática (`G.screen==='tac'`, ver seção própria
  abaixo) — só a ilha mudou de destino, igual já tinha acontecido com Ginásios → Torre de Gelo.
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

## Arena Tática (`screens/tactical.html` + ponte em `screens-bridge.js`)
- Tela em HTML/JS puro (substituiu o antigo bundle React minificado, que não tinha escada de níveis).
  Acessada pela aba **BATALHAS TÁTICAS** da lista lateral do menu (`nav:"tac"`) e pela ilha de ginásios antiga.
  Visual mantido igual ao de sempre do jogo (fontes JetBrains Mono/Press Start 2P, paleta laranja/brasa) —
  **não** é a estética nova de Treinamento/Torre/Troca.
- Hub (`#v-hub`): uma grade com um **treinador por tipo** (os 8 de sempre: Fogo, Água, Planta, Elétrico,
  Pedra, Gelo, Psíquico, Voador), com o emoji/nome do treinador que já existia em `TNPC` (`js/arena-fx.js`,
  ex.: Treinador Brasa = Fogo) e quantos dos 10 níveis da escada já estão liberados.
- **Dentro de cada treinador tem uma escada fixa de 10 níveis** (tabela `TACLV` em `js/data.js`:
  `[5,10,15,20,25,30,40,50,60,70]`), igual em espírito à escada da Batalha Virtuosa/Torre de Gelo: **vencer o
  nível N libera o N+1**; a dificuldade **não** escalona mais sozinha a cada vitória como antes (que ficava
  difícil rápido demais) — ela é só uma função de qual nível da escada o jogador está jogando (`tier`,
  0=Iniciante/1=Esperto/2=Estrategista/3=Mestre, tabela `TN`, cortes `L<25?0:L<45?1:L<60?2:3`). **Na primeira
  vez só o nível 1 (Nv 5) vem liberado**; os outros aparecem cinza/bloqueados (`.ph.locked`) até vencer o
  anterior.
- `tacUnlocked(t)` (`js/battle.js`) calcula quantos níveis da escada estão liberados pra um tipo a partir do
  maior nível já vencido (`G.tac[t].best`): conta quantos marcos de `TACLV` são `<= best` e soma 1 (o próximo).
  `tac(t,lvl)` usa `tacLvl(lvl)` pra achar o marco de `TACLV` mais próximo do nível pedido e **trava** o índice
  em `tacUnlocked(t)-1` (não dá pra pular pra um nível ainda bloqueado nem mandando a mensagem direto). Monta
  o time rival (`mk(pool[k%pool.length], L)`) nesse nível e abre a arena de batalha de verdade
  (`G.screen='battle'`) — a luta em si roda igual à de sempre (`turn`, `hit`...). `end()` só registra
  `T.w` (vitórias) e `T.best` (maior nível já vencido) por tipo em `G.tac[t]`, salvo em `save()` como `tac`
  (sem mudar `v`) — não tem mais `T.seen` (histórico de golpes pra contra-ataque) nem pumping de IV/EV.
- Ponte (`TB` em `screens-bridge.js`): `tbData()` manda `{levels:TACLV, types:[{t,e,tn,te,w,best,unl}],
  canFight, imgs}` — `tn`/`te` são o nome/emoji do treinador (de `TNPC`), `unl` é quantos níveis da escada
  esse tipo já tem liberados (`tacUnlocked`), `imgs` só vem uma vez (gate `TB.sent`). A tela manda
  `{k:'tac', t:<nome do tipo>, lvl:<nível da escada escolhido>}` direto (sem a tradução de ids minúsculos que
  o bundle antigo usava). Tem o mesmo temporizador de reserva de 12s das outras telas novas (`G.tbfb`); se não
  responder `ready`, cai na versão simples em HTML (`render.js`).
