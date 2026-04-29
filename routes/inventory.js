const router = require("express").Router();
const Item = require("../models/Item");
const Transaction = require("../models/Transaction"); 
const auth = require("../middleware/auth"); 

// GET / - Render the main HBS Dashboard
router.get("/", auth, async (req, res) => {
  try {
    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    res.render("items/index", { items, title: "Inventory Management" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error loading UI");
  }
});

// GET /:id/history - Render the HBS History Dashboard
router.get("/:id/history", auth, async (req, res) => {
  try {
    // 1. Fetch the asset
    const item = await Item.findById(req.params.id).lean();
    if (!item || item.isDeleted) {
        return res.status(404).send("Item not found or retired");
    }

    // 2. Fetch the populated transaction history
    const history = await Transaction.find({ item: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Render the view
    res.render("items/history", { item, history, title: `Asset History - ${item.model}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error loading history UI");
  }
});

module.exports = router;