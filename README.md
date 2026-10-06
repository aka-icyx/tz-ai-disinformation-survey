# Tanzania AI-Generated Disinformation Survey

A custom-built version of the questionnaire. Built on the config-driven Vercel + Google Drive blueprint:
no server to manage, no database, browser-only editing/deploys, and
Drive doubles as a human-browsable place to see raw responses.

## What is included

Building this from scratch removes two real limitations:

- **True per-respondent randomization.** This app draws a fresh
  random set (1 item per difficulty tier per modality, authenticity
  randomized) for every single respondent, server-side, at request
  time.
- **One set of bilingual content, not duplicated sections.** Here, all
  bilingual text lives once in `lib/survey-config.js` as `{en, sw}`
  pairs, and the frontend just swaps which key it reads based on the
  respondent's language choice — no duplication.

## Project structure

```
public/index.html        <- the whole frontend, vanilla JS, no build step
public/stimuli/**         <- Section 4 media (currently empty — see STIMULI_FOLDER_GUIDE.md)
api/get-config.js        <- serves lib/survey-config.js as JSON
api/get-stimuli-set.js    <- builds one participant's randomized 9-item + 2-attention-check set
api/submit.js               <- verifies tokens, scores, saves the final record to Drive
api/export.js                 <- admin-only CSV export, token-protected
lib/survey-config.js        <- THE ONLY FILE with survey content/text — edit this to change questions
lib/drive.js                   <- generic Drive helper (reuse verbatim in future apps)
lib/http.js                       <- generic API error-wrapping helper (reuse verbatim)
lib/token.js                        <- signs/verifies the Section 4 answer-key tokens
lib/stimuli.js                        <- scans public/stimuli/** and builds the randomized set
lib/scoring.js                          <- verifies tokens + computes detection accuracy
lib/records.js                             <- one-JSON-file-per-response storage + CSV flattening
```

## Data model

**No resume-in-progress state.** The survey is anonymous by design (no
email/name collected — see the consent text in `section0.consent`), and
the blueprint's guidance is that resume-state is only worth building
when responses carry an identifier. Progress is kept in memory in the
browser tab only; closing the tab before the final submit loses that
respondent's answers, which matches the consent text shown to them
("your responses will not be saved unless you reach the final submit
button").

**One JSON file per response**, stored at
`<DRIVE_FOLDER_ID>/responses/<uuid>.json`, e.g.:

```json
{
  "id": "b3f1...":
  "submittedAt": "2026-08-27T10:15:00.000Z",
  "language": "sw",
  "demographics": { "age_group": "25_34", "gender": "female", "...": "..." },
  "section2": { "ai_tools_used": ["chatgpt"], "aware_ai_disinfo": "yes", "...": "..." },
  "section3": { "trust": { "news_media": "somewhat" }, "newsSource": ["radio","social_media"] },
  "section4": {
    "detectionResults": [
      { "itemId": "...", "modality": "text", "tier": "hard", "trueAuthenticity": "ai", "judgment": "real", "correct": false, "reasonTags": ["guess"] }
    ],
    "attentionResults": [ { "itemId": "attn_1", "expected": "ai_generated", "given": "ai_generated", "passed": true } ],
    "scoreSummary": { "correct": 5, "total": 9, "accuracy": 0.5556, "byModality": {"text":{"correct":2,"total":3}}, "attentionChecksPassed": true }
  },
  "section5": { "...": "..." },
  "section6": { "...": "..." },
  "section7": { "finalComment": "..." }
}
```

Nothing here is a shared, mutated file — every write is a brand-new
file, so concurrent submissions during our 2-week collection window
can't race or overwrite each other.

## Stimuli: producing the actual content

We had **90 items total**: for text and audio, 30 in English + 30 in
Swahili (15 real + 15 AI each, split into 3 tiers of 5); for image, 30
total (not language-split). Exact folder locations are in
`STIMULI_FOLDER_GUIDE.md` — read that alongside this section.

### Text (30 English + 30 Swahili)
1. Collected 15 authentic short passages (100–150 words) per language
   from real Tanzanian sources (The Citizen, Daily News, Mwananchi) on
   ordinary, non-disinformation topics (business, sports, community
   events).
2. Generated 15 AI passages per language with any general-purpose LLM
   (ChatGPT, Claude, Gemini).
3. Had 2–3 reviewers independently guess real-vs-AI on the full set;
   sorted into easy/medium/hard by how often they're correctly guessed.
4. For Swahili, we generated directly in Swahili and have a fluent
   speaker check naturalness.

### Audio (30 English + 30 Swahili)
1. Sourced 15 authentic short clips (15–30s) per language.
2. Generated 15 AI voice clips per language with a multilingual
   voice-cloning/TTS tool that supports Swahili (e.g., ElevenLabs — used
   for African-context disinformation testing in Allen & Nehring,
   2025). Used the same script content as the authentic clips so wording
   itself isn't a giveaway.
3. Tiered empirically, same method as text.
4. Had a native Swahili speaker verify pronunciation/naturalness of
   every Swahili AI clip.

### Image (30 total, not language-split)
1. Collected 15 authentic photos of ordinary Tanzanian scenes (markets,
   streets, public events) with clear usage rights.
2. Generated 15 AI images with DALL-E. Picked the most photorealistic result per prompt.
3. Tiered empirically, same method as above.

## One-time setup

### Path A — you don't have any of this running yet
1. **Google Cloud**: create a project, enable the Drive API, configure
   the OAuth consent screen (External, Testing mode, add yourself as a
   test user), create an OAuth Client ID (Web application, redirect URI
   = `https://developers.google.com/oauthplayground`).
2. **Refresh token**: in OAuth Playground, authorize with your own
   Drive scope, exchange the code for tokens, copy the refresh token.
3. **Drive folder**: create one empty folder in your Drive for this
   app; copy its ID from the URL.
4. **GitHub**: create a new repo, upload every file in this project via
   GitHub's web uploader (drag-and-drop works for the whole folder
   tree).
5. **Vercel**: import the repo, add the four environment variables from
   `.env.example` (Client ID/Secret, Refresh Token, Drive Folder ID,
   plus generate your own `SURVEY_TOKEN_SECRET` and `ADMIN_EXPORT_TOKEN`
   — any long random strings), deploy.

### Path B — you already have OAuth credentials + Vercel/GitHub from a prior app on this blueprint
1. Create a **new, empty Drive folder** for this survey specifically
   (don't reuse a folder from a different app) — copy its ID.
2. Create a **new GitHub repo** and upload this project's files (keep
   it separate from other apps so a bug in one can't affect another).
3. Create a **new Vercel project** pointed at that repo.
4. Set env vars: reuse your existing
   `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET`/`GOOGLE_OAUTH_REFRESH_TOKEN`,
   but set `DRIVE_FOLDER_ID` to the new folder from step 1, and generate
   fresh `SURVEY_TOKEN_SECRET` and `ADMIN_EXPORT_TOKEN` values specific
   to this app.
5. Deploy.

## Closing / reopening the survey

Everything is controlled by one flag: `meta.isOpen` in
`lib/survey-config.js`.

**To close it:**
1. On GitHub, open `lib/survey-config.js` in the web editor.
2. Change `isOpen: true,` to `isOpen: false,` (near the top, inside `meta`).
3. Commit directly to `main`. If Vercel project has auto-deploy on
   (the default when importing from GitHub), it redeploys automatically
   within about a minute; otherwise, trigger a redeploy from the Vercel
   dashboard.

Once live: the survey page shows the `closedMessage` text instead of
starting the flow, `/api/get-stimuli-set` stops handing out new item
sets, and — the part that actually matters — `/api/submit` refuses to
save anything, returning a `403`, even if someone calls the API
directly rather than going through the page. All three read the same
flag, so there's nothing else to toggle.

**To reopen it:** change `isOpen: false,` back to `isOpen: true,` in the
same file, commit, redeploy. Nothing else needs reverting — no other
file is touched by closing/opening, and no data or state is lost either
way (already-saved responses in Drive are untouched regardless of the
flag).

## Using the admin export

Once you have responses, they can be downloaded as CSV
```
https://<your-vercel-app>.vercel.app/api/export?token=<ADMIN_EXPORT_TOKEN>
```
This isn't linked anywhere in the survey UI. The token is private.

## Known limitation worth knowing about

Section 4's answer key (which item is real vs. AI-generated) is packed
into a signed token the client holds between "get stimuli" and
"submit," rather than a plaintext field — this stops casual tampering
(an edited token fails signature verification and that item is
discarded), but a technically determined respondent could still decode
the base64 payload and read the true answer before answering. This is a
reasonable tradeoff for a voluntary, anonymous public survey; it is not
exam-grade anti-cheating and shouldn't be treated as one.
