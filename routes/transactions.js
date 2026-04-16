const router = require("express").Router();

// POST /api/transactions/checkout
router.post("/checkout", (request, response) => {
  response.json({ message: "transactions route" });
});

module.exports = router;
