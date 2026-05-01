const router = require("express").Router();
const Item = require("../models/Item");
const Transaction = require("../models/Transaction"); 
const auth = require("../middleware/auth"); 

// GET / - Render the main HBS Dashboard
router.get("/", auth, async (req, res) => {
  try {
    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    res.render("items/index", { items, title: "Inventory Management", error: req.query.error });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error loading UI");
  }
});

// POST / - Create item from UI form and redirect back
router.post("/", auth, async (req, res) => {
  try {
    const existing = await Item.findOne({ serialNumber: req.body.serialNumber, isDeleted: false });
    if (existing) {
      return res.redirect("/items?error=Serial+number+already+in+use");
    }
    await Item.create({
      serialNumber: req.body.serialNumber,
      model: req.body.model,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status || "Available",
      dateAcquired: req.body.dateAcquired || Date.now(),
    });
    res.redirect("/items");
  } catch (error) {
    console.error(error);
    res.redirect("/items?error=Failed+to+create+item");
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

    // 2. Fetch history oldest-first to pair checkouts with checkins
    const rawHistory = await Transaction.find({ item: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: 1 })
      .lean();

    // Attach duration to each checkout by finding the next checkin
    for (let i = 0; i < rawHistory.length; i++) {
      if (rawHistory[i].action !== "checkout") continue;
      const nextCheckin = rawHistory.find((r, idx) => idx > i && r.action === "checkin");
      if (nextCheckin) {
        const days = Math.ceil((new Date(nextCheckin.createdAt) - new Date(rawHistory[i].createdAt)) / (1000 * 60 * 60 * 24));
        rawHistory[i].duration = days === 1 ? "1 day" : `${days} days`;
      } else {
        rawHistory[i].duration = "Ongoing";
      }
    }

    const history = rawHistory.reverse();

    // 3. Render the view
    res.render("items/history", { item, history, title: `Asset History - ${item.model}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error loading history UI");
  }
});

module.exports = router;