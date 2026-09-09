// lib/records.js
//
// Storage pattern: ONE JSON file per completed submission (no shared
// read-modify-write file, so no last-write-wins race between
// concurrent respondents). This survey is anonymous and has no
// resume-in-progress state — per the blueprint, that pattern is only
// needed when responses carry an identifier, which this app
// deliberately does not collect (see consent text in survey-config.js).
// So there is nothing here beyond "write the final record" and
// "list/read records for export."

const crypto = require("crypto");
const { findOrCreateFolder, writeJsonFile, listFilesInFolder, readJsonFile } = require("./drive");
const config = require("./survey-config");

const RESPONSES_SUBFOLDER = "responses";

async function getResponsesFolderId() {
  const rootFolderId = process.env.DRIVE_FOLDER_ID;
  if (!rootFolderId) throw new Error("Missing env var DRIVE_FOLDER_ID");
  return findOrCreateFolder(rootFolderId, RESPONSES_SUBFOLDER);
}

/** Save one completed submission as <uuid>.json. Returns the record id. */
async function saveRecord(record) {
  const id = record.id || crypto.randomUUID();
  const folderId = await getResponsesFolderId();
  await writeJsonFile(folderId, `${id}.json`, { ...record, id });
  return id;
}

/** List + parse every submitted record. Fine up to a few thousand records. */
async function listRecords() {
  const folderId = await getResponsesFolderId();
  const files = await listFilesInFolder(folderId);
  const records = [];
  for (const f of files) {
    if (!f.name.endsWith(".json")) continue;
    try {
      records.push(await readJsonFile(f.id));
    } catch (err) {
      // Skip unreadable/corrupt individual files rather than failing the whole export.
      records.push({ id: f.id, _error: `Failed to read ${f.name}: ${err.message}` });
    }
  }
  return records;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// -------------------------------------------------------------------
// Label resolution: every id -> label lookup below is built directly
// from lib/survey-config.js, so the CSV headers and cell values always
// match whatever's actually in the config — edit questions/options
// there, and the export reflects it automatically, no separate label
// list to maintain here.
// -------------------------------------------------------------------

function optionLabelMap(options) {
  return (options || []).reduce((acc, o) => {
    acc[o.id] = o.label && o.label.en ? o.label.en : o.id;
    return acc;
  }, {});
}

/** "device_access" -> "Device Access" — used for column headers not driven by an explicit label. */
function humanize(id) {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function labelFor(map, id) {
  if (!id) return "";
  return map[id] || id;
}

function labelsFor(map, ids) {
  return (ids || []).map((id) => labelFor(map, id)).join("; ");
}

// Per-question option maps (single/multi-choice questions in sections 1 & 2)
const demographicsOptionMaps = {};
config.section1.questions.forEach((q) => { demographicsOptionMaps[q.id] = optionLabelMap(q.options); });

const section2OptionMaps = {};
config.section2.questions.forEach((q) => { section2OptionMaps[q.id] = optionLabelMap(q.options); });

// Matrix column maps (e.g. "0" -> "0 (Not at all)") — one set of
// columns shared across all rows of a given matrix question.
const trustColumnsMap = optionLabelMap(config.section3.trustMatrix.columns);
const newsSourceMap = optionLabelMap(config.section3.newsSource.options);
const recentFalseContentMap = optionLabelMap(config.section5.recentFalseContent.options);
const affectedYouMap = optionLabelMap(config.section5.affectedYou.options);
const aiInvolvedMap = optionLabelMap(config.section5.aiInvolved.options);
const everSuspectedAIMap = optionLabelMap(config.section5.everSuspectedAI.options);
const platformsEncounteredMap = optionLabelMap(config.section5.platformsEncountered.options);
const trustChangeColumnsMap = optionLabelMap(config.section6.trustChange.columns);

/**
 * Column definitions: each has a human header and a function that pulls
 * + resolves the right value out of one raw record. This is the single
 * place that decides "what does a readable row look like" — add a
 * question in survey-config.js, add one line here to expose it in the
 * export.
 */
function buildColumns() {
  const columns = [
    { header: "Response ID", get: (r) => r.id },
    { header: "Submitted At", get: (r) => r.submittedAt },
    { header: "Language", get: (r) => (r.language === "sw" ? "Kiswahili" : "English") },
  ];

  // Section 1 — demographics: one column per question
  config.section1.questions.forEach((q) => {
    columns.push({
      header: humanize(q.id),
      get: (r) => labelFor(demographicsOptionMaps[q.id], r.demographics && r.demographics[q.id]),
    });
  });

  // Section 2 — digital/AI familiarity
  config.section2.questions.forEach((q) => {
    const isMulti = q.type === "multi_choice";
    columns.push({
      header: humanize(q.id),
      get: (r) => {
        const v = r.section2 && r.section2[q.id];
        return isMulti ? labelsFor(section2OptionMaps[q.id], v) : labelFor(section2OptionMaps[q.id], v);
      },
    });
    // "Other, please specify" free text, if this question allows it (currently only ai_tools_used).
    if (q.allowOtherText) {
      columns.push({
        header: `${humanize(q.id)}: Other (specify)`,
        get: (r) => (r.section2 && r.section2[`${q.id}_otherText`]) || "",
      });
    }
  });

  // Section 3 — baseline trust (one column per row) + news source
  config.section3.trustMatrix.rows.forEach((row) => {
    columns.push({
      header: `Trust: ${humanize(row.id)}`,
      get: (r) => labelFor(trustColumnsMap, r.section3 && r.section3.trust && r.section3.trust[row.id]),
    });
  });
  columns.push({
    header: "News Source(s)",
    get: (r) => labelsFor(newsSourceMap, r.section3 && r.section3.newsSource),
  });

  // Section 4 — detection task, summarized (full per-item detail stays in the raw JSON record)
  columns.push({ header: "Detection Accuracy (%)", get: (r) => {
    const acc = r.section4 && r.section4.scoreSummary ? r.section4.scoreSummary.accuracy : null;
    return acc === null || acc === undefined ? "" : Math.round(acc * 1000) / 10;
  }});
  // Correct/Total values are formatted with one decimal place (e.g. "4.0 / 9.0"
  // instead of "4 / 9") specifically so Excel doesn't auto-detect the cell as a
  // date (plain "4/9"-style text is a classic Excel date-autoconversion trap —
  // it silently becomes "Apr-9"). correct/total are always whole-number counts
  // from lib/scoring.js, so .toFixed(1) is purely a display safeguard here,
  // not a real fractional value.
  columns.push({ header: "Detection Correct / Total", get: (r) => {
    const s = r.section4 && r.section4.scoreSummary;
    return s ? `${s.correct.toFixed(1)} / ${s.total.toFixed(1)}` : "";
  }});
  ["text", "image", "audio"].forEach((modality) => {
    columns.push({
      header: `Detection Correct / Total: ${humanize(modality)}`,
      get: (r) => {
        const byModality = r.section4 && r.section4.scoreSummary && r.section4.scoreSummary.byModality;
        const m = byModality && byModality[modality];
        return m ? `${m.correct.toFixed(1)} / ${m.total.toFixed(1)}` : "";
      },
    });
  });
  columns.push({
    header: "Attention Checks Passed",
    get: (r) => {
      const v = r.section4 && r.section4.scoreSummary ? r.section4.scoreSummary.attentionChecksPassed : undefined;
      return v === undefined ? "" : v ? "Yes" : "No";
    },
  });

  // Section 5 — exposure & unattributed harm (5.1-5.6)
  columns.push({
    header: "Recent False/Misleading Content Encountered",
    get: (r) => labelFor(recentFalseContentMap, r.section5 && r.section5.recentFalseContent),
  });
  columns.push({
    header: "Affected You or Someone You Know",
    get: (r) => labelFor(affectedYouMap, r.section5 && r.section5.affectedYou),
  });
  columns.push({
    header: "Affected Narrative",
    get: (r) => (r.section5 && r.section5.affectedNarrative) || "",
  });
  columns.push({
    header: "Believed AI Was Involved",
    get: (r) => labelFor(aiInvolvedMap, r.section5 && r.section5.aiInvolved),
  });
  columns.push({
    header: "Ever Specifically Suspected AI Content",
    get: (r) => labelFor(everSuspectedAIMap, r.section5 && r.section5.everSuspectedAI),
  });
  columns.push({
    header: "Platforms Encountered On",
    get: (r) => labelsFor(platformsEncounteredMap, r.section5 && r.section5.platforms),
  });

  // Section 6 — consequences (trust-change matrix only; the old
  // open-narrative question, 6.2, was removed from the survey entirely)
  config.section6.trustChange.rows.forEach((row) => {
    columns.push({
      header: `Trust Change: ${humanize(row.id)}`,
      get: (r) => labelFor(trustChangeColumnsMap, r.section6 && r.section6.trustChange && r.section6.trustChange[row.id]),
    });
  });

  // Section 7 — closing
  columns.push({
    header: "Final Comment",
    get: (r) => (r.section7 && r.section7.finalComment) || "",
  });

  return columns;
}

/** Flatten records into a readable, one-question-per-column CSV. */
function buildCSV(records) {
  const columns = buildColumns();
  const lines = [columns.map((c) => csvEscape(c.header)).join(",")];

  for (const r of records) {
    if (r._error) {
      // Preserve a visible row for unreadable files rather than silently dropping them.
      const row = columns.map(() => "");
      row[0] = r.id;
      row[1] = r._error;
      lines.push(row.map(csvEscape).join(","));
      continue;
    }
    const row = columns.map((c) => {
      try {
        return csvEscape(c.get(r));
      } catch {
        return "";
      }
    });
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

module.exports = { saveRecord, listRecords, buildCSV };
