/* Teste de fumaça: abre o jogo num navegador real e passa pelas telas principais.
   Uso:  npm test                      (testa a pasta, via servidor local)
         node tests/smoke.js --single dist/numius-arena-single.html   (testa o arquivo único) */
const { chromium } = require('playwright');
const path = require('path');
const { start } = require('../tools/serve');

const single = process.argv.indexOf('--single') > -1 ? path.resolve(process.argv[process.argv.indexOf('--single') + 1]) : null;
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  OK   ' : '  FALHOU ') + msg); if (!cond) fails++; };

(async () => {
  const server = single ? null : await start(0);
  const url = single ? 'file://' + single : 'http://localhost:' + server.address().port + '/index.html';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [], bad = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  await page.goto(url); await page.waitForTimeout(3500);

  console.log('Login');
  ok(await page.evaluate(() => G.screen === 'auth' && LG.ready), 'tela de login carregou');
  await page.evaluate(() => { guest(); G.hero = { g: 'f', skin: 1, col: 2, name: 'Teste' }; pick(1); G.team.push(mk(0, 20), mk(2, 18)); G.badges = [0, 1]; G.dex = [0, 1, 2]; G.screen = 'map'; R(); });
  await page.waitForTimeout(2800);

  console.log('Telas');
  const visible = () => page.evaluate(() => [...document.querySelectorAll('iframe')].filter(f => f.style.display !== 'none' && f.style.visibility !== 'hidden').map(f => f.id).join(','));
  for (const [screen, frame] of [['map', 'mnf'], ['gyms', 'gyf'], ['team', 'eqf'], ['dex', 'dxf'], ['pvp', 'pvf'], ['tac', 'tbf'], ['boss', 'bsf'], ['bag', 'bgf'], ['safari', 'sff'], ['train', 'trf'], ['tower', 'twf'], ['trade', 'xcf']]) {
    await page.evaluate(s => { G.screen = s; R(); }, screen); await page.waitForTimeout(1500);
    ok((await visible()) === frame, 'tela "' + screen + '" mostra o iframe ' + frame);
  }

  console.log('Boss semanal');
  ok(await page.evaluate(() => BSS.ready), 'tela do boss carregou');
  ok(await page.evaluate(() => { G.team = [mk(2, 46), mk(5, 45), mk(8, 44)]; const Z = bsNew(0, 0); let g = 0; while (!Z.over && g++ < 60) bsTurn(Z, bsPick(Z, Z.me)); return !!Z.over && Z.n > 3; }), 'simulação do raid termina');
  ok(await page.evaluate(() => { G.eggs = 1; G.team = [mk(0, 5)]; const r = bsHatch(); return r.i != null && G.team.length === 2 && G.eggs === 0; }), 'ovo choca e entra na equipe');

  console.log('Centro de cura');
  await page.evaluate(() => { G.team[1].hp = 3; goHeal(); }); await page.waitForTimeout(2500);
  ok(await page.evaluate(() => HC.ready), 'centro de cura carregou');
  await page.frameLocator('#hcf').locator('button:has-text("Curar equipe")').click(); await page.waitForTimeout(5200);
  ok(await page.evaluate(() => G.team.every(m => m.hp === m.max)), 'curar equipe restaura a vida');

  console.log('Zona Safari');
  await page.evaluate(() => { G.screen = 'safari'; R(); }); await page.waitForTimeout(2200);
  const sf = page.frameLocator('#sff');
  ok(await page.evaluate(() => SF.ready), 'tela da zona safari carregou');
  const mo0 = await page.evaluate(() => sfState().mo);
  await sf.locator('#zGELO').click(); await page.waitForTimeout(400);
  ok(await sf.locator('#zG .card.back').count() === 5, 'o altar da zona abre com 5 cartas viradas');
  await sf.locator('#zGo').click(); await page.waitForTimeout(2600);
  ok(await page.evaluate(() => G.sf.mo) === mo0 - 20, 'a invocação cobrou as Moedas Safari');
  ok(await sf.locator('#zG .card:not(.back)').count() === 5, 'as 5 cartas viraram e mostraram os Numius');
  ok(await page.evaluate(() => G.sf.lab.length) === 5, 'os Numius ficaram no laboratório');
  await sf.locator('#zX').click(); await page.waitForTimeout(250);
  /* cruza um casal da mesma espécie e leva o filhote para a equipe */
  await page.evaluate(() => { G.sf.lab = [{ u: 901, i: 0, l: 20, sx: 'M', z: 'GELO' }, { u: 902, i: 0, l: 24, sx: 'F', z: 'GELO' }]; G.sf.mo = 999; sfSend(); });
  await sf.locator('#labbtn').click(); await page.waitForTimeout(500);
  await sf.locator('#labG .card[data-u="902"]').click(); await sf.locator('#labG .card[data-u="901"]').click(); await page.waitForTimeout(300);
  await sf.locator('#cross').click(); await page.waitForTimeout(700);
  ok(await page.evaluate(() => G.sf.lab.some(m => m.nb)) === true, 'o cruzamento gerou um filhote no laboratório');
  const nt = await page.evaluate(() => G.team.length);
  await sf.locator('#labG .card').first().dblclick(); await page.waitForTimeout(700);
  ok(await page.evaluate(() => G.team.length) === nt + 1, 'dois cliques levam o Numiu do laboratório para a equipe');

  console.log('Missões');
  await page.evaluate(() => { msAdd('win', 3); msAdd('heal', 1); G.screen = 'missions'; R(); }); await page.waitForTimeout(2200);
  ok(await page.evaluate(() => MS.ready), 'tela de missões carregou');
  const ms = page.frameLocator('#msf');
  ok(await ms.locator('.claim').count() === 2, 'as missões cumpridas mostram o botão de resgate');
  const moA = await page.evaluate(() => G.sf.mo);
  await ms.locator('.claim').first().click(); await page.waitForTimeout(600);
  ok(await page.evaluate(() => G.sf.mo) > moA, 'resgatar a missão paga Moedas Safari');
  ok(await page.evaluate(() => MIS.d.reduce((a, m) => a + m.r, 0)) === 20 * 5 * 4, 'as diárias juntas pagam 5 invocações em cada região');

  console.log('Treinamento');
  await page.evaluate(() => { G.vc = 50; G.vbest = 0; G.screen = 'train'; G.trfb = 0; R(); }); await page.waitForTimeout(2200);
  const tr = page.frameLocator('#trf');
  ok(await page.evaluate(() => TR.ready), 'tela de treinamento carregou');
  await tr.locator('#goIv').click(); await page.waitForTimeout(400);
  const ev0 = await page.evaluate(() => G.team[0].ev.h || 0), vc0 = await page.evaluate(() => G.vc);
  await tr.locator('.stbtn.ev').first().click(); await page.waitForTimeout(500);
  ok(await page.evaluate(() => G.team[0].ev.h) === ev0 + 8, 'o botão de EV soma 8 pontos no primeiro Numiu');
  ok(await page.evaluate(() => G.vc) === vc0 - 2, 'a sessão de EV cobrou 2 Moedas Virtuosas');
  await tr.locator('#backIv').click(); await page.waitForTimeout(300);
  await tr.locator('#goVir').click(); await page.waitForTimeout(400);
  ok(await tr.locator('.ph').count() === 10, 'a escada de fases mostra as 10 fases');
  ok(await tr.locator('.ph.locked').count() === 9, 'só a fase 1 está liberada no começo');
  await tr.locator('#fightBtn').click(); await page.waitForTimeout(2200);
  ok(await page.evaluate(() => G.screen === 'battle' && G.battle && G.battle.vt === 1), 'lutar na fase 1 abre a arena de batalha de verdade');
  await page.evaluate(() => { G.battle = null; G.screen = 'map'; R(); }); await page.waitForTimeout(500);

  console.log('Torre de Gelo');
  await page.evaluate(() => { G.twBest = 0; G.coins = 0; G.screen = 'tower'; G.twfb = 0; R(); }); await page.waitForTimeout(2200);
  const tw = page.frameLocator('#twf');
  ok(await page.evaluate(() => TW.ready), 'tela da torre de gelo carregou');
  ok(await tw.locator('.fl').count() === 30, 'a torre mostra os 30 andares');
  ok(await tw.locator('.fl.locked').count() === 29, 'só o andar 1 está liberado no começo');
  await tw.locator('#fightBtn').click(); await page.waitForTimeout(2200);
  ok(await page.evaluate(() => G.screen === 'battle' && G.battle && G.battle.tw === 1), 'subir o andar 1 abre a arena de batalha de verdade');
  await page.evaluate(() => { G.team.forEach(m => { m.hp = m.max }); turn(0); }); await page.waitForTimeout(2200);
  let tries = 0;
  while (await page.evaluate(() => G.battle && !G.battle.over) && tries++ < 25) { await page.evaluate(() => turn(0)); await page.waitForTimeout(1600); }
  await page.evaluate(() => end());
  ok(await page.evaluate(() => G.screen === 'tower' && G.twBest === 1), 'o time de Nv 18-20 vence o andar 1 (rivais Nv ~6-8) e libera o andar 2');
  ok(await page.evaluate(() => G.coins) >= 22, 'a vitória paga ao menos as 22 moedas da Torre (1*12+10), além do XP da batalha');

  console.log('Troca de Numius');
  await page.evaluate(() => { G.team = [mk(0, 20), mk(3, 22), mk(6, 18)]; xcOpen(); }); await page.waitForTimeout(2200);
  const xc = page.frameLocator('#xcf');
  ok(await page.evaluate(() => XCS.ready), 'tela da troca carregou');
  ok(await page.evaluate(() => G.screen === 'trade'), 'xcOpen() abre a tela de troca');
  ok(await xc.locator('.mcard').count() === 3, 'a troca mostra os 3 Numius da equipe pra oferecer');
  ok((await xc.locator('#stage').innerText()).toLowerCase().includes('não está disponível'), 'fora do claude.ai a troca avisa que o online não está disponível (sem claude.use)');
  await xc.locator('.mcard').nth(1).click(); await page.waitForTimeout(400);
  ok(await page.evaluate(() => G.xcSel) === 1, 'escolher um Numiu na lista atualiza a oferta (G.xcSel)');
  ok(await xc.locator('#createRmBtn').count() === 1, 'a sala de amigos mostra o botão de criar sala');
  ok(await xc.locator('#codeIn').count() === 1, 'a sala de amigos mostra o campo pra entrar com um código');
  await page.evaluate(() => { G.screen = 'map'; R(); }); await page.waitForTimeout(500);

  console.log('Arena Tática');
  await page.evaluate(() => { G.team = [mk(0, 40)]; G.tac = {}; G.screen = 'tac'; R(); }); await page.waitForTimeout(2200);
  const tb = page.frameLocator('#tbf');
  ok(await page.evaluate(() => TB.ready), 'tela da arena tática carregou');
  ok(await tb.locator('.tcard').count() === 8, 'a arena tática mostra um treinador por tipo (8 no total)');
  await tb.locator('.tcard').first().click(); await page.waitForTimeout(400);
  ok(await tb.locator('.ph').count() === 10, 'o treinador tem uma escada de 10 níveis');
  ok(await tb.locator('.ph.locked').count() === 9, 'só o nível 1 vem liberado na primeira vez, o resto fica cinza');
  await tb.locator('.ph').first().click(); await page.waitForTimeout(300);
  await tb.locator('#fightBtn').click(); await page.waitForTimeout(1800);
  ok(await page.evaluate(() => G.screen === 'battle' && G.battle.tt === 'Fogo' && G.battle.tl === 5), 'o nível 1 da escada abre a batalha no Nv 5 (primeiro da tabela TACLV)');
  ok(await page.evaluate(() => G.battle.tier === 0), 'Nv 5 cai na dificuldade "Iniciante" (tier 0)');
  await page.evaluate(() => turn(0)); await page.waitForTimeout(1600);
  let tacTries = 0;
  while (await page.evaluate(() => G.battle && !G.battle.over) && tacTries++ < 25) { await page.evaluate(() => turn(0)); await page.waitForTimeout(1600); }
  await page.evaluate(() => end()); await page.waitForTimeout(1500);
  ok(await page.evaluate(() => G.tac.Fogo && G.tac.Fogo.w === 1 && G.tac.Fogo.best === 5), 'vencer o nível 1 (Nv 5) registra a vitória e o melhor nível batido');
  ok(await tb.locator('.ph.locked').count() === 8, 'vencer o nível 1 libera o nível 2 (só 8 continuam bloqueados)');
  await page.evaluate(() => { G.screen = 'map'; R(); }); await page.waitForTimeout(500);

  console.log('Batalha');
  await page.evaluate(() => { G.screen = 'map'; R(); wild(); }); await page.waitForTimeout(3500);
  ok(await page.evaluate(() => G.screen === 'battle' && !G.btfb && BT.ready), 'arena de batalha carregou');
  await page.evaluate(() => turn(0)); await page.waitForTimeout(2200);
  ok(await page.evaluate(() => G.battle.log.length > 1), 'golpe usado na arena nova');
  await page.evaluate(() => { G.screen = 'map'; R(); tac('Fogo'); }); await page.waitForTimeout(1500);
  await page.evaluate(() => turn(0)); await page.waitForTimeout(2200);
  ok(await page.evaluate(() => G.screen === 'battle' && G.battle.log.length > 0), 'um golpe foi usado na batalha');

  ok(errors.length === 0, 'sem erros de script' + (errors.length ? ': ' + errors.join(' | ') : ''));
  ok(bad.length === 0, 'sem arquivos faltando' + (bad.length ? ': ' + bad.join(' | ') : ''));
  await browser.close(); if (server) server.close();
  console.log(fails ? '\n' + fails + ' verificação(ões) falharam.' : '\nTudo certo.');
  process.exit(fails ? 1 : 0);
})();
