// api/get-stimuli-set.js — thin wrapper, no logic of its own.
const { withHandler } = require("../lib/http");
const { buildParticipantStimuliSet } = require("../lib/stimuli");

module.exports = withHandler("GET", async (req, res) => {
  const lang = req.query && req.query.lang === "sw" ? "sw" : "en";
  const { items, warnings } = buildParticipantStimuliSet(lang);

  if (warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.warn("[stimuli warnings]", warnings);
  }

  res.status(200).json({ items, warnings });
});
