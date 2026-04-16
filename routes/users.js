const router = require("express").Router();

// POST /api/users
router.post("/", (request, response) => {
  response.json({ message: "users route" });
});

module.exports = router;
