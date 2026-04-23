const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (request, response, next) => {
  // Check cookie first (UI) then Bearer token (API)
  let token = request.cookies?.jwt;

  if (!token) {
    const header = request.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }
  }

  if (!token) return response.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user || !user.isActive) {
      return response
        .status(401)
        .json({ error: "Account is disabled or not found" });
    }

    request.user = user;
    next();
  } catch (error) {
    response.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
