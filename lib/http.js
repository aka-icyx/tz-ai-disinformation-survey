// lib/http.js
//
// GENERIC helper. Reuse verbatim in future apps built on this
// blueprint. Wraps a Vercel serverless function handler so every route
// gets consistent method checking, JSON parsing safety, CORS-free same
// origin headers, and error-to-JSON conversion in one place.

/**
 * @param {"GET"|"POST"} method - the only HTTP method this route accepts
 * @param {(req, res) => Promise<void>} handler
 */
function withHandler(method, handler) {
  return async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== method) {
      res.status(405).json({ error: `Method not allowed. Expected ${method}.` });
      return;
    }

    try {
      await handler(req, res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[api error]", err);
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  };
}

module.exports = { withHandler };
