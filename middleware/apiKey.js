const ApiKey = require("../models/ApiKey");
const bcrypt = require("bcryptjs");

const apiKeyAuth = async (request, response, next) => {
  const rawKey = request.headers["x-api-key"];
  if (!rawKey)
    return response.status(401).json({ error: "No API key provided" });

  const keys = await ApiKey.find({ isActive: true });
  const match = await Promise.all(
    keys.map((key) =>
      bcrypt
        .compare(rawKey, key.hashedKey)
        .then((result) => (result ? key : null)),
    ),
  );
  const validKey = match.find((key) => key !== null);

  if (!validKey) return response.status(401).json({ error: "Invalid API key" });

  request.apiKey = validKey;
  next();
};

module.exports = apiKeyAuth;
