// lib/token.js
//
// Small signed-token helper, specific to this app's need: the server
// picks which stimulus item (and its true real/AI answer) a respondent
// sees, but the app is stateless between "get stimuli" and "submit"
// requests (no database, no session store). Rather than the client
// round-tripping the true answer in plain readable JSON — which any
// respondent could inspect in devtools network tab and use to game the
// detection task — the true answer is packed into a signed token. The
// client stores and returns the token unread; the server verifies the
// signature at submission time before trusting the payload.
//
// This is NOT bank-grade security (the payload is base64, not
// encrypted, so a determined respondent could still decode it) — it's
// a reasonable, low-complexity safeguard appropriate for a voluntary
// research survey, not a proctored high-stakes exam. It does prevent
// casual tampering: if a token is edited, the signature check fails
// and the server rejects that item's response.

const crypto = require("crypto");

function getSecret() {
  const secret = process.env.SURVEY_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Missing env var SURVEY_TOKEN_SECRET (any long random string).");
  }
  return secret;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payloadObj) {
  const payload = base64url(JSON.stringify(payloadObj));
  const hmac = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

/** Returns the decoded payload object, or null if signature is invalid/missing. */
function verify(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payload, hmac] = token.split(".");
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (hmac !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

module.exports = { sign, verify };
