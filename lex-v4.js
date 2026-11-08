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
function groupTitle(g){if(g[0]?.chapterGroup==='tax-ch2')return 'Chapter 2 — The Why and the What of Taxing Income';if(g[0]?.chapterGroup==='tax-ch3')return 'Chapter 3 — The Private Sphere and the Public Sphere';return g[0]?.title||'Chapter'}
function openPage(p,s=null){page=p;if(s!==null)sectionId=s;search='';$('search').value='';$('sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'instant'})}
function chooseCourse(id){courseId=id;sectionId=current()?.topics[0]?.id||null;showChapter=new Set();openPage('overview')}
function render(){
 const c=current();if(!c)return;
 $('courses').innerHTML=db.courses.map(x=>'<button class="course-tab '+(x.id===c.id?'active':'')+'" data-course="'+escapeHTML(x.id)+'">'+escapeHTML(x.name)+'</button>').join('');
 renderSidebar();
 const titles={overview:'Exam Outline',chapter:groupTitle(groupFor(topic())),section:topic()?.title||'Section',formulas:'Calculation Reference',problems:'Problem Bank',search:'Search results'};
 $('crumb').textContent=c.name+' / '+(titles[page]||'');
 $('title').textContent=titles[page]||'';
 $('subtitle').textContent={overview:'Use the roadmap, expand a section, and read only what you need.',chapter:'Condensed rules for the entire chapter. Click any rule to jump to the explanation.',section:'Rules first. Expand for detailed reasoning and examples.',formulas:'The formulas used throughout this course.',problems:'Unsolved assigned and practice questions.',search:'Search your courses and legal materials.'}[page];
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
   for(const t of g){const isIntro=t===g[0]&&g.length>1&&t.title.startsWith('Chapter ');
    html+='<button class="side-section '+(page==='section'&&sectionId===t.id?'active':'')+'" data-section="'+escapeHTML(t.id)+'">'+escapeHTML(isIntro?'Foundations — Key Terms':t.title)+'</button>';}
  }html+='</div>';
 }
 html+='<div class="side-caption">REFERENCE</div><button class="side-link '+(page==='formulas'?'active':'')+'" data-page="formulas">All formulas & calculations</button><button class="side-link '+(page==='problems'?'active':'')+'" data-page="problems">Unsolved problems ('+(c.problems?.length||0)+')</button>';
 $('outline').innerHTML=html;
}
const typeLabels={rule:'BLACK-LETTER RULE',case:'CASE',definition:'DEFINITION',concept:'CONCEPT',policy:'POLICY',context:'CONTEXT',framework:'FRAMEWORK',formula:'FORMULA',history:'HISTORY',example:'EXAMPLE'};
function kind(e){return typeLabels[e.type]?e.type:'context'}
function kindLabel(e){return typeLabels[kind(e)]}
function warningChip(e){const w=e.legalWarning;if(!w)return '';return '<span class="legal-warning-chip warning-'+escapeHTML(w.status)+'" title="Historical legal authority: see explanation">⚠ '+escapeHTML(w.label)+'</span>'}
function warningDetail(e){const w=e.legalWarning;if(!w)return '';const u=String(w.url||'');const link=/^https:\/\//.test(u)?'<a href="'+escapeHTML(u)+'" target="_blank" rel="noopener noreferrer">Read authority ↗</a>':'';return '<details class="legal-warning"><summary>⚠ '+escapeHTML(w.label)+' — Why is this flagged?</summary><div class="legal-warning-body"><p>'+escapeHTML(w.reason)+'</p><small>Authority: '+escapeHTML(w.authority)+'</small> '+link+'</div></details>'}
function lawRow(e,tid){return '<button class="law-row" data-entry="'+escapeHTML(e.id)+'" data-topic="'+escapeHTML(tid)+'"><span class="law-name"><span class="type-label label-'+kind(e)+'">'+kindLabel(e)+'</span><span class="law-title">'+escapeHTML(e.title)+'</span>'+warningChip(e)+'</span><span class="law-desc">'+escapeHTML(e.summary)+'</span><span class="law-arrow">↗</span></button>'}
function isExamEssential(e){return ['rule','definition','case','formula'].includes(e.type)}
function isBackground(e){return ['policy','context','history'].includes(e.type)}
function isLearningConcept(e){return ['concept','framework'].includes(e.type)}
function backgroundRows(entries,tid){if(!entries.length)return '';return '<details class="background-fold"><summary>📖 Background, context & historical development <span>'+entries.length+' notes</span></summary><div class="background-fold-body">'+entries.map(e=>lawRow(e,tid)).join('')+'</div></details>'}
function sourceTag(e){return e.sourceRole?'<span class="source-role">'+escapeHTML(e.sourceRole)+'</span>':''}


function explanationPair(e){
 let html='';
 if(e.laymanExplanation){
  html+='<div class="layman-explanation"><strong>IN PLAIN ENGLISH</strong><p>'+escapeHTML(e.laymanExplanation)+'</p></div>';
 }
 const legal=e.legalExplanation||(e.type==='case'&&e.assignedOpinion?'':e.details);
 if(legal){
  html+='<details class="lawyer-explanation"><summary>Legal explanation <span>· precise doctrine and qualifications</span></summary><div class="lawyer-explanation-body"><p>'+escapeHTML(legal)+'</p></div></details>';
 }
 return html;
}
function outlineEntry(e){
 const assigned=e.type==='case'&&e.assignedOpinion;
 const type=assigned?'ASSIGNED CASE':kindLabel(e);
 let more=explanationPair(e);
 if(assigned){
  more+='<details class="lawyer-explanation case-full-brief"><summary>Full assigned case brief <span>· facts, issue, holding, reasoning</span></summary><div class="lawyer-explanation-body">';
  more+=detailPart('Rule / holding',e.rule||e.holding);
  more+=detailPart('Facts',e.facts)+detailPart('Issue',e.issue)+detailPart('Holding',e.holding)+detailPart('Reasoning',e.reasoning)+detailPart('Exam significance',e.exam);
  more+='</div></details>';
 }else{
  more+=detailPart('Elements / test',e.elements)+detailPart('Exceptions',e.exceptions);
 }
 if(e.examApplication)more+='<div class="exam-application"><strong>HOW TO APPLY IT</strong><p>'+escapeHTML(e.examApplication)+'</p></div>';
 if(e.examTrap)more+='<div class="exam-trap"><strong>EXAM TRAP</strong><p>'+escapeHTML(e.examTrap)+'</p></div>';
 more+=warningDetail(e);
 if(e.alert)more+='<div class="notice">'+escapeHTML(e.alert)+'</div>';
 if(e.source)more+='<p class="entry-source">Source: '+escapeHTML(e.source)+'</p>';
 return '<details class="outline-entry" id="entry-'+escapeHTML(e.id)+'"><summary><span class="outline-entry-text"><span class="type-label label-'+kind(e)+'">'+type+'</span><strong>'+escapeHTML(e.title)+'</strong>'+warningChip(e)+'<small>'+escapeHTML(e.summary)+'</small></span><span class="outline-chevron">⌄</span></summary><div class="outline-entry-body"><button class="edit-btn outline-edit" data-edit="'+escapeHTML(e.id)+'">✎ Edit entry</button>'+more+'</div></details>';
}
function outlineFormula(f){
 return '<details class="outline-entry formula-outline"><summary><span class="outline-entry-text"><span class="type-label label-formula">FORMULA</span><strong>'+escapeHTML(f.title)+'</strong><small>'+escapeHTML(f.formula)+'</small></span><span class="outline-chevron">⌄</span></summary><div class="outline-entry-body"><div class="formula-code">'+escapeHTML(f.formula)+'</div><p>'+escapeHTML(f.meaning)+'</p><details class="study-explanation"><summary>Worked illustration</summary><p>'+escapeHTML(f.worked)+'</p></details><p class="entry-source">'+escapeHTML(f.source)+'</p></div></details>';
}
function outlineSection(t,c,isFoundation){
 const list=t.entries||[],required=list.filter(isExamEssential),concepts=list.filter(isLearningConcept),background=list.filter(isBackground),examples=list.filter(e=>e.type==='example');
 const formulas=(c.formulas||[]).filter(f=>f.topicId===t.id);
 const related=(c.problems||[]).filter(p=>p.topicId===t.id);
 const updates=(c.updates||[]).filter(u=>u.topicId===t.id);
 let html='<details class="outline-section" id="outline-section-'+escapeHTML(t.id)+'"><summary><span class="outline-section-title">'+escapeHTML(isFoundation?'Foundations — Key Terms':t.title)+'</span><span class="outline-meta">'+required.length+' essential items</span><span class="outline-chevron">⌄</span></summary><div class="outline-section-body">';
 if(required.length)html+=required.map(outlineEntry).join('');
 if(formulas.length)html+='<div class="outline-subheading">Calculations</div>'+formulas.map(outlineFormula).join('');
 if(concepts.length)html+='<details class="outline-optional"><summary>Additional concepts <span>'+concepts.length+'</span></summary><div>'+concepts.map(outlineEntry).join('')+'</div></details>';
 if(examples.length)html+='<details class="outline-optional"><summary>Examples <span>'+examples.length+'</span></summary><div>'+examples.map(outlineEntry).join('')+'</div></details>';
 if(background.length)html+='<details class="outline-optional"><summary>Background, policy & history <span>'+background.length+'</span></summary><div>'+background.map(outlineEntry).join('')+'</div></details>';
 if(updates.length){html+='<details class="outline-optional outline-updates"><summary>⚠ Current-law notes <span>'+updates.length+'</span></summary><div>';
  for(const u of updates)html+='<div class="outline-update"><strong>'+escapeHTML(u.title)+'</strong><p>Textbook: '+escapeHTML(u.book)+'</p><p>Updated: '+escapeHTML(u.current)+'</p>'+(String(u.source||'').startsWith('https://')?'<a href="'+escapeHTML(u.source)+'" target="_blank" rel="noopener noreferrer">Source ↗</a>':'')+'</div>';
  html+='</div></details>';
 }
 if(related.length)html+='<button class="outline-problems" data-page="problems" data-focus="'+escapeHTML(t.id)+'">▤ '+related.length+' unsolved practice questions →</button>';
 if(!list.length&&!formulas.length)html+='<p class="outline-empty">Content not yet added for this topic.</p>';
 return html+'</div></details>';
}
function renderOverview(){
 const c=current(),chapters=groups(c);
 let html='<div class="outline-top"><div class="outline-top-label">STUDY ROADMAP</div><div class="roadmap-track">';
 for(let i=0;i<chapters.length;i++){
   const ch=chapters[i],id=ch[0].chapterGroup||ch[0].id;
   const n=ch.reduce((acc,t)=>acc+(t.entries||[]).length,0);
   html+='<button class="roadmap-stop" data-roadmap="'+escapeHTML(id)+'"><span class="roadmap-number">'+(i+1)+'</span><span><strong>'+escapeHTML(groupTitle(ch))+'</strong><small>'+(n?n+' outline items':'Not added yet')+'</small></span><span class="roadmap-arrow">→</span></button>';
 }
 html+='</div><p class="roadmap-hint">Select a chapter in the roadmap, then expand only the topic or rule you want to study.</p></div>';
 html+='<div class="outline-header"><h2>Course outline</h2><div class="outline-controls"><button data-outline-action="expand">Expand chapters</button><button data-outline-action="collapse">Collapse all</button></div></div>';
 for(let i=0;i<chapters.length;i++){
  const ch=chapters[i],id=ch[0].chapterGroup||ch[0].id,n=ch.reduce((acc,t)=>acc+(t.entries||[]).length,0);
  html+='<details class="outline-chapter" id="outline-chapter-'+escapeHTML(id)+'" '+(i===0?'open':'')+'><summary><span class="chapter-index">'+String(i+1).padStart(2,'0')+'</span><span class="chapter-heading"><strong>'+escapeHTML(groupTitle(ch))+'</strong><small>'+n+' items · '+ch.length+' sections</small></span><span class="outline-chevron">⌄</span></summary><div class="outline-chapter-body">';
  for(const t of ch)html+=outlineSection(t,c,t===ch[0]&&ch.length>1&&t.title.startsWith('Chapter '));
  html+='</div></details>';
 }
 $('body').innerHTML=html;
}
function renderChapter(){
 const g=groupFor(topic());let html='<div class="exam-home-intro"><strong>CHAPTER EXAM MAP</strong><p>Only exam-essential law is displayed by default. Additional explanation and historical context remain available below each section.</p></div>';
 for(const t of g){
  html+='<section class="chapter-section"><h2><button data-section="'+escapeHTML(t.id)+'">'+escapeHTML(t.title)+' →</button></h2>';
  const main=t.entries.filter(isExamEssential),learning=t.entries.filter(isLearningConcept),background=t.entries.filter(isBackground);
  if(main.length)html+='<div class="law-table">'+main.map(e=>lawRow(e,t.id)).join('')+'</div>';
  if(learning.length)html+='<details class="concept-fold"><summary>Helpful concepts <span>'+learning.length+'</span></summary>'+learning.map(e=>lawRow(e,t.id)).join('')+'</details>';
  html+=backgroundRows(background,t.id);
  if(!t.entries.length)html+='<div class="empty">Not yet covered in supplied material.</div>';
  html+='</section>';
 }$('body').innerHTML=html;
}
function detailPart(label,value){return value?'<section class="exam-detail-part"><h4>'+escapeHTML(label)+'</h4><p>'+escapeHTML(value)+'</p></section>':''}
function entryHtml(e){
 const caseOpinion=e.type==='case'&&e.assignedOpinion;
 let details='';
 if(caseOpinion){
   details=detailPart('Facts',e.facts)+detailPart('Legal issue',e.issue)+detailPart('Holding',e.holding)+detailPart('Court reasoning',e.reasoning)+detailPart('Additional context',e.details);
 }else details=detailPart('Explanation / steps / qualifications',e.details);
 const extra=e.type==='rule'||e.type==='case'||e.type==='definition'||e.type==='formula';
 let body='<article class="entry exam-entry '+(isBackground(e)?'entry-background':'')+'" id="entry-'+escapeHTML(e.id)+'"><div class="entry-head"><div><span class="type-label label-'+kind(e)+'">'+(caseOpinion?'ASSIGNED CASE':kindLabel(e))+'</span><span class="entry-page">'+(e.page?'p. '+escapeHTML(e.page):'')+'</span><h3>'+escapeHTML(e.title)+' '+warningChip(e)+'</h3></div><button class="edit-btn" data-edit="'+escapeHTML(e.id)+'">Edit</button></div>';
 body+='<p class="exam-summary">'+escapeHTML(e.summary)+'</p>';
 body+=explanationPair(e);
 if(caseOpinion&&e.rule)body+='<div class="exam-rule"><strong>RULE FROM THE CASE</strong><p>'+escapeHTML(e.rule)+'</p></div>';
 if(e.elements)body+=detailPart('Elements / test',e.elements);
 if(e.exceptions)body+=detailPart('Exceptions / qualifications',e.exceptions);
 if(e.examApplication)body+='<div class="exam-application"><strong>EXAM APPLICATION</strong><p>'+escapeHTML(e.examApplication)+'</p></div>';
 if(caseOpinion&&e.exam)body+='<div class="exam-application"><strong>EXAM SIGNIFICANCE</strong><p>'+escapeHTML(e.exam)+'</p></div>';
 if(e.examTrap)body+='<div class="exam-trap"><strong>WATCH OUT</strong><p>'+escapeHTML(e.examTrap)+'</p></div>';
 body+=warningDetail(e);
 if(e.alert)body+='<div class="notice">'+escapeHTML(e.alert)+'</div>';
 if(caseOpinion&&details)body+='<details class="lawyer-explanation case-full-brief"><summary>Full assigned case brief</summary><div class="lawyer-explanation-body">'+details+'</div></details>';
 if(e.source)body+='<div class="entry-source">Source: '+escapeHTML(e.source)+'</div>';
 if(e.sourceRole)body+=sourceTag(e);
 return body+'</article>';
}
function formulaHtml(f){return '<article class="formula"><strong>'+escapeHTML(f.title)+'</strong><div class="formula-code">'+escapeHTML(f.formula)+'</div><p>'+escapeHTML(f.meaning)+'</p><details><summary>Worked example</summary><p>'+escapeHTML(f.worked)+'</p></details><div class="entry-source">'+escapeHTML(f.source)+'</div></article>'}
function renderSection(){
 const t=topic();if(!t)return;
 const formulas=(current().formulas||[]).filter(f=>f.topicId===t.id),problems=(current().problems||[]).filter(p=>p.topicId===t.id),updates=(current().updates||[]).filter(u=>u.topicId===t.id);
 const law=t.entries.filter(e=>e.type==='rule');
 const definitions=t.entries.filter(e=>e.type==='definition');
 const cases=t.entries.filter(e=>e.type==='case'&&e.assignedOpinion);
 const formulasEntries=t.entries.filter(e=>e.type==='formula');
 const concepts=t.entries.filter(isLearningConcept);
 const background=t.entries.filter(isBackground);
 const other=t.entries.filter(e=>e.type==='example'||e.type==='case'&&!e.assignedOpinion);
 let html='<div class="section-jumps">';
 for(const [name,id,count] of [['Rules','rule',law.length],['Definitions','definition',definitions.length],['Assigned cases','case',cases.length],['Formulas','formula',formulasEntries.length+formulas.length],['Background','background',background.length]]){
  if(count)html+='<button data-scroll-group="'+id+'">'+name+' <b>'+count+'</b></button>';
 }
 html+='</div>';
 if(updates.length){
   html+='<details class="current-law-updates"><summary>⚠ '+updates.length+' current-law updates affecting this section — check exam year</summary><div>';
   for(const u of updates){html+='<section><strong>'+escapeHTML(u.title)+'</strong><p><b>Textbook:</b> '+escapeHTML(u.book)+'</p><p><b>Updated rule:</b> '+escapeHTML(u.current)+'</p>'+(String(u.source||'').startsWith('https://')?'<a href="'+escapeHTML(u.source)+'" target="_blank" rel="noopener noreferrer">Source ↗</a>':'')+'</section>'}
   html+='</div></details>';
 }
 if(!t.entries.length)html+='<div class="empty">This section has not yet been extracted from your assigned readings.</div>';
 function group(title,id,entries){if(!entries.length)return '';return '<section class="detail-group" id="group-'+id+'"><h2 class="section-heading">'+title+'</h2>'+entries.map(entryHtml).join('')+'</section>'}
 html+=group('1. Black-letter law','rule',law);
 html+=group('2. Essential definitions','definition',definitions);
 html+=group('3. Assigned judicial opinions','case',cases);
 if(formulasEntries.length||formulas.length)html+='<section class="detail-group" id="group-formula"><h2 class="section-heading">4. Calculations & formulas</h2>'+formulasEntries.map(entryHtml).join('')+formulas.map(formulaHtml).join('')+'</section>';
 if(concepts.length)html+='<details class="concept-fold topic-extra"><summary>Further concepts / course framework <span>'+concepts.length+'</span></summary>'+concepts.map(entryHtml).join('')+'</details>';
 if(other.length)html+='<details class="concept-fold topic-extra"><summary>Examples and supporting references <span>'+other.length+'</span></summary>'+other.map(entryHtml).join('')+'</details>';
 if(background.length)html+='<details class="background-fold topic-extra" id="group-background"><summary>📖 Optional reading background, policy & history <span>'+background.length+'</span></summary><div class="background-fold-body">'+background.map(entryHtml).join('')+'</div></details>';
 if(problems.length)html+='<div class="related-practice"><strong>Practice for this topic</strong><p>'+problems.length+' unsolved questions, kept separate until you want to work through them.</p><button class="small-btn" data-page="problems" data-focus="'+escapeHTML(t.id)+'">Open '+problems.length+' questions →</button></div>';
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
 if(mode==='entry'){obj=t?.entries.find(e=>e.id===id)||{};body='<label class="form-field">Type<select name="type">'+['rule','case','definition','concept','policy','context','framework','history','formula','example'].map(v=>'<option value="'+v+'" '+(obj.type===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+field('Title','title',obj.title)+field('Short summary / holding','summary',obj.summary,true)+field('Plain-English explanation (simple, intuitive)','laymanExplanation',obj.laymanExplanation,true)+field('Lawyer explanation (precise legal doctrine)','legalExplanation',obj.legalExplanation,true)+field('Full explanation / background (optional)','details',obj.details,true)+field('Exam application','examApplication',obj.examApplication,true)+field('Exam trap / qualification','examTrap',obj.examTrap,true)+field('Elements or tests','elements',obj.elements,true)+field('Exceptions','exceptions',obj.exceptions,true)+field('Case rule (assigned opinions)','rule',obj.rule,true)+'<label class="form-field assigned-checkbox"><input type="checkbox" name="assignedOpinion" value="yes" '+(obj.assignedOpinion?'checked':'')+'> Reproduced judicial opinion in assigned readings</label>'+field('Facts (cases)','facts',obj.facts,true)+field('Issue','issue',obj.issue,true)+field('Holding','holding',obj.holding,true)+field('Reasoning','reasoning',obj.reasoning,true)+field('Exam significance','exam',obj.exam,true)+field('Source','source',obj.source)}
 else if(mode==='problem'){obj=c.problems?.find(p=>p.id===id)||{};body=field('Title','title',obj.title)+field('Problem text (unsolved)','prompt',obj.prompt,true)+field('Source','source',obj.source)+field('Your notes','notes',obj.notes,true)+'<label class="form-field">Section<select name="topicId">'+c.topics.map(t=>'<option value="'+escapeHTML(t.id)+'" '+(obj.topicId===t.id?'selected':'')+'>'+escapeHTML(t.title)+'</option>').join('')+'</select></label>'}
 else if(mode==='topic'){obj=t||{};body=field('Section title','title',obj.title)+field('Description','description',obj.description,true)}
 $('modalTitle').textContent=(id?'Edit ':'Add ')+(mode==='entry'?'rule / case':mode==='problem'?'problem':'section');
 $('editorFields').innerHTML=body;$('removeItem').hidden=!id;
 $('modalOverlay').hidden=false;
}
function closeEditor(){$('modalOverlay').hidden=true;editTarget=null}
function submitEdit(ev){ev.preventDefault();if(!editTarget)return;let form=new FormData($('editor')),v=n=>String(form.get(n)||'').trim();let {mode,id}=editTarget,c=current(),t=topic();
 if(!v('title'))return note('A title is required.');
 if(mode==='entry'){let e=t.entries.find(e=>e.id===id);const fields=['title','summary','laymanExplanation','legalExplanation','details','facts','issue','holding','reasoning','exam','source','examApplication','examTrap','elements','exceptions','rule'];let change={id:e?.id||unique(),type:v('type'),assignedOpinion:v('type')==='case'&&v('assignedOpinion')==='yes'};for(const f of fields)change[f]=v(f);if(e)Object.assign(e,change);else t.entries.push(change);record({kind:'upsertEntry',cid:c.id,tid:t.id,entry:change});}
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
$('body').onclick=e=>{let x=e.target.closest('button');if(!x)return;if(x.dataset.roadmap){const el=document.getElementById('outline-chapter-'+x.dataset.roadmap);if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}}else if(x.dataset.outlineAction){const target=x.dataset.outlineAction==='expand';document.querySelectorAll('.outline-chapter').forEach(el=>el.open=target);if(!target)document.querySelectorAll('.outline-section,.outline-entry,.outline-optional').forEach(el=>el.open=false)}else if(x.dataset.entry){openPage('section',x.dataset.topic);jump(x.dataset.entry)}else if(x.dataset.scroll)jump(x.dataset.scroll);else if(x.dataset.scrollGroup)document.getElementById('group-'+x.dataset.scrollGroup)?.scrollIntoView({behavior:'smooth',block:'start'});else if(x.dataset.section)openPage('section',x.dataset.section);else if(x.dataset.quick)openPage('chapter',x.dataset.quick);else if(x.dataset.edit)editor('entry',x.dataset.edit);else if(x.dataset.editProblem)editor('problem',x.dataset.editProblem);else if(x.dataset.page){problemFilter=x.dataset.focus||'all';openPage(x.dataset.page)}else if(x.dataset.searchEntry){courseId=x.dataset.searchCourse;sectionId=x.dataset.searchSection;openPage('section');jump(x.dataset.searchEntry)}};
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
 sectionId=current()?.topics[0]?.id||null;showChapter=new Set();save();render();
}
boot();
