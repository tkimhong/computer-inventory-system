const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { checkout, checkin } = require("../controllers/transactionController");
const Transaction = require("../models/Transaction");

// POST /api/transactions/checkout
router.post("/checkout", auth, upload.single("document"), checkout);

// POST /api/transactions/checkin
router.post("/checkin", auth, upload.single("document"), checkin);

// GET /transactions
router.get("/", auth, async (request, response) => {
  try {
    const transactions = await Transaction.find()
      .populate("item", "name serialNumber")
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .lean();
    response.render("transactions/index", {
      title: "Transactions",
      transactions,
    });
  } catch (error) {
    response
      .status(500)
      .render("error", { title: "Error", message: error.message });
  }
});

// GET /transactions/checkout
router.get("/checkout", auth, (request, response) =>
  response.render("transactions/checkout", { title: "Check Out Item", error: request.query.error }),
);

// GET /transactions/checkin
router.get("/checkin", auth, (request, response) =>
  response.render("transactions/checkin", { title: "Check In Item", error: request.query.error }),
);

module.exports = router;
