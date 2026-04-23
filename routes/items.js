const router = require("express").Router();
const Item = require("../models/Item");

// GET /api/items - List all inventory items 
router.get("/", async (req, res) => {
  try {
    // Only fetch items that haven't been soft-deleted 
    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    
    // Serve HBS UI if requested by browser, otherwise send JSON API 
    if (req.accepts('html')) {
      res.render("items/index", { items, title: "Inventory Management" });
    } else {
      res.json(items);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error reading items" });
  }
});

// POST /api/items - Create new item 
router.post("/", async (req, res) => {
  try {
    const newItem = await Item.create({
      serialNumber: req.body.serialNumber,
      model: req.body.model,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status,
      dateAcquired: req.body.dateAcquired || Date.now()
    });
    
    if (req.accepts('html')) {
      res.redirect("/api/items");
    } else {
      res.status(201).json(newItem);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create item. Check for duplicate serial numbers." });
  }
});

// PUT /api/items/:id - Update item details 
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to update item" });
  }
});

// DELETE /api/items/:id - Remove item (Soft Delete) 
router.delete("/:id", async (req, res) => {
  try {
    // We update the flag to true and force status to Retired instead of deleting 
    await Item.findByIdAndUpdate(req.params.id, { 
        isDeleted: true,
        status: "Retired"
    });
    res.status(200).json({ message: "Item successfully removed (soft delete)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;