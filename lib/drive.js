// lib/drive.js
//
// GENERIC Drive helper. Reuse verbatim in future apps built on this
// blueprint — nothing here is specific to this survey.
//
// Auth model: OAuth acting as your own Google account (never a service
// account — service accounts get zero storage quota on personal Gmail
// and cannot create files). Requires these env vars:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN
//   DRIVE_FOLDER_ID   <- root folder this app is scoped to

const { google } = require("googleapis");

function getAuthClient() {
  const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REFRESH_TOKEN) {
    throw new Error(
      "Missing Google OAuth env vars. Required: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN"
    );
  }
  const oAuth2Client = new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN });
  return oAuth2Client;
}

function getDrive() {
  return google.drive({ version: "v3", auth: getAuthClient() });
}

/**
 * Find a subfolder by name under parentFolderId; create it if missing.
 * Returns the folder id. Safe to call repeatedly (idempotent lookup).
 */
async function findOrCreateFolder(parentFolderId, name) {
  const drive = getDrive();
  const q = [
    `'${parentFolderId}' in parents`,
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
  ].join(" and ");

  const existing = await drive.files.list({ q, fields: "files(id, name)" });
  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id;
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
  });
  return created.data.id;
}

/**
 * Write a JSON file into a folder. Always creates a new file — this
 * app follows the "one JSON file per record" pattern, not a shared
 * read-modify-write file, so there is no update-in-place case in normal
 * operation.
 */
async function writeJsonFile(folderId, filename, data) {
  const drive = getDrive();
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType: "application/json",
    },
    media: {
      mimeType: "application/json",
      body: JSON.stringify(data, null, 2),
    },
    fields: "id",
  });
  return res.data.id;
}

/** List all non-trashed files directly inside a folder. */
async function listFilesInFolder(folderId) {
  const drive = getDrive();
  let files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, createdTime)",
      pageToken,
      pageSize: 1000,
    });
    files = files.concat(res.data.files || []);
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return files;
}

/** Download and parse a JSON file's contents by file id. */
async function readJsonFile(fileId) {
  const drive = getDrive();
  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "text" });
  return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
}

module.exports = {
  getAuthClient,
  getDrive,
  findOrCreateFolder,
  writeJsonFile,
  listFilesInFolder,
  readJsonFile,
};
