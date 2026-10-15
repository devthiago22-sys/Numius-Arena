/* Inicialização: carrega as telas e inicia o jogo. */
function boot(){
 R();
 try{const s=localStorage.getItem('mon-session');if(s&&U()[s]){ME=s;enter()}}catch(e){}
}
loadScreens().then(boot).catch(err=>{
 document.getElementById('app').innerHTML='<div style="padding:24px;font:16px/1.5 system-ui;color:#fff;background:#1a1330;min-height:100vh"><h2>Numius Arena</h2><p>Não foi possível carregar as telas ('+String(err.message||err)+').</p><p>Abra o jogo por um servidor web (por exemplo <code>python3 -m http.server</code> dentro desta pasta) ou pelo GitHub Pages. Abrir o index.html direto do disco (file://) não funciona.</p></div>';
});
