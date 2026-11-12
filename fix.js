 /* ===== CORRECTIF IA Aristem ===== */
(function(){
 const BAD=/openrouter\.ai\/(workspaces|settings|keys|models)|console\.groq\.com|aistudio\.google\.com/i;

 /* 1) Répare automatiquement les IA mal configurées (la clé est conservée) */
 S.providers.forEach(p=>{
  const d=DEF.providers.find(x=>x.id===p.id);if(!d)return;
  if(BAD.test(p.url||''))p.url=d.url;
  if(p.id==='openrouter'&&!/\//.test(p.model||''))p.model=d.model;
 });
 save();

 /* 2) Vérification de l'URL et messages d'erreur clairs */
 const apiUrl=p=>{
  let u=(p.url||'').trim();
  if(!/^https:\/\//i.test(u))throw new Error('URL invalide pour '+p.name+' (elle doit commencer par https://)');
  if(BAD.test(u))throw new Error("L'URL de "+p.name+" est une page web, pas l'API.");
  if(p.type!=='anthropic'&&!/\/chat\/completions\/?$/.test(u))u=u.replace(/\/+$/,'')+'/chat/completions';
  return u;
 };
 const post=async(p,url,headers,body)=>{
  let r;
  try{r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)})}
  catch(e){throw new Error('Impossible de joindre '+p.name+' ('+new URL(url).host+"). Vérifie l'URL, ta connexion ou le domaine autorisé.")}
  const t=await r.text();let d;
  try{d=JSON.parse(t)}catch(e){throw new Error(p.name+' a répondu autre chose que du JSON (HTTP '+r.status+"). L'URL est probablement une page web.")}
  if(!r.ok){const e=Array.isArray(d)?(d[0]&&d[0].error):d.error;const m=e&&(typeof e==='string'?e:e.message);throw new Error(m||('HTTP '+r.status+' '+t.slice(0,200)))}
  return d;
 };

 /* Fusionne les messages consécutifs du même rôle (certaines API refusent sinon) */
 const norm=a=>{const out=[];for(const x of a){const l=out[out.length-1];if(l&&l.role===x.role)l.text+='\n'+x.text;else out.push({role:x.role,text:x.text})}return out};

 /* 3) Nouvelle fonction ask (remplace l'ancienne) */
 window.ask=async function(pid,msgs,o={}){
  msgs=norm(msgs);
  const p=prov(pid);if(!p.key)throw new Error('Ajoute ta clé API dans Réglages pour '+p.name);
  if(!p.model)throw new Error('Ajoute un modèle pour '+p.name+' dans Réglages');
  const key=p.key.trim();
  const sys=(o.system||"Tu es Aristem, un assistant personnel avec une personnalité claire et directe. Réponds en français, clair et concis.")+(S.name?" L'utilisateur s'appelle "+S.name+".":"");
  const url=apiUrl(p);
  if(p.type==='anthropic'){
   const m=msgs.map((x,i)=>({role:x.role,content:(o.img&&i===msgs.length-1)?[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:o.img.split(',')[1]}},{type:'text',text:x.text}]:x.text}));
   const body={model:p.model,max_tokens:o.max||1200,system:sys,messages:m};
   if(o.search)body.tools=[{type:'web_search_20250305',name:'web_search',max_uses:3}];
   const d=await post(p,url,{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body);
   return d.content.filter(b=>b.type==='text').map(b=>b.text).join('\n');
  }
  const m=[{role:'system',content:sys},...msgs.map((x,i)=>({role:x.role,content:(o.img&&i===msgs.length-1)?[{type:'text',text:x.text},{type:'image_url',image_url:{url:o.img}}]:x.text}))];
  const d=await post(p,url,{'content-type':'application/json','authorization':'Bearer '+key},{model:p.model,messages:m});
  return d.choices[0].message.content;
 };

 /* 4) Les champs de Réglages s'enregistrent pendant la frappe */
 document.addEventListener('input',e=>{
  const a=e.target.getAttribute&&e.target.getAttribute('onchange')||'';
  const m=a.match(/^S\.providers\[(\d+)\]\.(name|url|model|key)=this\.value;save\(\)$/);
  if(m&&S.providers[+m[1]]){S.providers[+m[1]][m[2]]=e.target.value;save()}
 });
})();