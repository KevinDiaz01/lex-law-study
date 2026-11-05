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
