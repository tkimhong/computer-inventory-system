const jwt = require("jsonwebtoken");

const auth = (request, response, next) => {
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
    request.user = decoded;
    next();
  } catch (error) {
    response.status(401).json({ error: "Invalid token" });
  }
};
