const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

router.get("/", auth, rbac("Admin"), async (req, res) => {
  try {
    const users = await User.find()
        .select("-password -__v")
        .lean();

    const usersWithAssets = await Promise.all(
      users.map(async (user) => {
        const distinctItems = await Transaction.distinct("item", { user: user._id, action: "checkout" });
        const assetCount = distinctItems.length;
        return { ...user, assetCount };
      })
    );

    res.render("users/index", {
      users: usersWithAssets,
      title: "User Management",
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", message: "Failed to load users" });
  }
});

router.get("/:id/assets", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v").lean();
    if (!user) return res.status(404).render("error", { title: "Not Found", message: "User not found" });

    const transactions = await Transaction.find({
      user: req.params.id,
      action: "checkout",
    })
      .populate("item", "serialNumber model brand category status")
      .sort({ createdAt: -1 })
      .lean();

    const seen = new Set();
    const assets = transactions.filter(t => {
      if (!t.item || seen.has(t.item._id.toString())) return false;
      seen.add(t.item._id.toString());
      return true;
    });

    res.render("users/assets", { user, assets, title: `Assets for ${user.username}` });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", message: "Failed to load user assets" });
  }
});

module.exports = router;