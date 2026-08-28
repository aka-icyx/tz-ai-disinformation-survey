// api/submit.js — thin wrapper: validate shape, score, save. No storage
// or scoring logic lives here — see lib/scoring.js and lib/records.js.
const { withHandler } = require("../lib/http");
const { scoreSection4 } = require("../lib/scoring");
const { saveRecord } = require("../lib/records");

module.exports = withHandler("POST", async (req, res) => {
  const body = req.body || {};

  const required = ["language", "demographics", "section2", "section3", "section4", "section5", "section6"];
  const missing = required.filter((k) => body[k] === undefined);
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  const { detectionResults, attentionResults, invalidTokens, summary } = scoreSection4(
    body.section4.responses
  );

  if (invalidTokens.length > 0) {
    // eslint-disable-next-line no-console
    console.warn("[submit] invalid/tampered tokens ignored:", invalidTokens);
  }

  const record = {
    submittedAt: new Date().toISOString(),
    language: body.language,
    demographics: body.demographics,
    section2: body.section2,
    section3: body.section3,
    section4: {
      detectionResults,
      attentionResults,
      scoreSummary: summary,
    },
    section5: body.section5,
    section6: body.section6,
    section7: body.section7 || {},
  };

  const id = await saveRecord(record);
  res.status(200).json({ success: true, id });
});
