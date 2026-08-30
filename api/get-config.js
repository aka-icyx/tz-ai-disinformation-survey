// api/get-config.js — thin wrapper, no logic of its own.
const { withHandler } = require("../lib/http");
const config = require("../lib/survey-config");

module.exports = withHandler("GET", async (req, res) => {
  res.status(200).json(config);
});
