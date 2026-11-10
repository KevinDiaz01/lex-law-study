/* LEX learning tools v1 — interface-only. Never writes the published course-content JSON. */
'use strict';
(() => {
 const KEY='lex_learning_progress_v1';
 let state={page:'',scope:'all',mode:'rules',index:0,flipped:false,filter:'all',query:'',progress:{}};
 try{state.progress=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
 const safe=x=>escapeHTML(x==null?'':x);
 const entries=()=>current().topics.flatMap(t=>(t.entries||[]).map(e=>({e,t})));
 const selectable=()=>current().topics.filter(t=>(t.entries||[]).length||((current().formulas||[]).some(f=>f.topicId===t.id)));
 const scoped=()=>entries().filter(({t})=>state.scope==='all'||t.id===state.scope);
 const key=(e)=>courseId+':'+e.id;
 const mark=(e,v)=>{state.progress[key(e)]={rating:v,when:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(state.progress))}catch{}};
 const choose=(arr)=>arr.filter(({e})=>state.mode==='cases'?e.type==='case'&&e.assignedOpinion:state.mode==='definitions'?e.type==='definition':state.mode==='formulas'?e.type==='formula':state.mode==='all'?['rule','definition','case','formula'].includes(e.type):e.type==='rule');
 const controls=()=>'<div class="lex-controls"><label>Section <select id="lexScope"><option value="all">Entire course</option>'+current().topics.map(t=>'<option value="'+safe(t.id)+'" '+(state.scope===t.id?'selected':'')+'>'+safe(t.title)+'</option>').join('')+'</select></label><label>Material <select id="lexMode">'+[['rules','Rules'],['definitions','Definitions'],['cases','Assigned cases'],['formulas','Formula entries'],['all','All essentials']].map(([v,l])=>'<option value="'+v+'" '+(state.mode===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label></div>';
 function renderLearn(){
  let arr=choose(scoped());if(state.filter==='weak')arr=arr.filter(({e})=>!state.progress[key(e)]||state.progress[key(e)].rating!=='strong');if(state.index>=arr.length)state.index=0;
  const item=arr[state.index];
  let h='<div class="lex-intro"><strong>Active recall</strong><p>Read the prompt, recall the answer out loud or on paper, then reveal the original notes. Self-rate honestly; ratings are kept only in this browser.</p></div>'+controls()+'<label class="lex-check"><input type="checkbox" id="lexWeak" '+(state.filter==='weak'?'checked':'')+'> Review only unmastered items</label>';
  if(!item){$('body').innerHTML=h+'<div class="empty">No matching items in this section. Try All essentials or a different section.</div>';return}
  const {e,t}=item;const total=arr.length;
  h+='<div class="lex-study-count">'+(state.index+1)+' of '+total+' · '+safe(t.title)+'</div><article class="lex-study-card"><span class="type-label">'+safe(kindLabel(e))+'</span><h2>'+safe(e.title)+'</h2><p class="lex-prompt">Explain the governing rule, test, or significance before revealing the notes.</p>';
  if(state.flipped){h+='<div class="lex-answer"><h3>Original study material</h3><p>'+safe(e.summary)+'</p>'+(e.rule?'<p><b>Case rule:</b> '+safe(e.rule)+'</p>':'')+(e.elements?'<p><b>Elements:</b> '+safe(e.elements)+'</p>':'')+(e.exceptions?'<p><b>Exceptions:</b> '+safe(e.exceptions)+'</p>':'')+(e.laymanExplanation?'<p><b>Plain English:</b> '+safe(e.laymanExplanation)+'</p>':'')+(e.examApplication?'<p><b>Exam application:</b> '+safe(e.examApplication)+'</p>':'')+(e.examTrap?'<p><b>Exam trap:</b> '+safe(e.examTrap)+'</p>':'')+'</div><div class="lex-rate"><button data-lexrate="again">Study again</button><button data-lexrate="developing">Almost</button><button data-lexrate="strong">Know it</button></div>';}
  else h+='<button class="lex-primary" data-lex="flip">Reveal original notes</button>';
  h+='</article><div class="lex-actions"><button data-lex="prev">← Previous</button><button data-lex="next">Next →</button><button data-lex="source">Open full section</button></div>';
  $('body').innerHTML=h;
 }
 function renderAttack(){
  let arr=scoped().filter(({e})=>['rule','definition','formula'].includes(e.type)||(e.type==='case'&&e.assignedOpinion));
  let h='<div class="lex-intro"><strong>Exam attack outline</strong><p>Condensed directly from your existing entries. No new rules or case summaries have been substituted for your original content.</p></div><div class="lex-controls"><label>Section <select id="lexScope"><option value="all">Entire course</option>'+current().topics.map(t=>'<option value="'+safe(t.id)+'" '+(state.scope===t.id?'selected':'')+'>'+safe(t.title)+'</option>').join('')+'</select></label><button data-lex="print">Print / Save as PDF</button></div>';
  let prev='';
  for(const {e,t} of arr){if(prev!==t.id){h+='<h2 class="lex-attack-section">'+safe(t.title)+'</h2>';prev=t.id}h+='<article class="lex-attack-item"><div class="lex-attack-title"><strong>'+safe(e.title)+'</strong><span>'+safe(kindLabel(e))+'</span></div><p>'+safe(e.type==='case'?(e.rule||e.holding||e.summary):e.summary)+'</p>'+(e.elements?'<p><b>Test:</b> '+safe(e.elements)+'</p>':'')+(e.exceptions?'<p><b>Exceptions:</b> '+safe(e.exceptions)+'</p>':'')+(e.examTrap?'<p><b>Watch out:</b> '+safe(e.examTrap)+'</p>':'')+'</article>'}
  $('body').innerHTML=h||'<div class="empty">No items available.</div>';
 }
 function renderDashboard(){
  const all=entries(),reviewed=all.filter(({e})=>state.progress[key(e)]),mastered=all.filter(({e})=>state.progress[key(e)]?.rating==='strong');
  let h='<div class="lex-intro"><strong>Your learning dashboard</strong><p>Reading coverage and learning mastery are different. These counts show what is imported and what you have self-rated, not a guarantee that your syllabus is complete.</p></div><div class="lex-metrics"><div><strong>'+current().topics.length+'</strong><span>Sections in course data</span></div><div><strong>'+all.length+'</strong><span>Outline entries</span></div><div><strong>'+(current().formulas||[]).length+'</strong><span>Calculation references</span></div><div><strong>'+(current().problems||[]).length+'</strong><span>Unsolved problems</span></div><div><strong>'+reviewed.length+'</strong><span>Reviewed entries</span></div><div><strong>'+mastered.length+'</strong><span>Self-rated mastered</span></div></div><h2>Section progress</h2><div class="lex-progress-list">';
  for(const t of current().topics){const n=t.entries.length,m=t.entries.filter(e=>state.progress[key(e)]?.rating==='strong').length;h+='<div class="lex-progress-row"><div><strong>'+safe(t.title)+'</strong><span>'+m+' of '+n+' self-rated mastered</span></div><div class="lex-progress-track"><span style="width:'+(n?Math.round(100*m/n):0)+'%"></span></div></div>'}
  h+='</div><p class="lex-note">Known external-reading and handout gaps must be checked against your syllabus and source files; this dashboard does not mark unverified pages as complete.</p>';$('body').innerHTML=h;
 }
 function renderCalc(){
  const list=(current().formulas||[]).filter(f=>state.scope==='all'||f.topicId===state.scope);
  let h='<div class="lex-intro"><strong>Calculation practice</strong><p>Use the original formula references to work a calculation independently. The existing worked steps remain hidden until you choose to reveal them. This is self-check practice, not automatic numerical grading.</p></div><div class="lex-controls"><label>Section <select id="lexScope"><option value="all">Entire course</option>'+current().topics.map(t=>'<option value="'+safe(t.id)+'" '+(state.scope===t.id?'selected':'')+'>'+safe(t.title)+'</option>').join('')+'</select></label></div>';
  if(!list.length)h+='<div class="empty">No calculation references for this section.</div>';
  list.forEach((f,i)=>{h+='<article class="lex-calc"><div class="lex-attack-title"><strong>'+safe(f.title)+'</strong><span>'+safe(f.source||'Calculation reference')+'</span></div><p>'+safe(f.laymanExplanation||f.meaning)+'</p><div class="formula-code">'+safe(f.formula)+'</div><label>Your calculation / scratch work<textarea class="lex-scratch" data-calc="'+i+'" placeholder="Show your steps here. This stays in your browser until the page is refreshed."></textarea></label><details><summary>Reveal original worked steps</summary><div class="lex-answer">'+formulaSteps(f)+'</div></details></article>'});
  $('body').innerHTML=h;
 }
 const oldRender=render;
 render=function(){
  if(state.page){const c=current();if(!c)return;$('courses').innerHTML=db.courses.map(x=>'<button class="course-tab '+(x.id===c.id?'active':'')+'" data-course="'+safe(x.id)+'">'+safe(x.name)+'</button>').join('');renderSidebar();$('crumb').textContent=c.name+' / Learning tools';const names={learn:'Study mode',attack:'Exam attack outline',dashboard:'Learning dashboard',calc:'Calculation practice'};$('title').textContent=names[state.page];$('subtitle').textContent='Practice with your existing course material; original notes stay unchanged.';$('editSection').hidden=true;$('newEntry').hidden=true;if(state.page==='learn')renderLearn();else if(state.page==='attack')renderAttack();else if(state.page==='dashboard')renderDashboard();else renderCalc();updateSync();return;}
  oldRender();
 };
 const oldSidebar=renderSidebar;
 renderSidebar=function(){oldSidebar();const area=$('outline');const selected=p=>'side-link '+(state.page===p?'active':'');const html='<div class="side-caption">STUDY TOOLS</div><button class="'+selected('learn')+'" data-lexnav="learn">Study mode · recall</button><button class="'+selected('attack')+'" data-lexnav="attack">Exam attack outline</button><button class="'+selected('calc')+'" data-lexnav="calc">Calculation practice</button><button class="'+selected('dashboard')+'" data-lexnav="dashboard">Learning dashboard</button>';area.insertAdjacentHTML('beforeend',html)};
 const oldOpen=openPage;openPage=function(p,s){state.page='';oldOpen(p,s)};
 const oldCourse=chooseCourse;chooseCourse=function(id){state.page='';state.scope='all';state.index=0;oldCourse(id)};
 function nav(p){state.page=p;state.index=0;state.flipped=false;search='';$('search').value='';$('sidebar').classList.remove('open');render();window.scrollTo(0,0)}
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lexnav],[data-lex],[data-lexrate]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.lexnav){nav(b.dataset.lexnav);return}
  if(b.dataset.lexrate){const arr=choose(scoped()).filter(({e})=>state.filter!=='weak'||!state.progress[key(e)]||state.progress[key(e)].rating!=='strong');const item=arr[state.index];if(item)mark(item.e,b.dataset.lexrate);state.flipped=false;state.index++;render();return}
  const act=b.dataset.lex;if(act==='flip')state.flipped=true;else if(act==='prev'){state.index=Math.max(0,state.index-1);state.flipped=false}else if(act==='next'){state.index++;state.flipped=false}else if(act==='source'){const item=choose(scoped())[state.index];if(item){openPage('section',item.t.id);jump(item.e.id);return}}else if(act==='print'){window.print();return}render();
 },true);
 document.addEventListener('change',e=>{if(e.target.id==='lexScope'){state.scope=e.target.value;state.index=0;state.flipped=false;render()}else if(e.target.id==='lexMode'){state.mode=e.target.value;state.index=0;state.flipped=false;render()}else if(e.target.id==='lexWeak'){state.filter=e.target.checked?'weak':'all';state.index=0;state.flipped=false;render()}},true);
 document.addEventListener('input',e=>{if(e.target.id==='search')state.page=''},true);
 const oldSearch=renderSearch;
 renderSearch=function(){
  const q=search.toLowerCase().trim();if(!q){oldSearch();return}let hits=[];
  const stringify=(v)=>{if(v==null)return '';if(typeof v==='string'||typeof v==='number')return String(v);if(Array.isArray(v))return v.map(stringify).join(' ');if(typeof v==='object')return Object.values(v).map(stringify).join(' ');return ''};
  for(const c of db.courses){for(const t of c.topics){for(const e of t.entries||[]){if([c.name,t.title,stringify(e)].join(' ').toLowerCase().includes(q))hits.push({c,t,e})}}}
  const labels=hits.slice(0,200).map(({c,t,e})=>'<button class="search-hit" data-search-course="'+safe(c.id)+'" data-search-section="'+safe(t.id)+'" data-search-entry="'+safe(e.id)+'"><strong>'+safe(e.title)+'</strong><span>'+safe(c.name)+' / '+safe(t.title)+' · '+safe(e.summary||e.rule||e.holding)+'</span></button>').join('');
  const extras=[];for(const c of db.courses){for(const f of c.formulas||[])if(stringify(f).toLowerCase().includes(q))extras.push('<button class="search-hit" data-lexresult-course="'+safe(c.id)+'" data-lexresult="formulas"><strong>Formula · '+safe(f.title)+'</strong><span>'+safe(c.name)+' · '+safe(f.formula)+'</span></button>');for(const p of c.problems||[])if(stringify(p).toLowerCase().includes(q))extras.push('<button class="search-hit" data-lexresult-course="'+safe(c.id)+'" data-lexresult="problems" data-lexresult-section="'+safe(p.topicId)+'"><strong>Problem · '+safe(p.title)+'</strong><span>'+safe(c.name)+' · '+safe(p.source)+'</span></button>')}
  $('body').innerHTML='<div class="lex-result-count">'+hits.length+' outline results · '+extras.length+' formula/problem results</div>'+(labels+extras.slice(0,100).join('')||'<p class="empty">No results.</p>');
 };
 document.addEventListener('click',e=>{const b=e.target.closest('[data-lexresult]');if(!b)return;e.stopPropagation();courseId=b.dataset.lexresultCourse;if(b.dataset.lexresult==='problems'){problemFilter=b.dataset.lexresultSection||'all';}openPage(b.dataset.lexresult)},true);
 // Keep browser storage for study ratings distinct from editorial changes.
})();