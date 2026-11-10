# LEX — Law Study Workspace · Permanent GitHub Pages edition

This is the **one-time** deployment package for the LEX study website. After GitHub Pages is enabled, new course material can be published by updating **`content/lex-data.json` in GitHub**. The website reads that file whenever you open or refresh it; you do **not** have to download another folder for every batch.

It includes all Chapter 1 (Tax pp. 1–33) study material from the existing LEX site: Master Course Map, Rule Map, Detailed Outline, Calculation Reference, unsolved Problem Bank, search, and built-in editor. Administrative Law and Bankruptcy are placeholders. Contents are condensed original study notes, not copies of the supplied textbook.

## One-time GitHub setup

These steps must be completed in the GitHub account **KevinDiaz01**. The connected ChatGPT GitHub integration can edit existing repositories, but cannot create a new repository or enable Pages.

1. Open <https://github.com/new> while signed in as **KevinDiaz01**.
2. Set **Repository name** to exactly `lex-law-study`. Select **Public** (GitHub Pages is public), and **do not initialize with a README**. Create the repository.
3. Extract the one-time ZIP. In the new GitHub repository, use **Add file → Upload files**. Upload the files **inside** this folder to the repository root. Make sure the top level contains `index.html`, `app.js`, `styles.css`, `cloud-sync.js`, `tax-chapter1-data.js`, and the **`content/lex-data.json`** file inside a `content/` directory. Do not upload the ZIP as a single file or nest the entire package inside another folder. Commit the upload.
4. Open the repository's **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
5. Once GitHub finishes publishing, the intended address is <https://kevindiaz01.github.io/lex-law-study/>. That address will only become valid after steps 1–4 and successful deployment.
6. If ChatGPT cannot see the new repository in the connected GitHub account, adjust the GitHub app installation's repository access to include `lex-law-study` and confirm the app has Contents read/write permission.

**Privacy:** GitHub Pages sites are publicly accessible. Do not upload clients' personal information, confidential lecture recordings, full copyrighted textbooks, or any secret tokens. For genuinely private study data, use an authenticated hosting setup instead.

## Future ChatGPT updates — no more website downloads

Send a new reading batch in your ChatGPT conversation. Ask to add the rules, cases, definitions, formulas, and unsolved problems to **`KevinDiaz01/lex-law-study`** without replacing existing IDs or user edits. The GitHub connection can fetch and update the repository's **`content/lex-data.json`** file. Refresh the LEX website and the new material appears.

**This update workflow is supported by the code but is NOT activated until you create the repository and enable GitHub Pages.** Never mistake the intended URL above for a live verified deployment before activation.

## The built-in editor: saving across devices

Edits in the website are **immediately saved locally** in your browser. The sidebar shows how many local edits have not yet been published.

To also store those edits in GitHub:

1. On GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens** and create a fine-grained token scoped **only to `lex-law-study`**, with the minimum necessary permission: **Contents → Read and write**. Use a short expiration and revoke it when no longer needed.
2. In the hosted LEX site, click **☁ Publish my edits to GitHub**. The website asks for the token in a browser prompt. **Never paste the token into ChatGPT, a public issue, a website field you don't trust, or a study note.** The token is held in JavaScript memory for the current browser session only; it is not saved, exported, logged, or committed.
3. LEX retrieves the current GitHub content, applies only your pending edits to the newest version, and commits the merged file. After GitHub Pages finishes publishing, the changes appear on other devices when you refresh.

Publishing is **an explicit action** to avoid accidentally exposing personal material. If you do not publish, local edits still remain on the current device and can be exported as JSON backups. Browser-local data can be lost if browser storage is cleared.

**Important sync limitation:** When you and ChatGPT edit the exact *same entry* concurrently, the last published edit to that entry may win. Avoid editing the same item simultaneously; LEX merges changes to separate entries by stable IDs. Before large structural changes, use **Export / back up notes**.

## Site structure

- `index.html`: frontend shell
- `app.js`: master map, outline, formulas, problem bank, study UI, built-in editor
- `styles.css`: styling
- `tax-chapter1-data.js`: initial offline fallback of Chapter 1; **not** the authoritative cloud data
- `cloud-sync.js`: remote content refresh, local change tracking, GitHub publish flow
- `content/lex-data.json`: **authoritative source for published course material**
- `.nojekyll`: disables unwanted Jekyll processing

This is a static website; it does not have a server-side login. GitHub write access is used only if you explicitly authenticate while publishing edits. Users who visit the public site without your token can read the published study content but cannot modify the repository.

## Permanent exam-outline content standard

LEX is an **exam-ready law school outline that can also teach material from scratch** when the reader has not completed the assigned casebook pages. It is not a chapter-by-chapter textbook replacement and must not bury exam law beneath history or background.

When updating **any** course, use this hierarchy:

1. **Always visible and prominent:** controlling black-letter rules (with statutory references); **all important definitions** (including basis, AGI, recognition, etc.); elements/tests; exceptions and important qualifications.
2. **Only cases reproduced as judicial opinions in assigned readings:** prepare a dedicated brief with facts, issue, holding, rule, reasoning, and exam significance. Do **not** create case briefs for a case merely cited or mentioned; place its relevant holding or significance inline as supporting authority.
3. **Relevant calculations and worked examples:** put them beside the doctrine they illustrate; preserve source facts and mathematical assumptions.
4. **Exam application and traps:** briefly demonstrate how to spot and apply each rule, and important common distinctions, avoiding unsupported claims. Keep practice-bank problems **unsolved** unless the user asks for solutions.
5. **Background and context:** retain reading context, historical narrative, and policy explanations, but make these short and **collapsed by default**. They never displace the governing law.
6. **Current-law accuracy:** warn when authority was overruled, superseded, or is historical/qualified. Distinguish these categories. Explain what rule changed and cite an authoritative source. Do not conflate a case's historical discussion with a binding modern holding.
7. **Source integrity:** preserve the terminology and scope of the assigned source. Make clear when a note comes from a supplied excerpt versus independent current-law research. Never pretend unseen casebook pages were read or silently invent missing facts.
8. **Presentation:** compact navigation between courses, chapter/section outline, small colored text tags (not large colored cards); information prioritized by exam value; optional explanations expandable.

For the ongoing course priority, work on Federal Income Taxation first, then Administrative Law, then Bankruptcy & Creditors' Rights. Keep the rule/definition/exam structure consistent across each. Do not delete an existing definition to reduce visual density; collapse background instead.

The website's canonical published content is `content/lex-data.json`; `lex-v4.js` and `lex-v4.css` render the experience. Always preserve existing data, local edit publishing, and unsolved problem status.

## Syllabus-only extraction rule

**Hard requirement:** The syllabus is the authoritative whitelist of permitted source pages. When the student uploads an entire book or a long scan, **NEVER** automatically make notes from all uploaded pages. Only create or update LEX notes, case briefs, definitions, formulas and practice prompts for page ranges, problems, statutes, and separately assigned handouts explicitly on the course syllabus (including professor updates to it).

**Required workflow for each course and batch:**
1. Find the course's actual syllabus/assignment list and identify its assigned *printed textbook page* ranges, not simply PDF viewer page indices. Preserve section-specific assigned questions and opinion handouts.
2. Match the printed book page numbers against pages in the uploaded complete PDFs/scan; independently verify page numbering when covers/front matter cause an offset. A source file's inclusion does **not** authorize extraction beyond the syllabus.
3. Process only the intersection between uploaded source pages and assigned syllabus pages. If the requested page or assigned supplement is missing/illegible, mark it missing; do not substitute nearby unassigned chapters or invent its contents.
4. Assigned case briefs require the *opinion itself* reproduced in an assigned selection or separately supplied opinion handout. A passing citation does not qualify. Distinguish litigant briefs/arguments from judicial holdings.
5. Extract all relevant definitions, governing rules, statutory elements and exceptions, professor-assigned calculations and practice problems from the assigned pages; do not filter out important definitions merely to keep the outline short. Keep problems unsolved and background collapsed.
6. Record precise source page ranges and which syllabus assignment each new note belongs to, and deduplicate overlapping page ranges. Clearly distinguish law updates sourced independently from notes extracted from the syllabus's assigned pages; current-law status updates can be attached as narrowly scoped warning annotations, not notes covering unassigned textbook material.
7. Process class-by-class, preserve existing LEX content and the roadmap/expandable outlines. Before committing, verify every new entry's assigned source page belongs to the syllabus whitelist, and report any gaps.

**Never infer that a full book upload expands the assigned reading.** Do not summarize or import unassigned book pages, including pages adjacent to assigned ranges. If page assignments are missing or not verifiable, stop extraction for that unverified segment rather than guessing.

## Dual-explanation rule (layperson + legal)

Use two layers for **every complex or unfamiliar exam-relevant doctrine**, while preserving the compact expandable outline. On opening an entry, show a short **IN PLAIN ENGLISH** explanation that teaches the idea intuitively without compromising legal accuracy. Keep a separate **Legal explanation** with precise statutory language, test, requirements, exceptions, factual distinctions, relevant case reasoning and citations. A plain-English explanation supplements, and must never replace or contradict, the legal explanation. Where a supplied passage does not support a detail, do not invent it: distinguish independently researched law or leave a gap. Apply the same standard to important definitions, assigned cases, formulas, and applications. Never turn plain-language teaching examples into claimed quotes from the casebook. Preserve both editable fields (`laymanExplanation`, `legalExplanation`) and use existing verified `details` as the lawyer-level explanation where appropriate. For reproduced court opinions, the full assigned case brief itself is the formal legal layer.

## Verified Tax syllabus coverage (Weeks 1–7)

- **Week 1:** Chapter 1 printed pp. 1–33.
- **Week 2:** Chapter 2 printed pp. 35–68, §132 Questions 1–8 on printed pp. 64–65, and separately assigned *Gaylor* handout.
- **Week 3:** Chapter 2 printed pp. 68–77 (including the four-part hypothetical on p. 77) and pp. 78–102, plus separately assigned *McKenney* government-brief handout and *Harris* opinion handout (separately provided pp. 154–161), and textbook Chapter 3 printed pp. 111–134.

- **Week 4:** Chapter 3 pp.134–153 from earlier textbook upload, and Chapter 4 pp.155–165 from the latest upload; assigned p.141 questions and p.147 problems are unsolved. **Printed textbook p.154 (end of Chapter 3) is still missing**. No Chapter 4 source is a substitute for that page. Week 4 remains partial ONLY on that p.154 gap.
- The assigned *Harris* judicial opinion comes from the **separate handout pp.154–161** and is preserved, alongside the now-reproduced *Commissioner v. Duberstein* opinion in textbook pp.123–129. They are distinct assigned sources. The chapter also reproduces *Taft v. Bowers*, *United States v. Davis*, *Farid-Es-Sultaneh*, and *Diez-Arguelles* in the currently supplied Week 4 excerpt.

- **Week 5:** Chapter 4 pp.165–191 and pp.196–219. Both assigned textbook ranges are extracted. The full upload contains pp.192–195 but they are **NOT syllabus-assigned**; exclude them and do not brief *Helvering v. Bruun*, whose reproduced opinion spans the unassigned pages. *Ford Motor Co.* and *Nonrecognition* are separate assigned handouts not present in the latest casebook upload; add when supplied.
- **Week 6:** Chapter 4 pp.219–245 (including the four-part football signing-bonus problem p.245) and pp.245–257 extracted; shared p.219 deduplicated. The separate stock-option handout remains pending.
- **Current-law update annotations** (NOT imported casebook content): 2025 law replaced the book's scheduled bonus-depreciation phasedown with permanent §168(k) 100% for qualified property acquired after Jan.19,2025; §448(c) 2026 gross-receipts test $32m (IRS Rev. Proc.2025-32); *Moore v. United States* (2024) expressly reserved the general constitutional realization question; SECURE 2.0 changed RMD ages. These annotations have separate authority links and do not create extra assigned case briefs.
- **Math-source integrity:** The book's traditional/Roth IRA numerical example states 'tenfold' growth but prints balances corresponding to 100-fold growth; the study formula explains the inconsistency. The §72 annuity footnote contains a $25,514/$25,524 inconsistency; explanations flag it. All professor-assigned PROBLEM prompts remain unsolved, including Aerospace p.162 and NFL signing bonus p.245.
- **Week 7 (Oct.6 & 8):** Debt & Income; Life Insurance; Annuities; Income Splitting. The professor assigned printed textbook **pp.259–290; pp.290–321; pp.323–340; Problem 2 pp.338–339**, plus a separate **Tufts certiorari-petition handout**. The 2026-11-09 Chapter 5 upload includes **pp.259–321** (all printed page labels present). The website has imported **only pp.259–321**, including 3 full reproduced opinions (*Zarin*, *Tufts*, *Diedrich*), 22 calculation references and unsolved assigned questions. **Still missing:** textbook pp.323–340 (including the p338–339 assigned problem) and separate *Tufts* petition. Do NOT infer notes for these unseen pages or confuse the petition with the reproduced Supreme Court opinion. *Crane*, *Estate of Franklin*, *Preslar*, *Pleasant Summit*, *Old Colony*, *Kirby Lumber* and *South Carolina v. Baker* are mentioned/discussed in the assigned passages but not reproduced as full judicial opinions there; keep as supporting doctrinal authorities, not dedicated case briefs.
- **Week 7 later-law annotations:** The 2023 book's broad 2021–2025 student-loan CODI rule is historical after P.L.119-21's amendment to §108(f)(5) for specified death/permanent-disability cases with SSN requirement; the §108(a)(1)(E) principal-residence CODI relief has 2026 timing conditions. Keep these legal updates separate from the syllabus textbook text (https://www.law.cornell.edu/uscode/text/26/108).
- **Deliberately excluded:** the separately titled *Squire v. Capoeman* opinion begins at the bottom of textbook p. 102 but its substantive excerpt continues on **unassigned** pp. 103–108. Do not create a dedicated *Squire* case brief or extract those subsequent pages until the syllabus independently assigns them. The brief mention on assigned p. 102 is not the full assigned opinion.
- A full chapter upload can contain more pages than assigned. In the 2026-11-08 Chapter 2 text, content beyond assigned p.102 is outside the import scope.

Both Week 2 and Week 3 use the same Chapter 2 textbook file, and printed p.68 overlaps. Deduplicate that overlap rather than importing twice. All separately researched legal developments (for example amended 2026 wagering-loss limits) must be clearly marked as **current-law updates**, not as statements from the 2023 casebook.

### Week 7 — Chapter 6 assigned excerpt (2026-11-09)

- Chapter 6 pp.323–340 **only** (Rate structure, Lucas v. Earl, Poe v. Seaborn, Blair v. Commissioner, Helvering v. Horst and assigned Problem 2 on pp.338–339). Four judicial opinions reproduced in full within assigned page range received dedicated case briefs.
- The first lines of Helvering v. Eubank appear on p.340, but the opinion and Heim v. Fitzpatrick continue on unassigned pp.341 onward: **no full brief or later-page notes** were imported from that material. Likewise, later Chapter 6 filing status/EITC/CTC sections are beyond the assignment and are not extracted.
- Syllabus Week 7 textbook pp.259–321 and pp.323–340 are now covered. Printed p.322 is not part of the Week 7 assignment. The **separate Tufts certiorari petition handout is still pending**.
- All Chapter 6 questions remain unsolved, especially five-part **Problem 2 on pp.338–339**. The 2022 single-filer marginal brackets are marked historical and used only to illustrate calculations; additional numerical examples are labeled constructed where the text did not provide numbers. No current 2026 tax bracket has been silently substituted.

### Chapter 7 Tax: Week 8 and Week 9 partial (Nov 9, 2026)

- Source uploaded `Pasted text(20261110-000105).txt`: textbook Chapter 7 printed pp.363–412 inclusive, with each sequential page marker present.
- Week 8 assigned pp.363–394: included. Four complete, reproduced court opinions briefed (Midland Empire, Welch, Gilliam, Groetzinger). The separately assigned *Schitt's Creek* video was not in the upload.
- Week 9 assigned pp.394–433, Problems 2–4 p.433, pp.433–457 and separate home-office/vacation-home problem set. Only pp.394–412 extracted; pp.413–457, p.433 problems and handout NOT extracted.
- Reproduced Revenue Ruling 2004-18 classified as administrative guidance, not a case; INDOPCO mentioned in text but no reproduced opinion, therefore no case brief. Roof-shingle and Tammy blog prompts remain unsolved in Problem Bank.
- Current-law notes distinguish textbook's 2022–24 domestic R&D amortization from new §174A treatment beginning in 2025, bonus depreciation changes in 2025, and historical thresholds. Any constructed math examples labeled as such.

### Chapter 8 Tax Shelters — Week 9 partial (Nov. 9, 2026)

- Uploaded `Pasted text(20261110-002540).txt` contains sequential printed Chapter 8 pp. **413–443**. Week 9 assigned pp. **413–457**, so pp. **444–457 remain missing**. Chapter 7 pp.394–412 were completed in the prior update; syllabus Problems 2–4 on p.433 are included in this new upload.
- Dedicated opinion-excerpt briefs: **Gregory v. Helvering** (Second Circuit and Supreme Court assigned passages), **Knetsch v. United States**, and **Winn-Dixie Stores, Inc. v. Commissioner**. **Goldstein** is discussed/cited only, therefore is contextual doctrine and not independently briefed.
- Chapter 8 outline emphasizes substance over form, §7701(o), original tax-shelter typology, §469 passive activity losses, §163(d) investment interest, §465 at-risk limits, §§264 and 265 interest restrictions, AMT, and advisor standards.
- All assigned questions remain unsolved; **Problems 2–4 on p.433** retain Stan's two variations, Jamie's four subparts, and Rafael's multi-year nonrecourse restaurant facts. Additional problem 5 also preserved unsolved.
- Historical/current-law warnings: prior corporate AMT repeal does **not** describe the 15% corporate AMT enacted in 2022 for years beginning after 2022; original Circular 230 §10.35 covered-opinion requirement was replaced by written advice §10.37 in 2014. Historic 2022 individual AMT dollar thresholds flagged.
- Note math discrepancy within reproduced Knetsch excerpt: '$294,540 paid less $203,000 loans' gives $91,540, but opinion claims $91,570. The separate $4,000 initial payment plus two years' interest totals $294,570, yielding $91,570. Do not silently overwrite the original text.
- Separate **home-office and vacation-home problem set** remains outstanding; don't invent any questions from it.
