const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  let token = req.cookies?.jwt;
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) token = header.split(" ")[1];
  }

  if (!token) {
    if (req.accepts("html")) return res.redirect("/login");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user || !user.isActive) {
      if (req.accepts("html")) return res.redirect("/login");
      return res.status(401).json({ error: "Account disabled or not found" });
    }
    req.user = user;
    next();
  } catch {
    if (req.accepts("html")) return res.redirect("/login");
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;