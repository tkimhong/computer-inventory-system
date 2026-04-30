const Transaction = require("../models/Transaction");
const Item = require("../models/Item");

exports.checkout = async (request, response) => {
  try {
    const { itemId, notes } = request.body;
    const userId = request.user._id;

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted)
      return request.accepts("html")
        ? response.redirect("/transactions/checkout?error=Item not found")
        : response.status(404).json({ message: "Item not found" });
    if (item.status !== "Available")
      return request.accepts("html")
        ? response.redirect("/transactions/checkout?error=Item is not available for checkout")
        : response.status(400).json({ message: "Item is not available for checkout" });

    item.status = "In-Use";
    await item.save();

    await Transaction.create({
      item: itemId,
      user: userId,
      action: "checkout",
      documentPath: request.file ? request.file.path : undefined,
      notes,
    });

    response.redirect("/transactions");
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

exports.checkin = async (request, response) => {
  try {
    const { itemId, notes } = request.body;
    const userId = request.user._id;

    const item = await Item.findById(itemId);
    if (!item || item.isDeleted)
      return request.accepts("html")
        ? response.redirect("/transactions/checkin?error=Item not found")
        : response.status(404).json({ message: "Item not found" });
    if (item.status !== "In-Use")
      return request.accepts("html")
        ? response.redirect("/transactions/checkin?error=Item is not currently checked out")
        : response.status(400).json({ message: "Item is not currently checked out" });

    item.status = "Available";
    await item.save();

    await Transaction.create({
      item: itemId,
      user: userId,
      action: "checkin",
      documentPath: request.file ? request.file.path : undefined,
      notes,
    });

    response.redirect("/transactions");
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};
