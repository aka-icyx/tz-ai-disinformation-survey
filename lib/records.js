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
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Flatten records into a simple CSV — one row per respondent, nested detail as JSON strings. */
function buildCSV(records) {
  const columns = [
    "id",
    "submittedAt",
    "language",
    "demographics",
    "section2",
    "section3",
    "section4_detectionAccuracy",
    "section4_byModality",
    "section4_attentionChecksPassed",
    "section5",
    "section6",
    "section7",
  ];

  const rows = records.map((r) => [
    r.id,
    r.submittedAt,
    r.language,
    r.demographics,
    r.section2,
    r.section3,
    r.section4 && r.section4.scoreSummary ? r.section4.scoreSummary.accuracy : "",
    r.section4 && r.section4.scoreSummary ? r.section4.scoreSummary.byModality : "",
    r.section4 && r.section4.scoreSummary ? r.section4.scoreSummary.attentionChecksPassed : "",
    r.section5,
    r.section6,
    r.section7,
  ]);

  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

module.exports = { saveRecord, listRecords, buildCSV };
