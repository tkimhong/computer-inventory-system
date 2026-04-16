const router = require("express").Router();

// GET /api/items
router.get("/", (request, response) => {
  response.json({ message: "items route" });
});

module.exports = router;
