// lib/stimuli.js
//
// Reads stimulus media directly from public/stimuli/** at request time
// and assembles one randomized Section 4 set per participant. This is
// the piece that makes stimuli "drop files in, no code changes":
// add/replace files in the folders described in STIMULI_FOLDER_GUIDE.md
// and the next survey request picks them up automatically — nothing
// here needs editing for new content, only if the folder *shape*
// itself changes (see lib/survey-config.js -> section4.structure for
// the counts/parameters this file reads).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("./survey-config");
const { sign } = require("./token");

const STIMULI_ROOT = path.join(process.cwd(), "public", "stimuli");

// Extensions we treat as ignorable clutter (OS/editor artifacts), so a
// stray .DS_Store or Thumbs.db doesn't get treated as a stimulus file.
const IGNORE_FILES = new Set([".DS_Store", "Thumbs.db", ".gitkeep"]);

function listStimulusFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => !IGNORE_FILES.has(f) && !f.startsWith("."))
    .sort(); // deterministic order in; randomness is applied by the caller
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Resolve the folder for one (modality, language, authenticity, tier)
 * combination, respecting that image stimuli are not language-specific.
 */
function folderFor(modality, lang, authenticity, tier) {
  if (modality === "image") {
    return path.join(STIMULI_ROOT, "image", authenticity, tier);
  }
  return path.join(STIMULI_ROOT, modality, lang, authenticity, tier);
}

/** Public URL path the frontend can fetch/render directly (served from /public). */
function urlFor(modality, lang, authenticity, tier, filename) {
  if (modality === "image") {
    return `/stimuli/image/${authenticity}/${tier}/${encodeURIComponent(filename)}`;
  }
  return `/stimuli/${modality}/${lang}/${authenticity}/${tier}/${encodeURIComponent(filename)}`;
}

/**
 * Build the randomized Section 4 item set for one participant.
 * Returns { items, warnings } where each item is safe to send to the
 * client (no plaintext "authenticity" field — that lives only inside
 * the signed token, verified server-side at submission).
 */
function buildParticipantStimuliSet(language) {
  const lang = language === "sw" ? "sw" : "en";
  const { modalities, tiers, authenticities } = config.section4.structure;
  const warnings = [];
  const detectionItems = [];

  for (const modality of modalities) {
    for (const tier of tiers) {
      const authenticity = pickRandom(authenticities); // "real" | "ai"
      const dir = folderFor(modality, lang, authenticity, tier);
      const files = listStimulusFiles(dir);

      if (files.length === 0) {
        warnings.push(
          `No stimulus files found in ${path.relative(process.cwd(), dir)} — ` +
            `add files there (see STIMULI_FOLDER_GUIDE.md). This item was skipped.`
        );
        continue;
      }

      const filename = pickRandom(files);
      const itemId = crypto.randomUUID();
      const token = sign({
        type: "detection",
        itemId,
        modality,
        tier,
        authenticity, // "real" | "ai" — the answer key, only readable via signature-verified token
        lang,
        filename,
      });

      detectionItems.push({
        itemId,
        kind: "detection",
        modality,
        tier, // difficulty tier is fine to expose; it's not the answer
        url: urlFor(modality, lang, authenticity, tier, filename),
        token,
      });
    }
  }

  // Attention checks: fixed instructional text, no media, defined in
  // config. These do NOT count toward the 9 scored detection items.
  const attentionItems = config.section4.attentionChecks.map((check) => ({
    itemId: check.id,
    kind: "attention",
    text: check.text[lang],
    token: sign({ type: "attention", itemId: check.id, expected: check.expected }),
  }));

  // Shuffle the 9 detection items, then insert the 2 attention checks
  // at fixed, spaced-out positions (roughly 1/3 and 2/3 through) so
  // they don't cluster together and don't affect the 9-item total.
  const shuffledDetection = shuffle(detectionItems);
  const combined = [...shuffledDetection];
  const firstInsertAt = Math.min(3, combined.length);
  const secondInsertAt = Math.min(7, combined.length + 1);
  combined.splice(firstInsertAt, 0, attentionItems[0]);
  combined.splice(secondInsertAt, 0, attentionItems[1]);

  return { items: combined, warnings };
}

module.exports = { buildParticipantStimuliSet, STIMULI_ROOT };
