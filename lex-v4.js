'use strict';
const $=id=>document.getElementById(id);
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const copy=x=>JSON.parse(JSON.stringify(x));
const STORAGE='lex_workspace_v4',PENDING='lex_pending_changes_v2';
const repo='KevinDiaz01/lex-law-study',contentPath='content/lex-data.json';
let db={version:1,courses:[]},courseId='tax',sectionId=null,page='overview',search='',editTarget=null,pending=[],showChapter=new Set(),token=null;
function note(s){const el=$('notice');el.textContent=s;el.hidden=false;clearTimeout(note.timer);note.timer=setTimeout(()=>el.hidden=true,4200)}
function valid(d){return d?.version===1&&Array.isArray(d.courses)&&d.courses.every(c=>Array.isArray(c.topics))}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(db));localStorage.setItem(PENDING,JSON.stringify(pending))}catch{note('Storage is full. Export a backup.')} }
function applyChange(d,ch){
 if(ch.kind==='replace')return copy(ch.data);
 if(ch.kind==='merge'){for(const incoming of ch.data.courses||[]){let c=d.courses.find(c=>c.id===incoming.id);if(!c){d.courses.push(copy(incoming));continue}Object.assign(c,{name:incoming.name||c.name});for(const t of incoming.topics||[]){let old=c.topics.find(x=>x.id===t.id);if(!old){c.topics.push(copy(t));continue}Object.assign(old,{title:t.title,description:t.description});for(const e of t.entries||[]){let match=old.entries.find(x=>x.id===e.id);if(match)Object.assign(match,copy(e));else old.entries.push(copy(e))}}}return d}
 const c=d.courses.find(c=>c.id===ch.cid);if(!c)return d;
 if(ch.kind==='upsertTopic'){let t=c.topics.find(t=>t.id===ch.topic.id);if(t)Object.assign(t,copy(ch.topic));else c.topics.push(copy(ch.topic))}
 if(ch.kind==='upsertEntry'){let t=c.topics.find(t=>t.id===ch.tid);if(!t)return d;let e=t.entries.find(e=>e.id===ch.entry.id);if(e)Object.assign(e,copy(ch.entry));else t.entries.push(copy(ch.entry))}
 if(ch.kind==='upsertProblem'){c.problems??=[];let p=c.problems.find(p=>p.id===ch.problem.id);if(p)Object.assign(p,copy(ch.problem));else c.problems.push(copy(ch.problem))}
 if(ch.kind==='problemStatus'){let p=(c.problems||[]).find(p=>p.id===ch.id);if(p)p.status=ch.status}
 if(ch.kind==='delete'){if(ch.mode==='topic')c.topics=c.topics.filter(t=>t.id!==ch.id);else if(ch.mode==='problem')c.problems=c.problems.filter(p=>p.id!==ch.id);else{let t=c.topics.find(t=>t.id===ch.tid);if(t)t.entries=t.entries.filter(e=>e.id!==ch.id)}}
 return d;
}
function overlay(d,changes){let x=copy(d);for(const ch of changes)x=applyChange(x,ch);return x}
function record(ch){pending.push(copy(ch));save();updateSync()}
function updateSync(){const el=$('sync');if(el)el.textContent=pending.length?pending.length+' local changes not yet published':'Published content synced · edits stay in this browser until published'}
function current(){return db.courses.find(c=>c.id===courseId)||db.courses[0]}
function topic(){return current()?.topics.find(t=>t.id===sectionId)}
function groups(c){const map=new Map();for(const t of c.topics){let id=t.chapterGroup||t.id;if(!map.has(id))map.set(id,[]);map.get(id).push(t)}return [...map.values()]}
function groupFor(t){return groups(current()).find(g=>g.some(q=>q.id===t?.id))||[]}
function groupTitle(g){return g[0]?.title||'Chapter'}
function openPage(p,s=null){page=p;if(s!==null)sectionId=s;search='';$('search').value='';$('sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'instant'})}
function chooseCourse(id){courseId=id;sectionId=current()?.topics[0]?.id||null;showChapter=new Set(groups(current()).map(g=>g[0].chapterGroup||g[0].id));openPage('overview')}
function render(){
 const c=current();if(!c)return;
 $('courses').innerHTML=db.courses.map(x=>'<button class="course-tab '+(x.id===c.id?'active':'')+'" data-course="'+escapeHTML(x.id)+'">'+escapeHTML(x.name)+'</button>').join('');
 renderSidebar();
 const titles={overview:'Course Overview',chapter:groupTitle(groupFor(topic())),section:topic()?.title||'Section',formulas:'Calculation Reference',problems:'Problem Bank',search:'Search results'};
 $('crumb').textContent=c.name+' / '+(titles[page]||'');
 $('title').textContent=titles[page]||'';
 $('subtitle').textContent={overview:'All the important law, arranged by chapter and topic.',chapter:'Condensed rules for the entire chapter. Click any rule to jump to the explanation.',section:'Rules first. Expand for detailed reasoning and examples.',formulas:'The formulas used throughout this course.',problems:'Unsolved assigned and practice questions.',search:'Search your courses and legal materials.'}[page];
 $('editSection').hidden=page!=='section';$('newEntry').hidden=page==='overview'||page==='search';$('newEntry').textContent=page==='problems'?'+ Add problem':'+ Add rule';
 if(page==='overview')renderOverview();else if(page==='chapter')renderChapter();else if(page==='section')renderSection();else if(page==='formulas')renderFormulas();else if(page==='problems')renderProblems();else renderSearch();
 updateSync();
}
function renderSidebar(){
 const c=current();let html='<div class="side-caption">TABLE OF CONTENTS</div><button class="side-link '+(page==='overview'?'active':'')+'" data-page="overview">Course overview</button>';
 for(const g of groups(c)){
  const id=g[0].chapterGroup||g[0].id,opened=showChapter.has(id),active=groupFor(topic())===g;
  html+='<div class="chapter-group"><button class="side-chapter '+(active&&page==='chapter'?'active':'')+'" data-chapter="'+escapeHTML(g[0].id)+'"><span>'+escapeHTML(groupTitle(g))+'</span><span>'+(opened?'−':'+')+'</span></button>';
  if(opened){html+='<button class="side-link chapter-shortcut" data-quick="'+escapeHTML(g[0].id)+'">Chapter rule map</button>';
   for(const t of g){if(t===g[0]&&g.length>1&&t.title.startsWith('Chapter '))continue;
    html+='<button class="side-section '+(page==='section'&&sectionId===t.id?'active':'')+'" data-section="'+escapeHTML(t.id)+'">'+escapeHTML(t.title)+'</button>';}
  }html+='</div>';
 }
 html+='<div class="side-caption">REFERENCE</div><button class="side-link '+(page==='formulas'?'active':'')+'" data-page="formulas">All formulas & calculations</button><button class="side-link '+(page==='problems'?'active':'')+'" data-page="problems">Unsolved problems ('+(c.problems?.length||0)+')</button>';
 $('outline').innerHTML=html;
}
function kind(e){return e.type==='case'?'case':e.type==='rule'?'rule':e.type==='definition'?'definition':'example'}
function kindLabel(e){return e.type==='case'?'CASE':e.type==='rule'?'BLACK-LETTER RULE':e.type==='definition'?'DEFINITION':'EXAMPLE'}
function lawRow(e,tid){return '<button class="law-row law-'+kind(e)+'" data-entry="'+escapeHTML(e.id)+'" data-topic="'+escapeHTML(tid)+'"><span class="law-name"><span class="type-label">'+kindLabel(e)+'</span>'+escapeHTML(e.title)+'</span><span class="law-desc">'+escapeHTML(e.summary)+'</span><span class="law-arrow">↗</span></button>'}
function renderOverview(){
 const c=current();let html='';
 if(c.concept?.question)html+='<div class="course-context"><strong>What ties this course together?</strong><div>'+escapeHTML(c.concept.question)+'</div></div>';
 if(!c.topics.some(t=>t.entries.length)){html+='<div class="empty">Course content will be added after Tax is complete.</div>'}
 for(const g of groups(c)){
  html+='<section class="chapter-section"><h2><button data-quick="'+escapeHTML(g[0].id)+'">'+escapeHTML(groupTitle(g))+' →</button></h2>';
  for(const t of g){if(t===g[0]&&g.length>1&&t.title.startsWith('Chapter '))continue;
   html+='<div class="mini-title">'+escapeHTML(t.title)+'</div>';
   let entries=t.entries.filter(e=>e.type!=='example');
   if(entries.length)html+='<div class="law-table">'+entries.map(e=>lawRow(e,t.id)).join('')+'</div>';else html+='<div class="empty">Content pending</div>';
  }html+='</section>';
 }
 $('body').innerHTML=html;
}
function renderChapter(){
 const g=groupFor(topic());let html='<div class="course-context">Everything important from this chapter, condensed. Select a rule to see the full explanation.</div>';
 for(const t of g){
  html+='<section class="chapter-section"><h2><button data-section="'+escapeHTML(t.id)+'">'+escapeHTML(t.title)+' →</button></h2>';
  if(t.entries.length)html+='<div class="law-table">'+t.entries.filter(e=>e.type!=='example').map(e=>lawRow(e,t.id)).join('')+'</div>';
 }$('body').innerHTML=html;
}
function entryHtml(e){const details=e.type==='case'?[['Facts',e.facts],['Issue',e.issue],['Holding',e.holding],['Reasoning',e.reasoning],['Exam significance',e.exam],['Other',e.details]]:[['Full explanation / steps / exceptions',e.details]];
 return '<article class="entry entry-'+kind(e)+'" id="entry-'+escapeHTML(e.id)+'"><div class="entry-head"><div><div class="entry-kind">'+kindLabel(e)+(e.page?' · p. '+escapeHTML(e.page):'')+'</div><h3>'+escapeHTML(e.title)+'</h3></div><button class="edit-btn" data-edit="'+escapeHTML(e.id)+'">Edit</button></div><p>'+escapeHTML(e.summary)+'</p>'+
 (e.alert?'<div class="notice" style="margin-top:10px">'+escapeHTML(e.alert)+'</div>':'')+
 (details.some(v=>v[1])?'<details><summary>Explanation, elements, and examples</summary><div class="detail-body">'+details.filter(v=>v[1]).map(v=>'<b>'+escapeHTML(v[0])+'</b>'+escapeHTML(v[1])).join('\n\n')+'</div></details>':'')+
 (e.source?'<div class="entry-source">Source: '+escapeHTML(e.source)+'</div>':'')+'</article>';
}
function formulaHtml(f){return '<article class="formula"><strong>'+escapeHTML(f.title)+'</strong><div class="formula-code">'+escapeHTML(f.formula)+'</div><p>'+escapeHTML(f.meaning)+'</p><details><summary>Worked example</summary><p>'+escapeHTML(f.worked)+'</p></details><div class="entry-source">'+escapeHTML(f.source)+'</div></article>'}
function renderSection(){
 const t=topic();if(!t)return;
 const formulas=(current().formulas||[]).filter(f=>f.topicId===t.id),problems=(current().problems||[]).filter(p=>p.topicId===t.id);
 const classified=[
  {type:'rule',title:'Black-letter rules'},
  {type:'case',title:'Cases & holdings'},
  {type:'definition',title:'Key definitions'},
  {type:'example',title:'Examples & applications'}
 ];
 let html='<div class="section-jumps">';
 for(const x of classified){const count=t.entries.filter(e=>e.type===x.type).length;if(count)html+='<button data-scroll-group="'+x.type+'">'+x.title+' <b>'+count+'</b></button>';}
 html+='</div><div class="mini-title">QUICK REFERENCE</div>';
 for(const x of classified.filter(x=>x.type!=='example')){
  const entries=t.entries.filter(e=>e.type===x.type);if(!entries.length)continue;
  html+='<div class="quick-group"><h2>'+x.title+'</h2><div class="law-table">';
  html+=entries.map(e=>'<button class="law-row law-'+kind(e)+'" data-scroll="'+escapeHTML(e.id)+'"><span class="law-name"><span class="type-label">'+kindLabel(e)+'</span>'+escapeHTML(e.title)+'</span><span class="law-desc">'+escapeHTML(e.summary)+'</span><span class="law-arrow">↓</span></button>').join('');
  html+='</div></div>';
 }
 if(!t.entries.length)html+='<div class="empty">This section is awaiting its assigned readings.</div>';
 for(const x of classified){
  const entries=t.entries.filter(e=>e.type===x.type);if(!entries.length)continue;
  html+='<section class="detail-group" id="group-'+x.type+'"><div class="section-heading">'+x.title+'</div>'+entries.map(entryHtml).join('')+'</section>';
 }
 if(formulas.length)html+='<div class="section-heading" id="group-formulas">Calculations in this section</div>'+formulas.map(formulaHtml).join('');
 if(problems.length)html+='<div class="section-heading">Practice</div><button class="small-btn" data-page="problems" data-focus="'+escapeHTML(t.id)+'">View '+problems.length+' unsolved problems for this topic →</button>';
 $('body').innerHTML=html;
}
function renderFormulas(){const c=current(),a=c.formulas||[];let html='';for(const g of groups(c)){const list=a.filter(f=>g.some(t=>t.id===f.topicId));if(!list.length)continue;html+='<section class="chapter-section"><h2>'+escapeHTML(groupTitle(g))+'</h2>'+list.map(formulaHtml).join('')+'</section>'} $('body').innerHTML=html||'<div class="empty">No formulas have been added yet.</div>'}
let problemFilter='all';
function renderProblems(){const c=current(),all=c.problems||[];let html='<div class="course-context">All problems stay <strong>unsolved</strong>. Their original sources are tracked for later practice.</div>';
 html+='<label class="form-field" style="max-width:430px">Filter by section<select id="problemFilter"><option value="all">All sections</option>'+c.topics.map(t=>'<option value="'+escapeHTML(t.id)+'" '+(problemFilter===t.id?'selected':'')+'>'+escapeHTML(t.title)+'</option>').join('')+'</select></label>';
 for(const p of all.filter(p=>problemFilter==='all'||p.topicId===problemFilter)){
 html+='<article class="problem"><div class="problem-meta">'+escapeHTML(p.source)+' · '+escapeHTML(p.kind||'Unsolved problem')+'</div><h3>'+escapeHTML(p.title)+'</h3><p>'+escapeHTML(p.prompt)+'</p><div class="problem-actions"><select data-problem-status="'+escapeHTML(p.id)+'">'+['Not attempted','Attempted','Completed'].map(x=>'<option '+(p.status===x?'selected':'')+'>'+x+'</option>').join('')+'</select><button class="small-btn" data-edit-problem="'+escapeHTML(p.id)+'">Edit / notes</button></div>'+(p.notes?'<div class="problem-note">'+escapeHTML(p.notes)+'</div>':'')+'</article>';
 } $('body').innerHTML=html;
}
function renderSearch(){const q=search.toLowerCase().trim();if(!q){$('body').innerHTML='<p class="empty">Type a rule, statute, case, or topic in the search box.</p>';return}let matches=[];for(const c of db.courses){for(const t of c.topics){for(const e of t.entries){if([c.name,t.title,e.title,e.summary,e.details,e.holding].join(' ').toLowerCase().includes(q))matches.push({c,t,e})}}}
 $('body').innerHTML=matches.slice(0,150).map(x=>'<button class="search-hit" data-search-course="'+escapeHTML(x.c.id)+'" data-search-section="'+escapeHTML(x.t.id)+'" data-search-entry="'+escapeHTML(x.e.id)+'"><strong>'+escapeHTML(x.e.title)+'</strong><span>'+escapeHTML(x.c.name)+' / '+escapeHTML(x.t.title)+' — '+escapeHTML(x.e.summary)+'</span></button>').join('')||'<p class="empty">No matching rules found.</p>';
}
function jump(eid){requestAnimationFrame(()=>document.getElementById('entry-'+eid)?.scrollIntoView({behavior:'smooth',block:'start'}))}
function unique(){return 'lex-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function field(name,key,value,large=false){return '<label class="form-field">'+escapeHTML(name)+(large?'<textarea name="'+key+'">'+escapeHTML(value||'')+'</textarea>':'<input name="'+key+'" value="'+escapeHTML(value||'')+'">')+'</label>'}
function editor(mode,id=null){
 editTarget={mode,id};const c=current(),t=topic();let obj=null,body='';
 if(mode==='entry'){obj=t?.entries.find(e=>e.id===id)||{};body='<label class="form-field">Type<select name="type">'+['rule','definition','case','example'].map(v=>'<option value="'+v+'" '+(obj.type===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+field('Title','title',obj.title)+field('Black-letter rule / summary','summary',obj.summary,true)+field('Full explanation','details',obj.details,true)+field('Facts (cases)','facts',obj.facts,true)+field('Issue','issue',obj.issue,true)+field('Holding','holding',obj.holding,true)+field('Reasoning','reasoning',obj.reasoning,true)+field('Exam significance','exam',obj.exam,true)+field('Source','source',obj.source)}
 else if(mode==='problem'){obj=c.problems?.find(p=>p.id===id)||{};body=field('Title','title',obj.title)+field('Problem text (unsolved)','prompt',obj.prompt,true)+field('Source','source',obj.source)+field('Your notes','notes',obj.notes,true)+'<label class="form-field">Section<select name="topicId">'+c.topics.map(t=>'<option value="'+escapeHTML(t.id)+'" '+(obj.topicId===t.id?'selected':'')+'>'+escapeHTML(t.title)+'</option>').join('')+'</select></label>'}
 else if(mode==='topic'){obj=t||{};body=field('Section title','title',obj.title)+field('Description','description',obj.description,true)}
 $('modalTitle').textContent=(id?'Edit ':'Add ')+(mode==='entry'?'rule / case':mode==='problem'?'problem':'section');
 $('editorFields').innerHTML=body;$('removeItem').hidden=!id;
 $('modalOverlay').hidden=false;
}
function closeEditor(){$('modalOverlay').hidden=true;editTarget=null}
function submitEdit(ev){ev.preventDefault();if(!editTarget)return;let form=new FormData($('editor')),v=n=>String(form.get(n)||'').trim();let {mode,id}=editTarget,c=current(),t=topic();
 if(!v('title'))return note('A title is required.');
 if(mode==='entry'){let e=t.entries.find(e=>e.id===id);const fields=['title','summary','details','facts','issue','holding','reasoning','exam','source'];let change={id:e?.id||unique(),type:v('type')};for(const f of fields)change[f]=v(f);if(e)Object.assign(e,change);else t.entries.push(change);record({kind:'upsertEntry',cid:c.id,tid:t.id,entry:change});}
 else if(mode==='problem'){c.problems??=[];let p=c.problems.find(p=>p.id===id);const change={id:p?.id||unique(),title:v('title'),prompt:v('prompt'),source:v('source'),notes:v('notes'),topicId:v('topicId'),status:p?.status||'Not attempted',kind:p?.kind||'User-added problem'};if(p)Object.assign(p,change);else c.problems.push(change);record({kind:'upsertProblem',cid:c.id,problem:change})}
 else if(mode==='topic'){t.title=v('title');t.description=v('description');record({kind:'upsertTopic',cid:c.id,topic:copy(t)})}
 closeEditor();render();note('Saved in this browser. Publish changes to sync to GitHub.')}
function deleteItem(){if(!editTarget?.id||!confirm('Delete this item?'))return;const {mode,id}=editTarget,c=current(),t=topic();if(mode==='entry')t.entries=t.entries.filter(x=>x.id!==id);else if(mode==='problem')c.problems=c.problems.filter(x=>x.id!==id);else c.topics=c.topics.filter(x=>x.id!==id);record({kind:'delete',mode,cid:c.id,tid:t?.id,id});closeEditor();render();}
async function publish(){
 if(!pending.length)return note('No local changes to publish.');
 if(!confirm('Publish your local edits to the public GitHub Pages website? Do not publish private client information.'))return;
 if(!token){token=prompt('GitHub fine-grained token scoped to this repository with Contents: Read and write. It will remain only in browser memory. Do not share it in chat.');if(!token)return;}
 const api='https://api.github.com/repos/'+repo+'/contents/'+contentPath,headers={Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'};
 try{const r=await fetch(api+'?ref=main&t='+Date.now(),{headers,cache:'no-store'});if(!r.ok)throw Error('Cannot read GitHub content: '+r.status);const x=await r.json(),bin=atob(x.content.replace(/\s/g,'')),bytes=Uint8Array.from(bin,letter=>letter.charCodeAt(0)),base=JSON.parse(new TextDecoder().decode(bytes));const batch=pending.slice(),next=overlay(base,batch);const raw=JSON.stringify(next,null,2),encoded=new TextEncoder().encode(raw);let str='';for(let i=0;i<encoded.length;i+=8192)str+=String.fromCharCode(...encoded.subarray(i,i+8192));const put=await fetch(api,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message:'LEX: publish local study edits',content:btoa(str),sha:x.sha,branch:'main'})});if(!put.ok)throw Error('GitHub rejected update: '+put.status);pending.splice(0,batch.length);db=overlay(next,pending);save();render();note('Published edits to GitHub successfully.')}
 catch(err){note(err.message+' · Your local changes are safe.')}
}
function exportBackup(){let b=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='LEX-study-backup.json';a.click();URL.revokeObjectURL(url)}
function loadBackup(e){const f=e.target.files?.[0];e.target.value='';if(!f)return;f.text().then(s=>{let data=JSON.parse(s);if(!valid(data))throw Error('Invalid backup');if(!confirm('Merge this backup with your current content?'))return;pending.push({kind:'merge',data});db=overlay(db,[{kind:'merge',data}]);save();render();note('Backup merged; publish when ready.')}).catch(err=>note('Import failed: '+err.message))}
$('courses').onclick=e=>{let x=e.target.closest('[data-course]');if(x)chooseCourse(x.dataset.course)};
$('outline').onclick=e=>{let x=e.target.closest('button');if(!x)return;if(x.dataset.page)openPage(x.dataset.page);else if(x.dataset.quick){sectionId=x.dataset.quick;openPage('chapter')}else if(x.dataset.chapter){const t=current().topics.find(t=>t.id===x.dataset.chapter);const id=t.chapterGroup||t.id;if(showChapter.has(id))showChapter.delete(id);else showChapter.add(id);sectionId=t.id;render()}else if(x.dataset.section)openPage('section',x.dataset.section)};
$('body').onclick=e=>{let x=e.target.closest('button');if(!x)return;if(x.dataset.entry){openPage('section',x.dataset.topic);jump(x.dataset.entry)}else if(x.dataset.scroll)jump(x.dataset.scroll);else if(x.dataset.scrollGroup)document.getElementById('group-'+x.dataset.scrollGroup)?.scrollIntoView({behavior:'smooth',block:'start'});else if(x.dataset.section)openPage('section',x.dataset.section);else if(x.dataset.quick)openPage('chapter',x.dataset.quick);else if(x.dataset.edit)editor('entry',x.dataset.edit);else if(x.dataset.editProblem)editor('problem',x.dataset.editProblem);else if(x.dataset.page){problemFilter=x.dataset.focus||'all';openPage(x.dataset.page)}else if(x.dataset.searchEntry){courseId=x.dataset.searchCourse;sectionId=x.dataset.searchSection;openPage('section');jump(x.dataset.searchEntry)}};
$('body').onchange=e=>{const x=e.target;if(x.id==='problemFilter'){problemFilter=x.value;renderProblems()}else if(x.dataset.problemStatus){let p=current().problems.find(p=>p.id===x.dataset.problemStatus);if(p){p.status=x.value;record({kind:'problemStatus',cid:courseId,id:p.id,status:p.status})}}};
$('search').oninput=e=>{search=e.target.value;page='search';render()};
$('editSection').onclick=()=>editor('topic',sectionId);
$('newEntry').onclick=()=>editor(page==='problems'?'problem':'entry');
$('editor').onsubmit=submitEdit;
$('closeModal').onclick=$('cancelEdit').onclick=closeEditor;
$('removeItem').onclick=deleteItem;
$('modalOverlay').onclick=e=>{if(e.target===$('modalOverlay'))closeEditor()};
$('publish').onclick=publish;$('backup').onclick=exportBackup;$('import').onclick=()=>$('importFile').click();$('importFile').onchange=loadBackup;
$('mobileMenu').onclick=()=>$('sidebar').classList.toggle('open');
$('newSection').onclick=()=>{const c=current(),g=groups(c)[0],t={id:unique(),title:'New section',description:'',chapterGroup:g?.[0]?.chapterGroup||undefined,entries:[]};c.topics.push(t);sectionId=t.id;record({kind:'upsertTopic',cid:c.id,topic:t});openPage('section');editor('topic',t.id)};
document.onkeydown=e=>{if(e.key==='Escape')closeEditor();if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus()}};
async function boot(){
 try{const l=JSON.parse(localStorage.getItem(PENDING)||'[]');if(Array.isArray(l))pending=l}catch{}
 try{
  const r=await fetch('./'+contentPath+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const raw=await r.json();if(!valid(raw))throw Error('Invalid published data');db=overlay(raw,pending);
 }catch(e){const stored=JSON.parse(localStorage.getItem(STORAGE)||'null');if(valid(stored))db=stored;else{$('notice').hidden=false;$('notice').textContent='Unable to load published course data: '+e.message;return}}
 sectionId=current()?.topics[0]?.id||null;showChapter=new Set(groups(current()).map(g=>g[0].chapterGroup||g[0].id));save();render();
}
boot();
