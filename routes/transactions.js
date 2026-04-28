const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { checkout, checkin } = require("../controllers/transactionController");

// POST /api/transactions/checkout
router.post("/checkout", auth, upload.single("document"), checkout);

// POST /api/transactions/checkin
router.post("/checkin", auth, upload.single("document"), checkin);

// GET /transactions/checkout
router.get("/checkout", auth, (request, response) =>
  response.render("transactions/checkout", { title: "Check Out Item" }),
);

// GET /transactions/checkin
router.get("/checkin", auth, (request, response) =>
  response.render("transactions/checkin", { title: "Check In Item" }),
);

module.exports = router;
