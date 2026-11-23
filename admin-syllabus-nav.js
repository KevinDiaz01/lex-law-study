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
  {title:'Federal Statutory Hearing Rights',detail:'§ 3.1.1 · pp. 77–85',ids:['admin-ch3-federal-gateway']},
  {title:'State Hearing Rights',detail:'§ 3.1.2 · pp. 85–91',ids:['admin-ch3-state-gateway']},
  {title:'Using Rules to Limit Hearings',detail:'§ 3.2 · pp. 91–98',ids:['admin-ch3-rules-foreclose']},
  {title:'Judicial & Institutional Models',detail:'§ 3.3 · pp. 98–100',ids:['admin-ch3-judicial-institutional']},
  {title:'Morgan — Decisionmaker Responsibility',detail:'§ 3.3.1 · pp. 100–106',ids:['admin-ch3-personal-responsibility']},
  {title:'Ex Parte Contacts — PATCO',detail:'§ 3.3.2 · pp. 106–116',ids:['admin-ch3-ex-parte']},
  {title:'Congressional Pressure — Pillsbury',detail:'§ 3.3.3 · pp. 116–122',ids:['admin-ch3-legislative-pressure']},
  {title:'Separation of Functions — Introduction',detail:'§ 3.3.4 · p. 122',ids:['admin-ch3-separation-intro']},
  {title:'Separation of Functions — Cases',detail:'§ 3.3.4 · pp. 123–133',ids:['admin-ch3-separation-cases']},
  {title:'Bias & Prejudgment',detail:'§ 3.3.5 · pp. 133–141',ids:['admin-ch3-bias']},
  {title:'ALJs & Decisional Independence',detail:'§ 3.4 · pp. 141–154',ids:['admin-ch3-alj-independence']},
  {title:'Notice & Parties — Block',detail:'§ 4.1.1 · pp. 155–162',ids:['admin-ch4-notice']},
  {title:'Investigations & Discovery — Craib',detail:'§ 4.1.2 · pp. 163–173',ids:['admin-ch4-investigations']},
  {title:'Alternative Dispute Resolution',detail:'§ 4.1.3 · pp. 173–175',ids:['admin-ch4-adr']},
  {title:'Hearing Evidence — Reguero',detail:'§ 4.2.1 · pp. 175–185',ids:['admin-ch4-hearing-evidence']},
  {title:'Official Notice — Circu',detail:'§ 4.2.2 · pp. 185–190',ids:['admin-ch4-official-notice']},
  {title:'Findings & Reasons — Ship Creek',detail:'§ 4.3.1 · pp. 190–198',ids:['admin-ch4-reason-giving']},
  {title:'Post Hoc Reasons — Calcutt / Regents',detail:'§ 4.3.2 · pp. 198–203',ids:['admin-ch4-posthoc']},
  {title:'Enforcement — Civil Penalties',detail:'ACUS 72-6 (Canvas reading)',ids:['admin-ch4-enforcement-acus']},
  {title:'Consistency — UAW',detail:'§ 4.4.2 · pp. 210–212',ids:['admin-ch4-consistency']},
  {title:'Reliance / Fair Notice — Fox II',detail:'§ 4.5.1 · pp. 212–219',ids:['admin-ch4-fair-notice']},
  {title:'Equitable Estoppel — Richmond',detail:'§ 4.5.2 · pp. 219–224',ids:['admin-ch4-estoppel']}
 ]},
 {name:'IV.C. Administrative Rulemaking',caption:'Classes 14–20 · Oct 12–Nov 2',items:[
  {title:'Why Agencies Choose Rulemaking',detail:'§ 5.1 · pp. 225–233',ids:['admin-ch5-rise']},
  {title:'What Counts as a Rule?',detail:'§ 5.2.1 · pp. 233–238',ids:['admin-ch5-definition']},
  {title:'Retroactivity — Bowen',detail:'§ 5.2.2 · pp. 239–246',ids:['admin-ch5-retroactivity']},
  {title:'NPRM — Chocolate Manufacturers',detail:'§ 5.3.1 · pp. 246–254',ids:['admin-ch5-nprm']},
  {title:'Scientific Data — Nova Scotia',detail:'§ 5.3.2 · pp. 254–259',ids:['admin-ch5-scientific-record']},
  {title:'Informal Rulemaking Procedures',detail:'§ 5.4.1a · pp. 259–262',ids:['admin-ch5-informal']},
  {title:'Electronic Rulemaking & Comments',detail:'§ 5.4.1b · pp. 262–267',ids:['admin-ch5-electronic']},
  {title:'Formal Rulemaking — Florida East Coast',detail:'§ 5.4.2 · pp. 267–273',ids:['admin-ch5-formal']},
  {title:'Hybrid Rulemaking — Vermont Yankee',detail:'§ 5.4.3 · pp. 273–283',ids:['admin-ch5-hybrid']},
  {title:'Procedural Regularity & Regulatory Analysis',detail:'pp. 283–344',match:/procedural regularity|regulatory analysis/i},
  {title:'Good Cause & Emergency Rules — Jifry',detail:'§ 6.1.1 · pp. 355–363',ids:['admin-ch6-good-cause']},
  {title:'Subject-Matter Rulemaking Exemptions',detail:'§ 6.1.2 · pp. 363–366',ids:['admin-ch6-categorical']},
  {title:'Procedural Rules — Public Citizen',detail:'§ 6.1.3 · pp. 366–369',ids:['admin-ch6-procedural']},
  {title:'Legislative Rules vs Guidance',detail:'§ 6.1.4a · pp. 369–371',ids:['admin-ch6-guidance-basics']},
  {title:'Policy Statements — P2C2',detail:'§ 6.1.4b · pp. 371–384',ids:['admin-ch6-policy']},
  {title:'Interpretive Rules — Hoctor',detail:'§ 6.1.4c · pp. 384–389',ids:['admin-ch6-interpretive']},
  {title:'Agency Choice — Bell Aerospace',detail:'§ 6.2 · pp. 389–397',ids:['admin-ch6-required-rulemaking']},
  {title:'Rulemaking Petitions — Massachusetts v. EPA',detail:'§ 6.3 · pp. 397–406',ids:['admin-ch6-petitions']},
  {title:'Waivers of Rules — WAIT Radio',detail:'§ 6.4 · pp. 406–415',ids:['admin-ch6-waivers']}
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
  {title:'Scope of Review — Introduction',detail:'§ 9 · pp. 579–580',ids:['admin-ch9-intro']},
  {title:'Fact Findings & Universal Camera',detail:'§ 9.1 · pp. 580–595',ids:['admin-ch9-basic-facts']},
  {title:'Statutory Interpretation & Loper Bright',detail:'§ 9.2.1 · pp. 595–608',ids:['admin-ch9-loper']},
  {title:'State Law Approaches',detail:'§ 9.2.2 · pp. 609–612',ids:['admin-ch9-state']},
  {title:'Major Questions — West Virginia v. EPA',detail:'§ 9.2.3 · pp. 613–619 (620–622 pending)',ids:['admin-ch9-major']},
  {title:'Interpretation of Agency Regulations — Kisor',detail:'§ 9.2.4 · pp. 622–631',match:/auer|kisor|own regulations/i},
  {title:'Arbitrary & Capricious Review',detail:'pp. 632–668',match:/arbitrary and capricious|state farm|hard look/i},
  {title:'Jurisdiction and Reviewing Court',detail:'§ 10.1.1 · pp. 670–673',ids:['admin-ch10-jurisdiction']},
  {title:'Injunctions, Mandamus and Writs',detail:'§ 10.1.2 · pp. 673–676',ids:['admin-ch10-nonmonetary-remedies']},
  {title:'Government Damages & Immunities — SKIM',detail:'§ 10.2 · pp. 676–683 · SKIM',ids:['admin-ch10-damages-skim']},
  {title:'Presidential Criminal Immunity — Trump',detail:'§ 10.2.3 · pp. 683–685',ids:['admin-ch10-presidential-immunity']},
  {title:'Attorney Fees & EAJA',detail:'§ 10.3 · pp. 685–690',ids:['admin-ch10-attorney-fees']},
  {title:'Preclusion of Review — Bowen',detail:'§ 10.4 · pp. 690–693',ids:['admin-ch10-preclusion']},
  {title:'District Court Review — Axon',detail:'§ 10.4 · pp. 693–694',ids:['admin-ch10-implied-district-preclusion']},
  {title:'Constitutional Claims & State Preclusion',detail:'§ 10.4 · pp. 694–696, 697–698',ids:['admin-ch10-constitutional-preclusion']},
  {title:'Rule Review Deadlines — Corner Post',detail:'§ 10.4 · pp. 696–697',ids:['admin-ch10-rule-review-deadlines']},
  {title:'Committed to Discretion — Chaney',detail:'§ 10.5 · pp. 698–704',ids:['admin-ch10-agency-discretion']},
  {title:'Exceptions to Unreviewability — Regents',detail:'§ 10.5 · pp. 704–710',ids:['admin-ch10-reviewability-limits']},
  {title:'Agency Inaction — Norton v. SUWA',detail:'§ 10.6 · pp. 710–715',ids:['admin-ch10-inaction-suwa']},
  {title:'Unreasonable Delay — TRAC Factors',detail:'§ 10.6 · pp. 715–719',ids:['admin-ch10-unreasonable-delay']},
  {title:'ACUS Recommendation 75-3 — Choice of Forum',detail:'Separate assigned Canvas reading · Not uploaded',ids:['admin-ch10-acus-forum']},
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
  if(g[0]?.chapterGroup==='admin-ch3')return 'Chapter 3 — Administrative Adjudication: Fundamental Problems';
  if(g[0]?.chapterGroup==='admin-ch4')return 'Chapter 4 — The Process of Administrative Adjudication';
  if(g[0]?.chapterGroup==='admin-ch5')return 'Chapter 5 — Rulemaking Procedures';
  if(g[0]?.chapterGroup==='admin-ch6')return 'Chapter 6 — Policymaking Alternatives';
  if(g[0]?.chapterGroup==='admin-ch10')return 'Chapter 10 — Reviewability of Agency Decisions';
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
