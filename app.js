'use strict';
const STORAGE='lex_workspace_v1', THEME='lex_theme_v1';
const clone=v=>JSON.parse(JSON.stringify(v));
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=data=>!!(data&&data.version===1&&Array.isArray(data.courses)&&data.courses.every(c=>typeof c.id==='string'&&typeof c.name==='string'&&Array.isArray(c.topics)&&c.topics.every(t=>typeof t.id==='string'&&typeof t.title==='string'&&Array.isArray(t.entries)&&t.entries.every(e=>typeof e.id==='string'&&typeof e.title==='string'&&['rule','definition','case','example'].includes(e.type)))));
const seed={version:1,courses:[clone(LEX_CHAPTER_1),
  {id:'admin',name:'Administrative Law',color:'#469a91',topics:[{id:'admin-pending',title:'Course content — pending',description:'Administrative Law is next after Tax.',entries:[]}]},
  {id:'bankruptcy',name:'Bankruptcy & Creditors’ Rights',color:'#9a70c3',topics:[{id:'bank-pending',title:'Course content — pending',description:'Bankruptcy follows Tax and Administrative Law.',entries:[]}]}]};
function mergeById(base, incoming, key='id', preserveFields=[]){for(const x of incoming||[]){const old=base.find(y=>y[key]===x[key]);if(!old){base.push(clone(x));continue}const preserve={};for(const f of preserveFields)if(old[f]!==undefined)preserve[f]=old[f];Object.assign(old,clone(x),preserve)}}
function mergeData(target, incoming){for(const ic of incoming.courses){let c=target.courses.find(c=>c.id===ic.id);if(!c){target.courses.push(clone(ic));continue}if(ic.name)c.name=ic.name;if(ic.color)c.color=ic.color;
  for(const f of ['concept','syllabus','updates'])if(ic[f])c[f]=clone(ic[f]);
  if(ic.formulas){c.formulas??=[];mergeById(c.formulas,ic.formulas)}
  if(ic.problems){c.problems??=[];mergeById(c.problems,ic.problems,'id',['status','notes'])}
  for(const it of ic.topics){let t=c.topics.find(t=>t.id===it.id);if(!t){c.topics.push(clone(it));continue}
    for(const f of ['title','description','chapterGroup','pages'])if(it[f]!==undefined)t[f]=it[f];
    mergeById(t.entries,it.entries);
  }
}}
function load(){try{let stored=JSON.parse(localStorage.getItem(STORAGE));if(valid(stored)){if(!stored.courses.some(c=>c.id==='tax'&&c.topics.some(t=>t.id==='tax-ch1-overview'))){mergeData(stored,{version:1,courses:[LEX_CHAPTER_1]});localStorage.setItem(STORAGE,JSON.stringify(stored))}return stored}}catch(err){console.warn('Using starter data',err)}return clone(seed)}
let db=load(),courseId='tax',topicId='tax-ch1-overview',view='master',priorView='master',filter='all',query='',study=false,collapsed=new Set(['admin','bankruptcy']),openCards=new Set(),revealed=new Set(),editorMode='',editId=null,chapterScope='all',formulaScope='all',problemScope='all',problemStatus='all';
const getCourse=()=>db.courses.find(c=>c.id===courseId);
const getTopic=()=>getCourse()?.topics.find(t=>t.id===topicId);
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(db))}catch(err){toast('Storage full or blocked. Export a backup now.')}}
function toast(msg){$('notice').textContent=msg;$('notice').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('notice').hidden=true,4500)}
const allEntries=()=>db.courses.flatMap(c=>c.topics.flatMap(t=>t.entries.map(e=>({course:c,topic:t,entry:e}))));
function navCourse(cid){collapsed.delete(cid);for(const other of db.courses)if(other.id!==cid)collapsed.add(other.id);courseId=cid;const c=getCourse();topicId=c?.topics?.[0]?.id||'';view='master';query='';$('search').value='';filter='all';openCards.clear();revealed.clear();$('sidebar').classList.remove('open');render()}
function navigate(cid,tid,mode='read',eid){collapsed.delete(cid);courseId=cid;topicId=tid;view=mode;query='';$('search').value='';filter='all';openCards.clear();revealed.clear();if(eid)openCards.add(eid);$('sidebar').classList.remove('open');render();if(eid){requestAnimationFrame(()=>$('entry-'+eid)?.scrollIntoView({behavior:'smooth',block:'center'}))}}
const searchable=e=>[e.title,e.summary,e.details,e.facts,e.issue,e.holding,e.reasoning,e.exam,e.source].join(' ').toLowerCase();

function renderNav(){
 let out='';
 for(const c of db.courses){
  const folded=collapsed.has(c.id)&&!query;
  const chapters=new Map();
  for(const t of c.topics){let g=t.chapterGroup||t.id;if(!chapters.has(g))chapters.set(g,[]);chapters.get(g).push(t);}
  out+='<div class="course-group"><button class="course-row '+(courseId===c.id?'active-course':'')+'" data-course="'+safe(c.id)+'"><span class="course-dot"></span><span class="course-name">'+safe(c.name)+'</span><span class="chevron">'+(folded?'▸':'▾')+'</span></button>';
  if(!folded){
   out+='<div class="course-contents"><button class="topic-row map-nav '+(courseId===c.id&&view==='master'?'selected':'')+'" data-map="'+safe(c.id)+'">◇ Course overview</button>';
   for(const [g,topics] of chapters){
    const first=topics[0], active=courseId===c.id&&topics.some(t=>t.id===topicId),grouped=topics.length>1||!!first.chapterGroup;
    if(grouped){
      const label=first.title.startsWith('Chapter ')?first.title:first.title;
      out+='<div class="outline-chapter"><button class="chapter-link '+(active&&view==='chapter'?'selected':'')+'" data-chapter="'+safe(c.id)+'" data-first="'+safe(first.id)+'">▾ '+safe(label)+'</button>';
      out+='<button class="topic-row chapter-map" data-chapter="'+safe(c.id)+'" data-first="'+safe(first.id)+'">Quick chapter map</button>';
      for(const t of topics){if(t===first&&t.title.startsWith('Chapter '))continue;
       out+='<button class="topic-row subtopic-row '+(courseId===c.id&&topicId===t.id&&view==='read'?'selected':'')+'" data-cid="'+safe(c.id)+'" data-tid="'+safe(t.id)+'">'+safe(t.title)+'</button>';
      }
      out+='</div>';
    }else{
      out+='<button class="topic-row" data-cid="'+safe(c.id)+'" data-tid="'+safe(first.id)+'">'+safe(first.title)+'</button>';
    }
   }
   out+='<div class="nav-resources"><div class="nav-resource-heading">STUDY RESOURCES</div><button class="topic-row map-nav" data-calc="'+safe(c.id)+'">ƒ All calculations</button><button class="topic-row map-nav" data-problems="'+safe(c.id)+'">▤ Problem Bank'+(c.problems?.length?' ('+c.problems.length+')':'')+'</button></div></div>';
  }out+='</div>';
 }
 $('navigation').innerHTML=out;
}
function setView(mode){view=mode;filter='all';openCards.clear();revealed.clear();render()}
function setHead(){const c=getCourse(),t=getTopic();const heads={master:['Course Outline','Every important doctrine, rule, and definition in one place. Select an entry to read it.'],chapter:['Chapter Rule Map','Every key rule and definition at a glance. Click an item to open its detailed explanation.'],read:[t?.title||'Detailed Outline',t?.description||'Concise first. Expand when you need the reasoning.'],formulas:['Calculation Reference','Formulas, what the variables mean, and the book’s worked illustrations.'],problems:['Unsolved Problem Bank','Practice prompts collected by section. No solutions or hidden answer keys.'],search:['Search results','Find rules, cases, calculations and problems across all classes.']};let [title,subtitle]=heads[view]||heads.read;
$('breadcrumb').textContent=`Courses  /  ${c?.name||''}  /  ${title}`;$('courseLabel').textContent=c?.name?.toUpperCase()||'';$('topicTitle').textContent=title;$('topicSubtitle').textContent=subtitle;
$('topicActions').style.display=['read','chapter'].includes(view)?'flex':'none';$('readToolbar').hidden=view!=='read';
for(const b of $('viewTabs').querySelectorAll('button'))b.classList.toggle('active',b.dataset.view===view);
for(const b of $('filters').querySelectorAll('button'))b.classList.toggle('active',b.dataset.filter===filter);
$('studyMode').checked=study;
}
function render(){if(!getCourse()){courseId=db.courses[0].id}if(!getTopic()&&getCourse().topics.length)topicId=getCourse().topics[0].id;renderNav();setHead();switch(view){case'master':renderMaster();break;case'chapter':renderChapter();break;case'read':renderRead();break;case'formulas':renderFormulas();break;case'problems':renderProblems();break;case'search':renderSearch();break;}}


function renderMaster(){
 const c=getCourse(),m=c.concept;
 let out='<div class="minimal-overview">';
 out+='<div class="overview-lead"><h2>How this course fits together</h2><p>'+safe(m?.question||'Select a chapter to start reading the law.')+'</p></div>';
 if(m?.pipeline?.length){
  out+='<div class="concept-sequence"><strong>Core framework</strong><p>'+m.pipeline.map((step,i)=>'<span>'+(i+1)+'. '+safe(step)+'</span>').join('<b aria-hidden="true">→</b>')+'</p></div>';
 }
 const groupMap=new Map();
 c.topics.forEach(t=>{const g=t.chapterGroup||t.id;if(!groupMap.has(g))groupMap.set(g,[]);groupMap.get(g).push(t);});
 for(const [group,sections] of groupMap){
  const first=sections[0],chapterName=first.title.startsWith('Chapter ')?first.title:first.title;
  const count=sections.reduce((n,t)=>n+t.entries.length,0);
  out+='<section class="course-outline-group"><div class="course-outline-heading"><div><h3>'+safe(chapterName)+'</h3><small>'+safe(first.pages||'')+(count?' · '+count+' key entries':' · Not yet added')+'</small></div><button data-chapter-open="'+safe(first.id)+'">Chapter rule map →</button></div>';
  for(const t of sections){
   if(t===first&&t.title.startsWith('Chapter ')&&sections.length>1)continue;
   out+='<div class="overview-topic"><button class="overview-topic-title" data-go="'+safe(t.id)+'">'+safe(t.title)+' <span>→</span></button>';
   if(t.entries?.length){
    out+='<div class="overview-rule-rows">';
    for(const e of t.entries.filter(e=>e.type!=='example')){
      out+='<button class="overview-rule-row" data-open-entry="'+safe(e.id)+'" data-entry-topic="'+safe(t.id)+'"><span class="overview-rule-label">'+safe(e.title)+'</span><span class="overview-rule-summary">'+safe(e.summary)+'</span><span class="overview-rule-arrow">↗</span></button>';
    }
    out+='</div>';
   }else out+='<p class="pending-topic">Material pending</p>';
   out+='</div>';
  }
  out+='</section>';
 }
 if(c.updates?.length)out+='<section class="overview-block compact-updates"><h3>Important updates to the textbook</h3>'+renderUpdates(c.updates)+'</section>';
 $('cards').innerHTML=out+'</div>';
}
function renderUpdates(updates){return `<div class="updates-list">${updates.map(u=>`<details class="update-card"><summary><span class="alert-dot">!</span><strong>${safe(u.title)}</strong><span class="subtle">Show update</span></summary><div class="update-body"><p><b>2023 casebook:</b> ${safe(u.book)}</p><p><b>2026 update:</b> ${safe(u.current)}</p><a href="${safe(u.source)}" target="_blank" rel="noopener noreferrer">Official / supporting source ↗</a></div></details>`).join('')}</div>`}
function getChapterTopics(){let t=getTopic(),c=getCourse();if(!t)return [];return t.chapterGroup?c.topics.filter(q=>q.chapterGroup===t.chapterGroup):[t]}
function renderChapter(){let sections=getChapterTopics();let selected=chapterScope==='all'?sections:sections.filter(t=>t.id===chapterScope);if(!selected.length)selected=sections;
let out=`<div class="map-intro"><strong>Quick scan mode</strong><span>Rules and holdings only. Click any title for a complete explanation.</span></div><div class="selector-line"><label>Show section <select id="chapterSelect"><option value="all">Entire chapter</option>${sections.map(t=>`<option value="${safe(t.id)}" ${chapterScope===t.id?'selected':''}>${safe(t.title)}</option>`).join('')}</select></label></div>`;
for(const t of selected){let entries=t.entries.filter(e=>e.type!=='example');out+=`<section class="rule-group"><div class="rule-group-title"><div><span class="kicker">${safe(t.pages)} · ${entries.length} quick-reference entries</span><h2>${safe(t.title)}</h2></div><button class="button secondary" data-go="${safe(t.id)}">Read section</button></div><div class="rule-list">${entries.map(e=>`<button class="rule-line" data-go="${safe(t.id)}" data-eid="${safe(e.id)}"><span class="rule-type ${safe(e.type)}">${safe(e.type)}</span><span><b>${safe(e.title)}</b><small>${safe(e.summary)}</small>${e.alert?'<em>Updated / caution</em>':''}</span><span class="rule-jump">↗</span></button>`).join('')}</div></section>`}
$('cards').innerHTML=out}
function fieldsFor(e){return e.type==='case'?[['Facts and background',e.facts],['Issue',e.issue],['Holding',e.holding],['Reasoning',e.reasoning],['Why this matters',e.exam],['Details',e.details]].filter(x=>x[1]):[['Explanation, steps and qualifications',e.details]].filter(x=>x[1])}

function renderRead(){
 const t=getTopic(),c=getCourse();if(!t){$('cards').innerHTML='No section selected.';return;}
 const entries=(t.entries||[]).filter(e=>filter==='all'||e.type===filter);
 const formulas=(c.formulas||[]).filter(f=>f.topicId===t.id);
 const problems=(c.problems||[]).filter(p=>p.topicId===t.id);
 if(!entries.length&&!formulas.length){$('cards').innerHTML='<div class="empty"><h2>Section not available yet</h2><p>Material appears here as we add your readings.</p></div>';return;}
 let out='<section class="reading-intro"><span class="kicker">QUICK RULE MAP</span><h2>Everything important in this section</h2><p>Scan first. Jump to a rule only when you need the explanation.</p></section>';
 out+='<div class="inline-rule-map">';
 entries.filter(e=>e.type!=='example').forEach(e=>out+='<button data-jump-entry="'+safe(e.id)+'"><strong>'+safe(e.title)+'</strong><span>'+safe(e.summary)+'</span><b>↓</b></button>');
 out+='</div><div class="reading-section-title"><h2>Rules and explanations</h2><span>Expand for more detail</span></div>';
 for(const e of entries){
  const fields=fieldsFor(e),expanded=openCards.has(e.id),hidden=study&&!revealed.has(e.id);
  out+='<article class="entry" id="entry-'+safe(e.id)+'"><div class="entry-top"><div><span class="entry-kind '+safe(e.type)+'">'+safe(e.type)+'</span> '+(e.page?'<span class="page-cite">p. '+safe(e.page)+'</span>':'')+'<h2>'+safe(e.title)+'</h2></div><button class="entry-edit" data-edit="'+safe(e.id)+'">Edit</button></div>';
  if(hidden)out+='<div class="hidden-answer">Recall the rule before revealing.<br><button class="reveal-btn" data-reveal="'+safe(e.id)+'">Reveal answer</button></div>';
  else{
   out+='<p class="summary">'+safe(e.summary)+'</p>';
   if(e.alert)out+='<div class="inline-alert">'+safe(e.alert)+'</div>';
   if(fields.length){
    out+='<button class="details-toggle" data-toggle="'+safe(e.id)+'">'+(expanded?'− Hide explanation':'+ Explanation, elements and exceptions')+'</button>';
    if(expanded)out+='<div class="details-content">'+fields.map(v=>'<h3>'+safe(v[0])+'</h3><p>'+safe(v[1])+'</p>').join('')+'</div>';
   }
  }
  if(e.source)out+='<div class="source">Source: '+safe(e.source)+'</div>';
  out+='</article>';
 }
 if(formulas.length){
  out+='<div class="reading-section-title"><h2>Calculations for this section</h2><span>Same page as the law</span></div>';
  formulas.forEach(f=>out+='<article class="formula-card"><div class="formula-header"><span class="entry-kind rule">formula</span><span class="page-cite">'+safe(f.source)+'</span></div><h2>'+safe(f.title)+'</h2><div class="formula-expression">'+safe(f.formula)+'</div><p>'+safe(f.meaning)+'</p><details><summary>Show worked illustration</summary><p>'+safe(f.worked)+'</p></details></article>');
 }
 if(problems.length)out+='<div class="related-problems"><strong>'+problems.length+' unsolved problems associated with this section</strong><button data-open-problems="1">Open Problem Bank →</button></div>';
 $('cards').innerHTML=out;
}
function renderFormulas(){let c=getCourse(),arr=c.formulas||[];let choices=[...new Map(arr.map(f=>[f.topicId,c.topics.find(t=>t.id===f.topicId)?.title||f.topicId])).entries()];let display=formulaScope==='all'?arr:arr.filter(f=>f.topicId===formulaScope);
$('cards').innerHTML=`<div class="map-intro"><strong>${arr.length} formulas and numerical concepts</strong><span>Worked illustrations are explicitly labeled; practice questions live separately and remain unsolved.</span></div><div class="selector-line"><label>Section <select id="formulaSelect"><option value="all">All sections</option>${choices.map(([id,label])=>`<option value="${safe(id)}" ${formulaScope===id?'selected':''}>${safe(label)}</option>`).join('')}</select></label></div>${display.length?display.map(f=>`<article class="formula-card"><div class="formula-header"><span class="entry-kind rule">formula</span><span class="page-cite">${safe(f.source)}</span></div><h2>${safe(f.title)}</h2><div class="formula-expression">${safe(f.formula)}</div><p>${safe(f.meaning)}</p><details><summary>Show casebook worked illustration</summary><p>${safe(f.worked)}</p></details></article>`).join(''):'<div class="empty">No formulas added for this section yet.</div>'}`}
function renderProblems(){let c=getCourse(),arr=c.problems||[];let topics=new Map(arr.map(p=>[p.topicId,c.topics.find(t=>t.id===p.topicId)?.title||'Unknown']));let visible=arr.filter(p=>(problemScope==='all'||p.topicId===problemScope)&&(problemStatus==='all'||p.status===problemStatus));
$('cards').innerHTML=`<div class="problem-hero"><div><div class="kicker">PRACTICE, NOT ANSWER KEYS</div><h2>${arr.length} saved unsolved prompts</h2><p>Chapter 1's examples have been converted into prompts; none is claimed to be a separately numbered assigned problem. Work them when ready.</p></div><button class="button primary" id="addProblem">＋ Add problem</button></div><div class="selector-line"><label>Section <select id="problemSelect"><option value="all">All sections</option>${[...topics.entries()].map(([id,label])=>`<option value="${safe(id)}" ${problemScope===id?'selected':''}>${safe(label)}</option>`).join('')}</select></label><label>Status <select id="problemStatus"><option value="all">All statuses</option>${['Not attempted','Attempted','Completed'].map(s=>`<option value="${s}" ${problemStatus===s?'selected':''}>${s}</option>`).join('')}</select></label></div>${visible.length?visible.map((p,i)=>`<article class="problem-card"><div class="problem-header"><span class="entry-kind example">unsolved prompt</span><span class="page-cite">${safe(p.source)}</span></div><h2>${safe(p.title)}</h2><p class="prompt">${safe(p.prompt)}</p><div class="problem-actions"><label>Progress <select data-problem-status="${safe(p.id)}">${['Not attempted','Attempted','Completed'].map(s=>`<option value="${s}" ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></label><button class="button secondary" data-edit-problem="${safe(p.id)}">Edit / add notes</button></div>${p.notes?`<div class="user-notes"><b>Your notes:</b> ${safe(p.notes)}</div>`:''}</article>`).join(''):'<div class="empty">No problems match these filters.</div>'}`}
function renderSearch(){if(!query){view=priorView;render();return}let items=[];for(const row of allEntries())if(searchable(row.entry).includes(query))items.push({type:row.entry.type,title:row.entry.title,summary:row.entry.summary,subtitle:row.course.name+' · '+row.topic.title,cid:row.course.id,tid:row.topic.id,eid:row.entry.id});for(const c of db.courses)for(const p of c.problems||[])if([p.title,p.prompt,p.source].join(' ').toLowerCase().includes(query))items.push({type:'problem',title:p.title,summary:p.prompt,subtitle:c.name+' · Problem Bank',cid:c.id});for(const c of db.courses)for(const f of c.formulas||[])if([f.title,f.formula,f.meaning].join(' ').toLowerCase().includes(query))items.push({type:'formula',title:f.title,summary:f.formula,subtitle:c.name+' · Calculation Reference',cid:c.id});$('cards').innerHTML=`<div class="map-intro"><strong>${items.length} matches</strong><span>Results for “${safe(query)}” across all courses.</span></div>${items.slice(0,120).map(v=>`<button class="search-result" data-search-cid="${safe(v.cid)}" data-search-tid="${safe(v.tid||'')}" data-search-eid="${safe(v.eid||'')}" data-search-type="${safe(v.type)}"><span class="entry-kind ${safe(v.type)}">${safe(v.type)}</span><span><strong>${safe(v.title)}</strong><small>${safe(v.subtitle)}</small><p>${safe(v.summary)}</p></span></button>`).join('')}`}
function inputField(label,name,value='',multiline=false){return `<label class="field"><span>${safe(label)}</span>${multiline?`<textarea name="${safe(name)}">${safe(value)}</textarea>`:`<input name="${safe(name)}" value="${safe(value)}" />`}</label>`}
function openModal(mode,id=null){editorMode=mode;editId=id;const t=getTopic(),c=getCourse();const e=t?.entries.find(e=>e.id===id)||{};let p=(c.problems||[]).find(p=>p.id===id)||{};
$('modalTitle').textContent=mode==='topic'?(id?'Edit section':'Add section'):mode==='problem'?(id?'Edit problem':'New unsolved problem'):(id?'Edit study entry':'New study entry');$('deleteEntry').hidden=!id;
if(mode==='topic'){$('editorFields').innerHTML=`${!id?`<label class="field"><span>Course</span><select name="courseId">${db.courses.map(c=>`<option value="${safe(c.id)}" ${c.id===courseId?'selected':''}>${safe(c.name)}</option>`).join('')}</select></label>`:''}${inputField('Section title','title',id?t?.title:'')}${inputField('Section description','description',id?t?.description:'',true)}`}
else if(mode==='problem'){$('editorFields').innerHTML=`<label class="field"><span>Section</span><select name="topicId">${c.topics.map(t=>`<option value="${safe(t.id)}" ${p.topicId===t.id||!p.topicId&&t.id===topicId?'selected':''}>${safe(t.title)}</option>`).join('')}</select></label>${inputField('Problem title','title',p.title)}${inputField('Original prompt / question (no solution)','prompt',p.prompt,true)}${inputField('Source and page','source',p.source)}${inputField('Your working notes (optional)','notes',p.notes,true)}<p class="helper">No solutions are automatically generated or stored.</p>`}
else{$('editorFields').innerHTML=`<label class="field"><span>Entry type</span><select name="type" id="entryType">${['rule','definition','case','example'].map(x=>`<option value="${x}" ${e.type===x?'selected':''}>${x}</option>`).join('')}</select></label>${inputField('Title','title',e.title)}${inputField('One-line rule / takeaway','summary',e.summary,true)}<div id="dynamicFields"></div>${inputField('Source / page number','source',e.source)}`;
const dynamic=()=>{let type=$('entryType').value,prev={};document.querySelectorAll('#dynamicFields [name]').forEach(el=>prev[el.name]=el.value);$('dynamicFields').innerHTML=(type==='case'?[['Facts','facts'],['Issue','issue'],['Holding','holding'],['Reasoning','reasoning'],['Exam significance','exam'],['Other details','details']]:[['Expanded explanation / elements / exceptions','details']]).map(([title,key])=>inputField(title,key,prev[key]??e[key]??'',true)).join('')};$('entryType').onchange=dynamic;dynamic()}
$('modal').hidden=false;setTimeout(()=>$('editorFields input, #editorFields select')?.focus(),0)}
function closeModal(){$('modal').hidden=true;editorMode='';editId=null}
const uniqId=p=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
function handleSave(ev){ev.preventDefault();const form=new FormData($('editor')),v=k=>String(form.get(k)||'').trim();if(!v('title'))return toast('Title is required');if(editorMode==='topic'){if(editId){const t=getTopic();t.title=v('title');t.description=v('description')}else{const c=db.courses.find(c=>c.id===v('courseId'));if(!c)return;c.topics.push({id:uniqId('topic'),title:v('title'),description:v('description'),entries:[]});courseId=c.id;topicId=c.topics.at(-1).id;view='read'}}else if(editorMode==='problem'){let c=getCourse();c.problems??=[];let p=c.problems.find(p=>p.id===editId);let obj={id:p?.id||uniqId('problem'),title:v('title'),prompt:v('prompt'),source:v('source'),topicId:v('topicId'),notes:v('notes'),kind:p?.kind||'User-added problem',status:p?.status||'Not attempted',chapterGroup:p?.chapterGroup||getTopic()?.chapterGroup||''};if(p)Object.assign(p,obj);else c.problems.push(obj);view='problems'}else{let old=getTopic().entries.find(e=>e.id===editId);let obj={id:old?.id||uniqId('entry'),type:v('type'),title:v('title'),summary:v('summary'),details:v('details'),facts:v('facts'),issue:v('issue'),holding:v('holding'),reasoning:v('reasoning'),exam:v('exam'),source:v('source')};if(old)Object.assign(old,obj);else getTopic().entries.push(obj);view='read'}if(window.LEXCloud){
  if(editorMode==='topic'){window.LEXCloud.record({kind:'upsertTopic',cid:courseId,topic:clone(getTopic())});}
  else if(editorMode==='problem'){const p=getCourse().problems.find(p=>p.id===(editId||getCourse().problems.at(-1)?.id));if(p)window.LEXCloud.record({kind:'upsertProblem',cid:courseId,problem:clone(p)});}
  else {const e=editId?getTopic().entries.find(e=>e.id===editId):getTopic().entries.at(-1);if(e)window.LEXCloud.record({kind:'upsertEntry',cid:courseId,tid:topicId,entry:clone(e)});}
}save();closeModal();render();toast('Saved locally. Publish to GitHub when ready.')}
function handleDelete(){if(!editId||!confirm('Delete this item? You can recover it only from a backup.'))return;const c=getCourse();if(window.LEXCloud)window.LEXCloud.record({kind:'delete',mode:editorMode,cid:courseId,tid:topicId,id:editId});if(editorMode==='topic'){c.topics=c.topics.filter(t=>t.id!==editId);topicId=c.topics[0]?.id||''}else if(editorMode==='problem')c.problems=c.problems.filter(p=>p.id!==editId);else getTopic().entries=getTopic().entries.filter(e=>e.id!==editId);save();closeModal();render();toast('Deleted.')}
function exportData(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='LEX-full-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Full backup exported, including unsolved problems and progress.')}
async function importFile(ev){const file=ev.target.files?.[0];ev.target.value='';if(!file)return;try{if(file.size>8_000_000)throw Error('JSON must be smaller than 8 MB');const imported=JSON.parse(await file.text());if(!valid(imported))throw Error('Invalid LEX JSON format');const merge=confirm('IMPORT JSON\n\nOK = MERGE into your current work (recommended).\nCancel = option to REPLACE everything.');if(merge){mergeData(db,imported);if(window.LEXCloud)window.LEXCloud.record({kind:'merge',data:clone(imported)});}else if(confirm('REPLACE EVERYTHING? Export a backup first.')){db=clone(imported);if(window.LEXCloud)window.LEXCloud.record({kind:'replace',data:clone(imported)});}else return;save();render();toast('Import completed. Your course content has been updated.')}catch(e){alert('Import failed: '+e.message)}}
$('navigation').addEventListener('click',ev=>{const el=ev.target.closest('button');if(!el)return;if(el.dataset.map){navCourse(el.dataset.map);return}if(el.dataset.calc){courseId=el.dataset.calc;setView('formulas');return}if(el.dataset.problems){courseId=el.dataset.problems;setView('problems');return}if(el.dataset.chapter){courseId=el.dataset.chapter;topicId=el.dataset.first;chapterScope='all';setView('chapter');return}if(el.dataset.tid){navigate(el.dataset.cid,el.dataset.tid,'read');return}if(el.dataset.course){const cid=el.dataset.course;if(courseId===cid&&view==='master'){collapsed.has(cid)?collapsed.delete(cid):collapsed.add(cid);renderNav()}else navCourse(cid)}});
$('viewTabs').addEventListener('click',ev=>{let b=ev.target.closest('button[data-view]');if(b){query='';$('search').value='';setView(b.dataset.view)}});
$('cards').addEventListener('click',ev=>{const el=ev.target.closest('button');if(!el)return;if(el.dataset.chapterOpen){topicId=el.dataset.chapterOpen;chapterScope='all';setView('chapter');return}if(el.dataset.openEntry){navigate(courseId,el.dataset.entryTopic,'read',el.dataset.openEntry);return}if(el.dataset.go){navigate(courseId,el.dataset.go,'read',el.dataset.eid);return}if(el.dataset.jumpEntry){document.getElementById('entry-'+el.dataset.jumpEntry)?.scrollIntoView({behavior:'smooth',block:'start'});return}if(el.dataset.openProblems){problemScope=topicId;setView('problems');return}if(el.dataset.edit){openModal('entry',el.dataset.edit);return}if(el.dataset.toggle){openCards.has(el.dataset.toggle)?openCards.delete(el.dataset.toggle):openCards.add(el.dataset.toggle);renderRead();return}if(el.dataset.reveal){revealed.add(el.dataset.reveal);renderRead();return}if(el.dataset.editProblem){openModal('problem',el.dataset.editProblem);return}if(el.id==='addProblem'){openModal('problem');return}if(el.dataset.searchCid){let mode=el.dataset.searchType==='problem'?'problems':el.dataset.searchType==='formula'?'formulas':'read';if(mode==='read')navigate(el.dataset.searchCid,el.dataset.searchTid,mode,el.dataset.searchEid);else{courseId=el.dataset.searchCid;setView(mode)}return}});
$('cards').addEventListener('change',ev=>{let el=ev.target;if(el.id==='chapterSelect'){chapterScope=el.value;renderChapter()}else if(el.id==='formulaSelect'){formulaScope=el.value;renderFormulas()}else if(el.id==='problemSelect'){problemScope=el.value;renderProblems()}else if(el.id==='problemStatus'){problemStatus=el.value;renderProblems()}else if(el.dataset.problemStatus){let p=(getCourse().problems||[]).find(p=>p.id===el.dataset.problemStatus);if(p){p.status=el.value;if(window.LEXCloud)window.LEXCloud.record({kind:'problemStatus',cid:courseId,id:p.id,status:p.status});save();toast('Progress saved locally')}}});
$('filters').addEventListener('click',ev=>{let el=ev.target.closest('button[data-filter]');if(el){filter=el.dataset.filter;render()}});
$('search').addEventListener('input',ev=>{query=ev.target.value.toLowerCase().trim();if(query){if(view!=='search')priorView=view;view='search';render()}else{view=priorView;render()}});
$('studyMode').addEventListener('change',ev=>{study=ev.target.checked;revealed.clear();renderRead()});
$('addEntry').onclick=$('addEntryTop').onclick=()=>{if(view==='problems')openModal('problem');else{if(view==='master'||view==='formulas')view='read';openModal('entry')}};
$('addTopic').onclick=()=>openModal('topic');$('editTopic').onclick=()=>openModal('topic',topicId);
$('closeModal').onclick=$('cancelModal').onclick=closeModal;$('editor').onsubmit=handleSave;$('deleteEntry').onclick=handleDelete;
$('exportBtn').onclick=exportData;$('importBtn').onclick=()=>$('fileImport').click();$('fileImport').onchange=importFile;
$('mobileOpen').onclick=()=>$('sidebar').classList.add('open');$('mobileClose').onclick=()=>$('sidebar').classList.remove('open');
$('modal').addEventListener('click',ev=>{if(ev.target===$('modal'))closeModal()});
$('themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem(THEME,document.body.classList.contains('dark')?'dark':'light')};if(localStorage.getItem('lex_minimal_v1')!=='yes'){localStorage.setItem(THEME,'light');localStorage.setItem('lex_minimal_v1','yes')}if(localStorage.getItem(THEME)==='dark')document.body.classList.add('dark');
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeModal();if(ev.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)&&!ev.ctrlKey&&!ev.metaKey){ev.preventDefault();$('search').focus()}});
render();
