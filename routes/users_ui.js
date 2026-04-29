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
        const assetCount = await Transaction.countDocuments({
          user: user._id,
          action: "checkout",
        });
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

    const assets = await Transaction.find({
      user: req.params.id,
      action: "checkout",
    })
      .populate("item", "serialNumber model brand category status")
      .lean();

    res.render("users/assets", { user, assets, title: `Assets for ${user.username}` });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", message: "Failed to load user assets" });
  }
});

module.exports = router;