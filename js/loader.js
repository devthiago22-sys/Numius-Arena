/* Carrega o HTML das telas (login, menu, equipe...) que rodam em iframes.
   - Em hospedagem normal (GitHub Pages ou servidor local) busca screens/<nome>.html.
   - No arquivo único gerado por tools/build_single_file.py as telas já vêm embutidas em window.__SCREENS. */
const SCREEN_NAMES=['login','hero','starter','menu','tactical','heal','team','gyms','dex','pvp','battle','boss','bag','safari','missions','train','tower'];
const SCREENS={};
async function loadScreens(){
 if(window.__SCREENS){Object.assign(SCREENS,window.__SCREENS);return}
 await Promise.all(SCREEN_NAMES.map(async n=>{
  const r=await fetch('screens/'+n+'.html');
  if(!r.ok)throw new Error('screens/'+n+'.html: '+r.status);
  SCREENS[n]=await r.text();
 }));
}
