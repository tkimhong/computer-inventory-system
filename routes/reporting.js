const router = require("express").Router();
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// GET /reports - Dashboard with links to all reports
router.get("/", auth, rbac("Admin"), async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ isDeleted: false });
    const deployedItems = await Item.countDocuments({ isDeleted: false, status: "In-Use" });
    
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const agingItems = await Item.countDocuments({ isDeleted: false, dateAcquired: { $lte: threeYearsAgo } });

    res.render("reports/index", {
      title: "Reports",
      stats: {
        totalItems,
        deployedItems,
        agingItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { 
      title: "Error", 
      message: "Failed to load reports dashboard" 
    });
  }
});

// GET /reports/inventory - Inventory Status Report
router.get("/inventory", auth, rbac("Admin"), async (req, res) => {
  try {
    const allItems = await Item.find({ isDeleted: false }).lean();
    const total = allItems.length;
    const available = allItems.filter(i => i.status === "Available").length;
    const deployed = allItems.filter(i => i.status === "In-Use").length;
    const maintenance = allItems.filter(i => i.status === "Maintenance").length;
    const retired = allItems.filter(i => i.status === "Retired").length;
    const deploymentRate = total > 0 ? ((deployed / total) * 100).toFixed(2) : 0;

    res.render("reports/inventory", {
      title: "Inventory Status Report",
      stats: {
        total,
        deployed,
        available,
        maintenance,
        retired,
        deploymentRate,
      },
      items: allItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { 
      title: "Error", 
      message: "Failed to load inventory report" 
    });
  }
});

// GET /reports/aging - Asset Aging Report (older than 3 years)
router.get("/aging", auth, rbac("Admin"), async (req, res) => {
  try {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const agingItems = await Item.find({
      isDeleted: false,
      dateAcquired: { $lte: threeYearsAgo },
    })
      .sort({ dateAcquired: 1 })
      .lean();

    const ageBreakdown = {
      threeToFive: agingItems.filter(
        (item) =>
          item.dateAcquired <= threeYearsAgo &&
          item.dateAcquired > new Date(threeYearsAgo.getFullYear() - 5, threeYearsAgo.getMonth(), threeYearsAgo.getDate())
      ).length,
      fiveToSeven: agingItems.filter(
        (item) =>
          item.dateAcquired <=
            new Date(threeYearsAgo.getFullYear() - 5, threeYearsAgo.getMonth(), threeYearsAgo.getDate()) &&
          item.dateAcquired >
            new Date(threeYearsAgo.getFullYear() - 7, threeYearsAgo.getMonth(), threeYearsAgo.getDate())
      ).length,
      sevenPlus: agingItems.filter(
        (item) =>
          item.dateAcquired <=
          new Date(threeYearsAgo.getFullYear() - 7, threeYearsAgo.getMonth(), threeYearsAgo.getDate())
      ).length,
    };

    res.render("reports/aging", {
      title: "Asset Aging Report",
      items: agingItems,
      count: agingItems.length,
      breakdown: ageBreakdown,
      threeYearsAgoDate: threeYearsAgo.toLocaleDateString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { 
      title: "Error", 
      message: "Failed to load aging report" 
    });
  }
});

// GET /reports/users - User Audit
router.get("/users", auth, rbac("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("username email").lean();
    let transactions = [];
    let selectedUser = null;

    if (req.query.userId) {
      selectedUser = await User.findById(req.query.userId).select("username email").lean();
      transactions = await Transaction.find({ user: req.query.userId, action: "checkout" })
        .populate("item", "serialNumber brand model status")
        .sort({ createdAt: -1 })
        .lean();
      transactions = transactions.filter(t => t.item && t.item.status === "In-Use");
    }

    res.render("reports/users", { title: "User Audit", users, transactions, selectedUser });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { title: "Error", message: "Failed to load user audit" });
  }
});

module.exports = router;

