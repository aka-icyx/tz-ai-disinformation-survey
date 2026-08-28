// api/export.js — protected admin export. Not linked from the survey UI.
const { withHandler } = require("../lib/http");
const { listRecords, buildCSV } = require("../lib/records");

module.exports = withHandler("GET", async (req, res) => {
  const providedToken = req.query && req.query.token;
  const expectedToken = process.env.ADMIN_EXPORT_TOKEN;

  if (!expectedToken) {
    res.status(500).json({ error: "ADMIN_EXPORT_TOKEN is not configured on the server." });
    return;
  }
  if (!providedToken || providedToken !== expectedToken) {
    res.status(401).json({ error: "Unauthorized. Provide ?token=<ADMIN_EXPORT_TOKEN>." });
    return;
  }

  const records = await listRecords();
  const csv = buildCSV(records);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="survey-responses.csv"');
  res.status(200).send(csv);
});
