// test/standalone-test.js — run with: node test/standalone-test.js
process.env.SURVEY_TOKEN_SECRET = "test-secret-do-not-use-in-prod";

const assert = require("assert");
const { buildParticipantStimuliSet } = require("../lib/stimuli");
const { scoreSection4 } = require("../lib/scoring");

console.log("=== Test 1: buildParticipantStimuliSet (English) ===");
const setEn = buildParticipantStimuliSet("en");
console.log("Warnings:", setEn.warnings);
console.log("Total items (should be 11 = 9 detection + 2 attention):", setEn.items.length);
assert.strictEqual(setEn.warnings.length, 0, "Expected no warnings with dummy files populated");
assert.strictEqual(setEn.items.length, 11, "Expected 9 detection + 2 attention = 11 items");

const detectionItems = setEn.items.filter((i) => i.kind === "detection");
const attentionItems = setEn.items.filter((i) => i.kind === "attention");
assert.strictEqual(detectionItems.length, 9, "Expected exactly 9 detection items");
assert.strictEqual(attentionItems.length, 2, "Expected exactly 2 attention items");

const byModality = {};
detectionItems.forEach((i) => { byModality[i.modality] = (byModality[i.modality] || 0) + 1; });
console.log("Detection items per modality (should be 3 each):", byModality);
assert.deepStrictEqual(byModality, { text: 3, image: 3, audio: 3 });

const tiersSeen = detectionItems.map((i) => i.tier).sort();
console.log("Tiers across the 9 items (should be easy/medium/hard x3):", tiersSeen);

console.log("\nSample item (detection):", JSON.stringify(detectionItems[0], null, 2));
console.log("Sample item (attention):", JSON.stringify(attentionItems[0], null, 2));

console.log("\n=== Test 2: buildParticipantStimuliSet (Swahili) ===");
const setSw = buildParticipantStimuliSet("sw");
assert.strictEqual(setSw.items.filter((i) => i.kind === "detection").length, 9);
const swTextItem = setSw.items.find((i) => i.kind === "detection" && i.modality === "text");
console.log("Swahili text item URL (should contain /sw/):", swTextItem.url);
assert.ok(swTextItem.url.includes("/text/sw/"), "Swahili text item should be served from the /sw/ path");

console.log("\n=== Test 3: token round-trip is unforgeable ===");
const { sign, verify } = require("../lib/token");
const legitToken = sign({ type: "detection", itemId: "abc", modality: "text", tier: "easy", authenticity: "ai", lang: "en", filename: "item_1.txt" });
const verified = verify(legitToken);
assert.strictEqual(verified.authenticity, "ai");
const tampered = legitToken.slice(0, -2) + "xx"; // corrupt the signature
assert.strictEqual(verify(tampered), null, "Tampered token should fail verification");
console.log("Legit token verifies:", !!verified, "| Tampered token rejected:", verify(tampered) === null);

console.log("\n=== Test 4: scoreSection4 end-to-end ===");
// Build a real 11-item set, then simulate a respondent answering every item,
// intentionally getting some detection items right and some wrong, and
// passing/failing an attention check, to confirm scoring math is correct.
const liveSet = buildParticipantStimuliSet("en");
const liveDetection = liveSet.items.filter((i) => i.kind === "detection");
const liveAttention = liveSet.items.filter((i) => i.kind === "attention");

const simulatedResponses = [];
liveDetection.forEach((item, idx) => {
  const payload = verify(item.token);
  const correctJudgment = payload.authenticity === "ai" ? "ai_generated" : "real";
  const wrongJudgment = payload.authenticity === "ai" ? "real" : "ai_generated";
  // Make the respondent get the first 6 right and the last 3 wrong, deterministically, for a checkable score.
  simulatedResponses.push({
    itemId: item.itemId,
    token: item.token,
    judgment: idx < 6 ? correctJudgment : wrongJudgment,
    reasonTags: ["guess"],
  });
});
// Respondent passes attention check 1, fails attention check 2 (answers "real" to both).
simulatedResponses.push({ itemId: liveAttention[0].itemId, token: liveAttention[0].token, judgment: "real" });
simulatedResponses.push({ itemId: liveAttention[1].itemId, token: liveAttention[1].token, judgment: "real" });

const scored = scoreSection4(simulatedResponses);
console.log("Detection summary:", scored.summary);
assert.strictEqual(scored.summary.total, 9);
assert.strictEqual(scored.summary.correct, 6, "Expected 6 correct detection answers by construction");
assert.strictEqual(scored.invalidTokens.length, 0, "No tokens should be invalid in this simulation");
console.log("Attention results:", scored.attentionResults);

console.log("\n=== Test 5: tampered token is silently excluded from scoring, not trusted ===");
const cheatingResponse = [{
  itemId: "fake",
  token: sign({ type: "detection", itemId: "fake", modality: "text", tier: "easy", authenticity: "ai", lang: "en", filename: "x" }).slice(0, -2) + "zz",
  judgment: "real",
}];
const scoredCheat = scoreSection4(cheatingResponse);
assert.strictEqual(scoredCheat.detectionResults.length, 0);
assert.strictEqual(scoredCheat.invalidTokens.length, 1);
console.log("Tampered submission correctly excluded:", scoredCheat.invalidTokens);

console.log("\nALL TESTS PASSED");
