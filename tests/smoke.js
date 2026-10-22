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
  for (const [screen, frame] of [['map', 'mnf'], ['gyms', 'gyf'], ['team', 'eqf'], ['dex', 'dxf'], ['pvp', 'pvf'], ['tac', 'tbf'], ['boss', 'bsf'], ['bag', 'bgf'], ['safari', 'sff']]) {
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
