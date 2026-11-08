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
