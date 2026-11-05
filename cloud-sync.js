/* LEX cloud bridge. No external libraries, cookies, analytics or token storage. */
'use strict';
(function(){
  const cfg=Object.freeze({owner:'KevinDiaz01',repo:'lex-law-study',branch:'main',path:'content/lex-data.json'});
  const changeKey='lex_pending_changes_v2';
  let pending=[];
  try {const x=JSON.parse(localStorage.getItem(changeKey)||'[]');if(Array.isArray(x))pending=x;}catch{}
  let connected=false;
  let token=null; // Memory only. Refreshing the browser forgets the token.
  const byId=(items,id)=>items?.find(x=>x.id===id);
  const api=`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${cfg.path}`;
  const setStatus=(message)=>{const el=document.getElementById('cloudStatus');if(el)el.textContent=message;const badge=document.getElementById('pendingCount');if(badge)badge.textContent=pending.length?String(pending.length):'';};
  const persist=()=>{try{localStorage.setItem(changeKey,JSON.stringify(pending));}catch{toast('Browser storage is full; export a backup.');}};
  function record(change){
    pending.push(JSON.parse(JSON.stringify(change)));
    persist();setStatus(`${pending.length} unpublished local change${pending.length===1?'':'s'}. Your content will remain available in this browser.`);
  }
  function applyChange(data,ch){
    if(ch.kind==='replace')return clone(ch.data);
    if(ch.kind==='merge'){mergeData(data,ch.data);return data;}
    let c=byId(data.courses,ch.cid);if(!c)return data;
    if(ch.kind==='upsertTopic'){
      const old=byId(c.topics,ch.topic.id);
      if(old){old.title=ch.topic.title;old.description=ch.topic.description;}
      else c.topics.push(clone(ch.topic));
    } else if(ch.kind==='upsertEntry'){
      const t=byId(c.topics,ch.tid);if(!t)return data;
      const old=byId(t.entries,ch.entry.id);
      if(old)Object.assign(old,clone(ch.entry));else t.entries.push(clone(ch.entry));
    } else if(ch.kind==='upsertProblem'){
      c.problems??=[];
      const old=byId(c.problems,ch.problem.id);
      if(old)Object.assign(old,clone(ch.problem));else c.problems.push(clone(ch.problem));
    } else if(ch.kind==='problemStatus'){
      const p=byId(c.problems,ch.id);if(p)p.status=ch.status;
    } else if(ch.kind==='delete'){
      if(ch.mode==='topic')c.topics=c.topics.filter(t=>t.id!==ch.id);
      else if(ch.mode==='problem')c.problems=(c.problems||[]).filter(p=>p.id!==ch.id);
      else {const t=byId(c.topics,ch.tid);if(t)t.entries=t.entries.filter(e=>e.id!==ch.id);}
    }
    return data;
  }
  function overlay(source,changes){let data=clone(source);for(const ch of changes)data=applyChange(data,ch);return data;}
  async function refresh(){
    if(location.protocol==='file:'){setStatus('Local preview. This website will load updates automatically once GitHub Pages is enabled.');return;}
    setStatus('Checking for updated study content…');
    try{
      const r=await fetch(`./content/lex-data.json?revision=${Date.now()}`,{cache:'no-store'});
      if(!r.ok)throw new Error(`Content endpoint returned ${r.status}`);
      const fresh=await r.json();if(!valid(fresh))throw Error('The published LEX content is not valid.');
      db=overlay(fresh,pending);save();render();connected=true;
      setStatus(pending.length?`Published content loaded; ${pending.length} local edit${pending.length===1?'':'s'} not yet published.`:'Up to date — new chapters load automatically when you open or refresh LEX.');
    }catch(error){connected=false;setStatus(`Offline preview: ${error.message}. Existing notes remain available.`);}
  }
  function fromBase64(b64){const bytes=Uint8Array.from(atob(b64.replace(/\s/g,'')),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes);}
  function toBase64(str){const bytes=new TextEncoder().encode(str);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
  async function publish(){
    if(!pending.length){toast('No unpublished local changes.');return;}
    if(location.protocol==='file:'){alert('Open the GitHub Pages version of LEX to publish edits. Local file previews cannot publish.');return;}
    if(!confirm(`Publish ${pending.length} local change(s) to the LEX GitHub repository? The study content will be readable on the public website. Do not publish personal or confidential client information.`))return;
    if(!token){
      const entry=prompt('GitHub fine-grained token for the LEX repository (Contents: Read and write). This token is used only for this browser session and never stored or added to exports. Do not send it through ChatGPT.');
      if(!entry)return;token=entry.trim();
    }
    const btn=document.getElementById('cloudPublish');if(btn)btn.disabled=true;
    setStatus('Publishing changes to GitHub…');
    const batch=pending.slice();
    try{
      const headers={'Accept':'application/vnd.github+json','Authorization':'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
      const get=await fetch(api+`?ref=${encodeURIComponent(cfg.branch)}&t=${Date.now()}`,{headers,cache:'no-store'});
      if(get.status===401 || get.status===403)throw Error('GitHub did not accept the token or the token lacks Contents permission.');
      if(!get.ok)throw Error(`Cannot read repository content (${get.status}). Check repository setup.`);
      const file=await get.json();
      if(!file.sha||!file.content)throw Error('GitHub did not return the current content and SHA.');
      const current=JSON.parse(fromBase64(file.content));if(!valid(current))throw Error('The GitHub copy is not valid LEX JSON.');
      const next=overlay(current,batch);
      if(!valid(next))throw Error('Changes would create an invalid LEX file; nothing was published.');
      const body={message:`LEX: publish ${batch.length} study edit${batch.length===1?'':'s'}`,content:toBase64(JSON.stringify(next,null,2)),sha:file.sha,branch:cfg.branch};
      const put=await fetch(api,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!put.ok){const e=await put.json().catch(()=>({}));throw Error(`GitHub rejected update (${put.status}): ${String(e.message||'unknown error')}`);}
      pending.splice(0,batch.length);persist();
      db=overlay(next,pending);save();render();connected=true;
      setStatus(pending.length?`Published ${batch.length} edits; ${pending.length} new edits remain local.`:'Edits published to GitHub. Refreshing LEX on another device will show them after GitHub Pages updates.');
      toast('Your edits were published successfully.');
    } catch(error){setStatus(`Publish failed: ${error.message} Your edits remain saved locally.`);alert(`LEX could not publish changes. ${error.message}\n\nNo local edits were lost.`);}
    finally{if(btn)btn.disabled=false;}
  }
  window.LEXCloud={record,refresh,publish,get pendingCount(){return pending.length;}};
  document.getElementById('cloudRefresh')?.addEventListener('click',refresh);
  document.getElementById('cloudPublish')?.addEventListener('click',publish);
  refresh();
})();
