const Item = require("../models/Item");

exports.listItems = async (req, res) => {
  try {
    const items = await Item.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server Error reading items" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.isDeleted)
      return res.status(404).json({ error: "Item not found" });

    const Transaction = require("../models/Transaction");
    const history = await Transaction.find({ item: req.params.id })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json({ item, history });
  } catch (error) {
    res.status(500).json({ error: "Server Error reading history" });
  }
};

exports.createItem = async (req, res) => {
  try {
    const newItem = await Item.create({
      serialNumber: req.body.serialNumber,
      model: req.body.model,
      brand: req.body.brand,
      category: req.body.category,
      status: req.body.status,
      dateAcquired: req.body.dateAcquired || Date.now(),
    });
    res.status(201).json(newItem);
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Failed to create item. Check for duplicate serial numbers.",
      });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { serialNumber, model, brand, category, status, dateAcquired } =
      req.body;
    const updateData = {};

    if (serialNumber) updateData.serialNumber = serialNumber;
    if (model) updateData.model = model;
    if (brand) updateData.brand = brand;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (dateAcquired) updateData.dateAcquired = dateAcquired;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!updatedItem || updatedItem.isDeleted)
      return res.status(404).json({ error: "Item not found" });

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to update item" });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.isDeleted)
      return res.status(404).json({ error: "Item not found" });

    item.isDeleted = true;
    item.status = "Retired";
    await item.save();

    res
      .status(200)
      .json({ message: "Item successfully removed (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};
