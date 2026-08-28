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

  // Prepend a UTF-8 byte-order-mark. Without it, Excel doesn't reliably
  // auto-detect UTF-8 CSVs and falls back to a different encoding,
  // mangling any non-ASCII character (e.g. the en-dash in "18–24" or
  // "6–12 months ago") into garbled text like "â€"". The BOM fixes
  // this in Excel, Google Sheets, and Numbers without changing the
  // actual data.
  const csvWithBom = "\uFEFF" + csv;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="survey-responses.csv"');
  res.status(200).send(csvWithBom);
});
