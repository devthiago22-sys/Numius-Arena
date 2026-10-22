async function submitAuth(){
 const id=$('#fid').value.trim().toLowerCase(),pw=$('#fpw').value,em=$('#fem')?$('#fem').value.trim():'',p2=$('#fp2')?$('#fp2').value:'';
 G.f={id,em};const up=G.mode==='up',u=U();
 if(!/^[a-z0-9_]{3,20}$/.test(id))G.err='O ID deve ter de 3 a 20 letras minúsculas, números ou _.';
 else if(up&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))G.err='Digite um e-mail válido.';
 else if(up&&pw.length<6)G.err='A senha precisa ter pelo menos 6 caracteres.';
 else if(up&&pw!==p2)G.err='As senhas não coincidem.';
 else if(up&&u[id])G.err='Esse ID já está em uso.';
 else if(up&&Object.values(u).some(x=>x.email===em.toLowerCase()))G.err='Esse e-mail já está cadastrado.';
 else if(!up&&!u[id])G.err='ID não encontrado.';
 else{
  try{
   if(up){const s=rb();let old=null;try{old=JSON.parse(localStorage.getItem('mon-save'));localStorage.removeItem('mon-save')}catch(e){}u[id]={email:em.toLowerCase(),salt:s,hash:await H(pw,s),data:old};setU(u)}
   else if(await H(pw,u[id].salt)!==u[id].hash){G.err='Senha incorreta.';return R()}
   G.err='';G.f=null;ME=id;try{localStorage.setItem('mon-session',id)}catch(e){}enter();return;
  }catch(e){G.err='Não foi possível concluir. Tente novamente.'}
 }
 R();
}
function enter(){const d=U()[ME]&&U()[ME].data;if(d&&d.team&&d.team.length)load();else{G={team:[],badges:[],coins:0,screen:d&&d.hero?'start':'hero',battle:null,hero:d&&d.hero||null};R()}}
function guest(){ME=null;G={team:[],badges:[],coins:0,screen:'hero',battle:null};R()}
function logout(){musicOff();ME=null;try{localStorage.removeItem('mon-session')}catch(e){}G={team:[],badges:[],coins:0,screen:'auth',mode:'in',battle:null};R()}
