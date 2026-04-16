const router = require("express").Router();

// POST /api/keys
router.post("/", (request, response) => {
  response.json({ message: "keys route" });
});

module.exports = router;
