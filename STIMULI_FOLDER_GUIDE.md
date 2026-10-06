# Stimuli Folder Guide

This is the **only** thing needed to touch to add or change Section 4
test content. Nothing in the code needs editing — `lib/stimuli.js` scans
these folders at request time and automatically picks up whatever it
finds.

## Folder tree (already scaffolded, currently empty)

```
public/stimuli/
├── text/
│   ├── en/
│   │   ├── real/{easy,medium,hard}/     <- 5 files each, genuine English text
│   │   └── ai/{easy,medium,hard}/       <- 5 files each, AI-generated English text
│   └── sw/
│       ├── real/{easy,medium,hard}/     <- 5 files each, genuine Swahili text
│       └── ai/{easy,medium,hard}/       <- 5 files each, AI-generated Swahili text
├── audio/
│   ├── en/
│   │   ├── real/{easy,medium,hard}/     <- 5 clips each, genuine English audio
│   │   └── ai/{easy,medium,hard}/       <- 5 clips each, AI-generated English audio
│   └── sw/
│       ├── real/{easy,medium,hard}/     <- 5 clips each, genuine Swahili audio
│       └── ai/{easy,medium,hard}/       <- 5 clips each, AI-generated Swahili audio
└── image/
    ├── real/{easy,medium,hard}/         <- 5 images each (not language-specific)
    └── ai/{easy,medium,hard}/           <- 5 images each (not language-specific)
```

That's **24 leaf folders** total (2 language × 2 authenticity × 3 tiers
× 2 modalities [text, audio], plus 2 authenticity × 3 tiers for image).

## Rules

1. **5 files in each leaf folder.** The code will work with more or
   fewer, but 5-per-tier-per-authenticity is what the pool math in
   `lib/survey-config.js` (`section4.structure`) assumes, and is what
   lets every participant's 3-per-modality draw feel non-repetitive.
2. **Filenames don't matter, only location.** `001.mp3`, `clip-a.mp3`,
   `real_easy_1.mp3` are all fine. The code lists whatever's in the folder
   and picks randomly. Just don't leave stray files like `.DS_Store` in
   there (the loader already ignores a short list of known junk files,
   but avoid adding your own notes/readme files inside a leaf folder).
3. **File types:**
   - `text/**` — plain `.txt` files (UTF-8). The frontend fetches and
     displays the raw text content, so no HTML/markdown formatting —
     just the passage itself.
   - `audio/**` — `.mp3` or `.wav`, whatever your browser's `<audio>`
     tag supports. Keep clips reasonably short (15–30 seconds) so the
     survey doesn't get slow to complete.
   - `image/**` — `.jpg`, `.png`, or `.webp`. Keep file sizes modest
     (compress before uploading) since these are served directly to
     respondents' phones, some on limited data.
4. **Image has no language subfolder.** Per the study design, images
   are only split by `real`/`ai` and tier — not by language.
5. **Difficulty tiers assigned empirically, not guessed in
   advance.** Have 2–3 people independently judge real-vs-AI on your
   full candidate set before sorting into `easy`/`medium`/`hard` — items
   almost everyone gets right are `easy`, items most people misjudge are
   `hard`. See the stimuli-production steps in `README.md` for the full
   generation workflow (which tools to use for text/image/audio, in
   both languages).
6. **Deploy after any change.** Since these are static files bundled
   into the Vercel deployment, adding or replacing files requires a new
   commit + redeploy (via GitHub's web UI is enough — no local install
   needed) before they're live. There's no separate upload step or
   admin panel for this; it's just files in the repo.
7. **Every empty folder contains a `placeholder.txt`.** Git doesn't
   track empty directories at all, so each of the 30 currently-empty
   leaf folders has a small visible `placeholder.txt` file just to make
   the folder exist once uploaded. This is deliberately a normal,
   visible file — not a hidden dotfile like `.gitkeep` — because Finder,
   Windows Explorer, and browser drag-and-drop all hide dotfiles by
   default, which silently drops them from GitHub's web upload and
   leaves the folder missing entirely. `placeholder.txt` is
   automatically ignored by the app (`lib/stimuli.js`) and does not
   need to be deleted when you add real stimuli — just drop real files
   in next to it.

## What happens if a folder is empty

`lib/stimuli.js` won't crash — it logs a warning (visible in Vercel's
function logs) and that one item is silently skipped for that
participant, so a respondent might occasionally see fewer than 9
detection items if content isn't fully populated yet. Don't launch to
real respondents until all 24 leaf folders have content; this fallback
exists for safe local testing during development, not as a
launch-ready state.
