const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// POST /api/auth/login
router.post("/login", async (request, response) => {
  const { username, password } = request.body;

  //   Same error message for security reasons
  const user = await User.findOne({ username });
  if (!user || !user.isActive) {
    return response.status(401).json({ error: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return response.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  // Set cookie for UI, also return token for API callers
  response.cookie("jwt", token, { httpOnly: true });
  response.json({ token });
});

module.exports = router;
