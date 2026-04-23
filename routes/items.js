const router = require("express").Router();
const Item = require("../models/Item");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const apiKey = require("../middleware/apiKey");

// Helper middleware to allow EITHER JWT or API Key for GET requests
const authOrApiKey = (req, res, next) => {
    // Assuming Person 1's middlewares attach user or error
    if (req.headers['x-api-key']) return apiKey(req, res, next);
    return auth(req, res, next);
};

// GET /api/items - List all items (Requires Auth OR API Key)
router.get("/", authOrApiKey, async (req, res) => {
  try {
    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server Error reading items" });
  }
});

// GET /api/items/:id/history - Retrieve full history (Requires Auth)
router.get("/:id/history", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.isDeleted) return res.status(404).json({ error: "Item not found" });

    // Note: Person 4 is building the Transaction model. 
    // We will query it here assuming standard naming conventions.
    const Transaction = require("../models/Transaction"); // Will throw error if Person 4 hasn't made this yet, you can comment this out to test your part
    const history = await Transaction.find({ item: req.params.id }).sort({ createdAt: -1 });
    
    res.json({ item, history });
  } catch (error) {
    res.status(500).json({ error: "Server Error reading history" });
  }
});

// POST /api/items - Create new item (Requires Auth)
router.post("/", auth, async (req, res) => {
  try {
    const newItem = await Item.create({
      serialNumber: req.body.serialNumber,
      model: req.body.model,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status,
      dateAcquired: req.body.dateAcquired || Date.now()
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to create item. Check for duplicate serial numbers." });
  }
});

// PUT /api/items/:id - Update item details (Requires Auth)
router.put("/:id", auth, async (req, res) => {
  try {
    // SECURITY FIX: Whitelist only specific fields to prevent arbitrary data overwriting
    const { serialNumber, model, brand, category, status, dateAcquired } = req.body;
    const updateData = {};
    
    if (serialNumber) updateData.serialNumber = serialNumber;
    if (model) updateData.model = model;
    if (brand) updateData.brand = brand;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (dateAcquired) updateData.dateAcquired = dateAcquired;

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedItem || updatedItem.isDeleted) return res.status(404).json({ error: "Item not found" });

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to update item" });
  }
});

// DELETE /api/items/:id - Remove item (Requires Auth + Admin Role)
router.delete("/:id", auth, rbac("Admin"), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    // 404 FIX: Return error if ID doesn't exist or is already deleted
    if (!item || item.isDeleted) {
        return res.status(404).json({ error: "Item not found" });
    }

    item.isDeleted = true;
    item.status = "Retired";
    await item.save();

    res.status(200).json({ message: "Item successfully removed (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

module.exports = router;