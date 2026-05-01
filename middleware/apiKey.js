const crypto = require("crypto");
const ApiKey = require("../models/ApiKey");

const apiKeyAuth = async (request, response, next) => {
  const rawKey = request.headers["x-api-key"];
  if (!rawKey)
    return response.status(401).json({ error: "No API key provided" });

  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  const validKey = await ApiKey.findOne({ hashedKey, isActive: true });

  if (!validKey) return response.status(401).json({ error: "Invalid API key" });

  request.apiKey = validKey;
  next();
};

module.exports = apiKeyAuth;
