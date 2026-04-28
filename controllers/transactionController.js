const Transaction = require("../models/Transaction");
const Item = require("../models/Item");

exports.checkout = async (request, response) => {
  try {
    const { itemId, userId, notes } = request.body;

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted)
      return response.status(404).json({ message: "Item not found" });
    if (item.status !== "Available")
      return response
        .status(400)
        .json({ message: "Item is not available for checkout" });

    item.status = "In-Use";
    await item.save();

    const transaction = await Transaction.create({
      item: itemId,
      user: userId,
      action: "checkout",
      documentPath: request.file ? request.file.path : undefined,
      notes,
    });

    response.status(201).json(transaction);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

exports.checkin = async (request, response) => {
  try {
    const { itemId, userId, notes } = request.body;

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted)
      return response.status(404).json({ message: "Item not found" });
    if (item.status !== "In-Use")
      return response
        .status(400)
        .json({ message: "Item is not currently checked out" });

    item.status = "Available";
    await item.save();

    const transaction = await Transaction.create({
      item: itemId,
      user: userId,
      action: "checkin",
      documentPath: request.file ? request.file.path : undefined,
      notes,
    });

    response.status(201).json(transaction);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};
