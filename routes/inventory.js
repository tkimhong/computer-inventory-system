// routes/uiItems.js
const router = require("express").Router();
const Item = require("../models/Item");
// Assuming the UI uses JWT cookies or sessions (Person 1's setup)
const auth = require("../middleware/auth"); 

// GET /items - Render the HBS Dashboard
router.get("/", auth, async (req, res) => {
  try {
    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    res.render("items/index", { items, title: "Inventory Management" });
  } catch (error) {
    res.status(500).send("Server Error loading UI");
  }
});

module.exports = router;