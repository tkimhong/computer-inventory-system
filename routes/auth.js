const router = require("express").Router();

// POST /api/auth/login
router.post("/login", (request, response) => {
  response.json({ message: "login route" });
});

module.exports = router;
