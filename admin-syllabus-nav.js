/* LEX Administrative Law navigation, sourced from Professor Lubbers Fall 2026 syllabus.
   Presentation only. No study entries, problems, or course data modified. */
'use strict';
(() => {
const units=[
 {name:'I. Introduction & Agency Structure',caption:'Classes 1–4 · Aug 24–Sep 2',items:[
  {title:'Role and Structure of Agencies',detail:'Introduction · pp. 1–15',ids:['admin-ch1-introduction']},
  {title:'Appointment of Federal & Inferior Officers',detail:'§ 7.5.1a · pp. 493–510',ids:['admin-appointments-federal']},
  {title:'State Appointments',detail:'§ 7.5.1b · pp. 510–514',ids:['admin-appointments-state']},
  {title:'Removal — Independent Agencies',detail:'§ 7.5.2a · pp. 514–520',ids:['admin-removal-rise']},
  {title:'Removal — Modern Doctrine',detail:'§ 7.5.2b · pp. 520–534',ids:['admin-removal-modern']}
 ]},
 {name:'II. Delegation of Agency Power',caption:'Classes 3–6 · Aug 31–Sep 14',items:[
  {title:'Political Branches & Separation of Powers',detail:'§ 7.1 · pp. 417–418',ids:['admin-foundations-political']},
  {title:'Federal Nondelegation',detail:'§ 7.2.1 · pp. 418–440',ids:['admin-delegation-federal']},
  {title:'State & Private Delegation',detail:'§§ 7.2.2–7.2.3 · pp. 440–451',ids:['admin-delegation-states']},
  {title:'Article III — Agency Adjudication',detail:'§ 7.3.1 · pp. 451–454',ids:['admin-adjudication-article3']},
  {title:'Seventh Amendment — Jarkesy',detail:'§ 7.3.2 · pp. 454–466',ids:['admin-adjudication-jury']}
 ]},
 {name:'III. Substantive Statutory Checks',caption:'Classes 5–6 · Sep 9–14',items:[
  {title:'Agency Interpretation — Preview',detail:'pp. 595–608',match:/interpretation.*preview/i}
 ]},
 {name:'IV.A–B. Agency Procedures & Due Process',caption:'Classes 5–8 · Sep 9–21',items:[
  {title:'Adjudication vs. Rulemaking',detail:'§ 2.5 · pp. 69–76',ids:['admin-ch2-distinction']},
  {title:'Goldberg — Welfare Termination',detail:'§ 2.1 · pp. 17–29',ids:['admin-ch2-welfare']},
  {title:'Roth — Liberty & Property',detail:'§ 2.2 · pp. 29–47',ids:['admin-ch2-protected']},
  {title:'Mathews — Timing of Hearings',detail:'§ 2.3 · pp. 47–59',ids:['admin-ch2-timing']},
  {title:'Elements of a Hearing',detail:'§ 2.4 · pp. 59–69',ids:['admin-ch2-elements']}
 ]},
 {name:'IV.C. Administrative Adjudication',caption:'Classes 8–14 · Sep 21–Oct 12',items:[
  {title:'Statutory Hearing Rights',detail:'pp. 77–98',match:/hearing rights|statutory hearing/i},
  {title:'Decisionmakers, Ex Parte Contacts & Bias',detail:'pp. 98–154',match:/ex parte|bias|decisionmakers|administrative judges/i},
  {title:'Pre-Hearing, Evidence & Decisions',detail:'pp. 155–224',match:/pre-hearing|hearing phase|decision phase|stare decisis|estoppel/i}
 ]},
 {name:'IV.C. Administrative Rulemaking',caption:'Classes 14–20 · Oct 12–Nov 2',items:[
  {title:'Rules, Notice & Public Participation',detail:'pp. 225–284',match:/rulemaking|public participation|notice and comment/i},
  {title:'Procedural Regularity & Regulatory Analysis',detail:'pp. 283–344',match:/procedural regularity|regulatory analysis/i},
  {title:'Exemptions, Guidance & Agency Choice',detail:'pp. 355–415',match:/guidance|rulemaking exemption|agency choice|rulemaking petitions|waivers/i}
 ]},
 {name:'V. Regulatory Reform & Political Oversight',caption:'Classes 20–22 · Nov 2–9',items:[
  {title:'Legislative Veto, Chadha & CRA',detail:'§ 7.4.1 · pp. 466–483',ids:['admin-legislative-federal']},
  {title:'State Legislative Controls',detail:'§ 7.4.2 · pp. 483–489',ids:['admin-legislative-states']},
  {title:'Other Legislative Controls',detail:'§ 7.4.3 · pp. 489–493',ids:['admin-legislative-other']},
  {title:'Presidential Review & OIRA',detail:'§ 7.6 · pp. 535–544',ids:['admin-executive-oira']},
  {title:'State Executive Oversight',detail:'§ 7.6 · pp. 544–551',ids:['admin-executive-state']},
  {title:'Negotiated Rulemaking',detail:'pp. 344–353',match:/negotiated rulemaking/i}
 ]},
 {name:'VI. Judicial Review',caption:'Classes 21–26 · Nov 4–23',items:[
  {title:'Review of Facts, Law & Agency Interpretations',detail:'pp. 579–631',match:/scope of review|skidmore|loper bright|major questions|auer/i},
  {title:'Arbitrary & Capricious Review',detail:'pp. 632–668',match:/arbitrary and capricious|state farm|hard look/i},
  {title:'Reviewability & Agency Inaction',detail:'pp. 670–719',match:/reviewability|preclusion|agency inaction/i},
  {title:'Standing',detail:'pp. 721–744',match:/standing/i},
  {title:'Finality, Exhaustion & Ripeness',detail:'pp. 745–783',match:/finality|exhaustion|ripeness|primary jurisdiction/i}
 ]}
];
const esc=x=>escapeHTML(x);
const ogTitle=groupTitle;
groupTitle=function(g){
 if(courseId==='admin'){
  if(g[0]?.chapterGroup==='admin-ch1')return 'Introduction — Role and Structure of Agencies';
  if(g[0]?.chapterGroup==='admin-ch2')return 'Chapter 2 — Procedural Due Process & Hearings';
  if(g[0]?.chapterGroup==='admin-appointments')return 'Chief Executive’s Appointment Power';
  if(g[0]?.chapterGroup==='admin-removal')return 'Chief Executive’s Removal Power';
  if(g[0]?.chapterGroup==='admin-polbranches')return 'Separation of Powers & Political Branches';
  if(g[0]?.chapterGroup==='admin-delegation')return 'Delegation of Legislative Power';
  if(g[0]?.chapterGroup==='admin-adjudication-delegation')return 'Delegation of Adjudicatory Power';
  if(g[0]?.chapterGroup==='admin-legislative')return 'Legislative Control of Agencies';
  if(g[0]?.chapterGroup==='admin-executive')return 'Executive Oversight & Presidential Review';
 }
 return ogTitle(g);
};
const ogSidebar=renderSidebar;
renderSidebar=function(){
 if(courseId!=='admin'){ogSidebar();return;}
 const c=current(),available=c.topics||[],seen=new Set();
 let html='<div class="side-caption">ADMINISTRATIVE LAW · SYLLABUS</div>';
 html+='<button class="side-link '+(page==='overview'?'active':'')+'" data-page="overview">Master Course Map</button>';
 for(let i=0;i<units.length;i++){
  const unit=units[i],matchIds=unit.items.flatMap(it=>it.ids||[]);
  const opened=i===0||unit.items.some(it=>(it.ids||[]).includes(sectionId)||(!it.ids&&it.match&&available.some(t=>t.id===sectionId&&it.match.test(t.title))));
  html+='<details class="admin-syllabus-unit" '+(opened?'open':'')+'><summary><span class="admin-unit-name">'+esc(unit.name)+'</span><small>'+esc(unit.caption)+'</small></summary><div class="admin-unit-items">';
  for(const it of unit.items){
   let matched=available.filter(t=>((it.ids||[]).includes(t.id)||(!it.ids&&it.match?.test(t.title)))&&!seen.has(t.id));
   if(matched.length){
    for(const t of matched){
     seen.add(t.id);
     html+='<button class="side-section admin-topic '+(page==='section'&&sectionId===t.id?'active':'')+'" data-section="'+esc(t.id)+'"><span class="admin-topic-title">'+esc(it.title)+'</span><small>'+esc(it.detail)+' · '+(t.entries||[]).length+' entries</small></button>';
    }
   } else {
    html+='<div class="admin-pending"><span>'+esc(it.title)+'</span><small>'+esc(it.detail)+' · Not imported yet</small></div>';
   }
  }
  html+='</div></details>';
 }
 const unmatched=available.filter(t=>!seen.has(t.id)&&t.id!=='admin-pending');
 if(unmatched.length){
  html+='<details class="admin-syllabus-unit" open><summary><span class="admin-unit-name">Additional Imported Sections</span><small>Needs syllabus classification</small></summary><div class="admin-unit-items">';
  for(const t of unmatched)html+='<button class="side-section admin-topic" data-section="'+esc(t.id)+'">'+esc(t.title)+'</button>';
  html+='</div></details>';
 }
 html+='<div class="side-caption">REFERENCE</div>';
 html+='<button class="side-link '+(page==='formulas'?'active':'')+'" data-page="formulas">Calculation Reference</button>';
 html+='<button class="side-link '+(page==='problems'?'active':'')+'" data-page="problems">Assigned Problems ('+(c.problems?.length||0)+')</button>';
 html+='<div class="side-caption">STUDY TOOLS</div>';
 html+='<button class="side-link" data-lexnav="learn">Study Mode · Active Recall</button>';
 html+='<button class="side-link" data-lexnav="attack">Exam Attack Outline</button>';
 html+='<button class="side-link" data-lexnav="calc">Calculation Practice</button>';
 html+='<button class="side-link" data-lexnav="dashboard">Learning Dashboard</button>';
 $('outline').innerHTML=html;
};
})();
