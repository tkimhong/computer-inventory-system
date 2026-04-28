const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploads");
const { checkout, checkin } = require("../controllers/transactionController");

// POST /api/transactions/checkout
router.post("/checkout", auth, upload.single("document"), checkout);

// POST /api/transactions/checkin
router.post("/checkin", auth, upload.single("document", checkin));

module.exports = router;
