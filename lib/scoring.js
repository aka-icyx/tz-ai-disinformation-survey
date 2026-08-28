// lib/scoring.js
//
// Given the raw responses a client submits for Section 4 (one entry
// per item, each carrying back the signed token it was issued), verify
// every token server-side and compute:
//   - per-item correctness (judgment vs. the true, signed authenticity)
//   - an overall + per-modality detection score
//   - attention-check pass/fail
//
// This never trusts anything the client claims about the "true" answer
// — only what's inside a signature-verified token.

const { verify } = require("./token");

/**
 * @param {Array<{token: string, judgment: string, reasonTags?: string[]}>} responses
 *   judgment is "real" | "ai_generated" for detection items,
 *   or the respondent's pick for attention items.
 */
function scoreSection4(responses) {
  const detectionResults = [];
  const attentionResults = [];
  const invalidTokens = [];

  for (const r of responses || []) {
    const payload = verify(r.token);
    if (!payload) {
      invalidTokens.push(r.itemId || "(unknown item)");
      continue;
    }

    if (payload.type === "detection") {
      const respondentSaidAI = r.judgment === "ai_generated";
      const trueIsAI = payload.authenticity === "ai";
      detectionResults.push({
        itemId: payload.itemId,
        modality: payload.modality,
        tier: payload.tier,
        lang: payload.lang,
        filename: payload.filename,
        trueAuthenticity: payload.authenticity,
        judgment: r.judgment,
        correct: respondentSaidAI === trueIsAI,
        reasonTags: r.reasonTags || [],
      });
    } else if (payload.type === "attention") {
      attentionResults.push({
        itemId: payload.itemId,
        expected: payload.expected,
        given: r.judgment,
        passed: r.judgment === payload.expected,
      });
    }
  }

  const total = detectionResults.length;
  const correct = detectionResults.filter((d) => d.correct).length;

  const byModality = {};
  for (const d of detectionResults) {
    if (!byModality[d.modality]) byModality[d.modality] = { correct: 0, total: 0 };
    byModality[d.modality].total += 1;
    if (d.correct) byModality[d.modality].correct += 1;
  }

  return {
    detectionResults,
    attentionResults,
    invalidTokens,
    summary: {
      correct,
      total,
      accuracy: total > 0 ? correct / total : null,
      byModality,
      attentionChecksPassed: attentionResults.every((a) => a.passed) && attentionResults.length > 0,
    },
  };
}

module.exports = { scoreSection4 };
